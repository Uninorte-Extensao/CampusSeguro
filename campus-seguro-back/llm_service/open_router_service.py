import requests
import re
import time
import os

from typing import List
from dotenv import load_dotenv
from .utils import *
from .security import SecurityService

load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")
API_URL = "https://openrouter.ai/api/v1/chat/completions"


security_service = SecurityService()


SYSTEM_PROMPT = """
            Extraia JSON da denúncia.

            O texto fornecido pode conter placeholders de anonimização como:
            [NOME], [CPF], [EMAIL], [TELEFONE], [CARTAO], [CEP].

            Esses placeholders representam dados sensíveis que foram removidos por segurança.

            Regras:
            - Retorne UM ÚNICO objeto JSON
            - NÃO retorne múltiplos JSONs
            - Todos os campos devem estar no MESMO objeto
            - NÃO inclua comentários (// ou #)
            - NÃO inclua explicações
            - NÃO inclua texto fora do JSON
            - Todos os campos devem ser válidos em JSON
            - NÃO tente inferir ou reconstruir esses dados.
            - Considere os placeholders como entidades reais no contexto.
            - Continue a análise normalmente, ignorando a ausência dos dados reais.

            IMPORTANTE:
            - Sua resposta deve conter exatamente 1 objeto JSON
            - Não retorne múltiplos blocos
            - Não repita JSON

            - Campos desconhecidos devem ser:
            - string vazia "" para texto
            - null apenas se necessário

            - Horário:
            - formato HH:MM se existir
            - caso contrário use ""

            - tipo_agressao nunca pode ser vazio

            - gravidade: estime o nível de risco do incidente.
            - Valores permitidos: "Baixa", "Média", "Alta"
            - Use "Alta" quando houver: uso ou menção de arma (faca, facada,
              arma de fogo, tiro), lesão física, ameaça de morte, violência
              sexual, roubo com violência ou risco iminente à vida.
            - Use "Média" para agressões sem lesão grave, ameaças genéricas,
              assédio moral/racial recorrente.
            - Use "Baixa" para situações leves, sem contato físico nem ameaça direta.
            - gravidade nunca pode ser vazia.

            - Se não for denúncia:
            - "is_valid_denuncia": false
            - preencher "motivo_invalidacao"

            Tipos:
            agressao_fisica, assedio_moral, assedio_sexual,
            injuria_racial, bullying, ameaca, discriminacao,
            violencia_psicologica, outro

            JSON esperado:
            {
            "is_valid_denuncia": bool,
            "motivo_invalidacao": "",
            "tipo_agressao": "",
            "gravidade": "",
            "horario": "",
            "local": "",
            "agressor": "",
            "descricao_resumida": "",
            "confidence": 0.0
            }
"""


def chamar_openrouter(modelo: str, messages: list) -> dict:
    response = requests.post(
        API_URL,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost",
            "X-Title": "Campus Seguro"
        },
        json={
            "model": modelo,
            "messages": messages,
            "temperature": 0,
            # Sem "raciocínio" interno: a resposta sai em 1-4s em vez de 30-60s
            # (medido nos modelos gratuitos em 09/11/2026)
            "reasoning": {"enabled": False},
            "max_tokens": 700,
        },
        # Espera curta: se um modelo gratuito travar, passa logo para o próximo
        timeout=int(os.getenv("OPENROUTER_TIMEOUT") or 25)
    )

    if response.status_code >= 400:
        # Mostra o motivo real no log (401 chave inválida, 402 sem crédito,
        # 404 modelo inexistente, 429 limite atingido...)
        print(f"[ERRO] {modelo}: HTTP {response.status_code} - {response.text[:300]}", flush=True)
    response.raise_for_status()
    return response.json()


def executar_com_fallback(messages: list, modelos: List[str], tentativas: int = 2) -> dict:
    """Tenta cada modelo em ordem. Modelos gratuitos vivem congestionados (429):
    se todos falharem, espera um pouco e faz mais uma rodada."""
    for rodada in range(tentativas):
        if rodada:
            print("[INFO] Todos falharam; nova rodada em 3s (modelos gratuitos congestionados)", flush=True)
            time.sleep(3)
        resp = _uma_rodada(messages, modelos)
        if resp is not None:
            return resp
    raise Exception("Todos os modelos falharam")


