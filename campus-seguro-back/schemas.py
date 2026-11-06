from datetime import date, datetime
import re
from uuid import UUID
from typing import Optional, List
from pydantic import BaseModel, EmailStr, field_validator
from models import StatusOcorrencia, TipoAtualizacao, TipoMidia, TipoPerfil

GRAVIDADES = ("Baixa", "Média", "Alta", "Crítica")


def _validar_gravidade(valor: Optional[str]) -> Optional[str]:
    if valor is None or not str(valor).strip():
        return None
    mapa = {g.lower(): g for g in GRAVIDADES}
    mapa.update({"media": "Média", "critica": "Crítica"})
    normal = mapa.get(str(valor).strip().lower())
    if not normal:
        raise ValueError(f"Gravidade inválida. Use: {', '.join(GRAVIDADES)}.")
    return normal

# --- AUTENTICAÇÃO ---
class Token(BaseModel):
    access_token: str
    token_type: str

# --- USUÁRIOS ---
class UsuarioCreate(BaseModel):
    nome: str
    data_nascimento: Optional[date] = None 
    email: Optional[EmailStr] = None 
    cpf: Optional[str] = None
    senha: Optional[str] = None
    tipo_perfil: Optional[TipoPerfil] = TipoPerfil.ALUNO
    genero: Optional[str] = None

    @field_validator('senha')
    @classmethod
    def validar_forca_senha(cls, senha_digitada: Optional[str]) -> Optional[str]:
        if senha_digitada is None:
            return senha_digitada

        if len(senha_digitada) < 8:
            raise ValueError("A senha deve ter no mínimo 8 caracteres.")
        if not re.search(r"[A-Z]", senha_digitada):
            raise ValueError("A senha deve conter pelo menos uma letra maiúscula.")
        if not re.search(r"[0-9]", senha_digitada):
            raise ValueError("A senha deve conter pelo menos um número.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", senha_digitada):
            raise ValueError("A senha deve conter pelo menos um caractere especial (ex: @, #, $).")

        return senha_digitada

class UsuarioResponse(BaseModel):
    id: UUID
    nome: str
    data_nascimento: Optional[date] = None
    email: Optional[str] = None
    cpf: Optional[str] = None
    tipo_perfil: TipoPerfil
    cadastro_completo: bool

    class Config:
        from_attributes = True

# Retorno do cadastro: já devolve o token para o app autenticar na hora
# (útil também para o Cadastro Rápido, que não tem senha para fazer /login depois)
class UsuarioComToken(BaseModel):
    usuario: UsuarioResponse
    access_token: str
    token_type: str = "bearer"

# --- REQUISÇÃO DA IA (FRONT-END -> BACK-END) ---
class RelatoRequest(BaseModel):
    descricao: str

# --- OCORRÊNCIAS ---
class OcorrenciaCreate(BaseModel):
    tipo_incidente: str = "Emergência Geral"
    descricao: str = "Acionamento rápido via botão de emergência."
    localizacao: str
    anonimo: bool = False
    
    # 🌟 ESSES CAMPOS AGORA SÃO ENVIADOS PELA IA APÓS O PROCESSAMENTO 🌟
    descricao_resumida: Optional[str] = "Acionamento rápido"
    horario_ocorrencia: Optional[datetime] = None
    gravidade: Optional[str] = None

    _gravidade = field_validator('gravidade')(classmethod(lambda cls, v: _validar_gravidade(v)))

class OcorrenciaUpdate(BaseModel):
    status: Optional[StatusOcorrencia] = None
    responsavel_id: Optional[UUID] = None
    # Observação opcional do administrador registrada na linha do tempo
    mensagem: Optional[str] = None
    gravidade: Optional[str] = None

    _gravidade = field_validator('gravidade')(classmethod(lambda cls, v: _validar_gravidade(v)))

# Visão do painel do administrador: ocorrência + nomes de autor/responsável
class OcorrenciaAdmin(BaseModel):
    id: UUID
    usuario_id: Optional[UUID] = None
    descricao_resumida: str
    horario_ocorrencia: datetime
    tipo_incidente: str
    descricao: str
    localizacao: str
    status: StatusOcorrencia
    data_criacao: datetime
    responsavel_id: Optional[UUID] = None
    gravidade: Optional[str] = None
    data_resolucao: Optional[datetime] = None
    respondida: bool = False
    anonimo: bool
    autor_nome: Optional[str] = None
    autor_email: Optional[str] = None
    responsavel_nome: Optional[str] = None
    total_evidencias: int = 0

# --- EVIDÊNCIAS ---
class EvidenciaCreate(BaseModel):
    # Sincronizado: o model chama 'caminho_salvo', o schema precisa refletir isso
    caminho_salvo: str  
    tipo_midia: TipoMidia

# --- ATUALIZAÇÕES ---
class AtualizacaoCreate(BaseModel):
    mensagem_acao: str
    # Admin: RESPOSTA (padrão, o denunciante vê) ou NOTA_INTERNA.
    # Denunciante: sempre MENSAGEM.
    tipo: Optional[TipoAtualizacao] = None
    # Ignorado: o autor é sempre o usuário autenticado (mantido por compatibilidade)
    autor_id: Optional[UUID] = None

class AtualizacaoResponse(BaseModel):
    id: UUID
    ocorrencia_id: UUID
    autor_id: UUID
    autor_nome: Optional[str] = None
    autor_admin: bool = False
    tipo: str = TipoAtualizacao.STATUS.value
    mensagem_acao: str
    data_atualizado: datetime


# --- PAINEL: USUÁRIOS / PERMISSÕES ---
class UsuarioAdmin(BaseModel):
    id: UUID
    nome: str
    email: Optional[str] = None
    tipo_perfil: TipoPerfil
    cadastro_completo: bool
    total_denuncias: int = 0


class PerfilUpdate(BaseModel):
    tipo_perfil: TipoPerfil


# --- REGISTRO DE ATIVIDADES ---
class LogAtividadeResponse(BaseModel):
    id: UUID
    data: datetime
    usuario_id: Optional[UUID] = None
    usuario_nome: Optional[str] = None
    acao: str
    descricao: str
    ocorrencia_id: Optional[UUID] = None


class AdminCreate(BaseModel):
    """Novo administrador criado por outro administrador (nunca a partir de aluno)."""
    nome: str
    email: EmailStr
    senha: str

    @field_validator('senha')
    @classmethod
    def validar_senha(cls, senha: str) -> str:
        return UsuarioCreate.validar_forca_senha(senha)

    @field_validator('nome')
    @classmethod
    def validar_nome(cls, nome: str) -> str:
        if len(nome.strip()) < 3:
            raise ValueError("Informe o nome completo.")
        return nome.strip()


# --- ÁREA DO DENUNCIANTE ---
class MinhaDenuncia(BaseModel):
    id: UUID
    tipo_incidente: str
    localizacao: str
    descricao_resumida: str
    descricao: str
    gravidade: Optional[str] = None
    status: StatusOcorrencia
    data_criacao: datetime
    horario_ocorrencia: datetime
    data_resolucao: Optional[datetime] = None
    respondida: bool = False
    total_respostas: int = 0
    ultima_resposta: Optional[str] = None
    data_ultima_resposta: Optional[datetime] = None
    total_evidencias: int = 0
