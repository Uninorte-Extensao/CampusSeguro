import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CampusSeguroLogo from "../../assets/icons/campus-seguro.svg";
import DocumentoIcon from "../../assets/icons/documento.svg";
import RaioIcon from "../../assets/icons/raio.svg";
import GradientButton from "../../components/ui/BotaoGradiente";
import { tokens } from "../../constants/theme";

export default function AuthEntryScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 380;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#0E1323",
    },
    backgroundImage: {
      ...StyleSheet.absoluteFillObject,
      width: "100%",
      height: "100%",
      zIndex: 0,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "space-between",
      paddingHorizontal: isSmallScreen ? 20 : 24,
      paddingTop: isSmallScreen ? 24 : 32,
      paddingBottom: isSmallScreen ? 20 : 28,
    },
    contentBlock: {
      zIndex: 1,
      width: "100%",
      maxWidth: 420,
      alignSelf: "center",
    },
    header: {
      marginTop: isSmallScreen ? 10 : 20,
      alignItems: "center",
      marginBottom: 28,
    },
    title: {
      fontSize: isSmallScreen ? 24 : tokens.fontSize.xl,
      fontWeight: "700",
      color: "#DEE1F9",
      marginBottom: 5,
      marginTop: 15,
      textAlign: "center",
    },
    subtitle: {
      fontSize: isSmallScreen ? 15 : tokens.fontSize.md,
      lineHeight: 24,
      color: "#C3C5D8",
      textAlign: "center",
      marginBottom: 15,
      paddingHorizontal: 8,
    },
    card: {
      width: "100%",
      maxWidth: 356,
      gap: 16,
      alignSelf: "center",
      marginBottom: 24,
    },
    button: {
      minHeight: 56,
      borderRadius: tokens.radius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    ghostButton: {
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: "transparent",
    },
    ghostButtonText: {
      color: colors.text,
      fontSize: tokens.fontSize.md,
      fontWeight: "600",
    },
    cardInfo: {
      backgroundColor: "#161B2B",
      borderWidth: 1,
      borderColor: "#232A3D",
      borderRadius: tokens.radius.lx,
      padding: tokens.spacing.xxl,
      gap: 18,
      width: "100%",
      maxWidth: 356,
      alignSelf: "center",
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    iconWrapper: {
      width: 24,
      marginTop: 2,
      alignItems: "flex-start",
      justifyContent: "flex-start",
    },
    infoTextBlock: {
      flex: 1,
      marginLeft: 12,
    },
    cardTitle: {
      color: "#40DBD5",
      fontWeight: "700",
      fontSize: 14,
      letterSpacing: 1,
      marginBottom: 6,
    },
    cardTitle2: {
      color: "#B5C4FF",
      fontWeight: "700",
      fontSize: 14,
      letterSpacing: 1,
      marginBottom: 6,
    },
    cardsubTitle: {
      color: "#C3C5D8",
      textAlign: "left",
      fontSize: isSmallScreen ? 14 : 15,
      lineHeight: 22,
    },
    divider: {
      height: 1,
      width: "75%",
      alignSelf: "center",
      backgroundColor: "#232A3D",
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <Image
        source={require("../../assets/images/plano_fundo.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentBlock}>
          <View style={styles.header}>
            <CampusSeguroLogo
              width={isSmallScreen ? 84 : 96}
              height={isSmallScreen ? 84 : 96}
            />

            <Text style={styles.title}>Campus Seguro</Text>
            <Text style={styles.subtitle}>
              Sua segurança em primeiro lugar
            </Text>
          </View>

          <View style={styles.card}>
            <GradientButton
              title="Entrar"
              onPress={() => router.push("/auth/login")}
            />

            <TouchableOpacity
              style={[styles.button, styles.ghostButton]}
              activeOpacity={0.85}
              onPress={() => router.push("/auth/cadastro_completo")}
            >
              <Text style={styles.ghostButtonText}>Cadastro Completo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.ghostButton]}
              activeOpacity={0.85}
              onPress={() => router.push("/auth/cadastro_rapido")}
            >
              <Text style={styles.ghostButtonText}>Cadastro Rápido</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardInfo}>
            <View style={styles.infoItem}>
              <View style={styles.iconWrapper}>
                <RaioIcon width={16} height={16} />
              </View>

              <View style={styles.infoTextBlock}>
                <Text style={styles.cardTitle}>CADASTRO RÁPIDO</Text>
                <Text style={styles.cardsubTitle}>
                  Acesso imediato para emergências e alertas em tempo real.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <View style={styles.iconWrapper}>
                <DocumentoIcon width={16} height={16} />
              </View>

              <View style={styles.infoTextBlock}>
                <Text style={styles.cardTitle2}>CADASTRO COMPLETO</Text>
                <Text style={styles.cardsubTitle}>
                  Perfil verificado institucionalmente e histórico total de
                  atividades.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}