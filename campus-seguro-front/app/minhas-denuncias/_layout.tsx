import { Redirect, Stack } from "expo-router";
import { View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function MinhasDenunciasLayout() {
  const { autenticado, carregando } = useAuth();
  if (carregando) return <View style={{ flex: 1, backgroundColor: "#0B1020" }} />;
  if (!autenticado) return <Redirect href="/auth/login" />;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#0B1020" },
      }}
    />
  );
}
