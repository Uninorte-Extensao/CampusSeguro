import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type Tab = "inicio" | "notificacoes" | "ajustes";

type Props = {
  activeTab: Tab;
};

const TAB_ROUTES: Record<Tab, string> = {
  inicio: "/home/home",
  notificacoes: "/notificacoes",
  ajustes: "/ajustes",
};

const TABS: {
  id: Tab;
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
}[] = [
  { id: "inicio", icon: "home", label: "HOME" },
  { id: "notificacoes", icon: "bell", label: "NOTIFICAÇÕES" },
  { id: "ajustes", icon: "settings", label: "AJUSTES" },
];

export function Tabs({ activeTab }: Props) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isSmallScreen = width < 360;
  const isLargeScreen = width >= 768;

  const iconSize = isSmallScreen ? 18 : 21;
  const activeButtonSize = isSmallScreen ? 58 : 66;
  const labelSize = isSmallScreen ? 8 : 9.5;
  const navHeight = isSmallScreen ? 86 : 96;

  function handlePress(tab: Tab) {
    if (tab === activeTab) return;

    router.replace(TAB_ROUTES[tab] as any);
  }

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.bottomNavWrapper,
        {
          bottom: Math.max(insets.bottom, 8),
          paddingHorizontal: isSmallScreen ? 8 : 14,
        },
      ]}
    >
      <View
        style={[
          styles.bottomNav,
          {
            height: navHeight,
            maxWidth: isLargeScreen ? 460 : "100%",
          },
        ]}
      >
        {TABS.map(({ id, icon, label }) => {
          const isActive = activeTab === id;

          return (
            <TouchableOpacity
              key={id}
              style={styles.navItem}
              onPress={() => handlePress(id)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.navIconWrapper,
                  isActive && {
                    width: activeButtonSize,
                    height: activeButtonSize,
                  },
                  isActive && styles.navIconActive,
                ]}
              >
                <Feather
                  name={icon}
                  size={iconSize}
                  color={isActive ? "#FFFFFF" : "#8D90A1"}
                />

                {isActive && (
                  <Text
                    numberOfLines={1}
                    style={[styles.activeLabel, { fontSize: labelSize }]}
                  >
                    {label}
                  </Text>
                )}
              </View>

              {!isActive && (
                <Text
                  numberOfLines={1}
                  style={[styles.navLabel, { fontSize: labelSize }]}
                >
                  {label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },

  bottomNav: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#232A3D",
    borderRadius: 28,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    minWidth: 0,
  },

  navIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconActive: {
    backgroundColor: "#5B7CFA",
    shadowColor: "#5B7CFA",
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },

  navLabel: {
    fontWeight: "600",
    color: "#8D90A1",
    letterSpacing: 0.8,
    maxWidth: "100%",
  },

  activeLabel: {
    marginTop: 4,
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.7,
  },
});