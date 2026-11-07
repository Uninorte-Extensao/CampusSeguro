import { AudioModule, setAudioModeAsync } from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import { Alert, Linking, Platform } from "react-native";
import { alerta } from "./alerta";

/**
 * Permissões de hardware (microfone e câmera) para iOS, Android e web/PWA.
 *
 * Regras que evitam o "não pede permissão":
 *  - Só pedimos a permissão a partir de um toque do usuário (o iOS/Safari
 *    ignora pedidos automáticos ao abrir a tela).
 *  - Depois de negado, o iOS e o Android não perguntam de novo: oferecemos
 *    abrir os Ajustes do aparelho.
 *  - No navegador, microfone e câmera só existem em HTTPS.
 */

export type EstadoPermissao = "concedida" | "pendente" | "negada" | "indisponivel";

type Recurso = "microfone" | "camera";

const NOME: Record<Recurso, string> = { microfone: "microfone", camera: "câmera" };

function webSemConexaoSegura(): boolean {
  if (Platform.OS !== "web" || typeof window === "undefined") return false;
  return !window.isSecureContext || !navigator.mediaDevices?.getUserMedia;
}

async function lerPermissao(recurso: Recurso) {
  return recurso === "microfone"
    ? AudioModule.getRecordingPermissionsAsync()
    : ImagePicker.getCameraPermissionsAsync();
}

async function pedirPermissao(recurso: Recurso) {
  return recurso === "microfone"
    ? AudioModule.requestRecordingPermissionsAsync()
    : ImagePicker.requestCameraPermissionsAsync();
}

/** Lê o estado atual SEM abrir o pedido de permissão. */
export async function estadoPermissao(recurso: Recurso): Promise<EstadoPermissao> {
  if (webSemConexaoSegura()) return "indisponivel";
  try {
    const p = await lerPermissao(recurso);
    if (p.granted) return "concedida";
    if (p.status === "denied" && p.canAskAgain === false) return "negada";
    return p.status === "denied" && Platform.OS === "web" ? "negada" : "pendente";
  } catch {
    return "pendente";
  }
}

/** Explica como liberar quando o sistema não deixa mais perguntar. */
export function orientarAjustes(recurso: Recurso) {
  const nome = NOME[recurso];

  if (Platform.OS === "web") {
    alerta(
      `${nome[0].toUpperCase()}${nome.slice(1)} bloqueado`,
      `Libere o ${nome} para este site:\n\n` +
        `• iPhone (Safari): toque em “aA” na barra de endereço › Ajustes do Site › ${nome[0].toUpperCase()}${nome.slice(1)} › Permitir.\n` +
        `• Android (Chrome): toque no cadeado ao lado do endereço › Permissões › ${nome[0].toUpperCase()}${nome.slice(1)} › Permitir.\n\n` +
        "Depois, recarregue a página."
    );
    return;
  }

  Alert.alert(
    `Permitir ${nome}`,
    `O acesso ao ${nome} foi negado. Para liberar, abra os Ajustes do aparelho e ative “${nome[0].toUpperCase()}${nome.slice(1)}” para o Campus Seguro.`,
    [
      { text: "Agora não", style: "cancel" },
      { text: "Abrir Ajustes", onPress: () => Linking.openSettings().catch(() => {}) },
    ]
  );
}

/**
 * Garante a permissão (pedindo se ainda for possível). Chame a partir de um
 * toque do usuário. Retorna true se pode usar o recurso.
 */
export async function garantirPermissao(recurso: Recurso): Promise<boolean> {
  const nome = NOME[recurso];

  if (webSemConexaoSegura()) {
    alerta(
      `${nome[0].toUpperCase()}${nome.slice(1)} indisponível`,
      `O navegador só libera o ${nome} em conexão segura (https). ` +
        "Acesse o Campus Seguro pelo endereço com https para usar este recurso."
    );
    return false;
  }

  try {
    let p = await lerPermissao(recurso);
    if (!p.granted && p.canAskAgain !== false) {
      p = await pedirPermissao(recurso);
    }
    if (p.granted) {
      if (recurso === "microfone") {
        await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      }
      return true;
    }
    orientarAjustes(recurso);
    return false;
  } catch {
    // No web, o navegador lança erro quando o usuário nega ou não há dispositivo.
    orientarAjustes(recurso);
    return false;
  }
}

/** Depois de gravar, volta o áudio para o alto-falante (no iPhone o modo de
 *  gravação manda o som para o fone de ouvido do aparelho). */
export async function encerrarModoGravacao() {
  try {
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
  } catch {
    // sem efeito colateral relevante
  }
}
