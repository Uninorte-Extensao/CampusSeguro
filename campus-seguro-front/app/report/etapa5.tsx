import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Etapa5Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const tipoAgressao =
    typeof params.tipoAgressao === "string"
      ? params.tipoAgressao
      : "Injúria Racial";

  const local =
    typeof params.local === "string" ? params.local : "Sala de aula";

  const horario =
    typeof params.horario === "string" && params.horario.trim().length > 0
      ? params.horario
      : "Não informado";

  const agressor =
    typeof params.agressor === "string" && params.agressor.trim().length > 0
      ? params.agressor
      : "Não informado";

  const categoria =
    typeof params.categoria === "string" ? params.categoria : "Assédio";

  const gravidade =
    typeof params.gravidade === "string" ? params.gravidade : "Média";

  const destino =
    typeof params.destino === "string" ? params.destino : "Segurança";

  const resumo =
    typeof params.resumo === "string"
      ? params.resumo
      : "Fala infeliz e discriminatória com base na raça.";

  const anonimo =
    typeof params.anonimo === "string" ? params.anonimo === "true" : true;

  function handleEnviarDenuncia() {
    const protocolo = gerarProtocolo();

    router.replace({
      pathname: "/report/sucesso",
      params: {
        protocolo,
        tipoAgressao,
        local,
        horario,
        agressor,
        categoria,
        gravidade,
        destino,
        resumo,
        anonimo: anonimo ? "true" : "false",
      },
    });
  }

  function gerarProtocolo() {
    const numero = Math.floor(100000 + Math.random() * 900000);
    return `CS-${numero}`;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
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
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={20} color="#EAF0FF" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Reportar Incidente</Text>
            <Text style={styles.stepText}>PASSO 4 DE 4</Text>
          </View>
        </View>

        <View style={styles.progressWrapper}>
          <View style={[styles.progressBar, styles.progressBarActive]} />
          <View style={[styles.progressBar, styles.progressBarActive]} />
          <View style={[styles.progressBar, styles.progressBarActive]} />
          <View style={[styles.progressBar, styles.progressBarActive]} />
        </View>

        <View style={styles.mainTitleArea}>
          <Text style={styles.title}>
            Confirmação da{"\n"}
            <Text style={styles.highlight}>denúncia</Text>
          </Text>

          <Text style={styles.subtitle}>
            Revise os dados preenchidos antes de enviar a denúncia.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapper}>
              <Feather name="file-text" size={20} color="#40DBD5" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Dados da denúncia</Text>
              <Text style={styles.cardSubtitle}>
                Informações que serão enviadas
              </Text>
            </View>
          </View>

          <InfoRow label="Tipo de agressão" value={tipoAgressao} />
          <InfoRow label="Local" value={local} />
          <InfoRow label="Horário" value={horario} />
          <InfoRow label="Agressor" value={agressor} />
          <InfoRow label="Categoria" value={categoria} />
          <InfoRow label="Gravidade" value={gravidade} />
          <InfoRow label="Encaminhar para" value={destino} />
          <InfoRow label="Enviar de forma anônima" value={anonimo ? "Sim" : "Não"} />

          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>RESUMO</Text>
            <Text style={styles.summaryText}>{resumo}</Text>
          </View>
        </View>

        <View style={styles.alertCard}>
          <View style={styles.alertIcon}>
            <Feather name="shield" size={18} color="#40DBD5" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Envio seguro</Text>
            <Text style={styles.alertDescription}>
              Sua denúncia será registrada no sistema e poderá ser acompanhada
              pelo número de protocolo.
            </Text>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.88} onPress={handleEnviarDenuncia}>
          <LinearGradient
            colors={["#A8C0FF", "#4776FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sendButton}
          >
            <Text style={styles.sendButtonText}>Enviar minha denúncia</Text>
            <Feather name="send" size={18} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020",
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 28,
  },

  header: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    color: "#EAF0FF",
    fontSize: 14,
    fontWeight: "800",
  },

  stepText: {
    color: "#8EA0C7",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  progressWrapper: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    marginBottom: 32,
  },

  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#353B4F",
  },

  progressBarActive: {
    backgroundColor: "#40DBD5",
  },

  mainTitleArea: {
    marginBottom: 24,
  },

  title: {
    color: "#EAF0FF",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: -0.8,
  },

  highlight: {
    color: "#40DBD5",
  },

  subtitle: {
    color: "#AAB4C8",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },

  card: {
    borderRadius: 28,
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderColor: "#26304A",
    padding: 18,
    marginBottom: 18,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },

  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#122A39",
    alignItems: "center",
    justifyContent: "center",
  },

  cardTitle: {
    color: "#EAF0FF",
    fontSize: 15,
    fontWeight: "900",
  },

  cardSubtitle: {
    color: "#7F8AA3",
    fontSize: 12,
    marginTop: 2,
  },

  infoRow: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: "#0F1728",
    borderWidth: 1,
    borderColor: "#26304A",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    justifyContent: "center",
  },

  infoLabel: {
    color: "#8EA0C7",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: "uppercase",
  },

  infoValue: {
    color: "#EAF0FF",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 19,
  },

  summaryBox: {
    borderRadius: 18,
    backgroundColor: "#0F1728",
    borderWidth: 1,
    borderColor: "#26304A",
    padding: 14,
    marginTop: 4,
  },

  summaryLabel: {
    color: "#8EA0C7",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  summaryText: {
    color: "#EAF0FF",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },

  alertCard: {
    borderRadius: 22,
    backgroundColor: "#101827",
    borderWidth: 1,
    borderColor: "#26304A",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 22,
  },

  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#122A39",
    alignItems: "center",
    justifyContent: "center",
  },

  alertTitle: {
    color: "#EAF0FF",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },

  alertDescription: {
    color: "#7F8AA3",
    fontSize: 12,
    lineHeight: 17,
  },

  sendButton: {
    height: 62,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },

  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
});