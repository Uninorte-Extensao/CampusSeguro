import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Painel } from "../../components/admin/Graficos";
import { AdminShell } from "../../components/admin/Shell";
import { adminListarAtividades, LogAtividade } from "../../services/api";
import { COR, formatarData, paraData, tempoRelativo } from "../../utils/admin";

type IconeFeather = React.ComponentProps<typeof Feather>["name"];

const ACOES: Record<string, { label: string; icone: IconeFeather; cor: string }> = {
  LOGIN: { label: "Login", icone: "log-in", cor: "#60A5FA" },
  LOGIN_FALHOU: { label: "Login recusado", icone: "alert-octagon", cor: "#F87171" },
  DENUNCIA_RECEBIDA: { label: "Denúncia recebida", icone: "inbox", cor: "#A78BFA" },
  STATUS: { label: "Mudança de status", icone: "git-commit", cor: "#38BDF8" },
  CLASSIFICACAO: { label: "Classificação", icone: "alert-triangle", cor: "#F59E0B" },
  RESPOSTA: { label: "Resposta enviada", icone: "message-circle", cor: "#40DBD5" },
  NOTA_INTERNA: { label: "Nota interna", icone: "lock", cor: "#8EA0C7" },
  PERMISSAO: { label: "Permissão", icone: "shield", cor: "#C084FC" },
};

export default function AtividadesScreen() {
  const router = useRouter();
  const [itens, setItens] = useState<LogAtividade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setItens(await adminListarAtividades(500));
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível carregar o registro.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const visiveis = useMemo(() => (filtro ? itens.filter((i) => i.acao === filtro) : itens), [itens, filtro]);

  // Agrupa por dia
  const grupos = useMemo(() => {
    const mapa = new Map<string, LogAtividade[]>();
    visiveis.forEach((i) => {
      const d = paraData(i.data);
      const chave = d ? d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) : "—";
      mapa.set(chave, [...(mapa.get(chave) ?? []), i]);
    });
    return [...mapa.entries()];
  }, [visiveis]);

  const presentes = Object.keys(ACOES).filter((a) => itens.some((i) => i.acao === a));

  return (
    <AdminShell
      secao="atividades"
      titulo="Registro de Atividades"
      subtitulo="Auditoria de acessos e ações no painel. Denúncias anônimas nunca registram o autor."
      acoes={
        <TouchableOpacity style={s.atualizar} onPress={carregar}>
          <Feather name="refresh-cw" size={14} color={COR.textoSec} />
          <Text style={s.atualizarTexto}>Atualizar</Text>
        </TouchableOpacity>
      }
    >
      <Painel titulo={`${visiveis.length} registro(s)`} icone="activity">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          <TouchableOpacity onPress={() => setFiltro(null)} style={[s.chip, !filtro && s.chipAtivo]}>
            <Text style={[s.chipTexto, !filtro && { color: "#FFF" }]}>Todas</Text>
          </TouchableOpacity>
          {presentes.map((a) => (
            <TouchableOpacity key={a} onPress={() => setFiltro(filtro === a ? null : a)} style={[s.chip, filtro === a && s.chipAtivo]}>
              <Feather name={ACOES[a].icone} size={12} color={filtro === a ? "#FFF" : ACOES[a].cor} />
              <Text style={[s.chipTexto, filtro === a && { color: "#FFF" }]}>{ACOES[a].label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {carregando ? (
          <ActivityIndicator color={COR.destaque} />
        ) : erro ? (
          <Text style={s.erro}>{erro}</Text>
        ) : visiveis.length === 0 ? (
          <Text style={s.vazio}>Nenhuma atividade registrada.</Text>
        ) : (
          grupos.map(([dia, lista]) => (
            <View key={dia} style={{ gap: 2 }}>
              <Text style={s.dia}>{dia}</Text>
              {lista.map((i) => {
                const info = ACOES[i.acao] ?? { label: i.acao, icone: "circle" as IconeFeather, cor: COR.textoSec };
                return (
                  <Pressable
                    key={i.id}
                    disabled={!i.ocorrencia_id}
                    onPress={() => router.push(`/admin/${i.ocorrencia_id}` as any)}
                    style={({ hovered }: any) => [s.item, hovered && i.ocorrencia_id ? { backgroundColor: "#1A2136" } : null]}
                  >
                    <View style={[s.icone, { backgroundColor: `${info.cor}1F` }]}>
                      <Feather name={info.icone} size={14} color={info.cor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.texto}>
                        <Text style={s.quem}>{i.usuario_nome ?? (i.acao === "DENUNCIA_RECEBIDA" ? "Denunciante anônimo" : "Sistema")}</Text>
                        {"  "}
                        {i.descricao}
                      </Text>
                      <Text style={s.meta}>
                        {info.label} · {formatarData(i.data)} · {tempoRelativo(i.data)}
                        {i.ocorrencia_id ? `  ·  denúncia #${i.ocorrencia_id.slice(0, 6).toUpperCase()}` : ""}
                      </Text>
                    </View>
                    {i.ocorrencia_id && <Feather name="chevron-right" size={15} color={COR.textoMudo} />}
                  </Pressable>
                );
              })}
            </View>
          ))
        )}
      </Painel>
    </AdminShell>
  );
}

const s = StyleSheet.create({
  atualizar: { flexDirection: "row", alignItems: "center", gap: 8, height: 40, paddingHorizontal: 14, borderRadius: 10, backgroundColor: COR.superficie, borderWidth: 1, borderColor: COR.borda },
  atualizarTexto: { color: COR.textoSec, fontSize: 13, fontWeight: "700" },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: COR.borda, backgroundColor: COR.superficie2 },
  chipAtivo: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  chipTexto: { color: COR.textoSec, fontSize: 12, fontWeight: "700" },
  dia: { color: COR.textoMudo, fontSize: 11.5, fontWeight: "800", letterSpacing: 0.4, textTransform: "uppercase", marginTop: 8, marginBottom: 4 },
  item: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 10 },
  icone: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  texto: { color: COR.textoSec, fontSize: 13.5, lineHeight: 19 },
  quem: { color: COR.texto, fontWeight: "800" },
  meta: { color: COR.textoMudo, fontSize: 11.5, marginTop: 2 },
  vazio: { color: COR.textoMudo, fontSize: 13, textAlign: "center", paddingVertical: 20 },
  erro: { color: "#FCA5A5", fontSize: 13 },
});
