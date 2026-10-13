import { StatusRelato, useCampusSeguro } from "@/contexts/CampusSeguroContext";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EvidenciaResponse, listarEvidencias } from "../../services/api";

const STATUS_COR: Record<StatusRelato, string> = {
  ATIVO: "#ef4444",
  "EM ANÁLISE": "#f59e0b",
  "EM ATENDIMENTO": "#3B82F6",
  CONCLUÍDO: "#22c55e",
};

export default function DetalheOcorrenciaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = typeof params.id === "string" ? params.id : "";

  const { buscarRelatoPorId } = useCampusSeguro();
  const relato = buscarRelatoPorId(id);

  const [evidencias, setEvidencias] = useState<EvidenciaResponse[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    (async () => {
      if (!id) return;
      setCarregando(true);
      setErro(null);
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

  const corStatus = relato ? STATUS_COR[relato.status] : "#8D90A1";

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

        {!relato ? (
          <View style={s.card}>
            <Text style={s.semDados}>
              Não encontramos os dados dessa ocorrência na lista. Volte ao
              histórico e tente novamente.
            </Text>
          </View>
        ) : (
          <>
            {/* Cabeçalho da ocorrência */}
            <View style={s.card}>
              <View style={s.topo}>
                <View style={s.iconeWrap}>
                  <Feather name={relato.icone} size={22} color="#C9D3FF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.tipo}>{relato.tipo}</Text>
                  <Text style={s.protocolo}>ID: #{relato.id}</Text>
                </View>
                <View style={[s.badge, { borderColor: corStatus }]}>
                  <Text style={[s.badgeText, { color: corStatus }]}>{relato.status}</Text>
                </View>
              </View>

              <Linha icone="map-pin" label="Local" valor={relato.local} />
              <Linha icone="clock" label="Data" valor={`${relato.data}, ${relato.hora}`} />

              <View style={s.descBox}>
                <Text style={s.descLabel}>DESCRIÇÃO</Text>
                <Text style={s.descText}>{relato.descricao || "Sem descrição."}</Text>
              </View>
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
                        onPress={() => Linking.openURL(ev.url)}
                      >
                        <Image source={{ uri: ev.url }} style={s.imagem} resizeMode="cover" />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        key={ev.id}
                        style={s.arquivoItem}
                        activeOpacity={0.8}
                        onPress={() => Linking.openURL(ev.url)}
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
