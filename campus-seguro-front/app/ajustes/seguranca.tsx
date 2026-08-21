import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    ConfigScreen,
    FeedbackModal,
    InputField,
    PrimaryButton,
    SettingsGroup,
    SettingsRow,
} from "../../components/configuracoes/ConfigTelaBase";

function PasswordField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <InputField
      label={label}
      icon="lock"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={!visible}
      rightElement={
        <TouchableOpacity
          onPress={() => setVisible(!visible)}
          activeOpacity={0.7}
        >
          <Feather
            name={visible ? "eye-off" : "eye"}
            size={21}
            color="#A9B8FF"
          />
        </TouchableOpacity>
      }
    />
  );
}

export default function SegurancaScreen() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [popupSucesso, setPopupSucesso] = useState(false);
  const [popupFalha, setPopupFalha] = useState(false);

  function salvarNovaSenha() {
    const camposVazios = !senhaAtual || !novaSenha || !confirmarSenha;
    const senhasDiferentes = novaSenha !== confirmarSenha;
    const senhaFraca = novaSenha.length < 6;

    if (camposVazios || senhasDiferentes || senhaFraca) {
      setPopupFalha(true);
      return;
    }

    setPopupSucesso(true);
  }

  return (
    <ConfigScreen
      title="Segurança"
      subtitle="Atualize sua senha e proteção da conta."
    >
      <View style={styles.card}>
        <PasswordField
          label="Senha atual"
          value={senhaAtual}
          onChangeText={setSenhaAtual}
        />

        <PasswordField
          label="Nova senha"
          value={novaSenha}
          onChangeText={setNovaSenha}
        />

        <View style={styles.strengthArea}>
          <View style={styles.strengthLabel}>
            <Feather name="shield" size={18} color="#25D0CF" />
            <Text style={styles.strengthText}>
              {novaSenha.length >= 6 ? "Forte" : "Senha fraca"}
            </Text>
          </View>

          <View style={styles.strengthBars}>
            <View
              style={[
                styles.strengthBar,
                novaSenha.length >= 2 && styles.strengthBarActive,
              ]}
            />
            <View
              style={[
                styles.strengthBar,
                novaSenha.length >= 4 && styles.strengthBarActive,
              ]}
            />
            <View
              style={[
                styles.strengthBar,
                novaSenha.length >= 6 && styles.strengthBarActive,
              ]}
            />
            <View
              style={[
                styles.strengthBar,
                novaSenha.length >= 8 && styles.strengthBarActive,
              ]}
            />
          </View>
        </View>

        <PasswordField
          label="Confirmar senha"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />

        <SettingsGroup>
          <SettingsRow
            icon="shield"
            title="Biometria"
            subtitle="Login com impressão digital"
            badge="ATIVO"
          />

          <SettingsRow
            icon="lock"
            title="2FA"
            subtitle="Autenticação de dois fatores"
            badge="ATIVO"
            showDivider={false}
          />
        </SettingsGroup>

        <PrimaryButton label="Salvar nova senha" onPress={salvarNovaSenha} />
      </View>

      <FeedbackModal
        visible={popupSucesso}
        variant="success"
        title="Senha salva"
        message="Sua senha foi atualizada com sucesso."
        primaryLabel="OK"
        onPrimaryPress={() => setPopupSucesso(false)}
      />

      <FeedbackModal
        visible={popupFalha}
        variant="error"
        title="Falha ao salvar"
        message="Verifique se todos os campos foram preenchidos, se a nova senha tem pelo menos 6 caracteres e se a confirmação está igual."
        primaryLabel="Tentar novamente"
        onPrimaryPress={() => setPopupFalha(false)}
      />
    </ConfigScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(25, 33, 52, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(94, 111, 145, 0.32)",
    borderRadius: 30,
    padding: 24,
    marginBottom: 28,
  },

  strengthArea: {
    marginTop: -4,
    marginBottom: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },

  strengthLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  strengthText: {
    color: "#25D0CF",
    fontSize: 15,
    fontWeight: "800",
  },

  strengthBars: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 7,
  },

  strengthBar: {
    width: 38,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#3A4052",
  },

  strengthBarActive: {
    backgroundColor: "#25D0CF",
  },
});