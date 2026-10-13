import { Tabs } from "@/components/navegacao/Tabs";
import { useRouter } from "expo-router";
import { Alert, Platform, StatusBar, View } from "react-native";
import {
  ConfigScreen,
  SectionTitle,
  SettingsGroup,
  SettingsRow,
} from "../../components/configuracoes/ConfigTelaBase";
import { useAuth } from "../../contexts/AuthContext";

// Confirmação que funciona na web E no nativo.
// (No react-native-web o Alert.alert não dispara o onPress dos botões.)
function confirmar(titulo: string, mensagem: string): Promise<boolean> {
  if (Platform.OS === "web") {
    const ok =
      typeof window !== "undefined" && typeof window.confirm === "function"
        ? window.confirm(`${titulo}\n\n${mensagem}`)
        : true;
    return Promise.resolve(ok);
  }

  return new Promise((resolve) => {
    Alert.alert(titulo, mensagem, [
      { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
      { text: "Sair", style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}

export default function AjustesScreen() {
  const router = useRouter();
  const { sair } = useAuth();

  async function handleSair() {
    const confirmado = await confirmar(
      "Sair da conta",
      "Deseja encerrar a sessão?"
    );
    if (!confirmado) return;

    await sair();
    router.replace("/auth/login");
  }

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

        <SectionTitle>SESSÃO</SectionTitle>

        <SettingsGroup>
          <SettingsRow
            icon="log-out"
            title="Sair da conta"
            subtitle="Encerrar sessão neste dispositivo"
            showDivider={false}
            onPress={handleSair}
          />
        </SettingsGroup>
      </ConfigScreen>

      <Tabs activeTab="ajustes" />
    </View>
  );
}