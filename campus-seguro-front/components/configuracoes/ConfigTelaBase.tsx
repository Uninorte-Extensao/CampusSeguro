import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ReactNode } from "react";
import {
  KeyboardTypeOptions,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type FeatherIcon = React.ComponentProps<typeof Feather>["name"];
type FeedbackVariant = "success" | "error" | "warning" | "info";

type ConfigScreenProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  backTo?: string;
  showBackButton?: boolean;
};

type SettingsRowProps = {
  icon?: FeatherIcon;
  customIcon?: ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  onPress?: () => void;
  showDivider?: boolean;
  showChevron?: boolean;
};

type ToggleRowProps = {
  icon?: FeatherIcon;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  showDivider?: boolean;
};

type InputFieldProps = {
  label: string;
  icon: FeatherIcon;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  rightElement?: ReactNode;
};

type FeedbackModalProps = {
  visible: boolean;
  variant?: FeedbackVariant;
  title: string;
  message: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
};

export function ConfigScreen({
  title,
  subtitle,
  children,
  backTo = "/home/home",
  showBackButton = true,
}: ConfigScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
    function handleBack() {
    if (router.canGoBack()) {
        router.back();
        return;
    }

    router.replace(backTo as any);
    }
  const isLargeScreen = width >= 768;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: Math.max(insets.bottom, 0) + 140,
              maxWidth: isLargeScreen ? 520 : "100%",
            },
          ]}
        >
          <View style={styles.topBar}>
            {showBackButton ? (
            <TouchableOpacity
                style={styles.topIconButton}
                onPress={handleBack}
                activeOpacity={0.7}
            >
                <Feather name="arrow-left" size={26} color="#3978FF" />
            </TouchableOpacity>
            ) : (
            <View style={styles.topIconButton} />
            )}

            <View style={styles.topRight}>
              <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
                <Feather name="bell" size={22} color="#3978FF" />
                <View style={styles.bellDot} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.avatarSmall} activeOpacity={0.7}>
                <Feather name="user" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          {children}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function SettingsGroup({ children }: { children: ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

export function SettingsRow({
  icon,
  customIcon,
  title,
  subtitle,
  badge,
  onPress,
  showDivider = true,
  showChevron = true,
}: SettingsRowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, showDivider && styles.rowDivider]}
      onPress={onPress}
      activeOpacity={onPress ? 0.72 : 1}
      disabled={!onPress}
    >
      <View style={styles.rowIcon}>
        {customIcon ? (
          customIcon
        ) : icon ? (
          <Feather name={icon} size={23} color="#A9B8FF" />
        ) : null}
      </View>

      <View style={styles.rowTextArea}>
        <Text style={styles.rowTitle}>{title}</Text>

        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>

      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}

      {showChevron && <Feather name="chevron-right" size={23} color="#6E7488" />}
    </TouchableOpacity>
  );
}

export function ToggleRow({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  showDivider = true,
}: ToggleRowProps) {
  return (
    <View style={[styles.row, showDivider && styles.rowDivider]}>
      {icon && (
        <View style={styles.rowIcon}>
          <Feather name={icon} size={23} color="#A9B8FF" />
        </View>
      )}

      <View style={styles.rowTextArea}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#3A4052", true: "#3978FF" }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#3A4052"
        style={styles.switch}
      />
    </View>
  );
}

export function InputField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
  rightElement,
}: InputFieldProps) {
  return (
    <View style={styles.inputBlock}>
      <Text style={styles.inputLabel}>{label}</Text>

      <View style={styles.inputBox}>
        <Feather name={icon} size={21} color="#A9B8FF" />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#6E7488"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          style={styles.input}
        />

        {rightElement}
      </View>
    </View>
  );
}

