import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Servico = "policia" | "ambulancia" | "bombeiros";

interface ServicoConfig {
  id: Servico;
  titulo: string;
  numero: string;
  descricao: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  cor: string;
  corFundo: string;
  corBorda: string;
}

const SERVICOS: ServicoConfig[] = [
  {
    id: "policia",
    titulo: "Polícia",
    numero: "190",
    descricao: "Roubo, assalto, agressão ou ameaça",
    icon: "shield",
    cor: "#3B82F6",
    corFundo: "rgba(59,130,246,0.12)",
    corBorda: "rgba(59,130,246,0.3)",
  },
  {
    id: "ambulancia",
    titulo: "Ambulância",
    numero: "192",
    descricao: "Emergência médica, acidente ou desmaio",
    icon: "activity",
    cor: "#22c55e",
    corFundo: "rgba(34,197,94,0.12)",
    corBorda: "rgba(34,197,94,0.3)",
  },
  {
    id: "bombeiros",
    titulo: "Bombeiros",
    numero: "193",
    descricao: "Incêndio, resgate ou risco iminente",
    icon: "alert-triangle",
    cor: "#ef4444",
    corFundo: "rgba(239,68,68,0.12)",
    corBorda: "rgba(239,68,68,0.3)",
  },
];

export default function EmergenciaIndex() {
  const router = useRouter();

  function handleSelecionar(servico: Servico) {
    router.push({
      pathname: "/emergencia/confirmar",
      params: { servico },
    });
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
          <Text style={s.headerTitle}>Emergência</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Badge alerta */}
        <View style={s.alertaBadge}>
          <View style={s.alertaPulse} />
          <Feather name="alert-circle" size={14} color="#ef4444" />
          <Text style={s.alertaText}>EMERGÊNCIA ATIVA</Text>
        </View>

        {/* Título */}
        <View style={s.titleBlock}>
          <Text style={s.title}>
            Qual tipo de{"\n"}
            <Text style={s.titleAccent}>atendimento?</Text>
          </Text>
          <Text style={s.subtitle}>
            Selecione o serviço de emergência adequado. Sua localização será
            compartilhada automaticamente.
          </Text>
        </View>

        {/* Lista de serviços */}
        <View style={s.lista}>
          {SERVICOS.map((srv) => (
            <TouchableOpacity
              key={srv.id}
              style={[s.servicoCard, { borderColor: srv.corBorda }]}
              activeOpacity={0.85}
              onPress={() => handleSelecionar(srv.id)}
            >
              <View
                style={[s.iconWrapper, { backgroundColor: srv.corFundo }]}
              >
                <Feather name={srv.icon} size={26} color={srv.cor} />
              </View>

              <View style={s.servicoInfo}>
                <View style={s.servicoTitleRow}>
                  <Text style={s.servicoTitulo}>{srv.titulo}</Text>
                  <Text style={[s.servicoNumero, { color: srv.cor }]}>
                    {srv.numero}
                  </Text>
                </View>
                <Text style={s.servicoDesc}>{srv.descricao}</Text>
              </View>

              <Feather name="chevron-right" size={18} color="#454D66" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Aviso */}
        <View style={s.aviso}>
          <Feather name="info" size={14} color="#40DBD5" />
          <Text style={s.avisoText}>
            Em caso de perigo iminente à vida, ligue 190 imediatamente.
          </Text>
        </View>

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

  alertaBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  alertaPulse: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#ef4444",
  },
  alertaText: {
    color: "#ef4444",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  titleBlock: { gap: 8 },
  title: {
    color: "#EAF0FF",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  titleAccent: { color: "#ef4444" },
  subtitle: {
    color: "#C4CAD8",
    fontSize: 14,
    lineHeight: 20,
  },

  lista: { gap: 12 },

  servicoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  servicoInfo: { flex: 1, gap: 4 },
  servicoTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  servicoTitulo: {
    color: "#EAF0FF",
    fontSize: 16,
    fontWeight: "800",
  },
  servicoNumero: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  servicoDesc: {
    color: "#8D90A1",
    fontSize: 12,
    lineHeight: 17,
  },

  aviso: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(64,219,213,0.06)",
    borderWidth: 1,
    borderColor: "rgba(64,219,213,0.2)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  avisoText: {
    color: "#C4CAD8",
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },

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
