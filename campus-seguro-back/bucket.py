import os
import shutil
import boto3
from botocore.client import Config
from dotenv import load_dotenv
import uuid
from fastapi import UploadFile

# Pasta usada como fallback quando o R2 não está configurado (ambiente dev).
PASTA_UPLOADS_LOCAL = os.path.join(os.path.dirname(__file__), "uploads")

# 1. Carrega as variáveis do arquivo .env para a memória do Python
load_dotenv()

# 2. Puxa as credenciais usando o os.getenv()
#    `or None` trata string vazia ("" vindo de um .env com a chave em branco)
#    como ausente — senão o boto3 quebra com "Invalid endpoint:" já no import.
ENDPOINT_URL = os.getenv('R2_ENDPOINT_URL') or None
ACCESS_KEY = os.getenv('R2_ACCESS_KEY_ID') or None
SECRET_KEY = os.getenv('R2_SECRET_ACCESS_KEY') or None
BUCKET_NAME = os.getenv('R2_BUCKET_NAME') or None

# 3. Cria o cliente R2 somente se estiver configurado.
#    Assim o servidor sobe normalmente mesmo sem R2 (upload de evidências é
#    opcional e não faz parte do fluxo principal de denúncias).
R2_CONFIGURADO = bool(ENDPOINT_URL and ACCESS_KEY and SECRET_KEY and BUCKET_NAME)

if R2_CONFIGURADO:
    s3_client = boto3.client(
        's3',
        endpoint_url=ENDPOINT_URL,
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
        config=Config(signature_version='s3v4'),
        region_name='auto'
    )
else:
    s3_client = None


def _exigir_r2():
    """Garante que o storage está configurado antes de qualquer operação."""
    if s3_client is None:
        raise RuntimeError(
            "Armazenamento de arquivos (R2) não configurado. "
            "Defina R2_ENDPOINT_URL, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY e "
            "R2_BUCKET_NAME no arquivo .env para habilitar o upload de evidências."
        )

def gerar_link_seguro(caminho_arquivo: str):
    """Gera um link que se autodestrói em 1 hora"""
    _exigir_r2()
    url_temporaria = s3_client.generate_presigned_url(
        ClientMethod='get_object',
        Params={
            'Bucket': BUCKET_NAME, # Puxando do .env também
            'Key': caminho_arquivo
        },
        ExpiresIn=3600 # Tempo de vida do link em segundos (3600 = 1 hora)
    )
    print(url_temporaria)
    return url_temporaria


def deletar_arquivo_bucket(key: str):
    """Remove um arquivo do storage (R2 ou local) caso o banco de dados falhe"""
    if s3_client is None:
        # Fallback local: remove o arquivo da pasta uploads/
        try:
            caminho = os.path.join(PASTA_UPLOADS_LOCAL, key)
            if os.path.exists(caminho):
                os.remove(caminho)
        except Exception as e:
            print(f"Erro ao remover arquivo local {key}: {str(e)}")
        return
    try:
        s3_client.delete_object(Bucket=BUCKET_NAME, Key=key)
        print(f"Arquivo {key} removido do bucket após falha no banco.")
    except Exception as e:
        print(f"Erro crítico: Não foi possível remover {key} do bucket: {str(e)}")

def obter_tamanho_atual_bucket() -> int:
    """Soma o peso de todos os arquivos do bucket e retorna em bytes"""
    _exigir_r2()
    tamanho_total = 0
    # O Paginator lida automaticamente com buckets que têm milhares de arquivos
    paginator = s3_client.get_paginator('list_objects_v2')
    
    for pagina in paginator.paginate(Bucket=BUCKET_NAME):
        if 'Contents' in pagina:
            for objeto in pagina['Contents']:
                tamanho_total += objeto['Size'] # Soma os bytes de cada arquivo

    print(f"Tamanho atual do bucket: {tamanho_total} bytes")                
    return tamanho_total


def fazer_upload_arquivo(arquivo: UploadFile) -> str:
    """Recebe um arquivo, salva (R2 ou local) e retorna a Key/nome salvo."""

    # Gera um nome seguro e único para o arquivo
    extensao = (arquivo.filename or "arquivo").split(".")[-1]
    nome_seguro = f"{uuid.uuid4()}.{extensao}"

    # --- Fallback LOCAL: quando o R2 não está configurado (ambiente dev) ---
    if not R2_CONFIGURADO:
        os.makedirs(PASTA_UPLOADS_LOCAL, exist_ok=True)
        caminho = os.path.join(PASTA_UPLOADS_LOCAL, nome_seguro)
        arquivo.file.seek(0)
        with open(caminho, "wb") as destino:
            shutil.copyfileobj(arquivo.file, destino)
        return nome_seguro

    # --- Upload no Cloudflare R2 ---
    # 1. Trava de Segurança: Calcular o tamanho atual do bucket
    LIMITE_BYTES = 9 * 1024 * 1024 * 1024 # 9 Gigabytes em Bytes
    tamanho_atual_bucket = obter_tamanho_atual_bucket()
    
    # 2. Descobrir o tamanho do arquivo que o usuário está tentando enviar
    arquivo.file.seek(0, 2) # Joga o "cursor" de leitura pro final do arquivo
    tamanho_novo_arquivo = arquivo.file.tell() # Vê em qual byte parou (peso do arquivo)
    arquivo.file.seek(0) # IMPORTANTE: Volta o cursor para o começo para o upload funcionar
    
    # 3. Verifica se a soma do que já tem + o que está chegando passa de 9GB
    if (tamanho_atual_bucket + tamanho_novo_arquivo) >= LIMITE_BYTES:
        # Se passar, nós abortamos a operação aqui mesmo, antes de gastar internet enviando
        raise ValueError("Capacidade máxima do sistema atingida (9GB). Não é possível enviar novos arquivos no momento.")

    # 4. Fazer o upload usando o nome seguro gerado no início da função
    s3_client.upload_fileobj(
        arquivo.file,       
        BUCKET_NAME,        
        nome_seguro,        
        ExtraArgs={
            "ContentType": arquivo.content_type 
        }
    )

    return nome_seguro