import { StatusOcorrencia } from "../services/api";

/** Etapas mostradas ao denunciante (linguagem simples). */
export type EtapaAluno = "RECEBIDA" | "ANALISE" | "RESPONDIDA" | "FINALIZADA";

export const ETAPAS_ALUNO: { chave: EtapaAluno; label: string; descricao: string; icone: string; cor: string }[] = [
  { chave: "RECEBIDA", label: "Recebida", descricao: "Sua denúncia chegou à direção.", icone: "inbox", cor: "#A78BFA" },
  { chave: "ANALISE", label: "Em análise", descricao: "A equipe está verificando o caso.", icone: "search", cor: "#60A5FA" },
  { chave: "RESPONDIDA", label: "Respondida", descricao: "A direção enviou um retorno para você.", icone: "message-circle", cor: "#40DBD5" },
  { chave: "FINALIZADA", label: "Finalizada", descricao: "O caso foi encerrado pela direção.", icone: "check-circle", cor: "#34D399" },
];

export function etapaDoAluno(status: StatusOcorrencia, respondida: boolean): EtapaAluno {
  if (status === "RESOLVIDO") return "FINALIZADA";
  if (respondida) return "RESPONDIDA";
  if (status === "EM_ATENDIMENTO") return "ANALISE";
  return "RECEBIDA";
}

export function infoEtapa(e: EtapaAluno) {
  return ETAPAS_ALUNO.find((x) => x.chave === e)!;
}
