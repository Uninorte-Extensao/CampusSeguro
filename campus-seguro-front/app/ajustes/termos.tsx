import {
    ConfigScreen,
    SectionTitle,
    SettingsGroup,
    SettingsRow,
} from "../../components/configuracoes/ConfigTelaBase";

export default function TermosScreen() {
  return (
    <ConfigScreen
      title="Termos"
      subtitle="Consulte políticas, permissões e regras de uso."
    >
      <SectionTitle>LEGAL</SectionTitle>

      <SettingsGroup>
        <SettingsRow
          icon="file-text"
          title="Termos de uso"
          subtitle="Regras gerais de utilização do aplicativo"
        />

        <SettingsRow
          icon="shield"
          title="Política de privacidade"
          subtitle="Como seus dados são tratados"
        />

        <SettingsRow
          icon="lock"
          title="Permissões do aplicativo"
          subtitle="Entenda o uso de localização, câmera e notificações"
          showDivider={false}
        />
      </SettingsGroup>
    </ConfigScreen>
  );
}