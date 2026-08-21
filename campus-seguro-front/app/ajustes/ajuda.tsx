import {
    ConfigScreen,
    SectionTitle,
    SettingsGroup,
    SettingsRow,
} from "../../components/configuracoes/ConfigTelaBase";

export default function AjudaScreen() {
  return (
    <ConfigScreen
      title="Ajuda"
      subtitle="Encontre suporte e informações sobre o aplicativo."
    >
      <SectionTitle>SUPORTE</SectionTitle>

      <SettingsGroup>
        <SettingsRow
          icon="help-circle"
          title="Perguntas frequentes"
          subtitle="Veja respostas para dúvidas comuns"
        />

        <SettingsRow
          icon="mail"
          title="Falar com suporte"
          subtitle="Entre em contato com a equipe"
        />

        <SettingsRow
          icon="alert-circle"
          title="Reportar problema"
          subtitle="Informe erros ou dificuldades no app"
          showDivider={false}
        />
      </SettingsGroup>
    </ConfigScreen>
  );
}