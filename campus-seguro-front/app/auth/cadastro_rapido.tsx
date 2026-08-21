import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CalendarIcon from "../../assets/icons/calendar.svg";
import Escudo2Icon from "../../assets/icons/escudo2.svg";
import InfoIcon from "../../assets/icons/info.svg";
import UserIcon from "../../assets/icons/user.svg";
import GradientButton from "../../components/ui/BotaoGradiente";
import { tokens } from "../../constants/theme";
import { formatDateBR } from "../../utils/mascaras";

export default function CadastroRapidoScreen() {
  
  const { colors } = useTheme();
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [dataNascimento, setDataNascimento] = useState("");
  
  function handleCadastroRapido() {
    if (!aceitouTermos) {
      Alert.alert(
        "Termos obrigatórios",
        "Você precisa concordar com os termos para continuar."
      );
      return;
    }

    Alert.alert("Cadastro completo", "Exemplo de cadastro completo realizado.");
    router.replace("../home/home_visitante");
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

    divider: {
      height: 1,
      width: 150,
      alignSelf: "center",
      backgroundColor: "#232A3D",
      marginBottom: 5,
    },
    divider2: {
      height: 1,
      width: 165,
      backgroundColor: "#232A3D",
    },
    card: {
      gap: 20,
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
      
    },
    title: {
      fontSize: 20,
      fontWeight: "800",
      color: "#B5C4FF",
      textAlign: "center",
      marginBottom: 5,
      marginTop: 32,
    },
    cardInfo: {
      backgroundColor: "#161B2B",
      borderWidth: 1,
      borderColor: "#232A3D",
      borderRadius: tokens.radius.md,
      padding: tokens.spacing.md,
      width: "100%",
      alignSelf: "center",
    },
    cardTitle: {
      color: "#40DBD5",
      fontWeight: "700",
      fontSize: 14,
      letterSpacing: 1,
      marginBottom: 8,
    },
    cardsubTitle: {
      color: "#8D90A1",
      fontSize: 12,
      width: "auto",
      lineHeight: 13,
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

    infoTextBlock: {
      flex: 1,
      marginLeft: 35,
      alignContent: "center",
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "center",
    },

    iconWrapper: {
      width: 28,
      marginTop: 2,
      alignItems: "flex-start",
      justifyContent: "flex-start",
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

    linkButton: {
      alignItems: "center",
      marginTop: 4,
    },
    linkText: {
      color: "#93c5fd",
      fontSize: 14,
      fontWeight: "600",
    },

    termsWrapper: {
      marginTop: -18,
      marginBottom: -14,
    },

    checkboxRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      marginLeft: 4,
      marginTop: 16,
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
    backText: {
      textAlign: "center",
      color: "#94a3b8",
      fontSize: 14,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
        <View>
          <Text style={styles.title}>Cadastro Rápido</Text>
          <View style={styles.divider} />
        </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
          <View style={styles.cardInfo}>
            <View style={styles.infoItem}>
              <View style={styles.iconWrapper}>
                <InfoIcon width={48} height={48} />
              </View>
              <View style={styles.infoTextBlock}>
                <Text style={styles.cardTitle}>ACESSO LIMITADO</Text>
                <Text style={styles.cardsubTitle}>
                  Perfil otimizado para cionamento de emergência.
                  Você poderá completar seus dados depois.
                </Text>
              </View>
            </View>
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

          <View style={styles.cardInfo}>
            <View style={styles.infoItem}>
              <View style={styles.iconWrapper}>
                <Escudo2Icon width={48} height={48} />
              </View>
              <View style={styles.infoTextBlock}>
                <Text style={styles.cardTitle}>Ambiente Criptografado e Seguro</Text>
                <Text style={styles.cardsubTitle}>
                  Seus dados são protegidos por criptografia de
                  ponta a ponta seguindo a LGPD.
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
                <Text style={styles.checkboxLink}>Política de Privacidade</Text>.
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 16 }}>
            <GradientButton
              title="Cadastrar"
              onPress={handleCadastroRapido}/>
          </View>
          
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push("/auth/login")}>
              <Text style={styles.linkText}>Já tenho conta</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

          </View>
        </ScrollView>
    </SafeAreaView>
  );
}
