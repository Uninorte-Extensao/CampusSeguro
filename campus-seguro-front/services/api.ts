import { Platform } from "react-native";

/**
 * URL base da API.
 *
 * Prioridade:
 *  1. Variável de ambiente EXPO_PUBLIC_API_URL (defina em um arquivo .env).
 *  2. Fallback por plataforma:
 *     - Android (emulador): 10.0.2.2 aponta para o localhost da máquina host.
 *     - iOS / Web: localhost.
 *
 * Em dispositivo físico, defina EXPO_PUBLIC_API_URL com o IP da sua máquina,
 * ex.: EXPO_PUBLIC_API_URL=http://192.168.0.10:8000
 */
function resolverBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv.replace(/\/+$/, "");
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }

  return "http://localhost:8000";
}

export const API_BASE_URL = resolverBaseUrl();

// --- Tipos espelhando o backend ---
export type TipoPerfil = "ALUNO" | "ADMINISTRADOR" | "SEGURANCA";
export type StatusOcorrencia = "ABERTO" | "EM_ATENDIMENTO" | "RESOLVIDO";

export interface Usuario {
  id: string;
  nome: string;
  data_nascimento?: string | null;
  email?: string | null;
  cpf?: string | null;
  tipo_perfil: TipoPerfil;
  cadastro_completo: boolean;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface UsuarioComToken {
  usuario: Usuario;
  access_token: string;
  token_type: string;
}

export interface Ocorrencia {
  id: string;
  usuario_id?: string | null;
  descricao_resumida: string;
  horario_ocorrencia: string;
  tipo_incidente: string;
  descricao: string;
  localizacao: string;
  status: StatusOcorrencia;
  data_criacao: string;
  responsavel_id?: string | null;
}

export interface CriarUsuarioPayload {
  nome: string;
  data_nascimento?: string | null;
  email?: string | null;
  cpf?: string | null;
  senha?: string | null;
  tipo_perfil?: TipoPerfil;
  genero?: string | null;
}

export interface CriarOcorrenciaPayload {
  tipo_incidente?: string;
  descricao?: string;
  localizacao: string;
  anonimo?: boolean;
  descricao_resumida?: string;
  horario_ocorrencia?: string | null;
}

export interface DadosExtraidosIA {
  is_valid_denuncia?: boolean;
  motivo_invalidacao?: string;
  tipo_agressao?: string;
  gravidade?: string;
  horario?: string;
  local?: string;
  agressor?: string;
  descricao_resumida?: string;
  confidence?: number;
  erro?: boolean;
  mensagem?: string;
  seguranca?: {
    houve_anonimizacao?: boolean;
    risco?: boolean;
    mensagens?: string[];
  };
  [key: string]: unknown;
}

export interface PreviewIAResponse {
  descricao_original: string;
  dados_extraidos: DadosExtraidosIA;
}

// --- Erro padronizado da API ---
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// --- Token em memória (sincronizado pelo AuthContext) ---
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

function extrairMensagemErro(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;

  const detail = (body as { detail?: unknown }).detail;

  if (typeof detail === "string") return detail;

  // Erros de validação do FastAPI vêm como lista de objetos { msg, loc, ... }
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((item) =>
        item && typeof item === "object" && "msg" in item
          ? String((item as { msg: unknown }).msg)
          : null
      )
      .filter(Boolean);

    if (msgs.length > 0) return msgs.join("\n");
  }

