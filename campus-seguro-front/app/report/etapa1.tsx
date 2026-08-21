import { Feather } from "@expo/vector-icons";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Etapa1Screen() {
  const router = useRouter();

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 250);

  const [relato, setRelato] = useState("");
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [temPermissaoMicrofone, setTemPermissaoMicrofone] = useState(false);
  const [carregandoAudio, setCarregandoAudio] = useState(false);

  const relatoPreenchido = relato.trim().length > 0;
  const audioGravado = Boolean(audioUri);
  const gravando = recorderState.isRecording;

  const duracaoGravacao = useMemo(() => {
    return formatarDuracao(recorderState.durationMillis ?? 0);
  }, [recorderState.durationMillis]);

  const podeAnalisarRelato =
    (relatoPreenchido || audioGravado) && !gravando && !carregandoAudio;

  useEffect(() => {
    configurarAudio();
  }, []);

  async function configurarAudio() {
    try {
      const permissao = await AudioModule.requestRecordingPermissionsAsync();

      setTemPermissaoMicrofone(permissao.granted);

      if (!permissao.granted) {
        Alert.alert(
          "Permissão necessária",
          "Para gravar um relato por áudio, permita o acesso ao microfone."
        );

        return;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    } catch (error) {
      console.log("Erro ao configurar áudio:", error);

      Alert.alert(
        "Erro no áudio",
        "Não foi possível preparar o microfone para gravação."
      );
    }
  }

  async function solicitarPermissaoMicrofone() {
    try {
      const permissao = await AudioModule.requestRecordingPermissionsAsync();

      setTemPermissaoMicrofone(permissao.granted);

      if (!permissao.granted) {
        Alert.alert(
          "Microfone bloqueado",
          "Você precisa permitir o uso do microfone para gravar áudio."
        );

        return false;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      return true;
    } catch (error) {
      console.log("Erro ao solicitar permissão:", error);

      Alert.alert(
        "Erro no microfone",
        "Não foi possível solicitar permissão para usar o microfone."
      );

      return false;
    }
  }

  async function iniciarGravacao() {
    try {
      if (gravando || carregandoAudio) return;

      let podeUsarMicrofone = temPermissaoMicrofone;

      if (!podeUsarMicrofone) {
        podeUsarMicrofone = await solicitarPermissaoMicrofone();
      }

      if (!podeUsarMicrofone) return;

      setCarregandoAudio(true);
      setAudioUri(null);

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      console.log("Erro ao iniciar gravação:", error);

      Alert.alert(
        "Erro ao gravar",
        "Não foi possível iniciar a gravação do áudio."
      );
    } finally {
      setCarregandoAudio(false);
    }
  }

  async function pararGravacao() {
    try {
      if (!gravando || carregandoAudio) return;

      setCarregandoAudio(true);

      await audioRecorder.stop();

      const uri = audioRecorder.uri;

      if (!uri) {
        Alert.alert(
          "Áudio não encontrado",
          "A gravação foi encerrada, mas o arquivo de áudio não foi localizado."
        );

        return;
      }

      setAudioUri(uri);
    } catch (error) {
      console.log("Erro ao parar gravação:", error);

      Alert.alert(
        "Erro ao salvar áudio",
        "Não foi possível finalizar a gravação do áudio."
      );
    } finally {
      setCarregandoAudio(false);
    }
  }

  async function handleGravarAudio() {
    if (gravando) {
      await pararGravacao();
      return;
    }

    await iniciarGravacao();
  }

  function handleRemoverAudio() {
    if (gravando) return;

    setAudioUri(null);
  }

  function handleAnalisarRelato() {
    if (!podeAnalisarRelato) return;

    router.push({
      pathname: "/report/etapa2",
      params: {
        relato,
        audioUri: audioUri ?? "",
        tipoRelato: audioUri ? "audio" : "texto",
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

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.stepText}>PASSO 1 DE 4</Text>

                <Text style={styles.title}>
                  O que{"\n"}aconteceu?
                </Text>
              </View>

              <View style={styles.progressWrapper}>
                <View style={[styles.progressBar, styles.progressBarActive]} />
                <View style={styles.progressBar} />
                <View style={styles.progressBar} />
                <View style={styles.progressBar} />
              </View>
            </View>

            <Text style={styles.subtitle}>
              Descreva o que aconteceu ou grave um áudio com seu relato.
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>SEU RELATO</Text>

            <View
              style={[
                styles.textAreaWrapper,
                gravando && styles.textAreaWrapperRecording,
              ]}
            >
              <TextInput
                value={relato}
                onChangeText={setRelato}
                placeholder="Descreva o que rolou..."
                placeholderTextColor="#69748C"
                multiline
                textAlignVertical="top"
                style={styles.textArea}
              />

              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.micButton,
                  gravando && styles.micButtonRecording,
                  audioGravado && !gravando && styles.micButtonSaved,
                ]}
                onPress={handleGravarAudio}
                disabled={carregandoAudio}
              >
                {carregandoAudio ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Feather
                    name={gravando ? "square" : audioGravado ? "check" : "mic"}
                    size={22}
                    color={gravando || audioGravado ? "#FFFFFF" : "#40DBD5"}
                  />
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.helperText}>
              Você também pode usar o microfone para registrar o relato por voz.
            </Text>

            {(gravando || audioGravado) && (
              <View
                style={[
                  styles.audioCard,
                  gravando && styles.audioCardRecording,
                  audioGravado && !gravando && styles.audioCardSaved,
                ]}
              >
                <View style={styles.audioInfo}>
                  <View
                    style={[
                      styles.audioIcon,
                      gravando && styles.audioIconRecording,
                      audioGravado && !gravando && styles.audioIconSaved,
                    ]}
                  >
                    <Feather
                      name={gravando ? "mic" : "check-circle"}
                      size={18}
                      color="#FFFFFF"
                    />
                  </View>

                  <View style={styles.audioTextArea}>
                    <Text style={styles.audioTitle}>
                      {gravando ? "Gravando áudio..." : "Áudio gravado"}
                    </Text>

                    <Text style={styles.audioSubtitle}>
                      {gravando
                        ? `Duração: ${duracaoGravacao}`
                        : "O áudio será enviado junto com o relato."}
                    </Text>
                  </View>
                </View>

                {gravando ? (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.stopButton}
                    onPress={pararGravacao}
                    disabled={carregandoAudio}
                  >
                    <Feather name="square" size={15} color="#FFFFFF" />
                    <Text style={styles.stopButtonText}>Parar</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.removeAudioButton}
                    onPress={handleRemoverAudio}
                  >
                    <Feather name="trash-2" size={15} color="#FF6B6B" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleAnalisarRelato}
            disabled={!podeAnalisarRelato}
            style={[
              styles.analyzeButtonWrapper,
              !podeAnalisarRelato && styles.analyzeButtonDisabled,
            ]}
          >
            <LinearGradient
              colors={
                podeAnalisarRelato
                  ? ["#A8C0FF", "#4776FF"]
                  : ["#2A344D", "#2A344D"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.analyzeButton}
            >
              <Text
                style={[
                  styles.analyzeButtonText,
                  !podeAnalisarRelato && styles.analyzeButtonTextDisabled,
                ]}
              >
                Analisar relato
              </Text>

              <Feather
                name="arrow-right"
                size={18}
                color={podeAnalisarRelato ? "#FFFFFF" : "#7B8498"}
              />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancelar Relato</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            SUA LOCALIZAÇÃO SERÁ COMPARTILHADA EM TEMPO REAL
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function formatarDuracao(durationMillis: number) {
  const totalSegundos = Math.floor(durationMillis / 1000);
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;

  return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(
    2,
    "0"
  )}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020",
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 18,
    paddingBottom: 24,
  },

  header: {
    marginBottom: 34,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 14,
  },

  stepText: {
    color: "#40DBD5",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 6,
  },

  title: {
    color: "#EAF0FF",
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: -0.8,
  },

  subtitle: {
    color: "#C4CAD8",
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 320,
  },

  progressWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },

  progressBar: {
    width: 17,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#353B4F",
  },

  progressBarActive: {
    width: 34,
    backgroundColor: "#40DBD5",
  },

  inputSection: {
    marginBottom: 28,
  },

  inputLabel: {
    color: "#8EA0C7",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 10,
  },

  textAreaWrapper: {
    minHeight: 260,
    borderRadius: 28,
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderColor: "#26304A",
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  textAreaWrapperRecording: {
    borderColor: "#FF6B6B",
  },

  textArea: {
    flex: 1,
    minHeight: 210,
    color: "#EAF0FF",
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "600",
    paddingRight: 48,
  },

  micButton: {
    position: "absolute",
    right: 18,
    bottom: 18,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#101A30",
    borderWidth: 1,
    borderColor: "#263C5C",
    alignItems: "center",
    justifyContent: "center",
  },

  micButtonRecording: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },

  micButtonSaved: {
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
  },

  helperText: {
    color: "#747F96",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },

  audioCard: {
    marginTop: 14,
    borderRadius: 20,
    padding: 14,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#26304A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  audioCardRecording: {
    borderColor: "#EF4444",
    backgroundColor: "#1B1520",
  },

  audioCardSaved: {
    borderColor: "#1E7A4B",
    backgroundColor: "#102019",
  },

  audioInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  audioIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },

  audioIconRecording: {
    backgroundColor: "#EF4444",
  },

  audioIconSaved: {
    backgroundColor: "#22C55E",
  },

  audioTextArea: {
    flex: 1,
  },

  audioTitle: {
    color: "#EAF0FF",
    fontSize: 14,
    fontWeight: "800",
  },

  audioSubtitle: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },

  stopButton: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  stopButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  removeAudioButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "rgba(239,68,68,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  analyzeButtonWrapper: {
    borderRadius: 999,
    shadowColor: "#4B7DFF",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  analyzeButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },

  analyzeButton: {
    height: 58,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },

  analyzeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  analyzeButtonTextDisabled: {
    color: "#7B8498",
  },

  cancelButton: {
    height: 46,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    marginBottom: 18,
  },

  cancelButtonText: {
    color: "#8EA0C7",
    fontSize: 13,
    fontWeight: "700",
  },

  footerText: {
    color: "#747B8F",
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    marginTop: "auto",
  },
});