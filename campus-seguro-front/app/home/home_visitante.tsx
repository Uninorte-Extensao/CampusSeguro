import { tokens } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AmbulanciaIcon from "../../assets/icons/ambulancia.svg";
import EmergenciaIcon from "../../assets/icons/emergencia.svg";
import HistoricoIcon from "../../assets/icons/historico.svg";
import PoliciaIcon from "../../assets/icons/policia.svg";
import ReportarIcon from "../../assets/icons/reportar.svg";

type Tab = "inicio" | "relatar" | "historico" | "config";

export default function HomeVisitanteScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("inicio");

  const { width } = useWindowDimensions();

  const horizontalPadding = 40;
  const gridGap = 14;
  const cardWidth = (width - horizontalPadding - gridGap) / 2;

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
          <View style={styles.acessoBadge}>
            <Text style={styles.acessoBadgeText}>ACESSO RÁPIDO</Text>
          </View>

          <Text style={styles.title}>Olá, Visitante</Text>
        </View>

        <View style={styles.alertCard}>
          <View style={styles.alertIconWrapper}>
            <Feather name="info" size={16} color="#EF4444" />
          </View>

          <Text style={styles.alertText}>
            Acesso limitado a funções de emergência. Complete seu perfil para
            ver o histórico.
          </Text>
        </View>

        <View style={styles.emergenciaSection}>
          <TouchableOpacity
            style={styles.emergenciaOuter}
            activeOpacity={0.82}
            onPress={() => {}}
          >
            <View style={styles.emergenciaButton}>
              <EmergenciaIcon width={48} height={48} />

              <Text style={styles.emergenciaText}>
                EMERGÊNCIA
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.emergenciaHint}>
            PRESSIONE EM CASO DE PERIGO IMINENTE
          </Text>
        </View>

        <View style={styles.acoesSection}>
          <View style={styles.acoesGrid}>
            <TouchableOpacity
              style={[styles.acaoCard, { width: cardWidth }]}
              activeOpacity={0.85}
              onPress={() => {}}
            >
              <PoliciaIcon width={40} height={40} />

              <Text style={styles.acaoLabel}>Chamar Polícia</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.acaoCard, { width: cardWidth }]}
              activeOpacity={0.85}
              onPress={() => {}}
            >
              <AmbulanciaIcon width={40} height={40} />

              <Text style={styles.acaoLabel}>Ambulância</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.acaoCard,
                styles.acaoCardBloqueado,
                { width: cardWidth },
              ]}
              activeOpacity={0.7}
              disabled
            >
              <Feather
                name="lock"
                size={12}
                color="#7C8299"
                style={styles.lockIcon}
              />

              <ReportarIcon width={40} height={40} />

              <Text style={[styles.acaoLabel, styles.acaoLabelBloqueado]}>
                Reportar Incidente
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.acaoCard,
                styles.acaoCardBloqueado,
                { width: cardWidth },
              ]}
              activeOpacity={0.7}
              disabled
            >
              <Feather
                name="lock"
                size={12}
                color="#7C8299"
                style={styles.lockIcon}
              />

              <HistoricoIcon width={40} height={40} />

              <Text style={[styles.acaoLabel, styles.acaoLabelBloqueado]}>
                Histórico
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
    paddingTop: 8,
    paddingBottom: 150,
    gap: 24,
  },

  header: {
    gap: 10,
  },

  acessoBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#3155A4",
    backgroundColor: "#14224A",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },

  acessoBadgeText: {
    color: "#B5C4FF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.3,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#F8FAFC",
    letterSpacing: -0.8,
  },

  alertCard: {
    minHeight: 108,
    backgroundColor: "#171C2D",
    borderWidth: 1,
    borderColor: "#1F2638",
    borderRadius: 36,
    paddingHorizontal: 22,
    paddingVertical: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  alertIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  alertText: {
    flex: 1,
    color: "#C8CEDF",
    fontSize: 13,
    lineHeight: 22,
    fontWeight: "400",
  },

  emergenciaSection: {
    alignItems: "center",
    gap: 28,
    paddingTop: 6,
    paddingBottom: 8,
  },

  emergenciaOuter: {
    width: 232,
    height: 232,
    borderRadius: 116,
    backgroundColor: "#071225",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#DC2626",
    shadowOpacity: 0.4,
    shadowRadius: 42,
    shadowOffset: { width: 0, height: 12 },
    elevation: 18,
  },

  emergenciaButton: {
    width: 212,
    height: 212,
    borderRadius: 106,
    backgroundColor: "#C91420",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  emergenciaText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 1.5,
  },


  emergenciaHint: {
    color: "#8D90A1",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 3,
    textAlign: "center",
  },

  acoesSection: {
    gap: 14,
  },

  acoesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 14,
    rowGap: 16,
  },

  acaoCard: {
    minHeight: 132,
    backgroundColor: "#252A3D",
    borderWidth: 1,
    borderColor: "#2D344A",
    borderRadius: tokens.radius.md,
    paddingHorizontal: 18,
    paddingVertical: 18,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  acaoCardBloqueado: {
    position: "relative",
    backgroundColor: "#101727",
    borderColor: "#141D30",
    opacity: 0.9,
  },

  lockIcon: {
    position: "absolute",
    top: 12,
    right: 12,
  },

  acaoLabel: {
    color: "#F4F6FF",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
  },

  acaoLabelBloqueado: {
    color: "#8E95A8",
  },
});