def _uma_rodada(messages: list, modelos: List[str]):
    for modelo in modelos:
        try:
            print(f"[INFO] Tentando: {modelo}")
            resp = chamar_openrouter(modelo, messages)

            if "choices" not in resp:
                print(f"[ERRO] Resposta inválida: {modelo}")
                continue

            print(f"[SUCESSO] Modelo usado: {modelo}")
            return resp

        except requests.exceptions.RequestException as e:
            print(f"[ERRO] {modelo}: {e}", flush=True)
            continue

    return None


def fazer_request_via_open_router(messages: list):
    # Permite trocar a lista sem novo deploy: OPENROUTER_MODELOS=modelo1,modelo2
    personalizados = [m.strip() for m in (os.getenv("OPENROUTER_MODELOS") or "").split(",") if m.strip()]
    if personalizados:
        return executar_com_fallback(messages, personalizados)

    # Lista conferida no catálogo do OpenRouter em 06/11/2026.
    # Modelos ":free" mudam de nome/saem do ar com frequência; se voltar a
    # falhar tudo, confira em https://openrouter.ai/models?q=free e ajuste
    # aqui ou via OPENROUTER_MODELOS no .env (sem novo deploy).
    modelos = [
        # Somente modelos gratuitos (sem custo). Ordem = preferência.
        # Ordem pela velocidade medida (sem raciocínio): ~1-4s cada
        "nvidia/nemotron-3.5-super-vl:free",
        "nvidia/nemotron-3.5-lightning:free",
        "nvidia/nemotron-3-ultra-550b-a55b:free",
        "google/gemma-4-31b-it:free",
        "google/gemma-4-26b-a4b-it:free",
        "xingchen-agi/xing4.0-29b-a4b:free",
    ]

    return executar_com_fallback(messages, modelos)


def extrair_content_openrouter(resp_json: dict) -> str:
    try:
        return resp_json["choices"][0]["message"]["content"]
    except (KeyError, IndexError):
        raise ValueError("Estrutura inválida da resposta")


def extrair_relato(texto: str, debug: bool = True):
    inicio = time.time()

    if not API_KEY:
        raise ValueError("OPENROUTER_API_KEY não encontrada")

    # =========================
    # 1. Entrada do usuário
    # =========================
    texto = (texto or "").strip()[:500]

    # =========================
    # 2. Camada de segurança
    # =========================
    security_result = security_service.analisar_texto(texto)
    texto_para_llm = security_result.sanitized_text

    # Sempre garantir estrutura consistente pro front
    mensagens_seg = []

    if security_result.houve_anonimizacao:
        mensagens_seg.append(
            "Algumas informações sensíveis foram automaticamente anonimizadas."
        )

    if not security_result.is_safe:
        mensagens_seg.append(
            "Detectamos um possível comportamento suspeito na entrada."
        )

    seguranca_info = {
        "houve_anonimizacao": security_result.houve_anonimizacao,
        "risco": not security_result.is_safe,
        "mensagens": mensagens_seg  # <- SEMPRE lista válida
    }

    # =========================
    # 3. Chamada ao LLM
    # =========================
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": texto_para_llm}
    ]

    try:
        resp_json = fazer_request_via_open_router(messages)
        content = extrair_content_openrouter(resp_json)
        content = re.sub(r"//.*", "", content)

        if debug:
            print("\n=== TEXTO ENVIADO AO LLM ===")
            print(texto_para_llm)
            print("============================\n")

            print("\n=== OPENROUTER RAW ===")
            print(content)
            print("======================\n")

    except Exception as e:
        print_tempo(inicio, time.time())
        return {
            "erro": True,
            "mensagem": "Erro ao processar a solicitação.",
            "detalhe": str(e),
            "seguranca": seguranca_info
        }

    # =========================
    # 4. Parse e validação
    # =========================
    data = parse_json(content)

    if not data:
        print_tempo(inicio, time.time())
        return {
            "erro": True,
            "mensagem": "Resposta inválida do modelo.",
            "seguranca": seguranca_info
        }

    # =========================
    # 5. Normalização
    # =========================
    data["tipo_agressao"] = normalizar_tipo_agressao(data.get("tipo_agressao"))
    data["horario"] = normalizar_horario(data.get("horario"))

    # =========================
    # 6. Segurança SEMPRE presente
    # =========================
    data["seguranca"] = seguranca_info

    # (opcional mas recomendado)
    data["texto_anonimizado"] = texto_para_llm

    print_tempo(inicio, time.time())
    return data