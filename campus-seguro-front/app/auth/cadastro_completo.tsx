import { Feather } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { useState } from "react";
import { tokens } from "../../constants/theme";

import {
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
import CalendarIcon from "../../assets/icons/calendar.svg";
import CpfIcon from "../../assets/icons/cpf.svg";
import EmailIcon from "../../assets/icons/email.svg";
import Escudo2Icon from "../../assets/icons/escudo2.svg";
import LockIcon from "../../assets/icons/lock.svg";
import PeopleIcon from "../../assets/icons/people.svg";
import UserIcon from "../../assets/icons/user.svg";
import GradientButton from "../../components/ui/BotaoGradiente";
import {
  formatCpf,
  formatDateBR,
  sanitizeEmail,
  sanitizeFullName,
} from "../../utils/mascaras";

export default function CadastroCompletoScreen() {
  const { colors } = useTheme();

  const [sexo, setSexo] = useState("");
  const [sexoDropdownOpen, setSexoDropdownOpen] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const opcoesSexo = [
    { label: "Masculino", value: "masculino" },
    { label: "Feminino", value: "feminino" },
    { label: "Transgênero", value: "transgenero" },
    { label: "Cisgênero", value: "cisgenero" },
    { label: "Não-binário", value: "nao_binario" },
    { label: "Outro", value: "outro" },
  ];

  const sexoSelecionadoLabel =
    opcoesSexo.find((item) => item.value === sexo)?.label ??
    "Selecione seu gênero/sexo";

  function handleCadastroCompleto() {
    if (!aceitouTermos) {
      Alert.alert(
        "Termos obrigatórios",
        "Você precisa concordar com os termos para continuar."
      );
      return;
    }

    Alert.alert("Cadastro completo", "Exemplo de cadastro completo realizado.");
    router.replace("../home/home");
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingVertical: 20,
      paddingBottom: 20,
      gap: 24,
      flexGrow: 1,
    },
    keyboardContainer: {
      flex: 1,
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
      marginBottom: 5,
      backgroundColor: "#232A3D",
    },
    divider2: {
      height: 1,
      width: 165,
      backgroundColor: "#232A3D",
    },
    title2: {
      fontSize: 28,
      fontWeight: "800",
      color: "#f8fafc",
      width: 260,
    },
    title3: {
      fontSize: 28,
      fontWeight: "800",
      color: "#40DBD5",
      marginBottom: 10,
      width: 260,
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 24,
      color: "#cbd5e1",
    },
    card: {
      gap: 16,
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
    input: {
      flex: 1,
      marginLeft: 4,
      color: "#f8fafc",
      fontSize: 16,
      paddingVertical: 0,
    },
    inputGroup: {
      gap: 8,
    },
    label: {
      color: "#8D90A1",
      fontSize: 12,
      fontWeight: "700",
      paddingLeft: 4,
    },
    dropdownGroup: {
      gap: 8,
    },
    inputWrapperActive: {
      borderColor: "#40DBD5",
    },
    dropdownText: {
      flex: 1,
      marginLeft: 4,
      color: "#f8fafc",
      fontSize: 16,
    },
    dropdownPlaceholder: {
      color: "#8d90a17c",
    },
    dropdownArrow: {
      color: "#94a3b8",
      fontSize: 16,
      marginLeft: 8,
    },
    dropdownMenu: {
      backgroundColor: "#0D1326",
      borderWidth: 1,
      borderColor: "#334155",
      borderRadius: 16,
      paddingVertical: 8,
      overflow: "hidden",
    },
    dropdownItem: {
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    dropdownItemActive: {
      backgroundColor: "#111A33",
    },
    dropdownItemText: {
      color: "#cbd5e1",
      fontSize: 15,
    },
    dropdownItemTextActive: {
      color: "#40DBD5",
      fontWeight: "700",
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
    cardInfo: {
      backgroundColor: "#161B2B",
      borderWidth: 1,
      borderColor: "#232A3D",
      borderRadius: tokens.radius.md,
      padding: tokens.spacing.md,
      gap: 18,
      width: "100%",
      alignSelf: "center",
      marginTop: 16,
    },
    cardTitle: {
      color: "#DEE1F9",
      fontWeight: "700",
      fontSize: 14,
      letterSpacing: 1,
      marginBottom: 5,
    },
    cardsubTitle: {
      color: "#8D90A1",
      textAlign: "left",
      fontSize: 10,
      width: 220,
      lineHeight: 12,
    },
    iconWrapper: {
      width: 28,
      marginTop: 2,
      alignItems: "flex-start",
      justifyContent: "flex-start",
    },
    infoTextBlock: {
      flex: 1,
      marginLeft: 35,
      alignContent: "center",
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    termsWrapper: {
      marginTop: -4,
    },
    checkboxRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      marginLeft: 4,
      marginTop: 8,
    },
    checkboxBox: {
      width: 22,
      height: 22,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: "#334155",
      backgroundColor: "#080D1D",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },
    checkboxBoxChecked: {
      backgroundColor: "#40DBD5",
      borderColor: "#40DBD5",
    },
    checkboxCheck: {
      color: "#ffffff",
      fontSize: 14,
      fontWeight: "800",
    },
    checkboxText: {
      flex: 1,
      color: "#8D90A1",
      fontSize: 13,
      lineHeight: 20,
    },
    checkboxLink: {
      color: "#40DBD5",
      fontWeight: "700",
    },
    linkButton: {
      alignItems: "center",
      marginTop: 4,
    },
    eyeButton: {
      paddingLeft: 8,
      paddingVertical: 4,
      alignItems: "center",
      justifyContent: "center",
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
      marginBottom: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View>
          <Text style={styles.title}>Crie sua conta</Text>
          <View style={styles.divider} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text style={styles.title2}>Proteja sua</Text>
            <Text style={styles.title3}>jornada acadêmica</Text>

            <Text style={styles.subtitle}>
              Complete seu perfil para acessar todos os recursos de
              monitoramento e resposta rápida do campus.
            </Text>
          </View>

          <View style={styles.divider2} />

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome completo</Text>
              <View style={styles.inputWrapper}>
                <UserIcon width={16} height={16} fill="#94a3b8" />
                <TextInput
                  placeholder="Nome completo sem abreviações"
                  placeholderTextColor="#8d90a17c"
                  value={nomeCompleto}
                  onChangeText={(text) => setNomeCompleto(sanitizeFullName(text))}
                  maxLength={80}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <View style={styles.inputWrapper}>
                <EmailIcon width={16} height={16} fill="#94a3b8" />
                <TextInput
                  placeholder="Digite seu e-mail"
                  placeholderTextColor="#8d90a17c"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(text) => setEmail(sanitizeEmail(text))}
                  maxLength={50}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data de Nascimento</Text>
              <View style={styles.inputWrapper}>
                <CalendarIcon width={16} height={16} fill="#94a3b8" />
                <TextInput
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#8d90a17c"
                  keyboardType="number-pad"
                  value={dataNascimento}
                  onChangeText={(text) => setDataNascimento(formatDateBR(text))}
                  maxLength={10}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CPF</Text>
              <View style={styles.inputWrapper}>
                <CpfIcon width={16} height={16} fill="#94a3b8" />
                <TextInput
                  placeholder="000.000.000-00"
                  placeholderTextColor="#8d90a17c"
                  keyboardType="number-pad"
                  value={cpf}
                  onChangeText={(text) => setCpf(formatCpf(text))}
                  maxLength={14}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sexo / Gênero</Text>

              <View style={styles.dropdownGroup}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.inputWrapper,
                    sexoDropdownOpen && styles.inputWrapperActive,
                  ]}
                  onPress={() => setSexoDropdownOpen((prev) => !prev)}
                >
                  <PeopleIcon width={16} height={16} fill="#94a3b8" />

                  <Text
                    style={[
                      styles.dropdownText,
                      !sexo && styles.dropdownPlaceholder,
                    ]}
                  >
                    {sexoSelecionadoLabel}
                  </Text>

                  <Text style={styles.dropdownArrow}>
                    {sexoDropdownOpen ? "▴" : "▾"}
                  </Text>
                </TouchableOpacity>

                {sexoDropdownOpen && (
                  <View style={styles.dropdownMenu}>
                    {opcoesSexo.map((item) => (
                      <TouchableOpacity
                        key={item.value}
                        activeOpacity={0.85}
                        style={[
                          styles.dropdownItem,
                          sexo === item.value && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setSexo(item.value);
                          setSexoDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            sexo === item.value && styles.dropdownItemTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputWrapper}>
                <LockIcon width={16} height={16} fill="#94a3b8" />

                <TextInput
                  placeholder="Crie uma senha"
                  placeholderTextColor="#8d90a17c"
                  secureTextEntry={!mostrarSenha}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={senha}
                  onChangeText={setSenha}
                  maxLength={50}
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
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar senha</Text>
              <View style={styles.inputWrapper}>
                <LockIcon width={16} height={16} fill="#94a3b8" />

                <TextInput
                  placeholder="Confirme sua senha"
                  placeholderTextColor="#8d90a17c"
                  secureTextEntry={!mostrarConfirmarSenha}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  maxLength={50}
                  style={styles.input}
                />

                <TouchableOpacity
                  onPress={() => setMostrarConfirmarSenha((prev) => !prev)}
                  activeOpacity={0.7}
                  style={styles.eyeButton}
                >
                  <Feather
                    name={mostrarConfirmarSenha ? "eye-off" : "eye"}
                    size={20}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.cardInfo}>
              <View style={styles.infoItem}>
                <View style={styles.iconWrapper}>
                  <Escudo2Icon width={48} height={48} />
                </View>

                <View style={styles.infoTextBlock}>
                  <Text style={styles.cardTitle}>
                    Ambiente Criptografado e Seguro
                  </Text>
                  <Text style={styles.cardsubTitle}>
                    Seus dados são protegidos por criptografia de ponta a ponta
                    seguindo a LGPD.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.termsWrapper}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.checkboxRow}
                onPress={() => setAceitouTermos((prev) => !prev)}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    aceitouTermos && styles.checkboxBoxChecked,
                  ]}
                >
                  {aceitouTermos && <Text style={styles.checkboxCheck}>✓</Text>}
                </View>

                <Text style={styles.checkboxText}>
                  Li e aceito os{" "}
                  <Text style={styles.checkboxLink}>Termos de Uso</Text> e a{" "}
                  <Text style={styles.checkboxLink}>
                    Política de Privacidade
                  </Text>
                  .
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 8 }}>
              <GradientButton
                title="Cadastrar"
                onPress={handleCadastroCompleto}
              />
            </View>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push("/auth/login")}
            >
              <Text style={styles.linkText}>Já tenho conta</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}