  return fallback;
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  if (auth && authToken) {
    finalHeaders.Authorization = `Bearer ${authToken}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique sua conexão e se a API está no ar.",
      0
    );
  }

  const texto = await response.text();
  const body = texto ? safeJsonParse(texto) : null;

  if (!response.ok) {
    throw new ApiError(
      extrairMensagemErro(body, `Erro ${response.status} ao chamar a API.`),
      response.status
    );
  }

  return body as T;
}

function safeJsonParse(texto: string): unknown {
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

// --- Endpoints ---

/** Autentica via e-mail OU CPF + senha. O backend espera form-urlencoded. */
export async function login(identificador: string, senha: string): Promise<Token> {
  const form = new URLSearchParams();
  form.append("username", identificador);
  form.append("password", senha);

  return request<Token>("/login", {
    method: "POST",
    auth: false,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
}

/** Cria usuário (rápido ou completo) e já recebe um token de acesso. */
export async function criarUsuario(
  payload: CriarUsuarioPayload
): Promise<UsuarioComToken> {
  return request<UsuarioComToken>("/usuarios/", {
    method: "POST",
    auth: false,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** Retorna o usuário autenticado (nome, perfil etc.). */
export async function buscarUsuarioAtual(): Promise<Usuario> {
  return request<Usuario>("/usuarios/me", { method: "GET" });
}

/** Lista ocorrências visíveis para o usuário logado (RBAC no backend). */
export async function listarOcorrencias(): Promise<Ocorrencia[]> {
  return request<Ocorrencia[]>("/ocorrencias/", { method: "GET" });
}

export async function buscarOcorrencia(id: string): Promise<Ocorrencia> {
  return request<Ocorrencia>(`/ocorrencias/${id}`, { method: "GET" });
}

/** Aciona/registra uma ocorrência associada ao usuário logado. */
export async function criarOcorrencia(
  payload: CriarOcorrenciaPayload
): Promise<Ocorrencia> {
  return request<Ocorrencia>("/ocorrencias/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** Envia o relato em texto para a IA extrair categoria, local, gravidade etc. */
export async function analisarRelatoIA(
  descricao: string
): Promise<PreviewIAResponse> {
  return request<PreviewIAResponse>("/ocorrencias/ia/preview", {
    method: "POST",
    auth: false,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ descricao }),
  });
}

// --- Evidências (upload de arquivos) ---
export type TipoMidia = "Foto" | "Vídeo" | "Áudio" | "Documento";

export interface EvidenciaUpload {
  uri: string;
  // Na web capturamos o Blob no momento da escolha do arquivo, porque a URI
  // (blob:/data:) pode expirar ao navegar entre telas. No nativo usamos a uri.
  blob?: Blob | null;
  name: string;
  mimeType?: string | null;
  tipoMidia: TipoMidia;
}

export interface EvidenciaResponse {
  id: string;
  tipo_midia: TipoMidia;
  url: string;
}

/** Lista as evidências (com URL absoluta) de uma ocorrência. */
export async function listarEvidencias(
  ocorrenciaId: string
): Promise<EvidenciaResponse[]> {
  const lista = await request<EvidenciaResponse[]>(
    `/ocorrencias/${ocorrenciaId}/evidencias`,
    { method: "GET" }
  );
  return lista.map((e) => ({
    ...e,
    url: e.url.startsWith("http") ? e.url : `${API_BASE_URL}${e.url}`,
  }));
}

/**
 * Faz upload de um anexo (foto, vídeo, áudio ou documento) para uma ocorrência.
 * Usa multipart/form-data; o Content-Type (com boundary) é definido pelo fetch.
 */
export async function enviarEvidencia(
  ocorrenciaId: string,
  ev: EvidenciaUpload
): Promise<void> {
  const form = new FormData();

  if (ev.blob) {
    // Web: usamos o Blob capturado no momento da escolha (mais confiável).
    form.append("arquivo", ev.blob, ev.name);
  } else if (Platform.OS === "web") {
    // Fallback web: tenta buscar o Blob a partir da uri.
    const resp = await fetch(ev.uri);
    const blob = await resp.blob();
    form.append("arquivo", blob, ev.name);
  } else {
    // No nativo, o React Native aceita { uri, name, type }.
    form.append("arquivo", {
      uri: ev.uri,
      name: ev.name,
      type: ev.mimeType || "application/octet-stream",
    } as any);
  }

  form.append("tipo_midia", ev.tipoMidia);

  const headers: Record<string, string> = { Accept: "application/json" };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/ocorrencias/${ocorrenciaId}/evidencias`,
      { method: "POST", headers, body: form }
    );
  } catch {
    throw new ApiError("Falha de conexão ao enviar o anexo.", 0);
  }

  if (!response.ok) {
    const texto = await response.text();
    throw new ApiError(
      extrairMensagemErro(
        texto ? safeJsonParse(texto) : null,
        `Erro ${response.status} ao enviar anexo.`
      ),
      response.status
    );
  }
}
