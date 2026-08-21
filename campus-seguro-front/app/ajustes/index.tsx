import { Tabs } from "@/components/navegacao/Tabs";
import { useRouter } from "expo-router";
import { StatusBar, View } from "react-native";
import {
  ConfigScreen,
  SectionTitle,
  SettingsGroup,
  SettingsRow,
} from "../../components/configuracoes/ConfigTelaBase";

export default function AjustesScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#070B16" }}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ConfigScreen
        title="Ajustes"
        subtitle="Gerencie sua segurança e preferências do sistema."
        backTo="/home/home"
        showBackButton={false}
      >
        <SectionTitle>CONTA E SEGURANÇA</SectionTitle>

        <SettingsGroup>
          <SettingsRow
            icon="user"
            title="Perfil"
            subtitle="Dados pessoais e acadêmicos"
            onPress={() => router.push("/ajustes/perfil" as any)}
          />

          <SettingsRow
            icon="shield"
            title="Segurança"
            subtitle="Senha, biometria e autenticação"
            showDivider={false}
            onPress={() => router.push("/ajustes/seguranca" as any)}
          />
        </SettingsGroup>

        <SectionTitle>PRIVACIDADE E APP</SectionTitle>

        <SettingsGroup>
          <SettingsRow
            icon="map-pin"
            title="Localização"
            subtitle="Permissões e compartilhamento de localização"
            onPress={() => router.push("/ajustes/localizacao" as any)}
          />

          <SettingsRow
            icon="bell"
            title="Notificações"
            subtitle="Alertas, avisos e atualizações"
            onPress={() => router.push("/ajustes/notificacoes" as any)}
          />

          <SettingsRow
            icon="smartphone"
            title="Dispositivo"
            subtitle="Informações e vínculo do aparelho"
            showDivider={false}
            onPress={() => router.push("/ajustes/dispositivo" as any)}
          />
        </SettingsGroup>

        <SectionTitle>SUPORTE</SectionTitle>

        <SettingsGroup>
          <SettingsRow
            icon="help-circle"
            title="Ajuda"
            subtitle="Central de suporte e dúvidas frequentes"
            onPress={() => router.push("/ajustes/ajuda" as any)}
          />

          <SettingsRow
            icon="file-text"
            title="Termos e privacidade"
            subtitle="Políticas de uso do Campus Seguro"
            showDivider={false}
            onPress={() => router.push("/ajustes/termos" as any)}
          />
        </SettingsGroup>
      </ConfigScreen>

      <Tabs activeTab="ajustes" />
    </View>
  );
}