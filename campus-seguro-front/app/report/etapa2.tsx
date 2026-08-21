import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Etapa2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const relato =
    typeof params.relato === "string" ? params.relato : "";

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace({
        pathname: "/report/etapa3",
        params: {
          relato,
          categoria: "Assédio",
          gravidade: "Média",
          destino: "Segurança",
        },
      });
    }, 2600);

    return () => clearTimeout(timer);
  }, [relato, router]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <View style={styles.content}>
        <View style={styles.loadingCard}>
          <LinearGradient
            colors={["#152036", "#0E1628"]}
            style={styles.loadingCircle}
          >
            <ActivityIndicator size="large" color="#40DBD5" />
          </LinearGradient>

          <Text style={styles.title}>
            Analisando{"\n"}
            <Text style={styles.highlight}>seu relato...</Text>
          </Text>

          <Text style={styles.subtitle}>
            Estamos interpretando sua descrição para sugerir categoria,
            gravidade e encaminhamento.
          </Text>
        </View>

        <View style={styles.statusList}>
          <View style={styles.statusItem}>
            <View style={styles.statusIcon}>
              <Feather name="check" size={16} color="#40DBD5" />
            </View>

            <View style={styles.statusTextArea}>
              <Text style={styles.statusTitle}>Relato recebido</Text>
              <Text style={styles.statusDescription}>
                Sua descrição foi registrada com segurança.
              </Text>
            </View>
          </View>

          <View style={styles.statusItem}>
            <View style={styles.statusIcon}>
              <ActivityIndicator size="small" color="#40DBD5" />
            </View>

            <View style={styles.statusTextArea}>
              <Text style={styles.statusTitle}>Analisando conteúdo</Text>
              <Text style={styles.statusDescription}>
                A IA está identificando os principais detalhes.
              </Text>
            </View>
          </View>

          <View style={styles.statusItemDisabled}>
            <View style={styles.statusIconDisabled}>
              <Feather name="file-text" size={16} color="#69748C" />
            </View>

            <View style={styles.statusTextArea}>
              <Text style={styles.statusTitleDisabled}>
                Preenchendo denúncia
              </Text>
              <Text style={styles.statusDescription}>
                A próxima tela será preparada automaticamente.
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
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
    paddingHorizontal: 30,
    paddingTop: 28,
    paddingBottom: 24,
  },

  loadingCard: {
    alignItems: "center",
    marginTop: 58,
    marginBottom: 44,
  },

  loadingCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#263C5C",
  },

  title: {
    color: "#EAF0FF",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    textAlign: "center",
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
    maxWidth: 320,
  },

  statusList: {
    gap: 14,
  },

  statusItem: {
    minHeight: 78,
    borderRadius: 22,
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderColor: "#26304A",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },

  statusItemDisabled: {
    minHeight: 78,
    borderRadius: 22,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1F2937",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
    opacity: 0.78,
  },

  statusIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#122A39",
    alignItems: "center",
    justifyContent: "center",
  },

  statusIconDisabled: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#20283A",
    alignItems: "center",
    justifyContent: "center",
  },

  statusTextArea: {
    flex: 1,
  },

  statusTitle: {
    color: "#EAF0FF",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },

  statusTitleDisabled: {
    color: "#AAB4C8",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },

  statusDescription: {
    color: "#7F8AA3",
    fontSize: 12,
    lineHeight: 17,
  },

  cancelButton: {
    marginTop: "auto",
    height: 50,
    borderRadius: 999,
    backgroundColor: "#171D2E",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: "#9FB0D8",
    fontSize: 14,
    fontWeight: "700",
  },
});