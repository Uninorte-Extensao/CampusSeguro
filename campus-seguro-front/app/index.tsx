import { Redirect } from "expo-router";
import { View } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function Index() {
  const { autenticado, carregando, usuario } = useAuth();

  // Enquanto restaura a sessão salva, não redireciona (evita "piscar" a tela)
  if (carregando) {
    return <View style={{ flex: 1, backgroundColor: "#0B1020" }} />;
  }

  if (!autenticado) return <Redirect href="/auth" />;

  // Administrador cai direto no painel de denúncias
  return (
    <Redirect
      href={usuario?.tipo_perfil === "ADMINISTRADOR" ? "/admin" : "/home/home"}
    />
  );
}
