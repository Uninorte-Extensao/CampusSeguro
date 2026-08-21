import { useState } from "react";
import {
    ConfigScreen,
    FeedbackModal,
    InfoText,
    SectionTitle,
    SettingsGroup,
    SettingsRow,
    ToggleRow,
    WarningCard,
} from "../../components/configuracoes/ConfigTelaBase";

export default function LocalizacaoScreen() {
  const [usarLocalizacao, setUsarLocalizacao] = useState(true);
  const [mostrarAviso, setMostrarAviso] = useState(true);
  const [popupPermissao, setPopupPermissao] = useState(false);

  function alterarLocalizacao(valor: boolean) {
    setUsarLocalizacao(valor);

    if (!valor && mostrarAviso) {
      setPopupPermissao(true);
    }
  }

  return (
    <ConfigScreen
      title="Localização"
      subtitle="Controle permissões e preferências de localização."
    >
      <SettingsGroup>
        <ToggleRow
          title="Usar minha localização"
          value={usarLocalizacao}
          onValueChange={alterarLocalizacao}
          showDivider={false}
        />
      </SettingsGroup>

      <InfoText>
        A localização é usada para melhorar denúncias e alertas de segurança.
      </InfoText>

      {!usarLocalizacao && (
        <WarningCard text="Algumas funcionalidades exigem localização ativa." />
      )}

      <SettingsGroup>
        <ToggleRow
          title="Mostrar aviso quando a localização estiver desativada"
          value={mostrarAviso}
          onValueChange={setMostrarAviso}
          showDivider={false}
        />
      </SettingsGroup>

      <SectionTitle>LOCAIS SALVOS</SectionTitle>

      <SettingsGroup>
        <SettingsRow
          icon="home"
          title="Casa"
          subtitle="Rua das Flores, 123 - Centro"
        />

        <SettingsRow
          icon="briefcase"
          title="Trabalho"
          subtitle="Av. Paulista, 1000 - Bela Vista"
        />

        <SettingsRow
          icon="plus"
          title="Adicionar local salvo"
          subtitle="Cadastrar novo ponto favorito"
          showDivider={false}
        />
      </SettingsGroup>

      <FeedbackModal
        visible={popupPermissao}
        variant="warning"
        title="Localização desativada"
        message="Algumas funcionalidades de segurança podem não funcionar corretamente sem acesso à localização."
        primaryLabel="Entendi"
        secondaryLabel="Reativar"
        onPrimaryPress={() => setPopupPermissao(false)}
        onSecondaryPress={() => {
          setUsarLocalizacao(true);
          setPopupPermissao(false);
        }}
      />
    </ConfigScreen>
  );
}