import { OcorrenciaAdmin } from "../services/api";
import { paraData, pesoGravidade } from "./admin";

export type Periodo = "7D" | "30D" | "90D" | "1A";

export const PERIODOS: { chave: Periodo; label: string; descricao: string }[] = [
  { chave: "7D", label: "7D", descricao: "Últimos 7 dias" },
  { chave: "30D", label: "30D", descricao: "Últimos 30 dias" },
  { chave: "90D", label: "90D", descricao: "Últimos 90 dias" },
  { chave: "1A", label: "1A", descricao: "Últimos 12 meses" },
];

interface Balde {
  inicio: Date;
  fim: Date; // exclusivo
  rotulo: string;
  dica: string;
}

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const p2 = (n: number) => String(n).padStart(2, "0");

function inicioDoDia(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDias(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Intervalos do gráfico: diário (7D/30D), semanal (90D) ou mensal (1A). */
export function baldesDoPeriodo(periodo: Periodo, deslocamento = 0): Balde[] {
  const amanha = addDias(inicioDoDia(new Date()), 1);
  const baldes: Balde[] = [];

  if (periodo === "1A") {
    const base = new Date(amanha.getFullYear(), amanha.getMonth() - 11 - 12 * deslocamento, 1);
    for (let i = 0; i < 12; i++) {
      const ini = new Date(base.getFullYear(), base.getMonth() + i, 1);
      const fim = new Date(base.getFullYear(), base.getMonth() + i + 1, 1);
      baldes.push({ inicio: ini, fim, rotulo: `${MESES[ini.getMonth()]}/${String(ini.getFullYear()).slice(2)}`, dica: `${MESES[ini.getMonth()]} de ${ini.getFullYear()}` });
    }
    return baldes;
  }

  const dias = periodo === "7D" ? 7 : periodo === "30D" ? 30 : 91;
  const passo = periodo === "90D" ? 7 : 1;
  const fimTotal = addDias(amanha, -dias * deslocamento);
  const iniTotal = addDias(fimTotal, -dias);
  for (let ini = iniTotal; ini < fimTotal; ini = addDias(ini, passo)) {
    const fim = addDias(ini, passo);
    const r = `${p2(ini.getDate())}/${p2(ini.getMonth() + 1)}`;
    baldes.push({
      inicio: ini,
      fim,
      rotulo: r,
      dica:
        passo === 1
          ? ini.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })
          : `Semana de ${r} a ${p2(addDias(fim, -1).getDate())}/${p2(addDias(fim, -1).getMonth() + 1)}`,
    });
  }
  return baldes;
}

function quandoResolvida(o: OcorrenciaAdmin): Date | null {
  if (o.status !== "RESOLVIDO") return null;
  return paraData(o.data_resolucao) ?? paraData(o.data_criacao);
}

/** Quantas estavam em aberto (recebidas ou em verificação) num instante. */
function emAbertoEm(ocorrencias: OcorrenciaAdmin[], t: Date): number {
  return ocorrencias.filter((o) => {
    const c = paraData(o.data_criacao);
    if (!c || c >= t) return false;
    const r = quandoResolvida(o);
    return !r || r >= t;
  }).length;
}

function noIntervalo(d: Date | null, ini: Date, fim: Date) {
  return !!d && d >= ini && d < fim;
}

export function variacao(atual: number, anterior: number): number | null {
  if (anterior === 0) return atual === 0 ? 0 : null;
  return Math.round(((atual - anterior) / anterior) * 100);
}

export function calcularMetricas(ocorrencias: OcorrenciaAdmin[], periodo: Periodo) {
  const baldes = baldesDoPeriodo(periodo);
  const anteriores = baldesDoPeriodo(periodo, 1);
  const ini = baldes[0].inicio;
  const fim = baldes[baldes.length - 1].fim;
  const iniAnt = anteriores[0].inicio;

  const novasSerie = baldes.map((b) => ocorrencias.filter((o) => noIntervalo(paraData(o.data_criacao), b.inicio, b.fim)).length);
  const resolvidasSerie = baldes.map((b) => ocorrencias.filter((o) => noIntervalo(quandoResolvida(o), b.inicio, b.fim)).length);
  const abertasSerie = baldes.map((b) => emAbertoEm(ocorrencias, b.fim > new Date() ? new Date() : b.fim));
  const gravesSerie = baldes.map(
    (b) => ocorrencias.filter((o) => pesoGravidade(o.gravidade) >= 3 && noIntervalo(paraData(o.data_criacao), b.inicio, b.fim)).length
  );

  const soma = (a: number[]) => a.reduce((x, y) => x + y, 0);
  const contar = (f: (o: OcorrenciaAdmin) => boolean) => ocorrencias.filter(f).length;

  const total = soma(novasSerie);
  const totalAnt = contar((o) => noIntervalo(paraData(o.data_criacao), iniAnt, ini));
  const resolvidas = soma(resolvidasSerie);
  const resolvidasAnt = contar((o) => noIntervalo(quandoResolvida(o), iniAnt, ini));
  const graves = soma(gravesSerie);
  const gravesAnt = contar((o) => pesoGravidade(o.gravidade) >= 3 && noIntervalo(paraData(o.data_criacao), iniAnt, ini));
  const emAberto = ocorrencias.filter((o) => o.status !== "RESOLVIDO").length;
  const emAbertoInicio = emAbertoEm(ocorrencias, ini);

  const noPeriodo = ocorrencias.filter((o) => noIntervalo(paraData(o.data_criacao), ini, fim));

  return {
    baldes,
    rotulosX: baldes.map((b) => b.rotulo),
    dicas: baldes.map((b) => b.dica),
    series: { novas: novasSerie, resolvidas: resolvidasSerie, abertas: abertasSerie, graves: gravesSerie },
    kpis: {
      total: { valor: total, variacao: variacao(total, totalAnt) },
      emAberto: { valor: emAberto, variacao: variacao(emAberto, emAbertoInicio) },
      resolvidas: { valor: resolvidas, variacao: variacao(resolvidas, resolvidasAnt) },
      graves: { valor: graves, variacao: variacao(graves, gravesAnt) },
    },
    noPeriodo,
  };
}
