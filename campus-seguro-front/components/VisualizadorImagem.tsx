import { Feather } from "@expo/vector-icons";
import { useEffect } from "react";
import { Image, Linking, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * Abre um arquivo SEM tirar o usuário do app.
 * Na web abre em nova aba (no PWA em tela cheia, abrir na mesma janela
 * deixava a pessoa "presa" na imagem, sem botão de voltar).
 */
export function abrirArquivo(url: string) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  Linking.openURL(url).catch(() => {});
}

/** Visualizador de imagem em tela cheia, com botão de fechar, Esc e toque fora. */
export function VisualizadorImagem({
  url,
  titulo,
  onFechar,
}: {
  url: string | null;
  titulo?: string;
  onFechar: () => void;
}) {
  // Esc fecha (web)
  useEffect(() => {
    if (!url || Platform.OS !== "web" || typeof window === "undefined") return;
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [url, onFechar]);

  return (
    <Modal visible={!!url} transparent animationType="fade" onRequestClose={onFechar}>
      <View style={s.fundo}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onFechar} accessibilityLabel="Fechar imagem" />

        <View style={s.topo} pointerEvents="box-none">
          <Text style={s.titulo} numberOfLines={1}>
            {titulo ?? "Anexo"}
          </Text>
          {Platform.OS === "web" && url && (
            <TouchableOpacity style={s.botao} onPress={() => abrirArquivo(url)} activeOpacity={0.8}>
              <Feather name="external-link" size={16} color="#EAF0FF" />
              <Text style={s.botaoTexto}>Nova aba</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.fechar} onPress={onFechar} activeOpacity={0.8} accessibilityLabel="Fechar">
            <Feather name="x" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {url && (
          <View style={s.area} pointerEvents="box-none">
            <Image source={{ uri: url }} style={s.imagem} resizeMode="contain" />
          </View>
        )}

        <Text style={s.dica} pointerEvents="none">
          {Platform.OS === "web" ? "Clique fora da imagem ou pressione Esc para fechar" : "Toque fora da imagem para fechar"}
        </Text>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: "rgba(5,8,16,0.94)" },
  topo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    zIndex: 2,
  },
  titulo: { flex: 1, color: "#EAF0FF", fontSize: 15, fontWeight: "700" },
  botao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  botaoTexto: { color: "#EAF0FF", fontSize: 13, fontWeight: "700" },
  fechar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  area: { flex: 1, paddingHorizontal: 16, paddingBottom: 8, alignItems: "center", justifyContent: "center" },
  imagem: { width: "100%", height: "100%", maxWidth: 1400 },
  dica: { color: "#7C869E", fontSize: 12, textAlign: "center", paddingBottom: 18 },
});
