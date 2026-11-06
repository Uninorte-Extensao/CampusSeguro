import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { BarrasHorizontais, FatiaRosca, GraficoArea, ItemBarra, KpiCard, Painel, Rosca } from "../../components/admin/Graficos";
import { SeloEtapa, SeloGravidade } from "../../components/admin/Selos";
import { AdminShell, iniciais } from "../../components/admin/Shell";
import { useAdmin } from "../../contexts/AdminContext";
import {
  adminListarAtividades,
  adminListarUsuarios,
  LogAtividade,
  OcorrenciaAdmin,
  UsuarioAdmin,
} from "../../services/api";
import {
  COR,
  formatarData,
  GRAVIDADE_COR,
  GRAVIDADES,
  normalizarGravidade,
  paraData,
  pesoGravidade,
  SEM_GRAVIDADE_COR,
  tempoRelativo,
} from "../../utils/admin";
import { calcularMetricas, Periodo, PERIODOS } from "../../utils/metricas";

const SEM_CLASSIFICACAO = "Não classificada";

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { ocorrencias, carregando, erro, recarregar } = useAdmin();
  const [periodo, setPeriodo] = useState<Periodo>("30D");
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [atividades, setAtividades] = useState<LogAtividade[]>([]);

  const largo = width >= 1280;
  const muitoLargo = width >= 1700;
  const medio = width >= 960;

  useFocusEffect(
    useCallback(() => {
      recarregar();
      adminListarUsuarios().then(setUsuarios).catch(() => {});
      adminListarAtividades(4).then(setAtividades).catch(() => {});
    }, [recarregar])
  );

  const m = useMemo(() => calcularMetricas(ocorrencias, periodo), [ocorrencias, periodo]);
  const descPeriodo = PERIODOS.find((p) => p.chave === periodo)!.descricao;

  const gravidade: FatiaRosca[] = useMemo(() => {
    const cont: Record<string, number> = {};
    m.noPeriodo.forEach((o) => {
      const g = normalizarGravidade(o.gravidade) ?? SEM_CLASSIFICACAO;
      cont[g] = (cont[g] ?? 0) + 1;
    });
    const fatias: FatiaRosca[] = GRAVIDADES.map((g) => ({ chave: g, label: g, valor: cont[g] ?? 0, cor: GRAVIDADE_COR[g] }));
    if (cont[SEM_CLASSIFICACAO]) fatias.push({ chave: SEM_CLASSIFICACAO, label: SEM_CLASSIFICACAO, valor: cont[SEM_CLASSIFICACAO], cor: SEM_GRAVIDADE_COR });
    return fatias;
  }, [m.noPeriodo]);

  const tipos: ItemBarra[] = useMemo(() => {
    const cont = new Map<string, number>();
    m.noPeriodo.forEach((o) => {
      const t = (o.tipo_incidente || "Outros").trim();
      cont.set(t, (cont.get(t) ?? 0) + 1);
    });
    const ord = [...cont.entries()].sort((a, b) => b[1] - a[1]);
    const top = ord.slice(0, 6).map(([t, v]) => ({ chave: t, label: t, valor: v }));
    const resto = ord.slice(6).reduce((a, [, v]) => a + v, 0);
    if (resto) top.push({ chave: "__outros", label: `Outros (${ord.length - 6} tipos)`, valor: resto });
    return top;
  }, [m.noPeriodo]);

  const ultimas = useMemo(
    () =>
      [...ocorrencias]
        .sort((a, b) => (paraData(b.data_criacao)?.getTime() ?? 0) - (paraData(a.data_criacao)?.getTime() ?? 0))
        .slice(0, 7),
    [ocorrencias]
  );

  const aguardandoRetorno = useMemo(
    () =>
      ocorrencias
        .filter((o) => o.status !== "RESOLVIDO" && !o.anonimo && !o.respondida)
        .sort((a, b) => pesoGravidade(b.gravidade) - pesoGravidade(a.gravidade) || (paraData(a.data_criacao)?.getTime() ?? 0) - (paraData(b.data_criacao)?.getTime() ?? 0)),
    [ocorrencias]
  );
  const anonimasPeriodo = m.noPeriodo.filter((o) => o.anonimo).length;
  const totalAdmins = usuarios.filter((u) => u.tipo_perfil === "ADMINISTRADOR").length;

  const abrir = (o: OcorrenciaAdmin) => router.push(`/admin/${o.id}` as any);

  const seletorPeriodo = (
    <View style={s.periodos}>
      <Feather name="calendar" size={14} color={COR.textoMudo} style={{ marginHorizontal: 6 }} />
      {PERIODOS.map((p) => (
        <TouchableOpacity
          key={p.chave}
          onPress={() => setPeriodo(p.chave)}
          style={[s.periodo, periodo === p.chave && s.periodoAtivo]}
          activeOpacity={0.85}
        >
          <Text style={[s.periodoTexto, periodo === p.chave && { color: "#FFFFFF" }]}>{p.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <AdminShell
      secao="dashboard"
      titulo="Dashboard"
      subtitulo="Visão geral das denúncias e andamento das tratativas"
      acoes={seletorPeriodo}
    >
      {carregando ? (
        <ActivityIndicator color={COR.destaque} style={{ marginTop: 60 }} />
      ) : erro && !ocorrencias.length ? (
        <View style={s.erroBox}>
          <Feather name="alert-triangle" size={18} color="#F87171" />
          <Text style={s.erroText}>{erro}</Text>
        </View>
      ) : (
        <>
          {/* ---------- Indicadores ---------- */}
          <View style={s.kpis}>
            <KpiCard
              rotulo="Total de Denúncias"
              valor={m.kpis.total.valor}
              variacao={m.kpis.total.variacao}
              subidaBoa={false}
              icone="volume-2"
              cor="#3B82F6"
              serie={m.series.novas}
              onPress={() => router.push("/admin/denuncias?etapa=TODAS" as any)}
            />
            <KpiCard
              rotulo="Em Análise"
              valor={m.kpis.emAberto.valor}
              variacao={m.kpis.emAberto.variacao}
              legendaVariacao="vs. início do período"
              subidaBoa={false}
              icone="clock"
              cor="#F59E0B"
              serie={m.series.abertas}
              onPress={() => router.push("/admin/denuncias" as any)}
            />
            <KpiCard
              rotulo="Resolvidas"
              valor={m.kpis.resolvidas.valor}
              variacao={m.kpis.resolvidas.variacao}
              subidaBoa
              icone="check-circle"
              cor="#22C55E"
              serie={m.series.resolvidas}
              onPress={() => router.push("/admin/denuncias?etapa=RESOLVIDA" as any)}
            />
            <KpiCard
              rotulo="Graves"
              valor={m.kpis.graves.valor}
              variacao={m.kpis.graves.variacao}
              subidaBoa={false}
              icone="alert-triangle"
              cor="#EF4444"
              serie={m.series.graves}
              onPress={() => router.push("/admin/denuncias?gravidade=graves" as any)}
            />
          </View>
          <Text style={s.notaPeriodo}>
            {`${descPeriodo}. “Em análise” mostra as denúncias abertas agora; “Graves” são as de urgência alta ou crítica.`}
          </Text>

          {/* ---------- Gráficos ---------- */}
          <View style={[s.linha, !medio && { flexDirection: "column" }]}>
            <Painel
              titulo="Evolução das Denúncias"
              icone="bar-chart-2"
              style={[s.cartaoGrafico, { flex: 2.1 }]}
              acao={medio ? undefined : seletorPeriodo}
            >
              <GraficoArea
                rotulosX={m.rotulosX}
                dicas={m.dicas}
                series={[
                  { chave: "novas", label: "Recebidas", cor: "#3B82F6", valores: m.series.novas },
                  { chave: "resolvidas", label: "Resolvidas", cor: "#22C55E", valores: m.series.resolvidas },
                  { chave: "abertas", label: "Em análise (abertas)", cor: "#F59E0B", valores: m.series.abertas },
                ]}
              />
            </Painel>

            <Painel titulo="Por Gravidade" icone="shield" style={[s.cartaoGrafico, { flex: 1.25 }]}>
              <Rosca
                fatias={gravidade}
                onSelecionar={(k) => router.push(`/admin/denuncias?gravidade=${encodeURIComponent(k)}` as any)}
              />
            </Painel>

            {largo && (
              <Painel titulo="Incidentes por Tipo" icone="layers" style={[s.cartaoGrafico, { flex: 1 }]}>
                <BarrasHorizontais
                  itens={tipos}
                  onSelecionar={(k) => k !== "__outros" && router.push(`/admin/denuncias?tipo=${encodeURIComponent(k)}` as any)}
                />
              </Painel>
            )}
          </View>

          {!largo && (
            <Painel titulo="Incidentes por Tipo" icone="layers">
              <BarrasHorizontais itens={tipos} />
            </Painel>
          )}

          {/* ---------- Tabela + lateral ---------- */}
          <View style={[s.linha, !muitoLargo && { flexDirection: "column" }]}>
            <Painel
              titulo="Últimas Denúncias"
              icone="list"
              style={{ flex: 1 }}
              acao={
                <TouchableOpacity onPress={() => router.push("/admin/denuncias?etapa=TODAS" as any)} style={s.linkAcao}>
                  <Text style={s.link}>Ver todas</Text>
                  <Feather name="arrow-right" size={14} color="#60A5FA" />
                </TouchableOpacity>
              }
            >
              {ultimas.length === 0 ? (
                <Text style={s.vazio}>Nenhuma denúncia recebida ainda.</Text>
              ) : medio ? (
                <View>
                  <View style={s.thLinha}>
                    <Text style={[s.th, { width: 88 }]}>#</Text>
                    <Text style={[s.th, { width: 96 }]}>DATA</Text>
                    <Text style={[s.th, { flex: 1 }]}>TIPO</Text>
                    <Text style={[s.th, { width: 108 }]}>GRAVIDADE</Text>
                    <Text style={[s.th, { width: 136 }]}>STATUS</Text>
                    <Text style={[s.th, { width: 150 }]}>DENUNCIANTE</Text>
                    <Text style={[s.th, { width: 104 }]}>FEEDBACK</Text>
                    <View style={{ width: 84 }} />
                  </View>
                  {ultimas.map((o) => (
                    <Pressable key={o.id} onPress={() => abrir(o)} style={({ hovered }: any) => [s.tr, hovered && s.trHover]}>
                      <View style={[s.faixa, { backgroundColor: corGravidade(o.gravidade) }]} />
                      <Text style={[s.tdForte, { width: 76 }]}>#{o.id.slice(0, 6).toUpperCase()}</Text>
                      <View style={{ width: 96 }}>
                        <Text style={s.td}>{formatarData(o.data_criacao).split(",")[0].slice(0, 5)}</Text>
                        <Text style={s.tdMudo}>{formatarData(o.data_criacao).split(", ")[1]}</Text>
                      </View>
                      <Text style={[s.tdForte, { flex: 1, paddingRight: 8 }]} numberOfLines={1}>
                        {o.tipo_incidente || "Ocorrência"}
                      </Text>
                      <View style={{ width: 108 }}>
                        <SeloGravidade gravidade={o.gravidade} />
                      </View>
                      <View style={{ width: 136 }}>
                        <SeloEtapa o={o} />
                      </View>
                      <View style={{ width: 150, paddingRight: 8 }}>
                        <Denunciante o={o} />
                      </View>
                      <View style={{ width: 104 }}>
                        <Feedback o={o} />
                      </View>
                      <TouchableOpacity style={s.verBtn} onPress={() => abrir(o)} activeOpacity={0.8}>
                        <Text style={s.verTexto}>Ver</Text>
                        <Feather name="arrow-right" size={13} color="#93C5FD" />
                      </TouchableOpacity>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  {ultimas.map((o) => (
                    <TouchableOpacity key={o.id} style={s.cartao} onPress={() => abrir(o)} activeOpacity={0.85}>
                      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                        <SeloGravidade gravidade={o.gravidade} />
                        <View style={{ flex: 1 }} />
                        <SeloEtapa o={o} />
                      </View>
                      <Text style={s.tdForte}>{o.tipo_incidente}</Text>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Denunciante o={o} />
                        <Feedback o={o} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Painel>

            <View style={[{ gap: 20 }, muitoLargo ? { width: 360 } : medio && { flexDirection: "row", alignItems: "flex-start" }]}>
              {/* Feedback ao denunciante */}
              <Painel titulo="Feedback ao Denunciante" icone="message-circle" style={muitoLargo ? undefined : { flex: 1 }}>
                <Text style={s.explica}>
                  Somente denunciantes identificados recebem retorno individual. Anônimas são acompanhadas pela
                  direção, sem resposta.
                </Text>
                <View style={s.miniStats}>
                  <MiniStat valor={aguardandoRetorno.length} rotulo="aguardando retorno" cor="#F59E0B" />
                  <MiniStat valor={ocorrencias.filter((o) => o.respondida).length} rotulo="respondidas" cor="#22C55E" />
                  <MiniStat valor={anonimasPeriodo} rotulo="anônimas no período" cor="#8EA0C7" />
                </View>
                {aguardandoRetorno.length === 0 ? (
                  <Text style={s.vazio}>Nenhum denunciante aguardando retorno.</Text>
                ) : (
                  aguardandoRetorno.slice(0, 4).map((o) => (
                    <Pressable key={o.id} onPress={() => abrir(o)} style={({ hovered }: any) => [s.pendente, hovered && s.trHover]}>
                      <View style={[s.pendenteBarra, { backgroundColor: corGravidade(o.gravidade) }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.tdForte} numberOfLines={1}>
                          {o.tipo_incidente}
                        </Text>
                        <Text style={s.tdMudo} numberOfLines={1}>
                          {o.autor_nome} · esperando {tempoRelativo(o.data_criacao).replace("há ", "")}
                        </Text>
                      </View>
                      <View style={s.responderBtn}>
                        <Feather name="send" size={12} color={COR.fundo} />
                        <Text style={s.responderTexto}>Responder</Text>
                      </View>
                    </Pressable>
                  ))
                )}
              </Painel>

              {/* Acesso e segurança (dados reais) */}
              <Painel titulo="Acesso e Segurança" icone="lock" style={muitoLargo ? undefined : { flex: 1 }}>
                <LinhaSeguranca
                  icone="users"
                  titulo="Administradores"
                  valor={`${totalAdmins || "—"} com acesso ao painel`}
                  status="Gerenciar"
                  ok
                  onPress={() => router.push("/admin/usuarios" as any)}
                />
                <LinhaSeguranca
                  icone="eye-off"
                  titulo="Anonimato preservado"
                  valor="Anônimas não guardam o autor"
                  status="Ativo"
                  ok
                />
                <LinhaSeguranca
                  icone="clock"
                  titulo="Expiração de sessão"
                  valor="Login expira após 24 horas"
                  status="Ativa"
                  ok
                />
                <View style={s.sep} />
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={s.subtituloBloco}>Registro de atividades</Text>
                  <TouchableOpacity onPress={() => router.push("/admin/atividades" as any)} style={s.linkAcao}>
                    <Text style={s.link}>Ver tudo</Text>
                    <Feather name="arrow-right" size={14} color="#60A5FA" />
                  </TouchableOpacity>
                </View>
                {atividades.length === 0 ? (
                  <Text style={s.tdMudo}>Nenhuma atividade registrada.</Text>
                ) : (
                  atividades.map((a) => (
                    <View key={a.id} style={s.atividade}>
                      <View style={s.atividadePonto} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.td} numberOfLines={2}>
                          <Text style={{ color: COR.texto, fontWeight: "700" }}>{a.usuario_nome ?? "Sistema"}</Text> ·{" "}
                          {a.descricao}
                        </Text>
                        <Text style={s.tdMudo}>{tempoRelativo(a.data)}</Text>
                      </View>
                    </View>
                  ))
                )}
              </Painel>
            </View>
          </View>
        </>
      )}
    </AdminShell>
  );
}

function corGravidade(g?: string | null) {
  const n = normalizarGravidade(g);
  return n ? GRAVIDADE_COR[n] : SEM_GRAVIDADE_COR;
}

function Denunciante({ o }: { o: OcorrenciaAdmin }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View style={[s.miniAvatar, o.anonimo && { backgroundColor: "#1A2136" }]}>
        {o.anonimo ? (
          <Feather name="eye-off" size={12} color={COR.textoMudo} />
        ) : (
          <Text style={s.miniAvatarTexto}>{iniciais(o.autor_nome)}</Text>
        )}
      </View>
      <Text style={[s.td, o.anonimo && { color: COR.textoMudo }]} numberOfLines={1}>
        {o.anonimo ? "Anônimo" : o.autor_nome || "—"}
      </Text>
    </View>
  );
}

function Feedback({ o }: { o: OcorrenciaAdmin }) {
  if (o.anonimo) return <Text style={s.tdMudo}>Não se aplica</Text>;
  if (o.respondida)
    return (
      <View style={s.feedback}>
        <Feather name="check" size={13} color="#22C55E" />
        <Text style={[s.feedbackTexto, { color: "#4ADE80" }]}>Enviado</Text>
      </View>
    );
  if (o.status === "RESOLVIDO") return <Text style={s.tdMudo}>—</Text>;
  return (
    <View style={s.feedback}>
      <Feather name="clock" size={13} color="#F59E0B" />
      <Text style={[s.feedbackTexto, { color: "#FBBF24" }]}>Pendente</Text>
    </View>
  );
}

function MiniStat({ valor, rotulo, cor }: { valor: number; rotulo: string; cor: string }) {
  return (
    <View style={s.miniStat}>
      <Text style={[s.miniStatValor, { color: COR.texto }]}>{valor}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: cor }} />
        <Text style={s.miniStatRotulo}>{rotulo}</Text>
      </View>
    </View>
  );
}

function LinhaSeguranca({
  icone,
  titulo,
  valor,
  status,
  ok,
  onPress,
}: {
  icone: React.ComponentProps<typeof Feather>["name"];
  titulo: string;
  valor: string;
  status: string;
  ok: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ hovered }: any) => [s.seg, hovered && onPress ? s.trHover : null]}>
      <View style={s.segIcone}>
        <Feather name={icone} size={15} color={COR.textoSec} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.tdForte}>{titulo}</Text>
        <Text style={s.tdMudo}>{valor}</Text>
      </View>
      <View style={[s.segStatus, { backgroundColor: ok ? "#22C55E1F" : "#F59E0B1F", borderColor: ok ? "#22C55E55" : "#F59E0B55" }]}>
        <Feather name={ok ? "check" : "alert-circle"} size={11} color={ok ? "#4ADE80" : "#FBBF24"} />
        <Text style={[s.segStatusTexto, { color: ok ? "#4ADE80" : "#FBBF24" }]}>{status}</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  kpis: { flexDirection: "row", flexWrap: "wrap", gap: 20 },
  notaPeriodo: { color: COR.textoMudo, fontSize: 12, marginTop: -8 },
  linha: { flexDirection: "row", gap: 20, alignItems: "stretch" },
  cartaoGrafico: { minWidth: 0 },

  periodos: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COR.superficie,
    borderWidth: 1,
    borderColor: COR.borda,
    borderRadius: 12,
    padding: 4,
  },
  periodo: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  periodoAtivo: { backgroundColor: "#2563EB" },
  periodoTexto: { color: COR.textoSec, fontSize: 12.5, fontWeight: "800" },

  linkAcao: { flexDirection: "row", alignItems: "center", gap: 6 },
  link: { color: "#60A5FA", fontSize: 13, fontWeight: "700" },

  thLinha: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COR.superficie2,
    borderRadius: 8,
  },
  th: { color: COR.textoMudo, fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  tr: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COR.grade,
  },
  trHover: { backgroundColor: "#1A2136" },
  faixa: { width: 4, height: 22, borderRadius: 2, marginRight: 8 },
  td: { color: COR.textoSec, fontSize: 13 },
  tdForte: { color: COR.texto, fontSize: 13.5, fontWeight: "700" },
  tdMudo: { color: COR.textoMudo, fontSize: 12 },
  verBtn: {
    width: 84,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#3B82F655",
    borderRadius: 8,
    paddingVertical: 7,
  },
  verTexto: { color: "#93C5FD", fontSize: 12, fontWeight: "700" },

  miniAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#26304A",
    alignItems: "center",
    justifyContent: "center",
  },
  miniAvatarTexto: { color: COR.texto, fontSize: 10, fontWeight: "800" },
  feedback: { flexDirection: "row", alignItems: "center", gap: 5 },
  feedbackTexto: { fontSize: 12.5, fontWeight: "700" },

  cartao: { backgroundColor: COR.superficie2, borderWidth: 1, borderColor: COR.borda, borderRadius: 12, padding: 12, gap: 8 },

  explica: { color: COR.textoSec, fontSize: 12.5, lineHeight: 18, marginTop: -6 },
  miniStats: { flexDirection: "row", gap: 8 },
  miniStat: { flex: 1, backgroundColor: COR.superficie2, borderRadius: 10, padding: 10, gap: 2 },
  miniStatValor: { fontSize: 20, fontWeight: "800" },
  miniStatRotulo: { color: COR.textoMudo, fontSize: 11 },
  pendente: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingHorizontal: 6, borderRadius: 8 },
  pendenteBarra: { width: 3, alignSelf: "stretch", borderRadius: 2 },
  responderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COR.destaque,
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  responderTexto: { color: COR.fundo, fontSize: 11.5, fontWeight: "800" },

  seg: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6, paddingHorizontal: 4, borderRadius: 8 },
  segIcone: { width: 30, height: 30, borderRadius: 8, backgroundColor: COR.superficie2, alignItems: "center", justifyContent: "center" },
  segStatus: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  segStatusTexto: { fontSize: 11, fontWeight: "800" },
  sep: { height: 1, backgroundColor: COR.borda },
  subtituloBloco: { color: COR.texto, fontSize: 13.5, fontWeight: "800" },
  atividade: { flexDirection: "row", gap: 10 },
  atividadePonto: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#60A5FA", marginTop: 6 },

  vazio: { color: COR.textoMudo, fontSize: 13, paddingVertical: 12, textAlign: "center" },
  erroBox: { flexDirection: "row", gap: 10, backgroundColor: "#2A1620", borderRadius: 12, padding: 14, alignItems: "center" },
  erroText: { color: "#FCA5A5", fontSize: 13, flex: 1 },
});
