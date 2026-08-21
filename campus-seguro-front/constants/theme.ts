import { DarkTheme } from "@react-navigation/native";

export const appTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0B1020",
    card: "#111827",
    text: "#f8fafc",
    border: "#1f2937",
    primary: "#2563eb",
    notification: "#2563eb",
  },
};

export const tokens = {
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 12,
    md: 16,
    lg: 24,
    lx: 32,
    lg_md: 40,
    pill: 999,
  },
  fontSize: {
    sm: 13,
    md: 16,
    lg: 20,
    xl: 36,
  },
};