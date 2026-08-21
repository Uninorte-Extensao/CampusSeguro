import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    GestureResponderEvent,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

export const reportColors = {
  background: "#08111F",
  card: "#101B2F",
  cardSoft: "#14243D",
  border: "rgba(148, 163, 184, 0.16)",
  text: "#F8FAFC",
  muted: "#94A3B8",
  muted2: "#64748B",
  primary: "#38BDF8",
  primarySoft: "rgba(56, 189, 248, 0.14)",
  success: "#86EFAC",
  warning: "#FACC15",
  danger: "#FB7185",
  white: "#FFFFFF",
};

export const REPORT_STEPS = [
  {
    key: "etapa1",
    label: "Relato",
    description: "Descreva o ocorrido",
    icon: "edit-3",
  },
  {
    key: "analise",
    label: "Análise",
    description: "Revisão inicial",
    icon: "cpu",
  },
  {
    key: "etapa3",
    label: "Classificação",
    description: "Dados da denúncia",
    icon: "list",
  },
  {
    key: "etapa4",
    label: "Evidências",
    description: "Anexos e provas",
    icon: "paperclip",
  },
  {
    key: "etapa5",
    label: "Revisão",
    description: "Confirmação final",
    icon: "check-square",
  },
] as const;

export type ReportStepKey = (typeof REPORT_STEPS)[number]["key"];

type ReportScreenProps = {
  children: React.ReactNode;
};

