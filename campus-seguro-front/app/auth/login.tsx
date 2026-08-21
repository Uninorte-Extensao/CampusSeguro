import { tokens } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ArrowIcon from "../../assets/icons/arrow.svg";
import DocumentoIcon from "../../assets/icons/documento2.svg";
import EmailIcon from "../../assets/icons/email.svg";
import LockIcon from "../../assets/icons/lock.svg";
import RaioIcon from "../../assets/icons/raio2.svg";
import GradientButton from "../../components/ui/BotaoGradiente";
import { formatEmailOrCpf, isCpfLike } from "../../utils/mascaras";

export default function LoginScreen() {
  const [emailOrCpf, setEmailOrCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [modalEsqueceuSenha, setModalEsqueceuSenha] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState("");
  const [linkEnviado, setLinkEnviado] = useState(false);

  const inputMaxLength = isCpfLike(emailOrCpf) ? 14 : 50;

  function handleLogin() {
    Alert.alert("Login", "Exemplo de login realizado com sucesso.");
    router.replace("../home/home");
  }

  function handleAbrirModalSenha() {
    setEmailRecuperacao("");
    setLinkEnviado(false);
    setModalEsqueceuSenha(true);
  }

  function handleFecharModalSenha() {
    setModalEsqueceuSenha(false);
    setEmailRecuperacao("");
    setLinkEnviado(false);
  }

  function handleEnviarLinkRecuperacao() {
    if (!emailRecuperacao.trim() || !emailRecuperacao.includes("@")) {
      Alert.alert("E-mail inválido", "Por favor, insira um e-mail válido.");
      return;
    }
    setLinkEnviado(true);
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <View>
        <Text style={styles.title}>Acessar conta</Text>
        <View style={styles.divider} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.title2}>Continue protegendo sua</Text>
          <Text style={styles.title3}>jornada acadêmica</Text>
        </View>

        <View style={styles.divider2} />

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail ou CPF</Text>
            <View style={styles.inputWrapper}>
              <EmailIcon width={16} height={16} fill="#94a3b8" />
              <TextInput
                placeholder="Insira seus dados"
                placeholderTextColor="#8d90a17c"
                keyboardType="default"
                autoCapitalize="none"
                autoCorrect={false}
                value={emailOrCpf}
                onChangeText={(text) => setEmailOrCpf(formatEmailOrCpf(text))}
                maxLength={inputMaxLength}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>

            <View style={styles.inputWrapper}>
              <LockIcon width={16} height={16} fill="#94a3b8" />

              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#8d90a17c"
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
                autoCorrect={false}
                value={senha}
                onChangeText={setSenha}
                style={styles.input}
              />

              <TouchableOpacity
                onPress={() => setMostrarSenha((prev) => !prev)}
                activeOpacity={0.7}
                style={styles.eyeButton}
              >
                <Feather
                  name={mostrarSenha ? "eye-off" : "eye"}
                  size={20}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleAbrirModalSenha}>
              <Text style={styles.esqueceuSenha}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>
        </View>

        <GradientButton title="Entrar" onPress={handleLogin} />

        <View style={styles.dividerTextWrapper}>
          <View style={styles.divider3} />

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push("/auth/cadastro_completo")}
          >
            <Text style={styles.title4}>AINDA NÃO TEM CADASTRO?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.cardCadastro}
          onPress={() => router.push("/auth/cadastro_rapido")}
        >
          <View style={styles.cardItem}>
            <View style={styles.iconWrapper}>
              <RaioIcon width={48} height={48} />
            </View>

            <View style={styles.cardTextBlock}>
              <Text style={styles.cardTitle}>Cadastro Rápido</Text>
              <Text style={styles.cardsubTitle}>
                Acesso imediato para emergências
              </Text>
            </View>

            <ArrowIcon width={16} height={16} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.cardCadastro}
          onPress={() => router.push("/auth/cadastro_completo")}
        >
          <View style={styles.cardItem}>
            <View style={styles.iconWrapper}>
              <DocumentoIcon width={48} height={48} />
            </View>

            <View style={styles.cardTextBlock}>
              <Text style={styles.cardTitle}>Cadastro Completo</Text>
              <Text style={styles.cardsubTitle}>
                Cadastro institucional verificado
              </Text>
            </View>

            <ArrowIcon width={16} height={16} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={modalEsqueceuSenha}
        transparent
        animationType="fade"
        onRequestClose={handleFecharModalSenha}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={handleFecharModalSenha}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <Pressable style={styles.modalCard} onPress={() => {}}>
              {linkEnviado ? (
                <View style={styles.modalSuccessContainer}>
                  <View style={styles.modalSuccessIcon}>
                    <Feather name="check-circle" size={40} color="#40DBD5" />
                  </View>
                  <Text style={styles.modalTitle}>Link enviado!</Text>
                  <Text style={styles.modalSubtitle}>
                    Verifique sua caixa de entrada em{"\n"}
                    <Text style={styles.modalEmailDestaque}>
                      {emailRecuperacao}
                    </Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.modalBotaoFechar}
                    onPress={handleFecharModalSenha}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalBotaoFecharTexto}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Esqueceu a senha?</Text>
                    <TouchableOpacity
                      onPress={handleFecharModalSenha}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Feather name="x" size={20} color="#8D90A1" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.modalSubtitle}>
                    Digite seu e-mail e enviaremos um link para redefinir sua
                    senha.
                  </Text>

                  <View style={styles.modalInputGroup}>
                    <Text style={styles.label}>E-mail</Text>
                    <View style={styles.inputWrapper}>
                      <EmailIcon width={16} height={16} fill="#94a3b8" />
                      <TextInput
                        placeholder="seu@email.com"
                        placeholderTextColor="#8d90a17c"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={emailRecuperacao}
                        onChangeText={setEmailRecuperacao}
                        style={styles.input}
                        autoFocus
                      />
                    </View>
                  </View>

                  <View style={styles.modalBotoes}>
                    <TouchableOpacity
                      style={styles.modalBotaoCancelar}
                      onPress={handleFecharModalSenha}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modalBotaoCancelarTexto}>
                        Cancelar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalBotaoEnviar}
                      onPress={handleEnviarLinkRecuperacao}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.modalBotaoEnviarTexto}>
                        Enviar link
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 20,
    gap: 24,
    flexGrow: 1,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#B5C4FF",
    textAlign: "center",
    marginBottom: 5,
    marginTop: 32,
  },

  divider: {
    height: 1,
    width: 150,
    alignSelf: "center",
    backgroundColor: "#232A3D",
  },

  divider2: {
    height: 1,
    width: 165,
    backgroundColor: "#232A3D",
  },

  dividerTextWrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
    minHeight: 24,
  },

  divider3: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#232A3D",
  },

  title2: {
    marginLeft: 4,
    fontSize: 28,
    fontWeight: "700",
    color: "#f8fafc",
    width: 360,
  },

  title3: {
    marginLeft: 4,
    fontSize: 28,
    fontWeight: "700",
    color: "#40DBD5",
    width: 360,
  },

  card: {
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  inputGroup: {
    gap: 12,
  },

  label: {
    color: "#8D90A1",
    fontSize: 12,
    fontWeight: "700",
    paddingLeft: 4,
  },

  input: {
    flex: 1,
    marginLeft: 4,
    color: "#f8fafc",
    fontSize: 16,
    paddingVertical: 0,
  },

  inputWrapper: {
    backgroundColor: "#080D1D",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 16,
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  esqueceuSenha: {
    color: "#B5C4FF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    marginLeft: 4,
    marginBottom: 8,
  },

  title4: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 5,
    color: "#8D90A1",
    textAlign: "center",
    backgroundColor: "#0f172a",
    zIndex: 1,
  },

  cardCadastro: {
    backgroundColor: "#161B2B",
    borderWidth: 1,
    borderColor: "#232A3D",
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    width: "100%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  cardItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconWrapper: {
    width: 28,
    marginTop: 2,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },

  cardTextBlock: {
    flex: 1,
    marginLeft: 35,
    justifyContent: "center",
  },

  cardTitle: {
    color: "#DEE1F9",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 8,
  },

  cardsubTitle: {
    color: "#8D90A1",
    textAlign: "left",
    fontSize: 12,
    width: 220,
    lineHeight: 13,
  },

  eyeButton: {
    paddingLeft: 8,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  linkButton: {
    alignItems: "center",
    marginTop: 4,
  },

  linkText: {
    color: "#93c5fd",
    fontSize: 14,
    fontWeight: "600",
  },

  backText: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  modalCard: {
    backgroundColor: "#161B2B",
    borderWidth: 1,
    borderColor: "#232A3D",
    borderRadius: tokens.radius.lg,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f8fafc",
  },

  modalSubtitle: {
    fontSize: 13,
    color: "#8D90A1",
    lineHeight: 20,
    marginBottom: 20,
  },

  modalEmailDestaque: {
    color: "#40DBD5",
    fontWeight: "600",
  },

  modalInputGroup: {
    gap: 10,
    marginBottom: 24,
  },

  modalBotoes: {
    flexDirection: "row",
    gap: 12,
  },

  modalBotaoCancelar: {
    flex: 1,
    height: 48,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBotaoCancelarTexto: {
    color: "#8D90A1",
    fontSize: 14,
    fontWeight: "600",
  },

  modalBotaoEnviar: {
    flex: 1,
    height: 48,
    borderRadius: tokens.radius.sm,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBotaoEnviarTexto: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  modalSuccessContainer: {
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },

  modalSuccessIcon: {
    marginBottom: 4,
  },

  modalBotaoFechar: {
    marginTop: 8,
    width: "100%",
    height: 48,
    borderRadius: tokens.radius.sm,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBotaoFecharTexto: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});