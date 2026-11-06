import os

import jwt
from uuid import UUID
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
import requests
from sqlmodel import Session, SQLModel, create_engine, or_, select
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from llm_service.open_router_service import extrair_relato
from models import Ocorrencia, StatusOcorrencia, Usuario, AtualizacaoOcorrencia, Evidencia, TipoPerfil, TipoMidia, TipoAtualizacao, LogAtividade
from schemas import UsuarioAdmin, PerfilUpdate, LogAtividadeResponse, AdminCreate, MinhaDenuncia
from sqlalchemy import inspect as sa_inspect, text
from schemas import (Token, UsuarioCreate, UsuarioResponse, UsuarioComToken, OcorrenciaCreate, OcorrenciaUpdate, EvidenciaCreate, AtualizacaoCreate, AtualizacaoResponse, OcorrenciaAdmin, RelatoRequest)

from fastapi import File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from bucket import (
    deletar_arquivo_bucket,
    fazer_upload_arquivo,
    url_publica,
    PASTA_UPLOADS_LOCAL,
)
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

# --- 1. CONFIGURAÇÃO DO BANCO DE DADOS ---
database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise RuntimeError("DATABASE_URL não foi definida no arquivo .env")

if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

if not database_url.startswith(("postgresql://", "postgresql+psycopg2://")):
    raise RuntimeError(
        "DATABASE_URL deve ser uma URI PostgreSQL, começando com "
        "'postgresql://' ou 'postgresql+psycopg2://'"
    )

