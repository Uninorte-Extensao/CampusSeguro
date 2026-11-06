import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { Painel } from "../../components/admin/Graficos";
import { SeloEtapa, SeloGravidade } from "../../components/admin/Selos";
import { AdminShell, iniciais } from "../../components/admin/Shell";
import { useAdmin } from "../../contexts/AdminContext";
import { OcorrenciaAdmin } from "../../services/api";
import {
  COR,
  Etapa,
  etapaAtual,
  formatarData,
  GRAVIDADES,
  normalizarGravidade,
  paraData,
  pesoGravidade,
  tempoRelativo,
} from "../../utils/admin";

type FiltroEtapa = "ABERTAS" | "TODAS" | Etapa;
type FiltroIdent = "TODAS" | "IDENTIFICADAS" | "ANONIMAS";

const FILTROS_ETAPA: { chave: FiltroEtapa; label: string }[] = [
  { chave: "ABERTAS", label: "Em aberto" },
  { chave: "RECEBIDA", label: "Recebidas" },
  { chave: "VERIFICACAO", label: "Em verificação" },
  { chave: "RESPONDIDA", label: "Respondidas" },
  { chave: "RESOLVIDA", label: "Resolvidas" },
  { chave: "TODAS", label: "Todas" },
];

const SEM_CLASSIFICACAO = "Não classificada";

