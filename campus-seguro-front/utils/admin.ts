import { Alert, Platform } from "react-native";
import { OcorrenciaAdmin, StatusOcorrencia } from "../services/api";

// --- Cores do painel (tema escuro do app) ---
export const COR = {
  fundo: "#0B1020",
  superficie: "#141A2B",
  superficie2: "#0F1526",
  borda: "#232B40",
  grade: "#1E2537",
  texto: "#EAF0FF",
  textoSec: "#AAB4C8",
  textoMudo: "#7C869E",
  destaque: "#40DBD5",
};

// --- Etapas do atendimento ---
// Recebida -> Em verificação -> Respondida (resposta enviada) -> Resolvida
export const STATUS_INFO: Record<StatusOcorrencia, { label: string; cor: string; icone: string }> = {
  ABERTO: { label: "Recebida", cor: "#A78BFA", icone: "inbox" },
  EM_ATENDIMENTO: { label: "Em verificação", cor: "#60A5FA", icone: "search" },
  RESOLVIDO: { label: "Resolvida", cor: "#34D399", icone: "check-circle" },
};

export type Etapa = "RECEBIDA" | "VERIFICACAO" | "RESPONDIDA" | "RESOLVIDA";

export const ETAPAS: { chave: Etapa; label: string; icone: string }[] = [
  { chave: "RECEBIDA", label: "Recebida", icone: "inbox" },
  { chave: "VERIFICACAO", label: "Em verificação", icone: "search" },
  { chave: "RESPONDIDA", label: "Respondida", icone: "message-circle" },
  { chave: "RESOLVIDA", label: "Resolvida", icone: "check-circle" },
];

export const ETAPA_COR: Record<Etapa, string> = {
  RECEBIDA: "#A78BFA",
  VERIFICACAO: "#60A5FA",
  RESPONDIDA: "#40DBD5",
  RESOLVIDA: "#34D399",
};

export function etapaAtual(o: Pick<OcorrenciaAdmin, "status" | "respondida">): Etapa {
  if (o.status === "RESOLVIDO") return "RESOLVIDA";
  if (o.status === "EM_ATENDIMENTO") return o.respondida ? "RESPONDIDA" : "VERIFICACAO";
  return "RECEBIDA";
}

// --- Urgência (paleta de status: sempre com rótulo, nunca só cor) ---
export type Gravidade = "Baixa" | "Média" | "Alta" | "Crítica";
export const GRAVIDADES: Gravidade[] = ["Crítica", "Alta", "Média", "Baixa"];
export const GRAVIDADE_COR: Record<Gravidade, string> = {
  Crítica: "#d03b3b",
  Alta: "#ec835a",
  Média: "#fab219",
  Baixa: "#0ca30c",
};
export const SEM_GRAVIDADE_COR = "#5B6380";

export function normalizarGravidade(g?: string | null): Gravidade | null {
  if (!g) return null;
  const k = g.trim().toLowerCase();
  if (k.startsWith("cr")) return "Crítica";
  if (k === "alta") return "Alta";
  if (k.startsWith("m")) return "Média";
  if (k === "baixa") return "Baixa";
  return null;
}

export function pesoGravidade(g?: string | null): number {
  const n = normalizarGravidade(g);
  return n ? 4 - GRAVIDADES.indexOf(n) : 0; // Crítica=4 ... Baixa=1, sem=0
}

// --- Datas ---
export function paraData(iso?: string | null): Date | null {
  if (!iso) return null;
  // O backend devolve UTC sem "Z" em alguns bancos; trata como UTC.
  const normalizado = /[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`;
  const d = new Date(normalizado);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatarData(iso?: string | null): string {
  const d = paraData(iso);
  if (!d) return "—";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}, ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function tempoRelativo(iso?: string | null): string {
  const d = paraData(iso);
  if (!d) return "—";
  const min = Math.round((Date.now() - d.getTime()) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const dias = Math.round(h / 24);
  return dias === 1 ? "ontem" : `há ${dias} dias`;
}

export function formatarDuracao(ms: number): string {
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min} min`;
  const h = min / 60;
  if (h < 24) return `${h.toFixed(h < 10 ? 1 : 0).replace(".", ",")} h`;
  const d = h / 24;
  return `${d.toFixed(d < 10 ? 1 : 0).replace(".", ",")} dias`;
}

/** Confirmação que funciona na web e no nativo. */
export function confirmar(titulo: string, mensagem: string, botao = "Confirmar"): Promise<boolean> {
  if (Platform.OS === "web") {
    const ok =
      typeof window !== "undefined" && typeof window.confirm === "function"
        ? window.confirm(`${titulo}\n\n${mensagem}`)
        : true;
    return Promise.resolve(ok);
  }
  return new Promise((resolve) => {
    Alert.alert(titulo, mensagem, [
      { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
      { text: botao, onPress: () => resolve(true) },
    ]);
  });
}
