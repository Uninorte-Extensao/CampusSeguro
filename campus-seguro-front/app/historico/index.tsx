import {
  Relato,
  StatusRelato,
  useCampusSeguro,
} from "@/contexts/CampusSeguroContext";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FiltroType = "todos" | "ativos" | "emergencia" | "concluido";

const STATUS_COR: Record<StatusRelato, string> = {
  ATIVO: "#ef4444",
  "EM ANÁLISE": "#f59e0b",
  "EM ATENDIMENTO": "#3B82F6",
  CONCLUÍDO: "#22c55e",
};

const STATUS_BG: Record<StatusRelato, string> = {
  ATIVO: "rgba(239,68,68,0.12)",
  "EM ANÁLISE": "rgba(245,158,11,0.12)",
  "EM ATENDIMENTO": "rgba(59,130,246,0.12)",
  CONCLUÍDO: "rgba(34,197,94,0.12)",
};

const STATUS_BORDA: Record<StatusRelato, string> = {
  ATIVO: "rgba(239,68,68,0.35)",
  "EM ANÁLISE": "rgba(245,158,11,0.35)",
  "EM ATENDIMENTO": "rgba(59,130,246,0.35)",
  CONCLUÍDO: "rgba(34,197,94,0.35)",
};

const FILTROS: { id: FiltroType; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "ativos", label: "Ativos" },
  { id: "emergencia", label: "Emergência" },
  { id: "concluido", label: "Concluído" },
];

