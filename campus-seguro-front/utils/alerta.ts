import { Alert, Platform } from "react-native";

/**
 * Exibe um aviso simples (um botão) que funciona na WEB e no NATIVO.
 *
 * Motivo: no react-native-web o `Alert.alert` frequentemente não exibe nada,
 * o que fazia erros/validações passarem despercebidos (ex.: "cliquei em
 * Cadastrar e não aconteceu nada"). Aqui usamos `window.alert` na web.
 */
export function alerta(titulo: string, mensagem?: string) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && typeof window.alert === "function") {
      window.alert(mensagem ? `${titulo}\n\n${mensagem}` : titulo);
    }
    return;
  }

  Alert.alert(titulo, mensagem);
}
