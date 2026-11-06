from enum import Enum
from uuid import UUID, uuid4
from datetime import datetime, date, timezone
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

# --- ENUMS ---
class TipoPerfil(str, Enum):
    ALUNO = "ALUNO"
    ADMINISTRADOR = "ADMINISTRADOR"

class StatusOcorrencia(str, Enum):
    ABERTO = "ABERTO"
    EM_ATENDIMENTO = "EM_ATENDIMENTO"
    RESOLVIDO = "RESOLVIDO"

class TipoAtualizacao(str, Enum):
    STATUS = "STATUS"              # mudança de etapa (visível ao denunciante)
    RESPOSTA = "RESPOSTA"          # resposta/feedback da administração ao denunciante
    NOTA_INTERNA = "NOTA_INTERNA"  # anotação da verificação, só administradores veem
    MENSAGEM = "MENSAGEM"          # mensagem enviada pelo próprio denunciante

class TipoMidia(str, Enum):
    FOTO = "Foto"
    VIDEO = "Vídeo"
    AUDIO = "Áudio"
    DOCUMENTO = "Documento"

# --- MODELOS ---

class Usuario(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    # --- CAMPOS PARA O CADASTRO RÁPIDO ---
    nome: str
    data_nascimento: Optional[date] = None 
    
    # --- CAMPOS PARA O CADASTRO completo ---
    email: Optional[str] = Field(default=None, unique=True, index=True)
    senha_hash: Optional[str] = None
    
    tipo_perfil: TipoPerfil = Field(default=TipoPerfil.ALUNO)
    
    genero: Optional[str] = None
    cpf: Optional[str] = Field(default=None, unique=True, index=True)
    cadastro_completo: bool = Field(default=False)

    # Relacionamentos
    ocorrencias_registradas: List["Ocorrencia"] = Relationship(
        back_populates="autor", sa_relationship_kwargs={"foreign_keys": "Ocorrencia.usuario_id"}
    )
    ocorrencias_atendidas: List["Ocorrencia"] = Relationship(
        back_populates="responsavel", sa_relationship_kwargs={"foreign_keys": "Ocorrencia.responsavel_id"}
    )

class Ocorrencia(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    
    usuario_id: Optional[UUID] = Field(default=None, foreign_key="usuario.id")

    descricao_resumida: str
    horario_ocorrencia: datetime
    
    tipo_incidente: str
    descricao: str
    localizacao: str
    status: StatusOcorrencia = Field(default=StatusOcorrencia.ABERTO)
    # Urgência: "Baixa" | "Média" | "Alta" | "Crítica" (vem da IA, do botão de
    # emergência ou é classificada pelo administrador na verificação)
    gravidade: Optional[str] = None
    data_resolucao: Optional[datetime] = None

    # ALTERADO: datetime.now(timezone.utc) para aceitar timezone
    data_criacao: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    responsavel_id: Optional[UUID] = Field(default=None, foreign_key="usuario.id")

    # Relacionamentos
    autor: Optional[Usuario] = Relationship(
        back_populates="ocorrencias_registradas", sa_relationship_kwargs={"foreign_keys": "[Ocorrencia.usuario_id]"}
    )
    responsavel: Optional[Usuario] = Relationship(
        back_populates="ocorrencias_atendidas", sa_relationship_kwargs={"foreign_keys": "[Ocorrencia.responsavel_id]"}
    )
    atualizacoes: List["AtualizacaoOcorrencia"] = Relationship(back_populates="ocorrencia")
    evidencias: List["Evidencia"] = Relationship(back_populates="ocorrencia")

class AtualizacaoOcorrencia(SQLModel, table=True):
    __tablename__ = "atualizacao_ocorrencia"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    ocorrencia_id: UUID = Field(foreign_key="ocorrencia.id")
    autor_id: UUID = Field(foreign_key="usuario.id")
    mensagem_acao: str
    tipo: str = Field(default=TipoAtualizacao.STATUS.value)

    # ALTERADO: datetime.now(timezone.utc) para aceitar timezone
    data_atualizado: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relacionamento
    ocorrencia: Ocorrencia = Relationship(back_populates="atualizacoes")

class Evidencia(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    ocorrencia_id: UUID = Field(foreign_key="ocorrencia.id")
    caminho_salvo: str
    tipo_midia: TipoMidia

    # Relacionamento
    ocorrencia: Ocorrencia = Relationship(back_populates="evidencias")


class LogAtividade(SQLModel, table=True):
    """Registro de atividades (auditoria) do sistema.

    IMPORTANTE: denúncias anônimas são registradas SEM o autor, para o log
    nunca revelar quem denunciou.
    """
    __tablename__ = "log_atividade"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    data: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    usuario_id: Optional[UUID] = Field(default=None, foreign_key="usuario.id")
    usuario_nome: Optional[str] = None
    acao: str = Field(index=True)
    descricao: str
    ocorrencia_id: Optional[UUID] = Field(default=None, foreign_key="ocorrencia.id")