export default function DenunciasScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ etapa?: string; gravidade?: string; tipo?: string }>();
  const { width } = useWindowDimensions();
  const largo = width >= 1200;
  const { ocorrencias } = useAdmin();

  const [etapa, setEtapa] = useState<FiltroEtapa>("ABERTAS");
  const [gravidade, setGravidade] = useState<string | null>(null);
  const [tipo, setTipo] = useState<string | null>(null);
  const [ident, setIdent] = useState<FiltroIdent>("TODAS");
  const [busca, setBusca] = useState("");

  // Filtros vindos do dashboard / sino
  useEffect(() => {
    if (params.etapa && FILTROS_ETAPA.some((f) => f.chave === params.etapa)) setEtapa(params.etapa as FiltroEtapa);
    if (params.gravidade) {
      setGravidade(params.gravidade);
      if (!params.etapa) setEtapa("TODAS");
    }
    if (params.tipo) {
      setTipo(params.tipo);
      if (!params.etapa) setEtapa("TODAS");
    }
  }, [params.etapa, params.gravidade, params.tipo]);

  const contagem = useMemo(() => {
    const c: Record<FiltroEtapa, number> = { ABERTAS: 0, TODAS: ocorrencias.length, RECEBIDA: 0, VERIFICACAO: 0, RESPONDIDA: 0, RESOLVIDA: 0 };
    ocorrencias.forEach((o) => {
      const e = etapaAtual(o);
      c[e] += 1;
      if (e !== "RESOLVIDA") c.ABERTAS += 1;
    });
    return c;
  }, [ocorrencias]);

  const fila = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return ocorrencias
      .filter((o) => {
        const e = etapaAtual(o);
        if (etapa === "ABERTAS" && e === "RESOLVIDA") return false;
        if (etapa !== "ABERTAS" && etapa !== "TODAS" && e !== etapa) return false;
        if (gravidade) {
          if (gravidade === "graves") {
            if (pesoGravidade(o.gravidade) < 3) return false;
          } else if ((normalizarGravidade(o.gravidade) ?? SEM_CLASSIFICACAO) !== gravidade) return false;
        }
        if (tipo && (o.tipo_incidente || "").trim() !== tipo) return false;
        if (ident === "ANONIMAS" && !o.anonimo) return false;
        if (ident === "IDENTIFICADAS" && o.anonimo) return false;
        if (!termo) return true;
        return [o.tipo_incidente, o.localizacao, o.descricao_resumida, o.descricao, o.autor_nome, o.id]
          .filter(Boolean)
          .some((t) => String(t).toLowerCase().includes(termo));
      })
      .sort((a, b) => {
        // Em aberto primeiro: mais urgentes, depois as que esperam há mais tempo
        const ra = a.status === "RESOLVIDO" ? 1 : 0;
        const rb = b.status === "RESOLVIDO" ? 1 : 0;
        if (ra !== rb) return ra - rb;
        if (!ra) {
          const dg = pesoGravidade(b.gravidade) - pesoGravidade(a.gravidade);
          if (dg) return dg;
          return (paraData(a.data_criacao)?.getTime() ?? 0) - (paraData(b.data_criacao)?.getTime() ?? 0);
        }
        return (paraData(b.data_criacao)?.getTime() ?? 0) - (paraData(a.data_criacao)?.getTime() ?? 0);
      });
  }, [ocorrencias, etapa, gravidade, tipo, ident, busca]);

  const abrir = (o: OcorrenciaAdmin) => router.push(`/admin/${o.id}` as any);

  return (
    <AdminShell secao="denuncias" titulo="Denúncias" subtitulo="Fila de atendimento: das mais urgentes às que esperam há mais tempo">
      <Painel titulo={`${fila.length} denúncia(s)`} icone="file-text">
        {/* Busca + filtros */}
        <View style={[s.ferramentas, largo && { flexDirection: "row", alignItems: "center" }]}>
          <View style={[s.busca, largo && { width: 360 }]}>
            <Feather name="search" size={15} color={COR.textoMudo} />
            <TextInput
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar por tipo, local, denunciante ou protocolo"
              placeholderTextColor={COR.textoMudo}
              style={s.buscaInput}
            />
            {!!busca && (
              <TouchableOpacity onPress={() => setBusca("")}>
                <Feather name="x" size={15} color={COR.textoMudo} />
              </TouchableOpacity>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {FILTROS_ETAPA.map((f) => (
              <Chip key={f.chave} ativo={etapa === f.chave} onPress={() => setEtapa(f.chave)} texto={f.label} contagem={contagem[f.chave]} />
            ))}
          </ScrollView>
        </View>

        <View style={s.filtrosLinha}>
          <Text style={s.filtroRotulo}>Gravidade</Text>
          {["graves", ...GRAVIDADES, SEM_CLASSIFICACAO].map((g) => (
            <Chip
              key={g}
              pequeno
              ativo={gravidade === g}
              texto={g === "graves" ? "Graves (alta + crítica)" : g}
              onPress={() => setGravidade(gravidade === g ? null : g)}
            />
          ))}
          <View style={{ width: 12 }} />
          <Text style={s.filtroRotulo}>Denunciante</Text>
          {(["TODAS", "IDENTIFICADAS", "ANONIMAS"] as FiltroIdent[]).map((i) => (
            <Chip
              key={i}
              pequeno
              ativo={ident === i}
              texto={i === "TODAS" ? "Todos" : i === "IDENTIFICADAS" ? "Identificados" : "Anônimos"}
              onPress={() => setIdent(i)}
            />
          ))}
          {tipo && <Chip pequeno ativo texto={`Tipo: ${tipo}  ✕`} onPress={() => setTipo(null)} />}
        </View>

        {fila.length === 0 ? (
          <View style={s.centro}>
            <Feather name="inbox" size={28} color="#30364B" />
            <Text style={s.vazio}>Nenhuma denúncia com esses filtros.</Text>
          </View>
        ) : largo ? (
          <View>
            <View style={s.thLinha}>
              <Text style={[s.th, { width: 112 }]}>GRAVIDADE</Text>
              <Text style={[s.th, { flex: 1 }]}>DENÚNCIA</Text>
              <Text style={[s.th, { width: 190 }]}>LOCAL</Text>
              <Text style={[s.th, { width: 180 }]}>DENUNCIANTE</Text>
              <Text style={[s.th, { width: 130 }]}>RECEBIDA</Text>
              <Text style={[s.th, { width: 150 }]}>STATUS</Text>
              <Text style={[s.th, { width: 150 }]}>RESPONSÁVEL</Text>
              <View style={{ width: 20 }} />
            </View>
            {fila.map((o) => (
              <Pressable key={o.id} onPress={() => abrir(o)} style={({ hovered }: any) => [s.tr, hovered && s.trHover]}>
                <View style={{ width: 112 }}>
                  <SeloGravidade gravidade={o.gravidade} />
                </View>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={s.tdForte} numberOfLines={1}>
                    {o.tipo_incidente || "Ocorrência"}{" "}
                    <Text style={s.protocolo}>#{o.id.slice(0, 6).toUpperCase()}</Text>
                  </Text>
                  <Text style={s.tdMudo} numberOfLines={1}>
                    {o.descricao_resumida || o.descricao}
                    {o.total_evidencias > 0 ? `  ·  📎 ${o.total_evidencias}` : ""}
                  </Text>
                </View>
                <Text style={[s.td, { width: 190, paddingRight: 8 }]} numberOfLines={1}>
                  {o.localizacao || "—"}
                </Text>
                <View style={{ width: 180, flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={[s.miniAvatar, o.anonimo && { backgroundColor: "#1A2136" }]}>
                    {o.anonimo ? (
                      <Feather name="eye-off" size={11} color={COR.textoMudo} />
                    ) : (
                      <Text style={s.miniAvatarTexto}>{iniciais(o.autor_nome)}</Text>
                    )}
                  </View>
                  <Text style={[s.td, o.anonimo && { color: COR.textoMudo }]} numberOfLines={1}>
                    {o.anonimo ? "Anônimo" : o.autor_nome}
                  </Text>
                </View>
                <View style={{ width: 130 }}>
                  <Text style={s.td}>{tempoRelativo(o.data_criacao)}</Text>
                  <Text style={s.tdMudo}>{formatarData(o.data_criacao).split(",")[0]}</Text>
                </View>
                <View style={{ width: 150 }}>
                  <SeloEtapa o={o} />
                </View>
                <Text style={[s.td, { width: 150 }]} numberOfLines={1}>
                  {o.responsavel_nome || "—"}
                </Text>
                <Feather name="chevron-right" size={16} color={COR.textoMudo} style={{ width: 20 }} />
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {fila.map((o) => (
              <TouchableOpacity key={o.id} style={s.cartao} onPress={() => abrir(o)} activeOpacity={0.85}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <SeloGravidade gravidade={o.gravidade} />
                  <View style={{ flex: 1 }} />
                  <SeloEtapa o={o} />
                </View>
                <Text style={s.tdForte}>{o.tipo_incidente || "Ocorrência"}</Text>
                {!!o.descricao_resumida && (
                  <Text style={s.tdMudo} numberOfLines={2}>
                    {o.descricao_resumida}
                  </Text>
                )}
                <Text style={s.tdMudo}>
                  {o.localizacao} · {tempoRelativo(o.data_criacao)} · {o.anonimo ? "Anônimo" : o.autor_nome}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Painel>
    </AdminShell>
  );
}

function Chip({ texto, ativo, onPress, contagem, pequeno }: { texto: string; ativo: boolean; onPress: () => void; contagem?: number; pequeno?: boolean }) {
  return (
    <TouchableOpacity style={[s.chip, pequeno && s.chipPequeno, ativo && s.chipAtivo]} onPress={onPress} activeOpacity={0.85}>
      <Text style={[s.chipTexto, ativo && { color: "#FFFFFF" }]}>
        {texto}
        {contagem !== undefined && <Text style={[s.chipCont, ativo && { color: "#DBEAFE" }]}>  {contagem}</Text>}
      </Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  ferramentas: { gap: 10 },
  busca: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COR.superficie2,
    borderWidth: 1,
    borderColor: COR.borda,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  buscaInput: { flex: 1, color: COR.texto, fontSize: 13, paddingVertical: 10, outlineStyle: "none" } as any,
  filtrosLinha: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 },
  filtroRotulo: { color: COR.textoMudo, fontSize: 11.5, fontWeight: "800", marginRight: 2 },

  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: COR.borda, backgroundColor: COR.superficie2 },
  chipPequeno: { paddingHorizontal: 10, paddingVertical: 5 },
  chipAtivo: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  chipTexto: { color: COR.textoSec, fontSize: 12, fontWeight: "700" },
  chipCont: { color: COR.textoMudo, fontWeight: "800" },

  thLinha: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, backgroundColor: COR.superficie2, borderRadius: 8 },
  th: { color: COR.textoMudo, fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  tr: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COR.grade },
  trHover: { backgroundColor: "#1A2136" },
  td: { color: COR.textoSec, fontSize: 13 },
  tdForte: { color: COR.texto, fontSize: 13.5, fontWeight: "700" },
  tdMudo: { color: COR.textoMudo, fontSize: 12, marginTop: 2 },
  protocolo: { color: COR.textoMudo, fontSize: 11.5, fontWeight: "600" },
  miniAvatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#26304A", alignItems: "center", justifyContent: "center" },
  miniAvatarTexto: { color: COR.texto, fontSize: 10, fontWeight: "800" },

  cartao: { backgroundColor: COR.superficie2, borderWidth: 1, borderColor: COR.borda, borderRadius: 12, padding: 12, gap: 6 },
  centro: { alignItems: "center", paddingVertical: 32, gap: 10 },
  vazio: { color: COR.textoMudo, fontSize: 13, fontWeight: "600" },
});
