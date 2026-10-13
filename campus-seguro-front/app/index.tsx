import { Redirect } from "expo-router";
import { View } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function Index() {
  const { autenticado, carregando } = useAuth();

  // Enquanto restaura a sessão salva, não redireciona (evita "piscar" a tela)
  if (carregando) {
    return <View style={{ flex: 1, backgroundColor: "#0B1020" }} />;
  }

  return <Redirect href={autenticado ? "/home/home" : "/auth"} />;
}
