import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { analisarRelatoIA } from "../../services/api";

// A IA devolve o tipo em formato técnico (ex.: "agressao_fisica").
// Convertemos para um rótulo legível exibido no formulário.
const ROTULOS_TIPO: Record<string, string> = {
  agressao_fisica: "Agressão Física",
  assedio_moral: "Assédio Moral",
  assedio_sexual: "Assédio Sexual",
  injuria_racial: "Injúria Racial",
  bullying: "Bullying",
  ameaca: "Ameaça",
  discriminacao: "Discriminação",
  violencia_psicologica: "Violência Psicológica",
  outro: "Outro",
};

function rotularTipo(valor: string): string {
  const chave = valor.trim().toLowerCase().replace(/\s+/g, "_");
  if (ROTULOS_TIPO[chave]) return ROTULOS_TIPO[chave];
  // Fallback: "algo_assim" -> "Algo Assim"
  return valor
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Normaliza a gravidade retornada pela IA para "Baixa" | "Média" | "Alta".
function normalizarGravidade(valor?: string): "Baixa" | "Média" | "Alta" | null {
  if (!valor) return null;
  const v = valor.trim().toLowerCase();
  if (v.startsWith("alt")) return "Alta";
  if (v.startsWith("bai")) return "Baixa";
  if (v.startsWith("med") || v.startsWith("méd")) return "Média";
  return null;
}

// Rede de segurança: sinais de arma/lesão grave forçam gravidade "Alta",
// mesmo que a IA tenha estimado algo menor.
const PALAVRAS_ALTA = [
  "faca", "facada", "esfaque", "esfaqu", "arma", "tiro", "revólver", "revolver",
  "pistola", "bala", "sangue", "hospital", "morte", "matar", "mataram",
  "estupro", "abuso sexual", "sequestro", "refém",
];

function gravidadePorPalavraChave(texto: string): "Alta" | null {
  const t = texto.toLowerCase();
  return PALAVRAS_ALTA.some((p) => t.includes(p)) ? "Alta" : null;
}

// Categoria mais ampla derivada do tipo de agressão.
const CATEGORIA_POR_TIPO: Record<string, string> = {
  agressao_fisica: "Violência Física",
  assedio_moral: "Assédio",
  assedio_sexual: "Assédio",
  injuria_racial: "Discriminação",
  bullying: "Bullying",
  ameaca: "Ameaça",
  discriminacao: "Discriminação",
  violencia_psicologica: "Violência Psicológica",
  outro: "Outro",
};

function categoriaPorTipo(tipo: string): string | null {
  const chave = tipo.trim().toLowerCase().replace(/\s+/g, "_");
  return CATEGORIA_POR_TIPO[chave] ?? null;
}

export default function Etapa2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const relato =
    typeof params.relato === "string" ? params.relato : "";

  const audioUri =
    typeof params.audioUri === "string" ? params.audioUri : "";

  const tipoRelato =
    typeof params.tipoRelato === "string" ? params.tipoRelato : "texto";

  // Evita navegar duas vezes (resposta da IA + fallback)
  const navegouRef = useRef(false);

  useEffect(() => {
    let ativo = true;

    // Mantém a animação de "analisando" visível por um tempo mínimo
    const inicio = Date.now();
    const TEMPO_MINIMO = 1800;

    function irParaEtapa3(extra: Record<string, string>) {
      if (navegouRef.current || !ativo) return;
      navegouRef.current = true;

      const atraso = Math.max(0, TEMPO_MINIMO - (Date.now() - inicio));
      setTimeout(() => {
        if (!ativo) return;
        router.replace({
          pathname: "/report/etapa3",
          params: {
            relato,
            audioUri,
            tipoRelato,
            categoria: "Assédio",
            gravidade: "Média",
            destino: "Segurança",
            ...extra,
          },
        });
      }, atraso);
    }

    async function analisar() {
      // Sem texto (ex.: só áudio): segue o fluxo manual com os defaults.
      if (!relato.trim()) {
        irParaEtapa3({});
        return;
      }

      try {
        const resposta = await analisarRelatoIA(relato);
        const dados = resposta?.dados_extraidos ?? {};

        // Só repassa campos que a IA realmente preencheu.
        const extra: Record<string, string> = {};
        if (dados.tipo_agressao) {
          const tipoRaw = String(dados.tipo_agressao);
          extra.tipoAgressao = rotularTipo(tipoRaw);
          const cat = categoriaPorTipo(tipoRaw);
          if (cat) extra.categoria = cat;
        }
        if (dados.local) extra.local = String(dados.local);
        if (dados.horario) extra.horario = String(dados.horario);

        // Agressor: usa o nome extraído; se a IA não identificou, deixa claro.
        const agressorRaw = dados.agressor ? String(dados.agressor).trim() : "";
        extra.agressor = agressorRaw ? agressorRaw : "Agressor não identificado";

        if (dados.descricao_resumida)
          extra.resumo = String(dados.descricao_resumida);

        // Gravidade: usa a estimativa da IA; palavras-chave de risco forçam "Alta".
        const gravidadeIA = normalizarGravidade(
          dados.gravidade ? String(dados.gravidade) : undefined
        );
        const gravidadeRisco = gravidadePorPalavraChave(relato);
        const gravidade = gravidadeRisco ?? gravidadeIA;
        if (gravidade) extra.gravidade = gravidade;

        irParaEtapa3(extra);
      } catch {
        // IA indisponível (sem chave/offline): não bloqueia o usuário,
        // segue para o preenchimento manual com o relato original.
        irParaEtapa3({ resumo: relato });
      }
    }

    analisar();

    return () => {
      ativo = false;
    };
  }, [relato, audioUri, tipoRelato, router]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <View style={styles.content}>
        <View style={styles.loadingCard}>
          <LinearGradient
            colors={["#152036", "#0E1628"]}
            style={styles.loadingCircle}
          >
            <ActivityIndicator size="large" color="#40DBD5" />
          </LinearGradient>

          <Text style={styles.title}>
            Analisando{"\n"}
            <Text style={styles.highlight}>seu relato...</Text>
          </Text>

          <Text style={styles.subtitle}>
            Estamos interpretando sua descrição para sugerir categoria,
            gravidade e encaminhamento.
          </Text>
        </View>

        <View style={styles.statusList}>
          <View style={styles.statusItem}>
            <View style={styles.statusIcon}>
              <Feather name="check" size={16} color="#40DBD5" />
            </View>

            <View style={styles.statusTextArea}>
              <Text style={styles.statusTitle}>Relato recebido</Text>
              <Text style={styles.statusDescription}>
                Sua descrição foi registrada com segurança.
              </Text>
            </View>
          </View>

          <View style={styles.statusItem}>
            <View style={styles.statusIcon}>
              <ActivityIndicator size="small" color="#40DBD5" />
            </View>

            <View style={styles.statusTextArea}>
              <Text style={styles.statusTitle}>Analisando conteúdo</Text>
              <Text style={styles.statusDescription}>
                A IA está identificando os principais detalhes.
              </Text>
            </View>
          </View>

          <View style={styles.statusItemDisabled}>
            <View style={styles.statusIconDisabled}>
              <Feather name="file-text" size={16} color="#69748C" />
            </View>

            <View style={styles.statusTextArea}>
              <Text style={styles.statusTitleDisabled}>
                Preenchendo denúncia
              </Text>
              <Text style={styles.statusDescription}>
                A próxima tela será preparada automaticamente.
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020",
  },

  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 28,
    paddingBottom: 24,
  },

  loadingCard: {
    alignItems: "center",
    marginTop: 58,
    marginBottom: 44,
  },

  loadingCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#263C5C",
  },

  title: {
    color: "#EAF0FF",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    textAlign: "center",
  },

  highlight: {
    color: "#40DBD5",
  },

  subtitle: {
    color: "#AAB4C8",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 14,
    maxWidth: 320,
  },

  statusList: {
    gap: 14,
  },

  statusItem: {
    minHeight: 78,
    borderRadius: 22,
    backgroundColor: "#171D2E",
    borderWidth: 1,
    borderColor: "#26304A",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },

  statusItemDisabled: {
    minHeight: 78,
    borderRadius: 22,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1F2937",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
    opacity: 0.78,
  },

  statusIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#122A39",
    alignItems: "center",
    justifyContent: "center",
  },

  statusIconDisabled: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#20283A",
    alignItems: "center",
    justifyContent: "center",
  },

  statusTextArea: {
    flex: 1,
  },

  statusTitle: {
    color: "#EAF0FF",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },

  statusTitleDisabled: {
    color: "#AAB4C8",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },

  statusDescription: {
    color: "#7F8AA3",
    fontSize: 12,
    lineHeight: 17,
  },

  cancelButton: {
    marginTop: "auto",
    height: 50,
    borderRadius: 999,
    backgroundColor: "#171D2E",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: "#9FB0D8",
    fontSize: 14,
    fontWeight: "700",
  },
});