engine = create_engine(database_url, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    migrar_colunas_novas()


def migrar_colunas_novas():
    """create_all não altera tabelas existentes: adiciona aqui as colunas novas
    (bancos criados antes do painel do administrador)."""
    novas = {
        "ocorrencia": {"gravidade": "VARCHAR", "data_resolucao": "TIMESTAMP"},
        "atualizacao_ocorrencia": {"tipo": "VARCHAR DEFAULT 'STATUS' NOT NULL"},
    }
    insp = sa_inspect(engine)
    with engine.begin() as conn:
        for tabela, colunas in novas.items():
            existentes = {c["name"] for c in insp.get_columns(tabela)}
            for nome, tipo in colunas.items():
                if nome not in existentes:
                    conn.execute(text(f"ALTER TABLE {tabela} ADD COLUMN {nome} {tipo}"))

def get_session():
    with Session(engine) as session:
        yield session

# --- 2. INICIALIZAÇÃO DO FASTAPI E SEGURANÇA ---
app = FastAPI(
    title = "API Campus Seguro",
    description = "Backend do MVP para o sistema de segurança do campus universitário",
    version = "1.0.0"
)

# Origens permitidas definidas diretamente no código (sem dependência do .env)
origens_permitidas = [
    "http://localhost:8081",       # Expo web (Metro) local
    "http://127.0.0.1:8081",       # Expo web (alternativa de IP)
    "http://localhost:19006",      # Expo web (webpack, versões antigas)
    "http://localhost:3000",       # React / Next.js local
    "http://localhost:5173",       # Vite local
    "http://127.0.0.1:3000",       # Alternativa de IP local
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origens_permitidas,
    # Libera o domínio de produção e os previews automáticos da Vercel
    # (ex.: https://seuapp.vercel.app e https://seuapp-git-branch.vercel.app)
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve os anexos salvos localmente (fallback quando o R2 não está configurado)
os.makedirs(PASTA_UPLOADS_LOCAL, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=PASTA_UPLOADS_LOCAL), name="uploads")

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# Configura o FastAPI para saber que a rota de login se chama "/login"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Configurações do JWT
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY não foi definida no arquivo .env")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 horas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- FUNÇÕES DE SEGURANÇA (JWT E RBAC) ---
def criar_token_acesso(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_usuario_atual(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub: str = payload.get("sub")
        if sub is None:
            raise credentials_exception
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado. Faça login novamente.")
    except jwt.InvalidTokenError:
        raise credentials_exception

    # O "sub" pode ser o e-mail (cadastro completo) ou o id do usuário
    # (cadastro rápido, que não possui e-mail/senha).
    usuario = session.exec(select(Usuario).where(Usuario.email == sub)).first()
    if usuario is None:
        try:
            usuario = session.get(Usuario, UUID(sub))
        except (ValueError, TypeError):
            usuario = None

    if usuario is None:
        raise credentials_exception
    return usuario

def verificar_perfil_seguranca(usuario: Usuario = Depends(get_usuario_atual)):
    """Trava de RBAC: Garante que apenas Administradores acessem a rota."""
    # ALTERADO: SEGURANCA -> ADMINISTRADOR
    if usuario.tipo_perfil != TipoPerfil.ADMINISTRADOR:
        raise HTTPException(
            status_code=403, 
            detail="Acesso negado. Esta ação requer perfil de Administrador."
        )
    return usuario


# --- Autenticação e Usuários ---

@app.post("/login", response_model=Token, tags=["Autenticação"])
def login_para_obter_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    """Valida credenciais (Email ou CPF) e devolve um token JWT real."""
    identificador = form_data.username 
    
    usuario = session.exec(
        select(Usuario).where(
            or_(
                Usuario.email == identificador,
                Usuario.cpf == identificador
            )
        )
    ).first()
    
    if not usuario or not usuario.senha_hash or not pwd_context.verify(form_data.password, usuario.senha_hash):
        if usuario and usuario.tipo_perfil == TipoPerfil.ADMINISTRADOR:
            registrar_atividade(session, usuario, "LOGIN_FALHOU", "Tentativa de login com senha incorreta.")
            session.commit()
        raise HTTPException(
            status_code=401,
            detail="Email/CPF ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    registrar_atividade(session, usuario, "LOGIN", "Login realizado.")
    session.commit()

    access_token = criar_token_acesso(data={"sub": usuario.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/usuarios/", response_model=UsuarioComToken, status_code=201, tags=["Usuários"])
def criar_usuario(usuario_in: UsuarioCreate, session: Session = Depends(get_session)):
    """Cadastra um novo usuário no sistema (Suporta Cadastro Rápido e Completo)."""
    if usuario_in.email:
        usuario_existente = session.exec(select(Usuario).where(Usuario.email == usuario_in.email)).first()
        if usuario_existente:
            raise HTTPException(status_code=400, detail="Email já cadastrado.")

    if usuario_in.cpf:
        cpf_existente = session.exec(select(Usuario).where(Usuario.cpf == usuario_in.cpf)).first()
        if cpf_existente:
            raise HTTPException(status_code=400, detail="CPF já cadastrado.")

    flag_completo = bool(usuario_in.email and usuario_in.senha and usuario_in.cpf)
    senha_hasheada = pwd_context.hash(usuario_in.senha) if usuario_in.senha else None

    novo_usuario = Usuario(
        nome=usuario_in.nome,
        data_nascimento=usuario_in.data_nascimento,
        email=usuario_in.email,
        genero=usuario_in.genero,
        cpf=usuario_in.cpf,
        senha_hash=senha_hasheada,
        # Cadastro público sempre cria ALUNO. Administradores são criados
        # pelo script `criar_admin.py` (evita qualquer um virar admin).
        tipo_perfil=TipoPerfil.ALUNO,
        cadastro_completo=flag_completo
    )
    
    session.add(novo_usuario)
    session.commit()
    session.refresh(novo_usuario)

    # Já devolve um token para o app autenticar imediatamente após o cadastro.
    # Usa o e-mail como "sub" quando existe; caso contrário o id (cadastro rápido).
    sub = novo_usuario.email if novo_usuario.email else str(novo_usuario.id)
    access_token = criar_token_acesso(data={"sub": sub})

    return UsuarioComToken(
        usuario=novo_usuario,
        access_token=access_token,
        token_type="bearer",
    )


@app.get("/usuarios/me", response_model=UsuarioResponse, tags=["Usuários"])
def obter_usuario_atual(usuario_atual: Usuario = Depends(get_usuario_atual)):
    """Retorna os dados do usuário autenticado (usado pelo app após o login)."""
    return usuario_atual


@app.get("/usuarios/", response_model=List[UsuarioResponse], tags=["Usuários"])
def listar_usuarios(session: Session = Depends(get_session), usuario_admin: Usuario = Depends(verificar_perfil_seguranca)):
    """Lista todos os usuários cadastrados (exclusivo do Administrador)."""
    usuarios = session.exec(select(Usuario)).all()
    return usuarios


# --- Ocorrências (Jornada Principal) ---

@app.post("/ocorrencias/", status_code=201, tags=["Ocorrências"])
def acionar_botao_emergencia(
    ocorrencia_in: OcorrenciaCreate,
    session: Session = Depends(get_session),
    usuario_atual: Usuario = Depends(get_usuario_atual)
):
    """Aciona o Botão de Emergência associado ao usuário logado."""
    id_para_salvar = None if ocorrencia_in.anonimo else usuario_atual.id

    nova_ocorrencia = Ocorrencia(
        usuario_id=id_para_salvar,
        tipo_incidente=ocorrencia_in.tipo_incidente,
        descricao=ocorrencia_in.descricao,
        localizacao=ocorrencia_in.localizacao,
        status=StatusOcorrencia.ABERTO,
        
        descricao_resumida=ocorrencia_in.descricao_resumida or "Acionamento rápido de emergência",
        gravidade=ocorrencia_in.gravidade,
        # ALTERADO: datetime.now(timezone.utc) ao invés de utcnow()
        horario_ocorrencia=ocorrencia_in.horario_ocorrencia or datetime.now(timezone.utc)
    )
    session.add(nova_ocorrencia)
    session.commit()
    session.refresh(nova_ocorrencia)

    # Denúncia anônima: o log NÃO guarda quem enviou.
    registrar_atividade(
        session,
        None if ocorrencia_in.anonimo else usuario_atual,
        "DENUNCIA_RECEBIDA",
        f"{'Denúncia anônima' if ocorrencia_in.anonimo else 'Denúncia identificada'} recebida: {nova_ocorrencia.tipo_incidente}.",
        nova_ocorrencia.id,
    )
    session.commit()
    session.refresh(nova_ocorrencia)

    resposta = jsonable_encoder(nova_ocorrencia.model_dump())
    if ocorrencia_in.anonimo:
        # A denúncia anônima não guarda o autor; esta chave temporária deixa só
        # quem acabou de enviar anexar os arquivos dela (por 1 hora).
        resposta["token_anexo"] = _gerar_token_anexo(nova_ocorrencia.id)
    return resposta


@app.get("/ocorrencias/", response_model=List[Ocorrencia], tags=["Ocorrências"])
def listar_ocorrencias(
    session: Session = Depends(get_session),
    usuario_atual: Usuario = Depends(get_usuario_atual) 
):
    """
    Inteligência de RBAC:
    - Se for Administrador: Lista TODAS as ocorrências do campus.
    - Se for Aluno/Colaborador: Lista APENAS as que ele mesmo criou.
    """
    # ALTERADO: SEGURANCA -> ADMINISTRADOR
    if usuario_atual.tipo_perfil == TipoPerfil.ADMINISTRADOR:
        ocorrencias = session.exec(select(Ocorrencia).order_by(Ocorrencia.data_criacao.desc())).all()
    else:
        ocorrencias = session.exec(
            select(Ocorrencia)
            .where(Ocorrencia.usuario_id == usuario_atual.id)
            .order_by(Ocorrencia.data_criacao.desc())
        ).all()
    
    return ocorrencias

@app.post("/ocorrencias/ia/preview", tags=["Inteligência Artificial"])
def analisar_relato_com_ia(req: RelatoRequest):
    """Recebe um texto do Frontend e envia para o microserviço do Llama para extrair os dados da denúncia."""
    try:
        dados = extrair_relato(req.descricao)

        return {
            "descricao_original": req.descricao,
            "dados_extraidos": dados
        }
        
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="A API de IA demorou muito para responder."
        )
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=502,
            detail=f"Falha de comunicação com o serviço de IA: {str(e)}"
        )
    except ValueError as e:
        # Ex.: OPENROUTER_API_KEY não configurada. O app trata isso e segue
        # para o preenchimento manual da denúncia.
        raise HTTPException(
            status_code=503, # 503 Service Unavailable
            detail=f"Serviço de IA indisponível: {str(e)}"
        )


@app.get("/ocorrencias/{ocorrencia_id}", response_model=Ocorrencia, tags=["Ocorrências"])
def buscar_ocorrencia_por_id(
    ocorrencia_id: UUID, 
    session: Session = Depends(get_session),
    usuario_atual: Usuario = Depends(get_usuario_atual)
):
    """Aluno acompanhando status da SUA ocorrência (ou Admin vendo qualquer uma)."""
    ocorrencia = session.get(Ocorrencia, ocorrencia_id)
    if not ocorrencia:
        raise HTTPException(status_code=404, detail="Ocorrência não encontrada")
    
    # ALTERADO: SEGURANCA -> ADMINISTRADOR
    if usuario_atual.tipo_perfil != TipoPerfil.ADMINISTRADOR and ocorrencia.usuario_id != usuario_atual.id:
        raise HTTPException(status_code=403, detail="Acesso negado. Esta ocorrência pertence a outro usuário.")
        
    return ocorrencia


@app.patch("/ocorrencias/{ocorrencia_id}", response_model=Ocorrencia, tags=["Ocorrências"])
def atualizar_status_ocorrencia(
    ocorrencia_id: UUID,
    ocorrencia_in: OcorrenciaUpdate,
    session: Session = Depends(get_session),
    usuario_seguranca: Usuario = Depends(verificar_perfil_seguranca)
):
    """Exclusivo para Administrador/Responsável: Assumir o chamado e mudar status."""
    ocorrencia_db = session.get(Ocorrencia, ocorrencia_id)
    if not ocorrencia_db:
        raise HTTPException(status_code=404, detail="Ocorrência não encontrada")
    
    status_anterior = ocorrencia_db.status
    if ocorrencia_in.status is not None:
        # Só finaliza depois de responder quem denunciou (se não for anônimo)
        if (
            ocorrencia_in.status == StatusOcorrencia.RESOLVIDO
            and status_anterior != StatusOcorrencia.RESOLVIDO
            and ocorrencia_db.usuario_id is not None
            and not _foi_respondida(ocorrencia_db.id, session)
        ):
            raise HTTPException(
                status_code=400,
                detail="Envie uma resposta ao denunciante antes de finalizar a denúncia.",
            )
        ocorrencia_db.status = ocorrencia_in.status
        if ocorrencia_in.status == StatusOcorrencia.RESOLVIDO and status_anterior != StatusOcorrencia.RESOLVIDO:
            ocorrencia_db.data_resolucao = datetime.now(timezone.utc)
        elif ocorrencia_in.status != StatusOcorrencia.RESOLVIDO:
            ocorrencia_db.data_resolucao = None

    if ocorrencia_in.status is not None and ocorrencia_in.status != status_anterior:
        registrar_atividade(
            session, usuario_seguranca, "STATUS",
            f"Denúncia movida para {STATUS_TEXTO[ocorrencia_in.status]}.", ocorrencia_db.id,
        )

    if ocorrencia_in.gravidade is not None and ocorrencia_in.gravidade != ocorrencia_db.gravidade:
        registrar_atividade(
            session, usuario_seguranca, "CLASSIFICACAO",
            f"Urgência classificada como {ocorrencia_in.gravidade}.", ocorrencia_db.id,
        )
        session.add(AtualizacaoOcorrencia(
            ocorrencia_id=ocorrencia_db.id,
            autor_id=usuario_seguranca.id,
            tipo=TipoAtualizacao.NOTA_INTERNA.value,
            mensagem_acao=f"Urgência classificada como {ocorrencia_in.gravidade}.",
        ))
        ocorrencia_db.gravidade = ocorrencia_in.gravidade

    if ocorrencia_in.responsavel_id is not None:
        ocorrencia_db.responsavel_id = ocorrencia_in.responsavel_id
    else:
        ocorrencia_db.responsavel_id = usuario_seguranca.id

    # Registra a providência na linha do tempo (visível para o aluno)
    partes = []
    if ocorrencia_in.status is not None and ocorrencia_in.status != status_anterior:
        partes.append(f"Status alterado para {STATUS_TEXTO[ocorrencia_in.status]}.")
    if ocorrencia_in.mensagem and ocorrencia_in.mensagem.strip():
        partes.append(ocorrencia_in.mensagem.strip())
    if partes:
        session.add(AtualizacaoOcorrencia(
            ocorrencia_id=ocorrencia_db.id,
            autor_id=usuario_seguranca.id,
            tipo=TipoAtualizacao.STATUS.value,
            mensagem_acao=" ".join(partes),
        ))

    session.add(ocorrencia_db)
    session.commit()
    session.refresh(ocorrencia_db)
    return ocorrencia_db


@app.post("/ocorrencias/{ocorrencia_id}/evidencias", status_code=201, tags=["Detalhes Ocorrência"])
def adicionar_evidencia(
    ocorrencia_id: UUID,
    arquivo: UploadFile = File(...), 
    tipo_midia: TipoMidia = Form(...), 
    token_anexo: Optional[str] = Form(None),
    session: Session = Depends(get_session),
    usuario_atual: Usuario = Depends(get_usuario_atual) 
):
    """Aluno anexando mídia na própria ocorrência."""
    ocorrencia = session.get(Ocorrencia, ocorrencia_id)
    if not ocorrencia:
        raise HTTPException(status_code=404, detail="Ocorrência não encontrada")
    
    # ALTERADO: SEGURANCA -> ADMINISTRADOR
    pode_anexar = (
        usuario_atual.tipo_perfil == TipoPerfil.ADMINISTRADOR
        or (ocorrencia.usuario_id is not None and ocorrencia.usuario_id == usuario_atual.id)
        or (ocorrencia.usuario_id is None and _token_anexo_valido(token_anexo, ocorrencia.id))
    )
    if not pode_anexar:
        raise HTTPException(status_code=403, detail="Acesso negado. Você só pode enviar evidências para as suas próprias ocorrências.")
    
    try:
        caminho_salvo = fazer_upload_arquivo(arquivo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar arquivo na nuvem: {str(e)}")

    try:
        nova_evidencia = Evidencia(
            ocorrencia_id=ocorrencia_id,
            caminho_salvo=caminho_salvo,
            tipo_midia=tipo_midia
        )
        
        session.add(nova_evidencia)
        session.commit()
        session.refresh(nova_evidencia)
        return nova_evidencia

    except Exception as db_error:
        session.rollback()
        deletar_arquivo_bucket(caminho_salvo)
        
        raise HTTPException(
            status_code=500, 
            detail=f"Erro ao salvar no banco. O arquivo foi removido do storage para manter a integridade. Erro: {str(db_error)}"
        )
    
@app.get("/ocorrencias/{ocorrencia_id}/evidencias", tags=["Detalhes Ocorrência"])
def listar_evidencias(
    ocorrencia_id: UUID,
    session: Session = Depends(get_session),
    usuario_atual: Usuario = Depends(get_usuario_atual)
):
    """Lista as evidências (com URL de acesso) de uma ocorrência."""
    ocorrencia = session.get(Ocorrencia, ocorrencia_id)
    if not ocorrencia:
        raise HTTPException(status_code=404, detail="Ocorrência não encontrada")

    if usuario_atual.tipo_perfil != TipoPerfil.ADMINISTRADOR and ocorrencia.usuario_id != usuario_atual.id:
        raise HTTPException(status_code=403, detail="Acesso negado. Esta ocorrência pertence a outro usuário.")

    evidencias = session.exec(
        select(Evidencia).where(Evidencia.ocorrencia_id == ocorrencia_id)
    ).all()

    return [
        {
            "id": str(e.id),
            "tipo_midia": e.tipo_midia,
            "url": url_publica(e.caminho_salvo),
        }
        for e in evidencias
    ]


@app.get("/ocorrencias/{ocorrencia_id}/atualizacoes", response_model=List[AtualizacaoResponse], tags=["Detalhes Ocorrência"])
def listar_atualizacoes(
    ocorrencia_id: UUID,
    session: Session = Depends(get_session),
    usuario_atual: Usuario = Depends(get_usuario_atual)
):
    """Linha do tempo da ocorrência (mais antigas primeiro)."""
    ocorrencia = session.get(Ocorrencia, ocorrencia_id)
    if not ocorrencia:
        raise HTTPException(status_code=404, detail="Ocorrência não encontrada")

    if usuario_atual.tipo_perfil != TipoPerfil.ADMINISTRADOR and ocorrencia.usuario_id != usuario_atual.id:
        raise HTTPException(status_code=403, detail="Acesso negado. Esta ocorrência pertence a outro usuário.")

    query = (
        select(AtualizacaoOcorrencia)
        .where(AtualizacaoOcorrencia.ocorrencia_id == ocorrencia_id)
        .order_by(AtualizacaoOcorrencia.data_atualizado)
    )
    if usuario_atual.tipo_perfil != TipoPerfil.ADMINISTRADOR:
        query = query.where(AtualizacaoOcorrencia.tipo != TipoAtualizacao.NOTA_INTERNA.value)
    atualizacoes = session.exec(query).all()
    return [_montar_atualizacao(a, session) for a in atualizacoes]


@app.post("/ocorrencias/{ocorrencia_id}/atualizacoes", response_model=AtualizacaoResponse, status_code=201, tags=["Detalhes Ocorrência"])
def adicionar_atualizacao_linha_do_tempo(
    ocorrencia_id: UUID,
    atualizacao_in: AtualizacaoCreate,
    session: Session = Depends(get_session),
    usuario_atual: Usuario = Depends(get_usuario_atual) 
):
    """Chat / Linha do tempo da ocorrência."""
    ocorrencia = session.get(Ocorrencia, ocorrencia_id)
    if not ocorrencia:
        raise HTTPException(status_code=404, detail="Ocorrência não encontrada")
        
    # ALTERADO: SEGURANCA -> ADMINISTRADOR
    if usuario_atual.tipo_perfil != TipoPerfil.ADMINISTRADOR and ocorrencia.usuario_id != usuario_atual.id:
        raise HTTPException(status_code=403, detail="Acesso negado. Você só pode interagir com as suas próprias ocorrências.")
        
    texto = (atualizacao_in.mensagem_acao or "").strip()
    if not texto:
        raise HTTPException(status_code=400, detail="A mensagem não pode ser vazia.")

    if usuario_atual.tipo_perfil == TipoPerfil.ADMINISTRADOR:
        tipo = atualizacao_in.tipo or TipoAtualizacao.RESPOSTA
        if tipo not in (TipoAtualizacao.RESPOSTA, TipoAtualizacao.NOTA_INTERNA):
            tipo = TipoAtualizacao.RESPOSTA
        # Só denunciantes identificados recebem feedback individual
        if tipo == TipoAtualizacao.RESPOSTA and ocorrencia.usuario_id is None:
            raise HTTPException(
                status_code=400,
                detail="Denúncia anônima não recebe resposta individual. Registre como nota interna.",
            )
        registrar_atividade(
            session, usuario_atual,
            "RESPOSTA" if tipo == TipoAtualizacao.RESPOSTA else "NOTA_INTERNA",
            "Resposta enviada ao denunciante." if tipo == TipoAtualizacao.RESPOSTA else "Nota interna registrada.",
            ocorrencia.id,
        )
        # Responder o denunciante coloca a denúncia em verificação, se ainda não estiver
        if tipo == TipoAtualizacao.RESPOSTA and ocorrencia.status == StatusOcorrencia.ABERTO:
            ocorrencia.status = StatusOcorrencia.EM_ATENDIMENTO
            ocorrencia.responsavel_id = ocorrencia.responsavel_id or usuario_atual.id
            session.add(ocorrencia)
    else:
        tipo = TipoAtualizacao.MENSAGEM

    nova_atualizacao = AtualizacaoOcorrencia(
        ocorrencia_id=ocorrencia_id,
        autor_id=usuario_atual.id,
        tipo=tipo.value,
        mensagem_acao=texto,
    )
    session.add(nova_atualizacao)
    session.commit()
    session.refresh(nova_atualizacao)
    return _montar_atualizacao(nova_atualizacao, session)


def _montar_atualizacao(a: AtualizacaoOcorrencia, session: Session) -> AtualizacaoResponse:
    autor = session.get(Usuario, a.autor_id)
    return AtualizacaoResponse(
        id=a.id,
        ocorrencia_id=a.ocorrencia_id,
        autor_id=a.autor_id,
        autor_nome=autor.nome if autor else None,
        autor_admin=bool(autor and autor.tipo_perfil == TipoPerfil.ADMINISTRADOR),
        tipo=a.tipo or TipoAtualizacao.STATUS.value,
        mensagem_acao=a.mensagem_acao,
        data_atualizado=a.data_atualizado,
    )


# --- Painel do Administrador ---

STATUS_TEXTO = {
    StatusOcorrencia.ABERTO: "Recebida",
    StatusOcorrencia.EM_ATENDIMENTO: "Em verificação",
    StatusOcorrencia.RESOLVIDO: "Resolvida",
}


def _foi_respondida(ocorrencia_id, session: Session) -> bool:
    return session.exec(
        select(AtualizacaoOcorrencia.id).where(
            AtualizacaoOcorrencia.ocorrencia_id == ocorrencia_id,
            AtualizacaoOcorrencia.tipo == TipoAtualizacao.RESPOSTA.value,
        )
    ).first() is not None


def _montar_ocorrencia_admin(o: Ocorrencia, session: Session) -> OcorrenciaAdmin:
    autor = session.get(Usuario, o.usuario_id) if o.usuario_id else None
    responsavel = session.get(Usuario, o.responsavel_id) if o.responsavel_id else None
    total_evidencias = len(session.exec(
        select(Evidencia.id).where(Evidencia.ocorrencia_id == o.id)
    ).all())
    return OcorrenciaAdmin(
        **o.model_dump(),
        anonimo=o.usuario_id is None,
        autor_nome=autor.nome if autor else None,
        autor_email=autor.email if autor else None,
        responsavel_nome=responsavel.nome if responsavel else None,
        total_evidencias=total_evidencias,
        respondida=_foi_respondida(o.id, session),
    )


@app.get("/admin/ocorrencias", response_model=List[OcorrenciaAdmin], tags=["Administrador"])
def admin_listar_ocorrencias(
    status: Optional[StatusOcorrencia] = None,
    session: Session = Depends(get_session),
    usuario_admin: Usuario = Depends(verificar_perfil_seguranca)
):
    """Todas as denúncias do campus (mais recentes primeiro), com filtro opcional por status."""
    query = select(Ocorrencia).order_by(Ocorrencia.data_criacao.desc())
    if status is not None:
        query = query.where(Ocorrencia.status == status)
    return [_montar_ocorrencia_admin(o, session) for o in session.exec(query).all()]


@app.get("/admin/ocorrencias/{ocorrencia_id}", response_model=OcorrenciaAdmin, tags=["Administrador"])
def admin_buscar_ocorrencia(
    ocorrencia_id: UUID,
    session: Session = Depends(get_session),
    usuario_admin: Usuario = Depends(verificar_perfil_seguranca)
):
    """Detalhe da denúncia para o administrador (inclui autor e responsável)."""
    ocorrencia = session.get(Ocorrencia, ocorrencia_id)
    if not ocorrencia:
        raise HTTPException(status_code=404, detail="Ocorrência não encontrada")
    return _montar_ocorrencia_admin(ocorrencia, session)


# --- Registro de atividades (auditoria) ---

def registrar_atividade(session: Session, usuario: Optional[Usuario], acao: str, descricao: str, ocorrencia_id=None):
    """Adiciona um item ao log (o commit fica com quem chamou)."""
    session.add(LogAtividade(
        usuario_id=usuario.id if usuario else None,
        usuario_nome=usuario.nome if usuario else None,
        acao=acao,
        descricao=descricao,
        ocorrencia_id=ocorrencia_id,
    ))


@app.get("/admin/atividades", response_model=List[LogAtividadeResponse], tags=["Administrador"])
def admin_listar_atividades(
    limite: int = 200,
    acao: Optional[str] = None,
    session: Session = Depends(get_session),
    usuario_admin: Usuario = Depends(verificar_perfil_seguranca),
):
    """Últimas ações registradas no sistema (mais recentes primeiro)."""
    query = select(LogAtividade).order_by(LogAtividade.data.desc()).limit(max(1, min(limite, 1000)))
    if acao:
        query = query.where(LogAtividade.acao == acao)
    return session.exec(query).all()


# --- Usuários e permissões ---

@app.get("/admin/usuarios", response_model=List[UsuarioAdmin], tags=["Administrador"])
def admin_listar_usuarios(
    session: Session = Depends(get_session),
    usuario_admin: Usuario = Depends(verificar_perfil_seguranca),
):
    """Usuários com perfil. A contagem considera só denúncias identificadas."""
    usuarios = session.exec(select(Usuario).order_by(Usuario.tipo_perfil, Usuario.nome)).all()
    contagem = {}
    for uid in session.exec(select(Ocorrencia.usuario_id).where(Ocorrencia.usuario_id.is_not(None))).all():
        contagem[uid] = contagem.get(uid, 0) + 1
    return [
        UsuarioAdmin(
            id=u.id, nome=u.nome, email=u.email, tipo_perfil=u.tipo_perfil,
            cadastro_completo=u.cadastro_completo,
            total_denuncias=contagem.get(u.id, 0),
        )
        for u in usuarios
    ]


@app.patch("/admin/usuarios/{usuario_id}/perfil", response_model=UsuarioAdmin, tags=["Administrador"])
def admin_alterar_perfil(
    usuario_id: UUID,
    dados: PerfilUpdate,
    session: Session = Depends(get_session),
    usuario_admin: Usuario = Depends(verificar_perfil_seguranca),
):
    """Concede ou remove a permissão de administrador."""
    alvo = session.get(Usuario, usuario_id)
    if not alvo:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    if alvo.id == usuario_admin.id and dados.tipo_perfil != TipoPerfil.ADMINISTRADOR:
        raise HTTPException(status_code=400, detail="Você não pode remover a sua própria permissão de administrador.")
    if dados.tipo_perfil == TipoPerfil.ADMINISTRADOR and alvo.tipo_perfil != TipoPerfil.ADMINISTRADOR:
        raise HTTPException(
            status_code=400,
            detail="Alunos não podem virar administradores. Cadastre um novo administrador.",
        )

    if alvo.tipo_perfil != dados.tipo_perfil:
        alvo.tipo_perfil = dados.tipo_perfil
        session.add(alvo)
        registrar_atividade(
            session, usuario_admin, "PERMISSAO",
            f"{'Concedeu' if dados.tipo_perfil == TipoPerfil.ADMINISTRADOR else 'Removeu'} acesso de administrador "
            f"{'a' if dados.tipo_perfil == TipoPerfil.ADMINISTRADOR else 'de'} {alvo.nome}.",
        )
        session.commit()
        session.refresh(alvo)

    total = len(session.exec(select(Ocorrencia.id).where(Ocorrencia.usuario_id == alvo.id)).all())
    return UsuarioAdmin(
        id=alvo.id, nome=alvo.nome, email=alvo.email, tipo_perfil=alvo.tipo_perfil,
        cadastro_completo=alvo.cadastro_completo, total_denuncias=total,
    )


# --- Anexos de denúncia anônima ---

def _gerar_token_anexo(ocorrencia_id) -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=1)
    return jwt.encode({"anexo": str(ocorrencia_id), "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)


def _token_anexo_valido(token: Optional[str], ocorrencia_id) -> bool:
    if not token:
        return False
    try:
        dados = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.InvalidTokenError:
        return False
    return dados.get("anexo") == str(ocorrencia_id)


@app.post("/admin/usuarios", response_model=UsuarioAdmin, status_code=201, tags=["Administrador"])
def admin_criar_administrador(
    dados: AdminCreate,
    session: Session = Depends(get_session),
    usuario_admin: Usuario = Depends(verificar_perfil_seguranca),
):
    """Cadastra um novo administrador (conta separada; aluno não vira admin)."""
    if session.exec(select(Usuario).where(Usuario.email == dados.email)).first():
        raise HTTPException(status_code=400, detail="Já existe uma conta com este e-mail.")
    novo = Usuario(
        nome=dados.nome,
        email=dados.email,
        senha_hash=pwd_context.hash(dados.senha),
        tipo_perfil=TipoPerfil.ADMINISTRADOR,
        cadastro_completo=True,
    )
    session.add(novo)
    session.commit()
    session.refresh(novo)
    registrar_atividade(session, usuario_admin, "PERMISSAO", f"Cadastrou o administrador {novo.nome} ({novo.email}).")
    session.commit()
    session.refresh(novo)
    return UsuarioAdmin(
        id=novo.id, nome=novo.nome, email=novo.email, tipo_perfil=novo.tipo_perfil,
        cadastro_completo=True, total_denuncias=0,
    )


# --- Área do denunciante ---

@app.get("/minhas-denuncias", response_model=List[MinhaDenuncia], tags=["Ocorrências"])
def listar_minhas_denuncias(
    session: Session = Depends(get_session),
    usuario_atual: Usuario = Depends(get_usuario_atual),
):
    """Denúncias identificadas do usuário logado, com andamento e último retorno da administração.
    (Denúncias anônimas não ficam ligadas ao usuário, por isso não aparecem aqui.)"""
    ocorrencias = session.exec(
        select(Ocorrencia)
        .where(Ocorrencia.usuario_id == usuario_atual.id)
        .order_by(Ocorrencia.data_criacao.desc())
    ).all()
    resultado = []
    for o in ocorrencias:
        respostas = session.exec(
            select(AtualizacaoOcorrencia)
            .where(
                AtualizacaoOcorrencia.ocorrencia_id == o.id,
                AtualizacaoOcorrencia.tipo == TipoAtualizacao.RESPOSTA.value,
            )
            .order_by(AtualizacaoOcorrencia.data_atualizado.desc())
        ).all()
        total_ev = len(session.exec(select(Evidencia.id).where(Evidencia.ocorrencia_id == o.id)).all())
        resultado.append(MinhaDenuncia(
            id=o.id, tipo_incidente=o.tipo_incidente, localizacao=o.localizacao,
            descricao_resumida=o.descricao_resumida, descricao=o.descricao, gravidade=o.gravidade,
            status=o.status, data_criacao=o.data_criacao, horario_ocorrencia=o.horario_ocorrencia,
            data_resolucao=o.data_resolucao, respondida=bool(respostas), total_respostas=len(respostas),
            ultima_resposta=respostas[0].mensagem_acao if respostas else None,
            data_ultima_resposta=respostas[0].data_atualizado if respostas else None,
            total_evidencias=total_ev,
        ))
    return resultado