export function PrimaryButton({
  label,
  icon = "save",
  onPress,
}: {
  label: string;
  icon?: FeatherIcon;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.primaryButton}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <Feather name={icon} size={21} color="#FFFFFF" />
      <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function WarningCard({
  title = "Atenção",
  text,
}: {
  title?: string;
  text: string;
}) {
  return (
    <View style={styles.warningCard}>
      <Feather name="alert-triangle" size={34} color="#FDBA4B" />

      <View style={styles.warningTextArea}>
        <Text style={styles.warningTitle}>{title}</Text>
        <Text style={styles.warningText}>{text}</Text>
      </View>
    </View>
  );
}

export function InfoText({ children }: { children: ReactNode }) {
  return (
    <View style={styles.infoRow}>
      <Feather name="info" size={18} color="#3978FF" />
      <Text style={styles.infoText}>{children}</Text>
    </View>
  );
}

export function FeedbackModal({
  visible,
  variant = "success",
  title,
  message,
  primaryLabel = "OK",
  secondaryLabel,
  onPrimaryPress,
  onSecondaryPress,
}: FeedbackModalProps) {
  const config = {
    success: {
      icon: "check-circle" as const,
      color: "#25D0CF",
      bg: "rgba(37, 208, 207, 0.14)",
      border: "rgba(37, 208, 207, 0.45)",
    },
    error: {
      icon: "x-circle" as const,
      color: "#FB7185",
      bg: "rgba(251, 113, 133, 0.12)",
      border: "rgba(251, 113, 133, 0.42)",
    },
    warning: {
      icon: "alert-triangle" as const,
      color: "#FDBA4B",
      bg: "rgba(253, 186, 75, 0.12)",
      border: "rgba(253, 186, 75, 0.42)",
    },
    info: {
      icon: "info" as const,
      color: "#3978FF",
      bg: "rgba(57, 120, 255, 0.13)",
      border: "rgba(57, 120, 255, 0.42)",
    },
  }[variant];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onPrimaryPress}
    >
      <View style={styles.feedbackOverlay}>
        <View style={styles.feedbackCard}>
          <View
            style={[
              styles.feedbackIconCircle,
              {
                backgroundColor: config.bg,
                borderColor: config.border,
              },
            ]}
          >
            <Feather name={config.icon} size={46} color={config.color} />
          </View>

          <Text style={styles.feedbackTitle}>{title}</Text>
          <Text style={styles.feedbackMessage}>{message}</Text>

          <View style={styles.feedbackActions}>
            {secondaryLabel && onSecondaryPress && (
              <TouchableOpacity
                style={styles.feedbackSecondaryButton}
                onPress={onSecondaryPress}
                activeOpacity={0.75}
              >
                <Text style={styles.feedbackSecondaryText}>
                  {secondaryLabel}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.feedbackPrimaryButton,
                { backgroundColor: config.color },
              ]}
              onPress={onPrimaryPress}
              activeOpacity={0.75}
            >
              <Text style={styles.feedbackPrimaryText}>{primaryLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#070B16",
  },

  screen: {
    flex: 1,
    backgroundColor: "#070B16",
    position: "relative",
    overflow: "hidden",
  },

  glowTop: {
    position: "absolute",
    top: -120,
    right: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(57, 120, 255, 0.18)",
  },

  glowBottom: {
    position: "absolute",
    bottom: -140,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(32, 211, 204, 0.09)",
  },

  scrollContent: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
  },

  topBar: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  topIconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },

  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  bellButton: {
    width: 36,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  bellDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#3978FF",
    marginTop: 2,
    shadowColor: "#3978FF",
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },

  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#B9E4D1",
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    marginTop: 32,
    marginBottom: 28,
  },

  title: {
    fontSize: 42,
    lineHeight: 48,
    color: "#F4F7FF",
    fontWeight: "900",
    letterSpacing: -1,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 17,
    lineHeight: 26,
    color: "#C6CBD8",
    fontWeight: "400",
  },

  sectionTitle: {
    marginTop: 8,
    marginBottom: 12,
    color: "#25D0CF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 3,
  },

  group: {
    backgroundColor: "rgba(25, 33, 52, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(94, 111, 145, 0.32)",
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 28,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },

  row: {
    minHeight: 88,
    paddingHorizontal: 18,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.07)",
  },

  rowIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(102, 124, 180, 0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  rowTextArea: {
    flex: 1,
    minWidth: 0,
  },

  rowTitle: {
    color: "#F4F7FF",
    fontSize: 18,
    fontWeight: "800",
  },

  rowSubtitle: {
    marginTop: 4,
    color: "#B8BFCE",
    fontSize: 13,
    lineHeight: 18,
  },

  badge: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(37, 208, 207, 0.24)",
  },

  badgeText: {
    color: "#25D0CF",
    fontSize: 11,
    fontWeight: "900",
  },

  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },

  inputBlock: {
    marginBottom: 18,
  },

  inputLabel: {
    marginBottom: 8,
    color: "#C6CBD8",
    fontSize: 15,
    fontWeight: "700",
  },

  inputBox: {
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(169, 184, 255, 0.25)",
    backgroundColor: "rgba(9, 14, 28, 0.55)",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "500",
    paddingVertical: 12,
  },

  primaryButton: {
    minHeight: 62,
    borderRadius: 22,
    backgroundColor: "#3978FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 10,
    shadowColor: "#3978FF",
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  warningCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(253, 186, 75, 0.5)",
    backgroundColor: "rgba(253, 186, 75, 0.08)",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginBottom: 24,
  },

  warningTextArea: {
    flex: 1,
  },

  warningTitle: {
    color: "#FDBA4B",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
  },

  warningText: {
    color: "#C6CBD8",
    fontSize: 15,
    lineHeight: 22,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 4,
  },

  infoText: {
    flex: 1,
    color: "#C6CBD8",
    fontSize: 16,
    lineHeight: 24,
  },

  feedbackOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.76)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  feedbackCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 30,
    padding: 26,
    backgroundColor: "#121A2D",
    borderWidth: 1,
    borderColor: "rgba(169, 184, 255, 0.22)",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 16,
  },

  feedbackIconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  feedbackTitle: {
    color: "#F4F7FF",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 10,
  },

  feedbackMessage: {
    color: "#C6CBD8",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },

  feedbackActions: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },

  feedbackPrimaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  feedbackPrimaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  feedbackSecondaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  feedbackSecondaryText: {
    color: "#D8DDEF",
    fontSize: 15,
    fontWeight: "800",
  },
});