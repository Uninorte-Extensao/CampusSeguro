import { abrirArquivo, VisualizadorImagem } from "@/components/VisualizadorImagem";
import { StatusRelato, useCampusSeguro } from "@/contexts/CampusSeguroContext";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Atualizacao,
  buscarOcorrencia,
  EvidenciaResponse,
  listarAtualizacoes,
  listarEvidencias,
  Ocorrencia,
  StatusOcorrencia,
} from "../../services/api";

const STATUS_COR: Record<StatusRelato, string> = {
  ATIVO: "#ef4444",
  "EM ANÁLISE": "#f59e0b",
  "EM ATENDIMENTO": "#3B82F6",
  CONCLUÍDO: "#22c55e",
};

const STATUS_LABEL: Record<StatusOcorrencia, StatusRelato> = {
  ABERTO: "ATIVO",
  EM_ATENDIMENTO: "EM ANÁLISE",
  RESOLVIDO: "CONCLUÍDO",
};

function formatarData(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}, ${hh}:${mi}`;
}

export default function DetalheOcorrenciaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = typeof params.id === "string" ? params.id : "";

  const { buscarRelatoPorId } = useCampusSeguro();
  const relatoLocal = buscarRelatoPorId(id);

  const [ocorrencia, setOcorrencia] = useState<Ocorrencia | null>(null);
  const [evidencias, setEvidencias] = useState<EvidenciaResponse[]>([]);
  const [imagemAberta, setImagemAberta] = useState<string | null>(null);
  const [atualizacoes, setAtualizacoes] = useState<Atualizacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    (async () => {
      if (!id) return;
      setCarregando(true);
      setErro(null);
      // Busca a ocorrência e as evidências direto do backend (não depende
      // do contexto estar carregado).
      try {
        const oc = await buscarOcorrencia(id);
        if (ativo) setOcorrencia(oc);
      } catch {
        // Mantém o fallback do contexto se a busca falhar.
      }
      try {
        // Respostas da administração e mudanças de etapa
        const tl = await listarAtualizacoes(id);
        if (ativo) setAtualizacoes(tl);
      } catch {
        // Sem linha do tempo: a tela segue mostrando os dados da denúncia.
      }
      try {
        const lista = await listarEvidencias(id);
        if (ativo) setEvidencias(lista);
      } catch (e) {
        if (ativo)
          setErro(
            e instanceof Error ? e.message : "Não foi possível carregar os anexos."
          );
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [id]);

  // Dados para exibição: prioriza o backend, cai para o contexto.
  const dados = ocorrencia
    ? {
        tipo: ocorrencia.tipo_incidente || "Ocorrência",
        status: STATUS_LABEL[ocorrencia.status] ?? "ATIVO",
        local: ocorrencia.localizacao || "Local não informado",
        dataHora: formatarData(
          ocorrencia.horario_ocorrencia || ocorrencia.data_criacao
        ),
        descricao: ocorrencia.descricao || ocorrencia.descricao_resumida || "",
        icone: relatoLocal?.icone ?? "alert-circle",
      }
    : relatoLocal
    ? {
        tipo: relatoLocal.tipo,
        status: relatoLocal.status,
        local: relatoLocal.local,
        dataHora: `${relatoLocal.data}, ${relatoLocal.hora}`,
        descricao: relatoLocal.descricao,
        icone: relatoLocal.icone,
      }
    : null;

  const corStatus = dados ? STATUS_COR[dados.status] : "#8D90A1";

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Feather name="arrow-left" size={20} color="#C9D3FF" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Detalhes da ocorrência</Text>
          <View style={{ width: 36 }} />
        </View>

        {!dados ? (
          <View style={s.card}>
            {carregando ? (
              <View style={s.centro}>
                <ActivityIndicator color="#40DBD5" />
              </View>
            ) : (
              <Text style={s.semDados}>
                Não foi possível carregar os dados dessa ocorrência. Tente
                novamente.
              </Text>
            )}
          </View>
        ) : (
          <>
            {/* Cabeçalho da ocorrência */}
            <View style={s.card}>
              <View style={s.topo}>
                <View style={s.iconeWrap}>
                  <Feather name={dados.icone} size={22} color="#C9D3FF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.tipo}>{dados.tipo}</Text>
                  <Text style={s.protocolo}>ID: #{id}</Text>
                </View>
                <View style={[s.badge, { borderColor: corStatus }]}>
                  <Text style={[s.badgeText, { color: corStatus }]}>{dados.status}</Text>
                </View>
              </View>

              <Linha icone="map-pin" label="Local" valor={dados.local} />
              <Linha icone="clock" label="Data" valor={dados.dataHora} />

              <View style={s.descBox}>
                <Text style={s.descLabel}>DESCRIÇÃO</Text>
                <Text style={s.descText}>{dados.descricao || "Sem descrição."}</Text>
              </View>
            </View>

            {/* Retorno da administração */}
            <View style={s.card}>
              <Text style={s.secaoTitulo}>Retorno da administração</Text>
              {atualizacoes.filter((a) => a.tipo === "RESPOSTA").length === 0 ? (
                <View style={s.centro}>
                  <Feather name="message-circle" size={26} color="#30364B" />
                  <Text style={s.semAnexo}>
                    {ocorrencia?.status === "RESOLVIDO"
                      ? "Denúncia finalizada."
                      : "Sua denúncia está sendo analisada. Você verá a resposta aqui."}
                  </Text>
                </View>
              ) : (
                atualizacoes
                  .filter((a) => a.tipo === "RESPOSTA")
                  .map((a) => (
                    <View key={a.id} style={s.respostaBox}>
                      <View style={s.respostaTopo}>
                        <Feather name="shield" size={13} color="#40DBD5" />
                        <Text style={s.respostaAutor}>Administração do campus</Text>
                        <Text style={s.respostaData}>{formatarData(a.data_atualizado)}</Text>
                      </View>
                      <Text style={s.respostaTexto}>{a.mensagem_acao}</Text>
                    </View>
                  ))
              )}

              {atualizacoes.some((a) => a.tipo === "STATUS") && (
                <View style={{ gap: 8, marginTop: 4 }}>
                  <Text style={s.descLabel}>ANDAMENTO</Text>
                  {atualizacoes
                    .filter((a) => a.tipo === "STATUS")
                    .map((a) => (
                      <View key={a.id} style={s.andamentoLinha}>
                        <View style={s.andamentoPonto} />
                        <Text style={s.andamentoTexto}>{a.mensagem_acao}</Text>
                        <Text style={s.respostaData}>{formatarData(a.data_atualizado)}</Text>
                      </View>
                    ))}
                </View>
              )}
            </View>

            {/* Evidências */}
            <View style={s.card}>
              <Text style={s.secaoTitulo}>Evidências anexadas</Text>

              {carregando ? (
                <View style={s.centro}>
                  <ActivityIndicator color="#40DBD5" />
                </View>
              ) : erro ? (
                <Text style={s.erroText}>{erro}</Text>
              ) : evidencias.length === 0 ? (
                <View style={s.centro}>
                  <Feather name="paperclip" size={28} color="#30364B" />
                  <Text style={s.semAnexo}>Nenhum anexo nesta ocorrência.</Text>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {evidencias.map((ev) =>
                    ev.tipo_midia === "Foto" ? (
                      <TouchableOpacity
                        key={ev.id}
                        activeOpacity={0.9}
                        onPress={() => (ev.tipo_midia === "Foto" ? setImagemAberta(ev.url) : abrirArquivo(ev.url))}
                      >
                        <Image source={{ uri: ev.url }} style={s.imagem} resizeMode="cover" />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        key={ev.id}
                        style={s.arquivoItem}
                        activeOpacity={0.8}
                        onPress={() => (ev.tipo_midia === "Foto" ? setImagemAberta(ev.url) : abrirArquivo(ev.url))}
                      >
                        <Feather
                          name={
                            ev.tipo_midia === "Vídeo"
                              ? "video"
                              : ev.tipo_midia === "Áudio"
                              ? "mic"
                              : "file-text"
                          }
                          size={18}
                          color="#40DBD5"
                        />
                        <Text style={s.arquivoTexto}>Abrir {ev.tipo_midia.toLowerCase()}</Text>
                        <Feather name="external-link" size={16} color="#8D90A1" />
                      </TouchableOpacity>
                    )
                  )}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
      <VisualizadorImagem url={imagemAberta} titulo="Evidência anexada" onFechar={() => setImagemAberta(null)} />
    </SafeAreaView>
  );
}

function Linha({
  icone,
  label,
  valor,
}: {
  icone: React.ComponentProps<typeof Feather>["name"];
  label: string;
  valor: string;
}) {
  return (
    <View style={s.linha}>
      <Feather name={icone} size={14} color="#8D90A1" />
      <Text style={s.linhaLabel}>{label}:</Text>
      <Text style={s.linhaValor} numberOfLines={2}>
        {valor}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1020" },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28, gap: 16 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderColor: "#1F2638",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: "#EAF0FF", fontSize: 15, fontWeight: "800" },

  card: {
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderColor: "#26304A",
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },

  topo: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconeWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#30364B",
    alignItems: "center",
    justifyContent: "center",
  },
  tipo: { color: "#EAF0FF", fontSize: 15, fontWeight: "800" },
  protocolo: { color: "#8D90A1", fontSize: 12, marginTop: 2 },

  badge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },

  linha: { flexDirection: "row", alignItems: "center", gap: 6 },
  linhaLabel: { color: "#8D90A1", fontSize: 13, fontWeight: "700" },
  linhaValor: { color: "#EAF0FF", fontSize: 13, flex: 1 },

  descBox: {
    backgroundColor: "#0F1728",
    borderWidth: 1,
    borderColor: "#26304A",
    borderRadius: 14,
    padding: 12,
  },
  descLabel: {
    color: "#8EA0C7",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  descText: { color: "#EAF0FF", fontSize: 14, lineHeight: 20 },

  secaoTitulo: { color: "#EAF0FF", fontSize: 15, fontWeight: "800" },

  respostaBox: {
    backgroundColor: "#0F1728",
    borderLeftWidth: 3,
    borderLeftColor: "#40DBD5",
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  respostaTopo: { flexDirection: "row", alignItems: "center", gap: 6 },
  respostaAutor: { color: "#40DBD5", fontSize: 12, fontWeight: "800", flex: 1 },
  respostaData: { color: "#8D90A1", fontSize: 11 },
  respostaTexto: { color: "#EAF0FF", fontSize: 14, lineHeight: 20 },
  andamentoLinha: { flexDirection: "row", alignItems: "center", gap: 8 },
  andamentoPonto: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#3B82F6" },
  andamentoTexto: { color: "#AAB4C8", fontSize: 13, flex: 1 },

  centro: { alignItems: "center", paddingVertical: 20, gap: 10 },
  semAnexo: { color: "#454D66", fontSize: 13, fontWeight: "600" },
  semDados: { color: "#AAB4C8", fontSize: 14, lineHeight: 20 },
  erroText: { color: "#FF6B6B", fontSize: 13, lineHeight: 19 },

  imagem: {
    width: "100%",
    height: 200,
    borderRadius: 14,
    backgroundColor: "#0F1728",
  },

  arquivoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#0F1728",
    borderWidth: 1,
    borderColor: "#26304A",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  arquivoTexto: { flex: 1, color: "#EAF0FF", fontSize: 14, fontWeight: "700" },
});