export function ReportScreen({ children }: ReportScreenProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

type ReportStepperProps = {
  currentStep: ReportStepKey;
};

export function ReportStepper({ currentStep }: ReportStepperProps) {
  const { width } = useWindowDimensions();

  const currentIndex = Math.max(
    REPORT_STEPS.findIndex((step) => step.key === currentStep),
    0
  );

  const totalSteps = REPORT_STEPS.length;
  const currentNumber = currentIndex + 1;
  const currentStepInfo = REPORT_STEPS[currentIndex];

  const progressPercent =
    totalSteps <= 1 ? 100 : (currentIndex / (totalSteps - 1)) * 100;

  const isCompact = width < 390;

  return (
    <View style={styles.stepperContainer}>
      <LinearGradient
        colors={["#13213B", "#0D172B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.stepperCard}
      >
        <View style={styles.stepperHeader}>
          <View style={styles.stepperTitleArea}>
            <Text style={styles.stepperEyebrow}>
              PASSO {currentNumber} DE {totalSteps}
            </Text>

            <Text style={styles.stepperTitle}>Relatório de denúncia</Text>

            <Text style={styles.stepperSubtitle}>
              Siga as etapas para registrar sua denúncia com segurança.
            </Text>
          </View>

          <View style={styles.currentIconBox}>
            <Feather
              name={currentStepInfo.icon as FeatherIconName}
              size={22}
              color={reportColors.primary}
            />
          </View>
        </View>

        <View style={styles.currentStepBox}>
          <Text style={styles.currentStepLabel}>Etapa atual</Text>
          <Text style={styles.currentStepTitle}>{currentStepInfo.label}</Text>
          <Text style={styles.currentStepDescription}>
            {currentStepInfo.description}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercent}%`,
              },
            ]}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.stepsRow,
            isCompact && styles.stepsRowCompact,
          ]}
        >
          {REPORT_STEPS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <View
                key={step.key}
                style={[
                  styles.stepItem,
                  isActive && styles.stepItemActive,
                  isCompleted && styles.stepItemCompleted,
                  isPending && styles.stepItemPending,
                ]}
              >
                <View
                  style={[
                    styles.stepCircle,
                    isActive && styles.stepCircleActive,
                    isCompleted && styles.stepCircleCompleted,
                    isPending && styles.stepCirclePending,
                  ]}
                >
                  {isCompleted ? (
                    <Feather name="check" size={13} color="#06121F" />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        isActive && styles.stepNumberActive,
                        isPending && styles.stepNumberPending,
                      ]}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>

                <View style={styles.stepTextArea}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.stepLabel,
                      isActive && styles.stepLabelActive,
                      isPending && styles.stepLabelPending,
                    ]}
                  >
                    {step.label}
                  </Text>

                  {!isCompact && (
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.stepDescription,
                        isActive && styles.stepDescriptionActive,
                      ]}
                    >
                      {step.description}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

type GlassCardProps = {
  children: React.ReactNode;
  style?: object;
};

export function GlassCard({ children, style }: GlassCardProps) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <View style={styles.sectionTitleBox}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

type GradientButtonProps = {
  title: string;
  icon?: FeatherIconName;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
};

export function GradientButton({
  title,
  icon = "arrow-right",
  onPress,
  disabled = false,
}: GradientButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      disabled={disabled}
      style={[styles.gradientButtonWrapper, disabled && styles.disabledButton]}
    >
      <LinearGradient
        colors={disabled ? ["#334155", "#1E293B"] : ["#38BDF8", "#2563EB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientButton}
      >
        <Text style={styles.gradientButtonText}>{title}</Text>
        <Feather name={icon} size={18} color="#FFFFFF" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

type SecondaryButtonProps = {
  title: string;
  icon?: FeatherIconName;
  onPress: (event: GestureResponderEvent) => void;
};

export function SecondaryButton({
  title,
  icon = "arrow-left",
  onPress,
}: SecondaryButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={styles.secondaryButton}
    >
      <Feather name={icon} size={17} color={reportColors.primary} />
      <Text style={styles.secondaryButtonText}>{title}</Text>
    </TouchableOpacity>
  );
}

type OptionCardProps = {
  title: string;
  subtitle?: string;
  icon: FeatherIconName;
  selected?: boolean;
  onPress: () => void;
};

export function OptionCard({
  title,
  subtitle,
  icon,
  selected = false,
  onPress,
}: OptionCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={[styles.optionCard, selected && styles.optionCardSelected]}
    >
      <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
        <Feather
          name={icon}
          size={20}
          color={selected ? "#06121F" : reportColors.primary}
        />
      </View>

      <View style={styles.optionTextArea}>
        <Text style={[styles.optionTitle, selected && styles.optionTitleActive]}>
          {title}
        </Text>

        {subtitle ? (
          <Text style={styles.optionSubtitle}>{subtitle}</Text>
        ) : null}
      </View>

      {selected ? (
        <Feather name="check-circle" size={20} color={reportColors.success} />
      ) : null}
    </TouchableOpacity>
  );
}

type EvidenceTileProps = {
  title: string;
  subtitle: string;
  icon: FeatherIconName;
  onPress: () => void;
};

export function EvidenceTile({
  title,
  subtitle,
  icon,
  onPress,
}: EvidenceTileProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={styles.evidenceTile}
    >
      <View style={styles.evidenceIconBox}>
        <Feather name={icon} size={21} color={reportColors.primary} />
      </View>

      <Text style={styles.evidenceTitle}>{title}</Text>
      <Text style={styles.evidenceSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: reportColors.background,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 150,
  },

  stepperContainer: {
    width: "100%",
    marginBottom: 18,
  },

  stepperCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(103, 232, 249, 0.16)",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 8,
  },

  stepperHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
  },

  stepperTitleArea: {
    flex: 1,
  },

  stepperEyebrow: {
    color: reportColors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 7,
  },

  stepperTitle: {
    color: reportColors.text,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  stepperSubtitle: {
    color: reportColors.muted,
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: 6,
    maxWidth: 310,
  },

  currentIconBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: reportColors.primarySoft,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.24)",
    alignItems: "center",
    justifyContent: "center",
  },

  currentStepBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
  },

  currentStepLabel: {
    color: reportColors.muted2,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  currentStepTitle: {
    color: "#E2E8F0",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 4,
  },

  currentStepDescription: {
    color: reportColors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },

  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(148, 163, 184, 0.18)",
    overflow: "hidden",
    marginTop: 18,
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: reportColors.primary,
  },

  stepsRow: {
    gap: 10,
    paddingTop: 16,
    paddingBottom: 2,
  },

  stepsRowCompact: {
    gap: 8,
  },

  stepItem: {
    minWidth: 136,
    maxWidth: 168,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 11,
    borderWidth: 1,
  },

  stepItemActive: {
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    borderColor: "rgba(56, 189, 248, 0.34)",
  },

  stepItemCompleted: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderColor: "rgba(34, 197, 94, 0.24)",
  },

  stepItemPending: {
    backgroundColor: "rgba(15, 23, 42, 0.46)",
    borderColor: "rgba(148, 163, 184, 0.12)",
  },

  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  stepCircleActive: {
    backgroundColor: reportColors.primary,
    borderColor: reportColors.primary,
  },

  stepCircleCompleted: {
    backgroundColor: reportColors.success,
    borderColor: reportColors.success,
  },

  stepCirclePending: {
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderColor: "rgba(148, 163, 184, 0.28)",
  },

  stepNumber: {
    fontSize: 12,
    fontWeight: "900",
  },

  stepNumberActive: {
    color: "#06121F",
  },

  stepNumberPending: {
    color: reportColors.muted,
  },

  stepTextArea: {
    flex: 1,
    minWidth: 0,
  },

  stepLabel: {
    fontSize: 13,
    fontWeight: "900",
  },

  stepLabelActive: {
    color: "#E0F2FE",
  },

  stepLabelPending: {
    color: reportColors.muted,
  },

  stepDescription: {
    color: reportColors.muted2,
    fontSize: 11.5,
    marginTop: 2,
  },

  stepDescriptionActive: {
    color: "#A5F3FC",
  },

  glassCard: {
    backgroundColor: reportColors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: reportColors.border,
    marginBottom: 16,
  },

  sectionTitleBox: {
    marginBottom: 14,
  },

  sectionTitle: {
    color: reportColors.text,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  sectionSubtitle: {
    color: reportColors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },

  gradientButtonWrapper: {
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 6,
  },

  gradientButton: {
    minHeight: 56,
    borderRadius: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  gradientButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.6,
  },

  secondaryButton: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.24)",
    backgroundColor: "rgba(56, 189, 248, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 10,
  },

  secondaryButtonText: {
    color: reportColors.primary,
    fontSize: 14,
    fontWeight: "900",
  },

  optionCard: {
    minHeight: 74,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: reportColors.border,
    backgroundColor: reportColors.cardSoft,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },

  optionCardSelected: {
    borderColor: "rgba(56, 189, 248, 0.56)",
    backgroundColor: "rgba(56, 189, 248, 0.12)",
  },

  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.18)",
  },

  optionIconSelected: {
    backgroundColor: reportColors.primary,
    borderColor: reportColors.primary,
  },

  optionTextArea: {
    flex: 1,
  },

  optionTitle: {
    color: reportColors.text,
    fontSize: 15,
    fontWeight: "900",
  },

  optionTitleActive: {
    color: "#E0F2FE",
  },

  optionSubtitle: {
    color: reportColors.muted,
    fontSize: 12.8,
    lineHeight: 18,
    marginTop: 3,
  },

  evidenceTile: {
    width: "48%",
    minHeight: 132,
    borderRadius: 20,
    backgroundColor: reportColors.cardSoft,
    borderWidth: 1,
    borderColor: reportColors.border,
    padding: 14,
    marginBottom: 12,
  },

  evidenceIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: reportColors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  evidenceTitle: {
    color: reportColors.text,
    fontSize: 14,
    fontWeight: "900",
  },

  evidenceSubtitle: {
    color: reportColors.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
});