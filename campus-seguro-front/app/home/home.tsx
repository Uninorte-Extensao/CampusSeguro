import { Tabs } from "@/components/navegacao/Tabs";
import { tokens } from "@/constants/theme";
import { useCampusSeguro } from "@/contexts/CampusSeguroContext";
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
import ArrowIcon from "../../assets/icons/arrow.svg";
import CampusSeguroIcon from "../../assets/icons/campus-seguro.svg";
import EmergenciaIcon from "../../assets/icons/emergencia.svg";
import HistoricoIcon from "../../assets/icons/historico.svg";
import ReportarIcon from "../../assets/icons/reportar.svg";

export default function HomeScreen() {
  const router = useRouter();
  const { naoLidas } = useCampusSeguro();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.sistemaBadge}>
              <View style={styles.sistemaDot} />
              <Text style={styles.sistemaBadgeText}>SISTEMA ATIVO</Text>
            </View>

            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.headerIconBtn}
                activeOpacity={0.75}
                onPress={() => router.push("/notificacoes")}
              >
                <Feather name="bell" size={18} color="#C9D3FF" />
                {naoLidas > 0 && <View style={styles.headerBadge} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerIconBtn}
                activeOpacity={0.75}
                onPress={() => router.push("/ajustes")}
              >
                <Feather name="user" size={18} color="#C9D3FF" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.title}>Olá, Gustavo</Text>
          <Text style={styles.subtitle}>Sua segurança está ativa e monitorada.</Text>
        </View>

        <TouchableOpacity style={styles.campusCard} activeOpacity={0.85}>
          <View style={styles.campusIconWrapper}>
            <CampusSeguroIcon width={38} height={38} />
          </View>

          <View style={styles.campusInfo}>
            <Text style={styles.campusTitle}>Campus Seguro</Text>
            <Text style={styles.campusSubtitle}>12 patrulhas ativas no momento</Text>
          </View>

          <ArrowIcon width={14} height={14} />
        </TouchableOpacity>

        <View style={styles.emergenciaSection}>
          <TouchableOpacity
            style={styles.emergenciaButton}
            activeOpacity={0.8}
            onPress={() => router.push("../emergencia")}
          >
            <EmergenciaIcon width={45} height={45} />
            <Text style={styles.emergenciaText}>EMERGÊNCIA</Text>
          </TouchableOpacity>

          <Text style={styles.emergenciaHint}>
            PRESSIONE EM CASO DE PERIGO IMINENTE
          </Text>
        </View>

        <View style={styles.acoesSection}>
          <Text style={styles.acoesTitle}>Ações</Text>

          <View style={styles.acoesGrid}>
            <TouchableOpacity
              style={styles.acaoCard}
              activeOpacity={0.85}
              onPress={() => router.push("/report/etapa1" as any)}
            >
              <View style={styles.acaoIconPolicia}>
                <ReportarIcon width={40} height={40} />
              </View>
              <Text style={styles.acaoLabel}>Reportar{"\n"}Incidente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acaoCard}
              activeOpacity={0.85}
              onPress={() => router.push("../historico")}
            >
              <View style={styles.acaoIconPolicia}>
                <HistoricoIcon width={40} height={40} />
              </View>
              <Text style={styles.acaoLabel}>Histórico</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Tabs activeTab="inicio" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 150,
    gap: 20,
  },

  header: {
    gap: 8,
    marginBottom: 4,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },

  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderColor: "#1F2638",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  headerBadge: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 2,
    borderColor: "#0B1020",
  },

  sistemaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },

  sistemaDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#40DBD5",
  },

  sistemaBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#40DBD5",
    letterSpacing: 1.2,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#f8fafc",
  },

  subtitle: {
    fontSize: 14,
    color: "#8D90A1",
    fontWeight: "400",
  },

  campusCard: {
    backgroundColor: "#161B2B",
    borderWidth: 1,
    borderColor: "#232A3D",
    borderRadius: tokens.radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  campusIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#0B1020",
    borderWidth: 1,
    borderColor: "#232A3D",
    alignItems: "center",
    justifyContent: "center",
  },

  campusInfo: {
    flex: 1,
    gap: 3,
  },

  campusTitle: {
    color: "#f8fafc",
    fontWeight: "700",
    fontSize: 14,
  },

  campusSubtitle: {
    color: "#8D90A1",
    fontSize: 12,
  },

  emergenciaSection: {
    alignItems: "center",
    gap: 20,
    paddingVertical: 16,
  },

  emergenciaButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#C0392B",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#e53e3e",
    shadowOpacity: 0.55,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 6 },
    elevation: 16,
    overflow: "visible",
  },

  emergenciaText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 1.5,
  },

  emergenciaHint: {
    color: "#8D90A1",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    paddingTop: 20,
    textAlign: "center",
  },

  acoesSection: {
    gap: 14,
  },

  acoesTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
  },

  acoesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 12,
    rowGap: 12,
  },

  acaoCard: {
    flexBasis: "48%",
    flexGrow: 1,
    backgroundColor: "#161B2B",
    borderWidth: 1,
    borderColor: "#232A3D",
    borderRadius: tokens.radius.md,
    padding: 18,
    gap: 26,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    minHeight: 110,
  },

  acaoIconPolicia: {
    alignSelf: "flex-start",
  },

  acaoLabel: {
    color: "#DEE1F9",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
});