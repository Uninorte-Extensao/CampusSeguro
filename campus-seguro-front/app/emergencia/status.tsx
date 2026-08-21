import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SERVICO_INFO: Record<
  string,
  {
    titulo: string;
    numero: string;
    icon: React.ComponentProps<typeof Feather>["name"];
    cor: string;
    corFundo: string;
  }
> = {
  policia: {
    titulo: "Polícia",
    numero: "190",
    icon: "shield",
    cor: "#3B82F6",
    corFundo: "rgba(59,130,246,0.12)",
  },
  ambulancia: {
    titulo: "Ambulância",
    numero: "192",
    icon: "activity",
    cor: "#22c55e",
    corFundo: "rgba(34,197,94,0.12)",
  },
  bombeiros: {
    titulo: "Bombeiros",
    numero: "193",
    icon: "alert-triangle",
    cor: "#ef4444",
    corFundo: "rgba(239,68,68,0.12)",
  },
};

type Estado = "enviando" | "acionado";

function gerarProtocolo() {
  return "#EM" + Math.random().toString(36).substring(2, 5).toUpperCase();
}

export default function StatusEmergencia() {
  const router = useRouter();
  const { servico } = useLocalSearchParams<{ servico: string }>();
  const info = SERVICO_INFO[servico ?? ""] ?? SERVICO_INFO.policia;

  const [estado, setEstado] = useState<Estado>("enviando");
  const protocolo = useRef(gerarProtocolo()).current;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    const t = setTimeout(() => {
      setEstado("acionado");
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 2500);

    return () => clearTimeout(t);
  }, []);

  function handleOk() {
    router.replace("/home/home");
  }

  function handleVerHistorico() {
    router.replace("/historico");
  }

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Animação central */}
        <View style={s.iconSection}>
          {estado === "enviando" ? (
            <View style={s.iconWrapper}>
              <Animated.View
                style={[
                  s.pulseRing,
                  {
                    backgroundColor: info.corFundo,
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />
              <View style={[s.iconCircle, { backgroundColor: info.corFundo }]}>
                <Feather name={info.icon} size={42} color={info.cor} />
              </View>
            </View>
          ) : (
            <View style={s.iconWrapper}>
              <View style={[s.iconCircle, { backgroundColor: "rgba(34,197,94,0.12)" }]}>
                <Feather name="check" size={42} color="#22c55e" />
              </View>
            </View>
          )}
        </View>

        {/* Texto status */}
        <View style={s.titleBlock}>
          {estado === "enviando" ? (
            <>
              <Text style={s.title}>Acionando {info.titulo.toLowerCase()}...</Text>
              <Text style={s.subtitle}>
                Estamos enviando sua solicitação e localização para a central
                de emergência.
              </Text>
            </>
          ) : (
            <Animated.View style={{ gap: 10, opacity: fadeAnim }}>
              <Text style={s.title}>Emergência acionada!</Text>
              <Text style={s.subtitle}>
                O atendimento está a caminho. Mantenha a calma e fique no local
                seguro mais próximo.
              </Text>
            </Animated.View>
          )}
        </View>

        {/* Card informações */}
        {estado === "acionado" && (
          <Animated.View style={[s.card, { opacity: fadeAnim }]}>
            <View style={s.cardTop}>
              <View
                style={[
                  s.badge,
                  { backgroundColor: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.3)" },
                ]}
              >
                <View style={[s.dot, { backgroundColor: "#22c55e" }]} />
                <Text style={[s.badgeText, { color: "#22c55e" }]}>
                  EM ATENDIMENTO
                </Text>
              </View>
              <Text style={s.protocolo}>{protocolo}</Text>
            </View>

            <View style={s.divider} />

            <View style={s.infoRow}>
              <View style={s.infoCol}>
                <Text style={s.infoLabel}>SERVIÇO</Text>
                <Text style={s.infoValue}>{info.titulo}</Text>
              </View>
              <View style={s.infoCol}>
                <Text style={s.infoLabel}>NÚMERO</Text>
                <Text style={[s.infoValue, { color: info.cor }]}>
                  {info.numero}
                </Text>
              </View>
            </View>

            <View style={s.divider} />

            <View style={s.locBlock}>
              <Text style={s.infoLabel}>LOCALIZAÇÃO ENVIADA</Text>
              <View style={s.locRow}>
                <Feather name="map-pin" size={13} color="#8D90A1" />
                <Text style={s.locText}>UniNorte – Campus Djalma Batista</Text>
              </View>
            </View>

            <View style={s.divider} />

            <View style={s.checks}>
              {[
                "Localização compartilhada com a central.",
                "Acompanhe o atendimento pelo Histórico.",
                "Em caso de mudança, ligue 190 diretamente.",
              ].map((txt, i) => (
                <View key={i} style={s.checkItem}>
                  <Feather name="check-circle" size={14} color="#40DBD5" />
                  <Text style={s.checkText}>{txt}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Botões */}
        {estado === "acionado" && (
          <Animated.View style={[s.btnGroup, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={[s.btn, s.btnPrimary]}
              activeOpacity={0.85}
              onPress={handleOk}
            >
              <Text style={s.btnPrimaryText}>OK</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btn, s.btnSecondary]}
              activeOpacity={0.85}
              onPress={handleVerHistorico}
            >
              <Feather name="clock" size={15} color="#C9D3FF" />
              <Text style={s.btnSecondaryText}>Ver no histórico</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1020" },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
    gap: 24,
    flexGrow: 1,
  },

  iconSection: { alignItems: "center", paddingVertical: 16 },
  iconWrapper: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },

  titleBlock: { alignItems: "center", gap: 10 },
  title: {
    color: "#EAF0FF",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#8D90A1",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: 8,
  },

  card: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1F2638",
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dot: { width: 7, height: 7, borderRadius: 999 },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  protocolo: {
    color: "#EAF0FF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },

  divider: { height: 1, backgroundColor: "#1F2638" },

  infoRow: { flexDirection: "row", gap: 16 },
  infoCol: { flex: 1, gap: 4 },
  infoLabel: {
    color: "#454D66",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  infoValue: { color: "#EAF0FF", fontSize: 14, fontWeight: "800" },

  locBlock: { gap: 6 },
  locRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  locText: { color: "#EAF0FF", fontSize: 13, fontWeight: "700" },

  checks: { gap: 10 },
  checkItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkText: { color: "#C4CAD8", fontSize: 12, lineHeight: 18, flex: 1 },

  btnGroup: { gap: 10 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    borderRadius: 999,
  },
  btnPrimary: {
    backgroundColor: "#4B7DFF",
    shadowColor: "#4B7DFF",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  btnPrimaryText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  btnSecondary: {
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderColor: "#1F2638",
  },
  btnSecondaryText: { color: "#C9D3FF", fontSize: 14, fontWeight: "700" },
});
