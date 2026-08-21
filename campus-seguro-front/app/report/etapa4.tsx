import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type EvidenceType = "foto" | "video" | "arquivo" | "audio";

const evidencias: {
  id: EvidenceType;
  titulo: string;
  icon: React.ComponentProps<typeof Feather>["name"];
}[] = [
  {
    id: "foto",
    titulo: "Foto",
    icon: "image",
  },
  {
    id: "video",
    titulo: "Vídeo",
    icon: "video",
  },
  {
    id: "arquivo",
    titulo: "Arquivo",
    icon: "file-text",
  },
  {
    id: "audio",
    titulo: "Áudio",
    icon: "mic",
  },
];

export default function Etapa4Screen() {
  const router = useRouter();
  const [selecionadas, setSelecionadas] = useState<EvidenceType[]>([]);

  function toggleEvidencia(tipo: EvidenceType) {
    setSelecionadas((atual) => {
      if (atual.includes(tipo)) {
        return atual.filter((item) => item !== tipo);
      }

      return [...atual, tipo];
    });
  }

    function handleAvancar() {
    router.push({
        pathname: "/report/etapa5",
        params: {
        evidencias: selecionadas.join(","),
        },
    });
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
            <Text style={styles.stepText}>PASSO 3 DE 4</Text>
          </View>
        </View>

        <View style={styles.progressWrapper}>
          <View style={[styles.progressBar, styles.progressBarActive]} />
          <View style={[styles.progressBar, styles.progressBarActive]} />
          <View style={[styles.progressBar, styles.progressBarActive]} />
          <View style={styles.progressBar} />
        </View>

        <View style={styles.mainTitleArea}>
          <Text style={styles.title}>
            Anexe{"\n"}
            <Text style={styles.highlight}>evidências</Text>
          </Text>

          <Text style={styles.subtitle}>
            Adicione fotos, vídeos, arquivos ou áudios que ajudem a comprovar
            ou explicar o ocorrido.
          </Text>
        </View>

        <View style={styles.grid}>
          {evidencias.map((item) => {
            const selected = selecionadas.includes(item.id);

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => toggleEvidencia(item.id)}
                style={[
                  styles.evidenceCard,
                  selected && styles.evidenceCardActive,
                ]}
              >
                <View
                  style={[
                    styles.evidenceIconWrapper,
                    selected && styles.evidenceIconWrapperActive,
                  ]}
                >
                  <Feather
                    name={item.icon}
                    size={26}
                    color={selected ? "#40DBD5" : "#C9D3FF"}
                  />
                </View>

                <Text style={styles.evidenceTitle}>{item.titulo}</Text>

                {selected && (
                  <View style={styles.checkBadge}>
                    <Feather name="check" size={13} color="#07101F" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Feather name="lock" size={18} color="#40DBD5" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Arquivos protegidos</Text>
            <Text style={styles.infoDescription}>
              Os anexos serão vinculados somente ao protocolo deste incidente.
              Você também pode avançar sem anexar nada.
            </Text>
          </View>
        </View>

        <View style={styles.counterCard}>
          <Text style={styles.counterLabel}>Evidências selecionadas</Text>
          <Text style={styles.counterValue}>{selecionadas.length}</Text>
        </View>

        <TouchableOpacity activeOpacity={0.88} onPress={handleAvancar}>
          <LinearGradient
            colors={["#A8C0FF", "#4776FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>Avançar</Text>
            <Feather name="arrow-right" size={18} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
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
    marginBottom: 26,
  },

  title: {
    color: "#EAF0FF",
    fontSize: 31,
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

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
    marginBottom: 20,
  },

  evidenceCard: {
    width: "48%",
    minHeight: 128,
    borderRadius: 26,
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderColor: "#26304A",
    padding: 16,
    justifyContent: "space-between",
    position: "relative",
  },

  evidenceCardActive: {
    backgroundColor: "#101F32",
    borderColor: "#40DBD5",
  },

  evidenceIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: "#30364B",
    alignItems: "center",
    justifyContent: "center",
  },

  evidenceIconWrapperActive: {
    backgroundColor: "#12323B",
  },

  evidenceTitle: {
    color: "#EAF0FF",
    fontSize: 15,
    fontWeight: "900",
  },

  checkBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#40DBD5",
    alignItems: "center",
    justifyContent: "center",
  },

  infoCard: {
    borderRadius: 22,
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderColor: "#26304A",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#122A39",
    alignItems: "center",
    justifyContent: "center",
  },

  infoTitle: {
    color: "#EAF0FF",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },

  infoDescription: {
    color: "#7F8AA3",
    fontSize: 12,
    lineHeight: 17,
  },

  counterCard: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "#0F1728",
    borderWidth: 1,
    borderColor: "#26304A",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  counterLabel: {
    color: "#8EA0C7",
    fontSize: 12,
    fontWeight: "800",
  },

  counterValue: {
    color: "#40DBD5",
    fontSize: 18,
    fontWeight: "900",
  },

  nextButton: {
    height: 58,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },

  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});