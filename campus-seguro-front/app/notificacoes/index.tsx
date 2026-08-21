// app/notificacoes/index.tsx

import { Tabs } from "@/components/navegacao/Tabs";
import {
  Notificacao,
  TipoNotificacao,
  useCampusSeguro,
} from "@/contexts/CampusSeguroContext";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TIPO_CONFIG: Record<
  TipoNotificacao,
  {
    icon: ComponentProps<typeof Feather>["name"];
    cor: string;
    corFundo: string;
    label: string;
  }
> = {
  denuncia: {
    icon: "bell",
    cor: "#3B82F6",
    corFundo: "rgba(59,130,246,0.12)",
    label: "Denúncia",
  },
  emergencia: {
    icon: "alert-octagon",
    cor: "#ef4444",
    corFundo: "rgba(239,68,68,0.12)",
    label: "Emergência",
  },
  alerta: {
    icon: "alert-triangle",
    cor: "#f59e0b",
    corFundo: "rgba(245,158,11,0.12)",
    label: "Alerta",
  },
  sistema: {
    icon: "info",
    cor: "#40DBD5",
    corFundo: "rgba(64,219,213,0.12)",
    label: "Sistema",
  },
};

export default function NotificacoesIndex() {
  const router = useRouter();

  const {
    notificacoes,
    naoLidas,
    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,
  } = useCampusSeguro();

  const [filtro, setFiltro] = useState<"todas" | "nao-lidas">("todas");

  const lista = useMemo(() => {
    if (filtro === "nao-lidas") {
      return notificacoes.filter((notificacao) => !notificacao.lida);
    }

    return notificacoes;
  }, [filtro, notificacoes]);

  function handleAbrir(notificacao: Notificacao) {
    marcarNotificacaoLida(notificacao.id);

    if (notificacao.registroId) {
      router.push({
        pathname: "/historico/[id]",
        params: { id: notificacao.registroId },
      });
    }
  }

  return (
    <View style={s.screen}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <SafeAreaView style={s.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Feather name="arrow-left" size={20} color="#C9D3FF" />
            </TouchableOpacity>

            <View style={s.headerCenter}>
              <Text style={s.headerTitle}>Notificações</Text>

              {naoLidas > 0 && (
                <View style={s.headerBadge}>
                  <Text style={s.headerBadgeText}>{naoLidas}</Text>
                </View>
              )}
            </View>

            {naoLidas > 0 ? (
              <TouchableOpacity
                onPress={marcarTodasNotificacoesLidas}
                style={s.checkAllBtn}
                activeOpacity={0.8}
              >
                <Feather name="check" size={16} color="#C9D3FF" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 36 }} />
            )}
          </View>

          <View style={s.filtrosRow}>
            <TouchableOpacity
              style={[s.filtro, filtro === "todas" && s.filtroAtivo]}
              onPress={() => setFiltro("todas")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  s.filtroText,
                  filtro === "todas" && s.filtroTextAtivo,
                ]}
              >
                Todas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.filtro, filtro === "nao-lidas" && s.filtroAtivo]}
              onPress={() => setFiltro("nao-lidas")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  s.filtroText,
                  filtro === "nao-lidas" && s.filtroTextAtivo,
                ]}
              >
                Não lidas {naoLidas > 0 && `(${naoLidas})`}
              </Text>
            </TouchableOpacity>
          </View>

          {lista.length === 0 ? (
            <View style={s.vazio}>
              <View style={s.vazioIcon}>
                <Feather name="bell-off" size={32} color="#454D66" />
              </View>

              <Text style={s.vazioTitulo}>
                {filtro === "nao-lidas"
                  ? "Nenhuma notificação não lida"
                  : "Sem notificações"}
              </Text>

              <Text style={s.vazioSub}>
                {filtro === "nao-lidas"
                  ? "Você está em dia com tudo!"
                  : "Você verá aqui atualizações sobre suas denúncias e alertas de segurança."}
              </Text>
            </View>
          ) : (
            <View style={s.lista}>
              {lista.map((notificacao) => {
                const config = TIPO_CONFIG[notificacao.tipo];

                return (
                  <TouchableOpacity
                    key={notificacao.id}
                    style={[s.card, !notificacao.lida && s.cardNaoLida]}
                    activeOpacity={0.85}
                    onPress={() => handleAbrir(notificacao)}
                  >
                    <View
                      style={[
                        s.iconBox,
                        { backgroundColor: config.corFundo },
                      ]}
                    >
                      <Feather
                        name={config.icon}
                        size={18}
                        color={config.cor}
                      />
                    </View>

                    <View style={s.conteudo}>
                      <View style={s.topo}>
                        <Text style={s.titulo} numberOfLines={1}>
                          {notificacao.titulo}
                        </Text>

                        {!notificacao.lida && <View style={s.dotNaoLida} />}
                      </View>

                      <Text style={s.mensagem} numberOfLines={2}>
                        {notificacao.mensagem}
                      </Text>

                      <View style={s.rodape}>
                        <View
                          style={[
                            s.tipoBadge,
                            { backgroundColor: config.corFundo },
                          ]}
                        >
                          <Text
                            style={[
                              s.tipoBadgeText,
                              { color: config.cor },
                            ]}
                          >
                            {config.label}
                          </Text>
                        </View>

                        {notificacao.protocolo && (
                          <Text style={s.protocolo}>
                            {notificacao.protocolo}
                          </Text>
                        )}

                        <Text style={s.tempo}>{notificacao.tempo}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <Tabs activeTab="notificacoes" />
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0B1020",
  },

  safeArea: {
    flex: 1,
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 140,
    gap: 18,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#171D2E",
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  headerTitle: {
    color: "#EAF0FF",
    fontSize: 16,
    fontWeight: "700",
  },

  headerBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  headerBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
  },

  checkAllBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#171D2E",
    alignItems: "center",
    justifyContent: "center",
  },

  filtrosRow: {
    flexDirection: "row",
    gap: 8,
  },

  filtro: {
    paddingHorizontal: 16,
    height: 34,
    borderRadius: 999,
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderColor: "#1F2638",
    alignItems: "center",
    justifyContent: "center",
  },

  filtroAtivo: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  filtroText: {
    color: "#8D90A1",
    fontSize: 12,
    fontWeight: "700",
  },

  filtroTextAtivo: {
    color: "#fff",
  },

  lista: {
    gap: 10,
  },

  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderColor: "#1F2638",
    borderRadius: 16,
    padding: 14,
  },

  cardNaoLida: {
    borderColor: "#2D3D67",
    backgroundColor: "#1A2238",
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  conteudo: {
    flex: 1,
    gap: 6,
  },

  topo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  titulo: {
    flex: 1,
    color: "#EAF0FF",
    fontSize: 14,
    fontWeight: "800",
  },

  dotNaoLida: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#40DBD5",
  },

  mensagem: {
    color: "#C4CAD8",
    fontSize: 12,
    lineHeight: 17,
  },

  rodape: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },

  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  tipoBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  protocolo: {
    color: "#8D90A1",
    fontSize: 11,
    fontWeight: "700",
  },

  tempo: {
    marginLeft: "auto",
    color: "#454D66",
    fontSize: 11,
    fontWeight: "700",
  },

  vazio: {
    alignItems: "center",
    paddingVertical: 56,
    gap: 12,
  },

  vazioIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderColor: "#1F2638",
    alignItems: "center",
    justifyContent: "center",
  },

  vazioTitulo: {
    color: "#EAF0FF",
    fontSize: 16,
    fontWeight: "800",
  },

  vazioSub: {
    color: "#8D90A1",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});