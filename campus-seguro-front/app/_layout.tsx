import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { appTheme } from "../constants/theme";
import { AuthProvider } from "../contexts/AuthContext";
import { CampusSeguroProvider } from "../contexts/CampusSeguroContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={appTheme}>
        <AuthProvider>
          <CampusSeguroProvider>
            <View style={styles.root}>
              <StatusBar style="light" backgroundColor={appTheme.colors.background} />
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "none",
                  contentStyle: {
                    backgroundColor: appTheme.colors.background,
                  },
                }}
              />
            </View>
          </CampusSeguroProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
});