import { Redirect, Stack } from "expo-router";
import { View } from "react-native";
import { AdminProvider } from "../../contexts/AdminContext";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Área do Administrador. Só entra quem tem perfil ADMINISTRADOR
 * (o backend também bloqueia as rotas com 403).
 */
export default function AdminLayout() {
  const { autenticado, carregando, usuario } = useAuth();

  if (carregando) {
    return <View style={{ flex: 1, backgroundColor: "#0B1020" }} />;
  }

  if (!autenticado) return <Redirect href="/auth/login" />;
  if (usuario?.tipo_perfil !== "ADMINISTRADOR") return <Redirect href="/home/home" />;

  return (
    <AdminProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
          contentStyle: { backgroundColor: "#0B1020" },
        }}
      />
    </AdminProvider>
  );
}
