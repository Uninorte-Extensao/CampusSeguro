import { useState } from "react";
import {
    ConfigScreen,
    FeedbackModal,
    InfoText,
    SettingsGroup,
    ToggleRow,
    WarningCard,
} from "../../components/configuracoes/ConfigTelaBase";

type Permissao = "camera" | "microfone" | "sensores";

export default function DispositivoScreen() {
  const [camera, setCamera] = useState(true);
  const [microfone, setMicrofone] = useState(false);
  const [sensores, setSensores] = useState(true);

  const [popupPermissao, setPopupPermissao] = useState<Permissao | null>(null);

  function alterarCamera(valor: boolean) {
    setCamera(valor);

    if (!valor) {
      setPopupPermissao("camera");
    }
  }

  function alterarMicrofone(valor: boolean) {
    setMicrofone(valor);

    if (!valor) {
      setPopupPermissao("microfone");
    }
  }

  function alterarSensores(valor: boolean) {
    setSensores(valor);

    if (!valor) {
      setPopupPermissao("sensores");
    }
  }

  function getMensagemPopup() {
    if (popupPermissao === "camera") {
      return "A câmera foi desativada. Algumas funcionalidades de envio de evidências podem não funcionar.";
    }

    if (popupPermissao === "microfone") {
      return "O microfone foi desativado. Recursos que dependem de áudio podem ficar indisponíveis.";
    }

    return "Os sensores foram desativados. Algumas funções automáticas do aplicativo podem ser limitadas.";
  }

  return (
    <ConfigScreen
      title="Dispositivo"
      subtitle="Gerencie permissões de hardware do app."
    >
      <SettingsGroup>
        <ToggleRow
          icon="camera"
          title="Câmera"
          value={camera}
          onValueChange={alterarCamera}
        />

        <ToggleRow
          icon="mic"
          title="Microfone"
          value={microfone}
          onValueChange={alterarMicrofone}
        />

        <ToggleRow
          icon="radio"
          title="Sensores"
          value={sensores}
          onValueChange={alterarSensores}
          showDivider={false}
        />
      </SettingsGroup>

      <InfoText>
        Ative apenas os recursos necessários para o funcionamento do app.
      </InfoText>

      <WarningCard text="Se todas as permissões forem desativadas, alguns recursos podem não funcionar corretamente." />

      <FeedbackModal
        visible={popupPermissao !== null}
        variant="warning"
        title="Permissão desativada"
        message={getMensagemPopup()}
        primaryLabel="Entendi"
        onPrimaryPress={() => setPopupPermissao(null)}
      />
    </ConfigScreen>
  );
}