import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { Painel } from "../../components/admin/Graficos";
import { AdminShell } from "../../components/admin/Shell";
import { useAuth } from "../../contexts/AuthContext";
import { COR } from "../../utils/admin";

export default function ConfiguracoesScreen() {
  const router = useRouter();
  const { usuario } = useAuth();
  const { width } = useWindowDimensions();
  const largo = width >= 1100;

  return (
    <AdminShell secao="configuracoes" titulo="Configurações" subtitulo="Sua conta e políticas de acesso do painel">
      <View style={[{ gap: 20 }, largo && { flexDirection: "row", alignItems: "flex-start" }]}>
        <View style={{ flex: 1, gap: 20 }}>
          <Painel titulo="Sua conta" icone="user">
            <Linha rotulo="Nome" valor={usuario?.nome ?? "—"} />
            <Linha rotulo="E-mail" valor={usuario?.email ?? "—"} />
            <Linha rotulo="Perfil" valor="Administrador" />
          </Painel>

          <Painel titulo="Atalhos" icone="sliders">
            <Atalho icone="users" titulo="Gerenciar usuários e permissões" onPress={() => router.push("/admin/usuarios" as any)} />
            <Atalho icone="activity" titulo="Ver registro de atividades" onPress={() => router.push("/admin/atividades" as any)} />
          </Painel>
        </View>

        <Painel titulo="Políticas de acesso" icone="lock" style={{ flex: 1.4 }}>
          <Politica icone="clock" titulo="Expiração de sessão" texto="O login vale por 30 dias; depois é preciso entrar de novo." />
          <Politica icone="activity" titulo="Registro de atividades" texto="Logins, tentativas recusadas, mudanças de status, respostas e permissões ficam registrados." />
          <Politica icone="eye-off" titulo="Anonimato preservado" texto="Denúncias anônimas não guardam o autor, nem no registro de atividades." />
          <Politica icone="message-circle" titulo="Feedback só para identificados" texto="Somente denunciantes identificados recebem resposta individual sobre andamento e resolução." />
          <Politica icone="users" titulo="Permissões" texto="Somente administradores podem conceder ou remover acesso ao painel; ninguém remove o próprio acesso." />
        </Painel>
      </View>
    </AdminShell>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
      <Text style={s.textoMudo}>{rotulo}</Text>
      <Text style={s.valor}>{valor}</Text>
    </View>
  );
}

function Atalho({ icone, titulo, onPress }: { icone: React.ComponentProps<typeof Feather>["name"]; titulo: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.atalho} onPress={onPress} activeOpacity={0.8}>
      <Feather name={icone} size={15} color={COR.textoSec} />
      <Text style={s.atalhoTexto}>{titulo}</Text>
      <Feather name="chevron-right" size={15} color={COR.textoMudo} />
    </TouchableOpacity>
  );
}

function Politica({ icone, titulo, texto }: { icone: React.ComponentProps<typeof Feather>["name"]; titulo: string; texto: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      <View style={s.polIcone}>
        <Feather name={icone} size={14} color={COR.textoSec} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={s.polTitulo}>{titulo}</Text>
          <View style={s.ativoPill}>
            <Text style={s.ativoPillTexto}>ATIVA</Text>
          </View>
        </View>
        <Text style={s.textoMudo}>{texto}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  textoMudo: { color: COR.textoMudo, fontSize: 12.5, lineHeight: 18 },
  valor: { color: COR.texto, fontSize: 13.5, flexShrink: 1, textAlign: "right" },
  atalho: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: COR.superficie2, borderRadius: 10, padding: 12 },
  atalhoTexto: { color: COR.texto, fontSize: 13.5, fontWeight: "600", flex: 1 },
  polIcone: { width: 30, height: 30, borderRadius: 8, backgroundColor: COR.superficie2, alignItems: "center", justifyContent: "center" },
  polTitulo: { color: COR.texto, fontSize: 13.5, fontWeight: "800" },
  ativoPill: { backgroundColor: "#22C55E1F", borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1 },
  ativoPillTexto: { color: "#4ADE80", fontSize: 9.5, fontWeight: "900", letterSpacing: 0.5 },
});