function normalizarTexto(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function filtrar(relatos: Relato[], filtro: FiltroType, busca: string): Relato[] {
  let lista = relatos;

  if (filtro === "ativos") {
    lista = lista.filter(
      (relato) => relato.status === "ATIVO" || relato.status === "EM ANÁLISE"
    );
  } else if (filtro === "emergencia") {
    lista = lista.filter(
      (relato) =>
        relato.tipo.toLowerCase().includes("emergencial") ||
        relato.status === "ATIVO"
    );
  } else if (filtro === "concluido") {
    lista = lista.filter((relato) => relato.status === "CONCLUÍDO");
  }

  if (busca.trim()) {
    const termo = normalizarTexto(busca);

    lista = lista.filter((relato) => {
      const textoRelato = normalizarTexto(
        `${relato.id} ${relato.tipo} ${relato.local} ${relato.descricao}`
      );

      return textoRelato.includes(termo);
    });
  }

  return lista;
}

export default function HistoricoScreen() {
  const router = useRouter();
  const { relatos, naoLidas } = useCampusSeguro();
  const [filtro, setFiltro] = useState<FiltroType>("todos");
  const [busca, setBusca] = useState("");

  const lista = useMemo(
    () => filtrar(relatos, filtro, busca),
    [relatos, filtro, busca]
  );

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={20} color="#C9D3FF" />
          </TouchableOpacity>

          <View style={s.headerLeft}>
            <Text style={s.headerTitle}>Histórico</Text>
            <Text style={s.headerSub}>
              Acompanhe todos os relatos de incidentes e atividades de segurança
              no campus.
            </Text>
          </View>

          <View style={s.headerIcons}>
            <TouchableOpacity
              style={s.notificacaoBtn}
              onPress={() => router.push("/notificacoes")}
              activeOpacity={0.7}
            >
              <Feather name="bell" size={20} color="#C9D3FF" />
              {naoLidas > 0 && <View style={s.headerBadge} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={s.avatarCircle}
              onPress={() => router.push("/ajustes")}
              activeOpacity={0.8}
            >
              <Feather name="user" size={16} color="#C9D3FF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.searchWrap}>
          <Feather name="search" size={16} color="#454D66" />

          <TextInput
            style={s.searchInput}
            placeholder="Buscar por local, tipo ou protocolo..."
            placeholderTextColor="#454D66"
            value={busca}
            onChangeText={setBusca}
            autoCorrect={false}
          />

          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca("")}>
              <Feather name="x" size={16} color="#454D66" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filtrosRow}
        >
          {FILTROS.map((filtroItem) => {
            const ativo = filtro === filtroItem.id;

            return (
              <TouchableOpacity
                key={filtroItem.id}
                style={[s.filtroChip, ativo && s.filtroChipAtivo]}
                onPress={() => setFiltro(filtroItem.id)}
                activeOpacity={0.8}
              >
                <Text style={[s.filtroText, ativo && s.filtroTextAtivo]}>
                  {filtroItem.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={s.lista}>
          {lista.length === 0 ? (
            <View style={s.vazio}>
              <Feather name="inbox" size={40} color="#30364B" />
              <Text style={s.vazioText}>Nenhum relato encontrado</Text>
            </View>
          ) : (
            lista.map((relato) => (
              <View
                key={relato.id}
                style={[
                  s.card,
                  {
                    borderLeftColor: STATUS_COR[relato.status],
                    borderLeftWidth: 3,
                  },
                ]}
              >
                <View style={s.cardTop}>
                  <View style={s.cardIconWrap}>
                    <Feather name={relato.icone} size={20} color="#C9D3FF" />
                  </View>

                  <View style={s.cardInfo}>
                    <Text style={s.cardTipo}>{relato.tipo}</Text>
                    <Text style={s.cardId}>ID: #{relato.id}</Text>
                  </View>

                  <View
                    style={[
                      s.statusBadge,
                      {
                        backgroundColor: STATUS_BG[relato.status],
                        borderColor: STATUS_BORDA[relato.status],
                      },
                    ]}
                  >
                    <Text
                      style={[
                        s.statusText,
                        { color: STATUS_COR[relato.status] },
                      ]}
                    >
                      {relato.status}
                    </Text>
                  </View>
                </View>

                <View style={s.cardMeta}>
                  <View style={s.metaItem}>
                    <Feather name="map-pin" size={12} color="#8D90A1" />
                    <Text style={s.metaText}>{relato.local}</Text>
                  </View>

                  <View style={s.metaItem}>
                    <Feather name="clock" size={12} color="#8D90A1" />
                    <Text style={s.metaText}>
                      {relato.data}, {relato.hora}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={s.detalhesBtn}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({
                      pathname: "/historico/[id]",
                      params: { id: relato.id },
                    })
                  }
                >
                  <Text style={s.detalhesBtnText}>VER DETALHES</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020",
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderColor: "#1F2638",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  headerLeft: {
    flex: 1,
    gap: 6,
  },

  headerTitle: {
    color: "#EAF0FF",
    fontSize: 28,
    fontWeight: "900",
  },

  headerSub: {
    color: "#8D90A1",
    fontSize: 13,
    lineHeight: 19,
  },

  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingTop: 4,
  },

  notificacaoBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  headerBadge: {
    position: "absolute",
    top: 6,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 2,
    borderColor: "#0B1020",
  },

  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#30364B",
    alignItems: "center",
    justifyContent: "center",
  },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderColor: "#1F2638",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },

  searchInput: {
    flex: 1,
    color: "#EAF0FF",
    fontSize: 14,
  },

  filtrosRow: {
    gap: 8,
    paddingRight: 4,
  },

  filtroChip: {
    paddingHorizontal: 18,
    height: 36,
    borderRadius: 999,
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderColor: "#1F2638",
    alignItems: "center",
    justifyContent: "center",
  },

  filtroChipAtivo: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  filtroText: {
    color: "#8D90A1",
    fontSize: 13,
    fontWeight: "600",
  },

  filtroTextAtivo: {
    color: "#fff",
    fontWeight: "700",
  },

  lista: {
    gap: 14,
  },

  vazio: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },

  vazioText: {
    color: "#454D66",
    fontSize: 14,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderColor: "#1F2638",
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#30364B",
    alignItems: "center",
    justifyContent: "center",
  },

  cardInfo: {
    flex: 1,
    gap: 3,
  },

  cardTipo: {
    color: "#EAF0FF",
    fontSize: 14,
    fontWeight: "700",
    flexShrink: 1,
  },

  cardId: {
    color: "#8D90A1",
    fontSize: 12,
  },

  statusBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  cardMeta: {
    gap: 6,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  metaText: {
    color: "#8D90A1",
    fontSize: 12,
    flexShrink: 1,
  },

  detalhesBtn: {
    height: 40,
    borderRadius: 10,
    backgroundColor: "#0B1020",
    borderWidth: 1,
    borderColor: "#1F2638",
    alignItems: "center",
    justifyContent: "center",
  },

  detalhesBtnText: {
    color: "#C9D3FF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
});