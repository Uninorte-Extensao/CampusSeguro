import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Line, Rect } from "react-native-svg";

const SERVICO_INFO: Record<
  string,
  {
    titulo: string;
    numero: string;
    icon: React.ComponentProps<typeof Feather>["name"];
    cor: string;
    corFundo: string;
  }
> = {
  policia: {
    titulo: "Polícia",
    numero: "190",
    icon: "shield",
    cor: "#3B82F6",
    corFundo: "rgba(59,130,246,0.12)",
  },
  ambulancia: {
    titulo: "Ambulância",
    numero: "192",
    icon: "activity",
    cor: "#22c55e",
    corFundo: "rgba(34,197,94,0.12)",
  },
  bombeiros: {
    titulo: "Bombeiros",
    numero: "193",
    icon: "alert-triangle",
    cor: "#ef4444",
    corFundo: "rgba(239,68,68,0.12)",
  },
};

function MapaMini() {
  return (
    <View style={s.mapaWrap}>
      <View style={s.mapaFundo}>
        <Svg
          style={{ position: "absolute", width: "100%", height: "100%" }}
          width="100%"
          height="100%"
        >
          {[0.25, 0.5, 0.75].map((f, i) => (
            <Line
              key={`h${i}`}
              x1="0%"
              y1={`${f * 100}%`}
              x2="100%"
              y2={`${f * 100}%`}
              stroke="#1F2E48"
              strokeWidth="10"
            />
          ))}
          {[0.3, 0.6].map((f, i) => (
            <Line
              key={`v${i}`}
              x1={`${f * 100}%`}
              y1="0%"
              x2={`${f * 100}%`}
              y2="100%"
              stroke="#1F2E48"
              strokeWidth="10"
            />
          ))}
          <Rect x="32%" y="26%" width="22%" height="18%" fill="#162032" rx="4" />
          <Rect x="32%" y="56%" width="22%" height="16%" fill="#162032" rx="4" />
          <Circle cx="50%" cy="50%" r="22" fill="#1A3A4A" />
          <Circle cx="50%" cy="50%" r="14" fill="#1E4A5E" />
        </Svg>

        <View style={s.pin}>
          <Feather name="map-pin" size={20} color="#40DBD5" />
        </View>
      </View>
    </View>
  );
}

export default function ConfirmarEmergencia() {
  const router = useRouter();
  const { servico } = useLocalSearchParams<{ servico: string }>();

  const info =
    SERVICO_INFO[servico ?? ""] ?? SERVICO_INFO.policia;

  async function handleConfirmar() {
    const url =
      Platform.OS === "ios" ? `telprompt:${info.numero}` : `tel:${info.numero}`;

    try {
      const podeAbrir = await Linking.canOpenURL(url);
      if (!podeAbrir) {
        Alert.alert(
          "Não foi possível ligar",
          `Disque manualmente: ${info.numero}`
        );
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Erro ao iniciar chamada",
        `Disque manualmente: ${info.numero}`
      );
    } finally {
      router.replace({
        pathname: "/emergencia/status",
        params: { servico },
      });
    }
  }

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Feather name="arrow-left" size={20} color="#C9D3FF" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Confirmar</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Serviço selecionado */}
        <View style={s.servicoBlock}>
          <View
            style={[
              s.servicoIcone,
              { backgroundColor: info.corFundo },
            ]}
          >
            <Feather name={info.icon} size={36} color={info.cor} />
          </View>

          <Text style={s.servicoTitulo}>{info.titulo}</Text>
          <Text style={s.servicoSub}>
            Ligando para <Text style={[s.numero, { color: info.cor }]}>{info.numero}</Text>
          </Text>
        </View>

        {/* Aviso de localização */}
        <View style={s.avisoLoc}>
          <View style={s.avisoIcon}>
            <Feather name="navigation" size={18} color="#40DBD5" />
          </View>
          <View style={s.flex}>
            <Text style={s.avisoTitulo}>Localização será compartilhada</Text>
            <Text style={s.avisoSub}>
              Sua localização atual será enviada ao serviço de emergência para
              agilizar o atendimento.
            </Text>
          </View>
        </View>

        {/* Mapa */}
        <MapaMini />

        {/* Endereço estimado */}
        <View style={s.enderecoCard}>
          <Text style={s.enderecoLabel}>LOCALIZAÇÃO ATUAL</Text>
          <View style={s.enderecoRow}>
            <Feather name="map-pin" size={14} color="#8D90A1" />
            <Text style={s.enderecoText}>
              UniNorte – Campus Djalma Batista
            </Text>
          </View>
          <Text style={s.enderecoSub}>
            Av. Djalma Batista, 2100 – Chapada, Manaus – AM
          </Text>
        </View>

        {/* Botão confirmar */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleConfirmar}
          style={s.btnWrap}
        >
          <LinearGradient
            colors={[info.cor, info.cor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.btn}
          >
            <Feather name="phone-call" size={18} color="#fff" />
            <Text style={s.btnText}>Confirmar e acionar</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Cancelar */}
        <TouchableOpacity
          style={s.cancelarBtn}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Text style={s.cancelarText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1020" },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 20,
  },

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
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#EAF0FF",
    fontSize: 15,
    fontWeight: "700",
  },

  servicoBlock: { alignItems: "center", gap: 12, paddingVertical: 8 },
  servicoIcone: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  servicoTitulo: {
    color: "#EAF0FF",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  servicoSub: {
    color: "#8D90A1",
    fontSize: 14,
  },
  numero: {
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: 0.5,
  },

  avisoLoc: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(64,219,213,0.06)",
    borderWidth: 1,
    borderColor: "rgba(64,219,213,0.2)",
    borderRadius: 16,
    padding: 14,
  },
  avisoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(64,219,213,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  flex: { flex: 1 },
  avisoTitulo: {
    color: "#EAF0FF",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  avisoSub: {
    color: "#8D90A1",
    fontSize: 12,
    lineHeight: 17,
  },

  mapaWrap: { borderRadius: 18, overflow: "hidden", height: 140 },
  mapaFundo: {
    flex: 1,
    backgroundColor: "#0E1929",
    borderWidth: 1,
    borderColor: "#1F2638",
    alignItems: "center",
    justifyContent: "center",
  },
  pin: {
    backgroundColor: "#0B1020",
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: "#40DBD5",
    shadowColor: "#40DBD5",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },

  enderecoCard: {
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderColor: "#1F2638",
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  enderecoLabel: {
    color: "#454D66",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  enderecoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  enderecoText: {
    color: "#EAF0FF",
    fontSize: 14,
    fontWeight: "700",
  },
  enderecoSub: {
    color: "#8D90A1",
    fontSize: 12,
    lineHeight: 17,
  },

  btnWrap: {
    borderRadius: 999,
    overflow: "hidden",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 58,
    borderRadius: 999,
  },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "800" },

  cancelarBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  cancelarText: {
    color: "#8D90A1",
    fontSize: 14,
    fontWeight: "600",
  },
});
