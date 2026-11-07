import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { AppState, Platform } from "react-native";
import {
    ConfigScreen,
    FeedbackModal,
    InfoText,
    SettingsGroup,
    ToggleRow,
    WarningCard,
} from "../../components/configuracoes/ConfigTelaBase";
import {
    EstadoPermissao,
    estadoPermissao,
    garantirPermissao,
    orientarAjustes,
} from "../../utils/permissoes";

type Recurso = "microfone" | "camera";

const LEGENDA: Record<EstadoPermissao, string> = {
  concedida: "Permitido",
  pendente: "Toque para permitir",
  negada: "Bloqueado — toque para ver como liberar",
  indisponivel: "Indisponível sem conexão segura (https)",
};

export default function DispositivoScreen() {
  const [estado, setEstado] = useState<Record<Recurso, EstadoPermissao>>({
    microfone: "pendente",
    camera: "pendente",
  });
  const [sensores, setSensores] = useState(true);
  const [avisoSensores, setAvisoSensores] = useState(false);

  // Mostra o estado REAL das permissões do aparelho (e atualiza ao voltar dos Ajustes)
  const atualizar = useCallback(async () => {
    const [microfone, camera] = await Promise.all([estadoPermissao("microfone"), estadoPermissao("camera")]);
    setEstado({ microfone, camera });
  }, []);

  useFocusEffect(
    useCallback(() => {
      atualizar();
      const sub = AppState.addEventListener("change", (s) => s === "active" && atualizar());
      return () => sub.remove();
    }, [atualizar])
  );

  async function alternar(recurso: Recurso, ligar: boolean) {
    if (ligar) {
      await garantirPermissao(recurso);
    } else {
      // O app não pode revogar uma permissão: isso é feito nos Ajustes do sistema.
      orientarAjustes(recurso);
    }
    atualizar();
  }

  return (
    <ConfigScreen title="Dispositivo" subtitle="Gerencie permissões de hardware do app.">
      <SettingsGroup>
        <ToggleRow
          icon="camera"
          title="Câmera"
          subtitle={LEGENDA[estado.camera]}
          value={estado.camera === "concedida"}
          onValueChange={(v) => alternar("camera", v)}
        />

        <ToggleRow
          icon="mic"
          title="Microfone"
          subtitle={LEGENDA[estado.microfone]}
          value={estado.microfone === "concedida"}
          onValueChange={(v) => alternar("microfone", v)}
        />

        <ToggleRow
          icon="radio"
          title="Sensores"
          value={sensores}
          onValueChange={(v) => {
            setSensores(v);
            if (!v) setAvisoSensores(true);
          }}
          showDivider={false}
        />
      </SettingsGroup>

      <InfoText>
        {Platform.OS === "web"
          ? "As permissões ficam guardadas no navegador. Para revogar, use as configurações do site no navegador."
          : "Para revogar uma permissão, use os Ajustes do aparelho. O app abre a tela certa para você."}
      </InfoText>

      <WarningCard text="Sem o microfone não é possível gravar relatos por áudio; sem a câmera, não dá para fotografar evidências." />

      <FeedbackModal
        visible={avisoSensores}
        variant="warning"
        title="Permissão desativada"
        message="Os sensores foram desativados. Algumas funções automáticas do aplicativo podem ser limitadas."
        primaryLabel="Entendi"
        onPrimaryPress={() => setAvisoSensores(false)}
      />
    </ConfigScreen>
  );
}
