import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Etapa3Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const relatoOriginal =
    typeof params.relato === "string" ? params.relato : "";

  const audioUri =
    typeof params.audioUri === "string" ? params.audioUri : "";

  const tipoRelato =
    typeof params.tipoRelato === "string" ? params.tipoRelato : "texto";

  const [tipoAgressao, setTipoAgressao] = useState(
    typeof params.tipoAgressao === "string"
      ? params.tipoAgressao
      : "Injúria Racial"
  );

  const [local, setLocal] = useState(
    typeof params.local === "string" ? params.local : "Sala de aula"
  );

  const [horario, setHorario] = useState(
    typeof params.horario === "string" ? params.horario : "09:00"
  );

  const [agressor, setAgressor] = useState(
    typeof params.agressor === "string"
      ? params.agressor
      : "Pessoa extremamente conservadora"
  );

  const [categoria, setCategoria] = useState(
    typeof params.categoria === "string" ? params.categoria : "Assédio"
  );

  const [gravidade, setGravidade] = useState(
    typeof params.gravidade === "string" ? params.gravidade : "Média"
  );

  const [destino, setDestino] = useState(
    typeof params.destino === "string" ? params.destino : "Segurança"
  );

  const [resumo, setResumo] = useState(
    typeof params.resumo === "string"
      ? params.resumo
      : relatoOriginal ||
          "Fala infeliz e discriminatória com base na raça."
  );

  const [anonimo, setAnonimo] = useState(
    typeof params.anonimo === "string" ? params.anonimo === "true" : true
  );

  function handleAvancar() {
    router.push({
      pathname: "/report/etapa4",
      params: {
        relato: relatoOriginal,
        audioUri,
        tipoRelato,
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
        keyboardShouldPersistTaps="handled"
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
            <Text style={styles.stepText}>PASSO 2 DE 4</Text>
          </View>
        </View>

        <View style={styles.progressWrapper}>
          <View style={[styles.progressBar, styles.progressBarActive]} />
          <View style={[styles.progressBar, styles.progressBarActive]} />
          <View style={styles.progressBar} />
          <View style={styles.progressBar} />
        </View>

        <View style={styles.mainTitleArea}>
          <Text style={styles.title}>
            Confirmação da{"\n"}
            <Text style={styles.highlight}>denúncia</Text>
          </Text>

          <Text style={styles.subtitle}>
            Confira os dados preenchidos automaticamente. Você pode editar
            qualquer informação antes de continuar.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapper}>
              <Feather name="zap" size={20} color="#40DBD5" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Dados da denúncia</Text>
              <Text style={styles.cardSubtitle}>
                Campos preenchidos automaticamente
              </Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Tipo de agressão <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              value={tipoAgressao}
              onChangeText={setTipoAgressao}
              placeholder="Ex: Injúria Racial"
              placeholderTextColor="#69748C"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Local <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              value={local}
              onChangeText={setLocal}
              placeholder="Ex: Sala de aula"
              placeholderTextColor="#69748C"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Horário opcional</Text>

            <TextInput
              value={horario}
              onChangeText={setHorario}
              placeholder="Ex: 09:00"
              placeholderTextColor="#69748C"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Agressor opcional</Text>

            <TextInput
              value={agressor}
              onChangeText={setAgressor}
              placeholder="Ex: Pessoa envolvida"
              placeholderTextColor="#69748C"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Categoria sugerida</Text>

            <TextInput
              value={categoria}
              onChangeText={setCategoria}
              placeholder="Ex: Assédio"
              placeholderTextColor="#69748C"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Resumo <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              value={resumo}
              onChangeText={setResumo}
              placeholder="Resumo analisado"
              placeholderTextColor="#69748C"
              multiline
              textAlignVertical="top"
              style={[styles.input, styles.textArea]}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Encaminhar para</Text>

            <View style={styles.optionsRow}>
              {["Segurança", "Coordenação", "Administração"].map((item) => (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.85}
                  onPress={() => setDestino(item)}
                  style={[
                    styles.optionPill,
                    destino === item && styles.optionPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      destino === item && styles.optionTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Gravidade estimada</Text>

            <View style={styles.optionsRow}>
              {["Baixa", "Média", "Alta"].map((item) => (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.85}
                  onPress={() => setGravidade(item)}
                  style={[
                    styles.optionPill,
                    gravidade === item && styles.optionPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      gravidade === item && styles.optionTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.anonymousCard}>
          <View style={styles.anonymousTextArea}>
            <Text style={styles.anonymousTitle}>Enviar de forma anônima</Text>
            <Text style={styles.anonymousSubtitle}>
              Seu nome não será vinculado à denúncia
            </Text>
          </View>

          <Switch
            value={anonimo}
            onValueChange={setAnonimo}
            trackColor={{
              false: "#374151",
              true: "#22C55E",
            }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#374151"
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={styles.editButton}
        >
          <Text style={styles.editButtonText}>Voltar e editar</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.88} onPress={handleAvancar}>
          <LinearGradient
            colors={["#A8C0FF", "#4776FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>Confirmar e enviar</Text>
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
    color: "#40DBD5",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  progressWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 18,
    marginBottom: 28,
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
    letterSpacing: -0.6,
  },

  highlight: {
    color: "#40DBD5",
  },

  subtitle: {
    color: "#C4CAD8",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },

  card: {
    borderRadius: 26,
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderColor: "#26304A",
    padding: 18,
    marginBottom: 14,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },

  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "#122A39",
    alignItems: "center",
    justifyContent: "center",
  },

  cardTitle: {
    color: "#EAF0FF",
    fontSize: 16,
    fontWeight: "900",
  },

  cardSubtitle: {
    color: "#7F8AA3",
    fontSize: 12,
    marginTop: 3,
  },

  fieldGroup: {
    marginBottom: 16,
  },

  label: {
    color: "#C4CAD8",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },

  required: {
    color: "#EF4444",
  },

  input: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#0F1628",
    borderWidth: 1,
    borderColor: "#26304A",
    color: "#EAF0FF",
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  textArea: {
    minHeight: 96,
    lineHeight: 20,
  },

  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  optionPill: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#0F1628",
    borderWidth: 1,
    borderColor: "#26304A",
    alignItems: "center",
    justifyContent: "center",
  },

  optionPillActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  optionText: {
    color: "#8EA0C7",
    fontSize: 12,
    fontWeight: "800",
  },

  optionTextActive: {
    color: "#FFFFFF",
  },

  anonymousCard: {
    borderRadius: 22,
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderColor: "#26304A",
    padding: 16,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },

  anonymousTextArea: {
    flex: 1,
  },

  anonymousTitle: {
    color: "#EAF0FF",
    fontSize: 15,
    fontWeight: "900",
  },

  anonymousSubtitle: {
    color: "#9CA3AF",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },

  editButton: {
    height: 46,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  editButtonText: {
    color: "#8EA0C7",
    fontSize: 14,
    fontWeight: "800",
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
    fontWeight: "900",
  },
});