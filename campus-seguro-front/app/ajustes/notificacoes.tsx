import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    ConfigScreen,
    FeedbackModal,
    PrimaryButton,
    SectionTitle,
    SettingsGroup,
    ToggleRow,
} from "../../components/configuracoes/ConfigTelaBase";

type Canal = "email" | "sms" | "push";

export default function NotificacoesScreen() {
  const [alertas, setAlertas] = useState(true);
  const [ocorrencias, setOcorrencias] = useState(true);
  const [sons, setSons] = useState(false);
  const [canal, setCanal] = useState<Canal>("push");

  const [popupSucesso, setPopupSucesso] = useState(false);
  const [popupFalha, setPopupFalha] = useState(false);

  function salvarNotificacoes() {
    if (!alertas && !ocorrencias && !sons) {
      setPopupFalha(true);
      return;
    }

    setPopupSucesso(true);
  }

  return (
    <ConfigScreen
      title="Notificações"
      subtitle="Personalize alertas e comunicações do app."
    >
      <SectionTitle>PREFERÊNCIAS DE NOTIFICAÇÕES</SectionTitle>

      <SettingsGroup>
        <ToggleRow
          icon="bell"
          title="Alertas"
          subtitle="Receba alertas críticos e importantes."
          value={alertas}
          onValueChange={setAlertas}
        />

        <ToggleRow
          icon="refresh-cw"
          title="Atualizações de ocorrência"
          subtitle="Seja informado sobre novas ocorrências."
          value={ocorrencias}
          onValueChange={setOcorrencias}
        />

        <ToggleRow
          icon="volume-2"
          title="Sons"
          subtitle="Reproduzir sons nas notificações."
          value={sons}
          onValueChange={setSons}
          showDivider={false}
        />
      </SettingsGroup>

      <SectionTitle>CANAL DE NOTIFICAÇÃO</SectionTitle>

      <View style={styles.channelCard}>
        <View style={styles.channelIcon}>
          <Feather name="mail" size={23} color="#A9B8FF" />
        </View>

        <View style={styles.channelTextArea}>
          <Text style={styles.channelTitle}>Canal</Text>
          <Text style={styles.channelSubtitle}>
            Escolha como deseja receber suas notificações.
          </Text>
        </View>

        <View style={styles.segmented}>
          <SegmentButton
            label="e-mail"
            active={canal === "email"}
            onPress={() => setCanal("email")}
          />

          <SegmentButton
            label="SMS"
            active={canal === "sms"}
            onPress={() => setCanal("sms")}
          />

          <SegmentButton
            label="push"
            active={canal === "push"}
            onPress={() => setCanal("push")}
          />
        </View>
      </View>

      <PrimaryButton label="Salvar" onPress={salvarNotificacoes} />

      <FeedbackModal
        visible={popupSucesso}
        variant="success"
        title="Preferências salvas"
        message="Suas configurações de notificação foram atualizadas com sucesso."
        primaryLabel="OK"
        onPrimaryPress={() => setPopupSucesso(false)}
      />

      <FeedbackModal
        visible={popupFalha}
        variant="error"
        title="Falha ao salvar"
        message="Ative pelo menos uma opção de notificação antes de salvar."
        primaryLabel="Corrigir"
        onPrimaryPress={() => setPopupFalha(false)}
      />
    </ConfigScreen>
  );
}

function SegmentButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.segmentButton, active && styles.segmentButtonActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  channelCard: {
    backgroundColor: "rgba(25, 33, 52, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(94, 111, 145, 0.32)",
    borderRadius: 28,
    padding: 18,
    marginBottom: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  channelIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(102, 124, 180, 0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  channelTextArea: {
    flex: 1,
    minWidth: 0,
  },

  channelTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  channelSubtitle: {
    marginTop: 5,
    color: "#B8BFCE",
    fontSize: 13,
    lineHeight: 18,
  },

  segmented: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "rgba(169, 184, 255, 0.28)",
    borderRadius: 16,
    overflow: "hidden",
  },

  segmentButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(9, 14, 28, 0.4)",
  },

  segmentButtonActive: {
    backgroundColor: "#3978FF",
  },

  segmentText: {
    color: "#D8DDEF",
    fontSize: 13,
    fontWeight: "700",
  },

  segmentTextActive: {
    color: "#FFFFFF",
  },
});