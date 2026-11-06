import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { listarMinhasDenuncias, MinhaDenuncia } from "../../services/api";
import { ETAPAS_ALUNO, etapaDoAluno, infoEtapa } from "../../utils/acompanhamento";
import { formatarData, tempoRelativo } from "../../utils/admin";

type Filtro = "TODAS" | "ANDAMENTO" | "FINALIZADAS";

export default function MinhasDenunciasScreen() {
  const router = useRouter();
  const [lista, setLista] = useState<MinhaDenuncia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("TODAS");

  const carregar = useCallback(async () => {
    try {
      setLista(await listarMinhasDenuncias());
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível carregar suas denúncias.");
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const finalizadas = lista.filter((d) => d.status === "RESOLVIDO").length;
  const comResposta = lista.filter((d) => d.respondida).length;
  const visiveis = useMemo(
    () =>
      lista.filter((d) =>
        filtro === "TODAS" ? true : filtro === "FINALIZADAS" ? d.status === "RESOLVIDO" : d.status !== "RESOLVIDO"
      ),
    [lista, filtro]
  );

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            tintColor="#40DBD5"
            onRefresh={() => {
              setAtualizando(true);
              carregar();
            }}
          />
        }
      >
        <View style={s.header}>
          <TouchableOpacity style={s.voltar} onPress={() => (router.canGoBack() ? router.back() : router.replace("/home/home"))}>
            <Feather name="arrow-left" size={20} color="#C9D3FF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.titulo}>Minhas denúncias</Text>
            <Text style={s.subtitulo}>Acompanhe o andamento e o retorno da direção</Text>
          </View>
        </View>

        <View style={s.nota}>
          <Feather name="info" size={14} color="#93C5FD" />
          <Text style={s.notaTexto}>
            Aqui aparecem as denúncias que você fez <Text style={{ fontWeight: "800" }}>identificado</Text>. Denúncias
            anônimas não ficam ligadas à sua conta, por isso não recebem retorno individual.
          </Text>
        </View>

        <View style={s.resumo}>
          <Numero valor={lista.length - finalizadas} rotulo="Em andamento" cor="#60A5FA" />
          <Numero valor={comResposta} rotulo="Com resposta" cor="#40DBD5" />
          <Numero valor={finalizadas} rotulo="Finalizadas" cor="#34D399" />
        </View>

        <View style={s.abas}>
          {(
            [
              ["TODAS", "Todas"],
              ["ANDAMENTO", "Em andamento"],
              ["FINALIZADAS", "Finalizadas"],
            ] as [Filtro, string][]
          ).map(([k, l]) => (
            <TouchableOpacity key={k} onPress={() => setFiltro(k)} style={[s.aba, filtro === k && s.abaAtiva]}>
              <Text style={[s.abaTexto, filtro === k && { color: "#0B1020" }]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {carregando ? (
          <ActivityIndicator color="#40DBD5" style={{ marginTop: 30 }} />
        ) : erro ? (
          <View style={s.card}>
            <Text style={s.erro}>{erro}</Text>
            <TouchableOpacity onPress={carregar}>
              <Text style={s.link}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : visiveis.length === 0 ? (
          <View style={s.vazio}>
            <Feather name="inbox" size={34} color="#30364B" />
            <Text style={s.vazioTexto}>
              {lista.length === 0 ? "Você ainda não fez denúncias identificadas." : "Nenhuma denúncia neste filtro."}
            </Text>
            {lista.length === 0 && (
              <TouchableOpacity style={s.botao} onPress={() => router.push("/report/etapa1" as any)}>
                <Text style={s.botaoTexto}>Fazer uma denúncia</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          visiveis.map((d) => <CartaoDenuncia key={d.id} d={d} onPress={() => router.push(`/minhas-denuncias/${d.id}` as any)} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function CartaoDenuncia({ d, onPress }: { d: MinhaDenuncia; onPress: () => void }) {
  const etapa = etapaDoAluno(d.status, d.respondida);
  const info = infoEtapa(etapa);
  const indice = ETAPAS_ALUNO.findIndex((e) => e.chave === etapa);

  return (
    <TouchableOpacity style={s.card} activeOpacity={0.85} onPress={onPress}>
      <View style={s.cardTopo}>
        <View style={{ flex: 1 }}>
          <Text style={s.tipo}>{d.tipo_incidente}</Text>
          <Text style={s.meta}>
            #{d.id.slice(0, 6).toUpperCase()} · enviada {tempoRelativo(d.data_criacao)}
          </Text>
        </View>
        <View style={[s.status, { borderColor: `${info.cor}66`, backgroundColor: `${info.cor}1A` }]}>
          <Feather name={info.icone as any} size={12} color={info.cor} />
          <Text style={[s.statusTexto, { color: info.cor }]}>{info.label}</Text>
        </View>
      </View>

      {/* progresso */}
      <View style={s.progresso}>
        {ETAPAS_ALUNO.map((e, i) => (
          <View key={e.chave} style={[s.trecho, { backgroundColor: i <= indice ? info.cor : "#26304A" }]} />
        ))}
      </View>

      <View style={s.linha}>
        <Feather name="map-pin" size={13} color="#8D90A1" />
        <Text style={s.linhaTexto} numberOfLines={1}>
          {d.localizacao}
        </Text>
      </View>

      {d.ultima_resposta ? (
        <View style={s.resposta}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Feather name="shield" size={12} color="#40DBD5" />
            <Text style={s.respostaTitulo}>Resposta da direção</Text>
            <Text style={s.respostaData}>{tempoRelativo(d.data_ultima_resposta)}</Text>
          </View>
          <Text style={s.respostaTexto} numberOfLines={3}>
            {d.ultima_resposta}
          </Text>
        </View>
      ) : (
        <Text style={s.aguardando}>
          {d.status === "RESOLVIDO" ? "Caso encerrado pela direção." : "Aguardando retorno da direção."}
        </Text>
      )}

      {d.status === "RESOLVIDO" && (
        <View style={s.finalizada}>
          <Feather name="check-circle" size={14} color="#34D399" />
          <Text style={s.finalizadaTexto}>Finalizada em {formatarData(d.data_resolucao)}</Text>
        </View>
      )}

      <View style={s.rodape}>
        {d.total_evidencias > 0 && (
          <Text style={s.meta}>
            <Feather name="paperclip" size={11} color="#8D90A1" /> {d.total_evidencias} anexo(s)
          </Text>
        )}
        <View style={{ flex: 1 }} />
        <Text style={s.link}>Ver acompanhamento</Text>
        <Feather name="chevron-right" size={16} color="#40DBD5" />
      </View>
    </TouchableOpacity>
  );
}

function Numero({ valor, rotulo, cor }: { valor: number; rotulo: string; cor: string }) {
  return (
    <View style={s.numero}>
      <Text style={s.numeroValor}>{valor}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: cor }} />
        <Text style={s.numeroRotulo}>{rotulo}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1020" },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, gap: 14, width: "100%", maxWidth: 720, alignSelf: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  voltar: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#171D2E", borderWidth: 1, borderColor: "#1F2638", alignItems: "center", justifyContent: "center" },
  titulo: { color: "#EAF0FF", fontSize: 22, fontWeight: "800" },
  subtitulo: { color: "#8D90A1", fontSize: 13, marginTop: 2 },

  nota: { flexDirection: "row", gap: 10, backgroundColor: "#1E3A8A26", borderWidth: 1, borderColor: "#3B82F633", borderRadius: 14, padding: 12 },
  notaTexto: { color: "#BFDBFE", fontSize: 12.5, lineHeight: 18, flex: 1 },

  resumo: { flexDirection: "row", gap: 10 },
  numero: { flex: 1, backgroundColor: "#171D2E", borderWidth: 1, borderColor: "#26304A", borderRadius: 14, padding: 12, gap: 2 },
  numeroValor: { color: "#EAF0FF", fontSize: 22, fontWeight: "800" },
  numeroRotulo: { color: "#8D90A1", fontSize: 11.5 },

  abas: { flexDirection: "row", backgroundColor: "#171D2E", borderRadius: 12, padding: 4, gap: 4 },
  aba: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
  abaAtiva: { backgroundColor: "#40DBD5" },
  abaTexto: { color: "#AAB4C8", fontSize: 12.5, fontWeight: "800" },

  card: { backgroundColor: "#171D2E", borderWidth: 1, borderColor: "#26304A", borderRadius: 18, padding: 16, gap: 12 },
  cardTopo: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  tipo: { color: "#EAF0FF", fontSize: 16, fontWeight: "800" },
  meta: { color: "#8D90A1", fontSize: 12, marginTop: 2 },
  status: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusTexto: { fontSize: 11.5, fontWeight: "800" },
  progresso: { flexDirection: "row", gap: 4 },
  trecho: { flex: 1, height: 4, borderRadius: 2 },
  linha: { flexDirection: "row", alignItems: "center", gap: 6 },
  linhaTexto: { color: "#AAB4C8", fontSize: 13, flex: 1 },
  resposta: { backgroundColor: "#0F1728", borderLeftWidth: 3, borderLeftColor: "#40DBD5", borderRadius: 10, padding: 12, gap: 6 },
  respostaTitulo: { color: "#40DBD5", fontSize: 12, fontWeight: "800", flex: 1 },
  respostaData: { color: "#8D90A1", fontSize: 11 },
  respostaTexto: { color: "#EAF0FF", fontSize: 13.5, lineHeight: 19 },
  aguardando: { color: "#8D90A1", fontSize: 12.5, fontStyle: "italic" },
  finalizada: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#34D3991A", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  finalizadaTexto: { color: "#6EE7B7", fontSize: 12.5, fontWeight: "700" },
  rodape: { flexDirection: "row", alignItems: "center", gap: 4 },
  link: { color: "#40DBD5", fontSize: 13, fontWeight: "800" },

  vazio: { alignItems: "center", gap: 12, paddingVertical: 40 },
  vazioTexto: { color: "#8D90A1", fontSize: 14, textAlign: "center" },
  botao: { backgroundColor: "#40DBD5", borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12 },
  botaoTexto: { color: "#0B1020", fontSize: 14, fontWeight: "800" },
  erro: { color: "#FCA5A5", fontSize: 13 },
});
