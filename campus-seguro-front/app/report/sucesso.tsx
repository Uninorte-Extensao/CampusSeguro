import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SucessoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const protocolo =
    typeof params.protocolo === "string" ? params.protocolo : "CS-000000";

  function handleVoltarInicio() {
    router.replace("/home/home");
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <View style={styles.content}>
        <View style={styles.successCard}>
          <LinearGradient
            colors={["#12323B", "#101F32"]}
            style={styles.checkCircle}
          >
            <Feather name="check" size={58} color="#40DBD5" />
          </LinearGradient>

          <Text style={styles.title}>
            Denúncia{"\n"}
            <Text style={styles.highlight}>enviada</Text>
          </Text>

          <Text style={styles.subtitle}>
            Seu relato foi registrado com sucesso. Guarde o número de protocolo
            para acompanhar a denúncia.
          </Text>

          <View style={styles.protocolCard}>
            <Text style={styles.protocolLabel}>ID / PROTOCOLO</Text>
            <Text style={styles.protocolValue}>{protocolo}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Feather name="info" size={18} color="#40DBD5" />
          </View>

          <Text style={styles.infoText}>
            A equipe responsável poderá analisar as informações enviadas e tomar
            as medidas necessárias.
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.88} onPress={handleVoltarInicio}>
          <LinearGradient
            colors={["#A8C0FF", "#4776FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Voltar para o início</Text>
            <Feather name="home" size={18} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020",
  },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 56,
    paddingBottom: 28,
  },

  successCard: {
    flex: 1,
    borderRadius: 32,
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderColor: "#26304A",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  checkCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 1,
    borderColor: "#40DBD5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },

  title: {
    color: "#EAF0FF",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.8,
  },

  highlight: {
    color: "#40DBD5",
  },

  subtitle: {
    color: "#AAB4C8",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 14,
    marginBottom: 26,
  },

  protocolCard: {
    width: "100%",
    borderRadius: 22,
    backgroundColor: "#0F1728",
    borderWidth: 1,
    borderColor: "#26304A",
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
  },

  protocolLabel: {
    color: "#8EA0C7",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
  },

  protocolValue: {
    color: "#40DBD5",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1,
  },

  infoCard: {
    borderRadius: 22,
    backgroundColor: "#101827",
    borderWidth: 1,
    borderColor: "#26304A",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
    marginBottom: 20,
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#122A39",
    alignItems: "center",
    justifyContent: "center",
  },

  infoText: {
    flex: 1,
    color: "#AAB4C8",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  button: {
    height: 60,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
});