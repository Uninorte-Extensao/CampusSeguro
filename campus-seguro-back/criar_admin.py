"""
Cria (ou promove) um usuário ADMINISTRADOR.

O cadastro público (/usuarios/) sempre cria ALUNO, então administradores
são criados por aqui, com acesso ao banco (mesmo .env da API):

    python criar_admin.py "Nome do Admin" admin@campus.edu "SenhaForte@123"

Se o e-mail já existir, o usuário é promovido a ADMINISTRADOR e a senha
é atualizada.
"""
import os
import sys

from dotenv import load_dotenv
from passlib.context import CryptContext
from sqlmodel import Session, SQLModel, create_engine, select

from models import TipoPerfil, Usuario
from schemas import UsuarioCreate


def main():
    if len(sys.argv) != 4:
        print(__doc__)
        sys.exit(1)

    nome, email, senha = sys.argv[1:]
    # Reaproveita as validações de e-mail e força de senha do cadastro
    UsuarioCreate(nome=nome, email=email, senha=senha)

    load_dotenv()
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        sys.exit("DATABASE_URL não foi definida no .env")
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    engine = create_engine(database_url)
    SQLModel.metadata.create_all(engine)
    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

    with Session(engine) as session:
        usuario = session.exec(select(Usuario).where(Usuario.email == email)).first()
        acao = "promovido" if usuario else "criado"
        if not usuario:
            usuario = Usuario(nome=nome, email=email)
        usuario.nome = nome
        usuario.senha_hash = pwd.hash(senha)
        usuario.tipo_perfil = TipoPerfil.ADMINISTRADOR
        usuario.cadastro_completo = True
        session.add(usuario)
        session.commit()

    print(f"Administrador {acao}: {email}")


if __name__ == "__main__":
    main()
