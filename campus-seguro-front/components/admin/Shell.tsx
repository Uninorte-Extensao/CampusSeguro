import { Feather } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { ReactNode, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAdmin } from "../../contexts/AdminContext";
import { useAuth } from "../../contexts/AuthContext";
import { confirmar, COR } from "../../utils/admin";

type IconeFeather = React.ComponentProps<typeof Feather>["name"];
export type SecaoAdmin = "dashboard" | "denuncias" | "usuarios" | "atividades" | "configuracoes";

const MENU: { chave: SecaoAdmin; label: string; icone: IconeFeather; rota: string }[] = [
  { chave: "dashboard", label: "Dashboard", icone: "home", rota: "/admin" },
  { chave: "denuncias", label: "Denúncias", icone: "file-text", rota: "/admin/denuncias" },
  { chave: "usuarios", label: "Usuários", icone: "users", rota: "/admin/usuarios" },
  { chave: "atividades", label: "Atividades", icone: "activity", rota: "/admin/atividades" },
  { chave: "configuracoes", label: "Configurações", icone: "settings", rota: "/admin/configuracoes" },
];

export function iniciais(nome?: string | null): string {
  const partes = (nome ?? "").trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "?";
  const sem = partes.filter((p) => !/^(diretor|diretora|dr|dra|prof|profa)\.?$/i.test(p));
  const usar = sem.length ? sem : partes;
  return ((usar[0]?.[0] ?? "") + (usar.length > 1 ? usar[usar.length - 1][0] : "")).toUpperCase();
}

/** Estrutura das telas do administrador: menu lateral + barra superior. */
export function AdminShell({
  secao,
  titulo,
  subtitulo,
  acoes,
  children,
}: {
  secao: SecaoAdmin;
  titulo: string;
  subtitulo?: string;
  acoes?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const { usuario, sair } = useAuth();
  const { ocorrencias, online, atualizadoEm } = useAdmin();

  const largo = width >= 960;
  const [recolhido, setRecolhido] = useState(false);
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const [menuUsuario, setMenuUsuario] = useState(false);

  const novas = ocorrencias.filter((o) => o.status === "ABERTO").length;

  function ir(rota: string) {
    setGavetaAberta(false);
    setMenuUsuario(false);
    if (pathname !== rota) router.push(rota as any);
  }

  async function handleSair() {
    setMenuUsuario(false);
    if (!(await confirmar("Sair da conta", "Deseja encerrar a sessão?", "Sair"))) return;
    await sair();
    router.replace("/auth/login");
  }

  const mostrarTexto = !largo || !recolhido;

  const sidebar = (
    <View style={[s.sidebar, largo && recolhido && { width: 76 }, !largo && s.gaveta]}>
      <View style={[s.logo, !mostrarTexto && { justifyContent: "center", paddingHorizontal: 0 }]}>
        <View style={s.logoIcone}>
          <Feather name="shield" size={20} color="#60A5FA" />
        </View>
        {mostrarTexto && (
          <View>
            <Text style={s.logoTitulo}>Campus Seguro</Text>
            <Text style={s.logoSub}>Painel Administrativo</Text>
          </View>
        )}
      </View>

      <View style={{ gap: 4, marginTop: 8 }}>
        {MENU.map((m) => {
          const ativo = m.chave === secao;
          return (
            <Pressable
              key={m.chave}
              onPress={() => ir(m.rota)}
              style={({ hovered }: any) => [
                s.item,
                !mostrarTexto && { justifyContent: "center", paddingHorizontal: 0 },
                hovered && !ativo && { backgroundColor: "#151C30" },
                ativo && s.itemAtivo,
              ]}
              accessibilityLabel={m.label}
            >
              <Feather name={m.icone} size={18} color={ativo ? "#FFFFFF" : COR.textoSec} />
              {mostrarTexto && <Text style={[s.itemTexto, ativo && { color: "#FFFFFF" }]}>{m.label}</Text>}
              {m.chave === "denuncias" && novas > 0 && (
                <View style={[s.badge, !mostrarTexto && s.badgeFlutuante]}>
                  <Text style={s.badgeTexto}>{novas > 99 ? "99+" : novas}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      <View style={[s.status, !mostrarTexto && { alignItems: "center", paddingHorizontal: 0 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={[s.statusPonto, { backgroundColor: online ? "#22C55E" : "#EF4444" }]} />
          {mostrarTexto && <Text style={s.statusTexto}>{online ? "Sistema online" : "Sem conexão com a API"}</Text>}
        </View>
        {mostrarTexto && (
          <Text style={s.statusSub}>
            {atualizadoEm
              ? `Atualizado às ${atualizadoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
              : "Carregando..."}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={s.linha}>
        {largo && sidebar}

        <View style={{ flex: 1 }}>
          {/* Barra superior */}
          <View style={[s.topo, !largo && { paddingHorizontal: 14 }]}>
            <TouchableOpacity
              style={s.hamburguer}
              onPress={() => (largo ? setRecolhido((r) => !r) : setGavetaAberta(true))}
              activeOpacity={0.8}
              accessibilityLabel="Menu"
            >
              <Feather name="menu" size={20} color={COR.textoSec} />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={[s.titulo, !largo && { fontSize: 20 }]} numberOfLines={1}>
                {titulo}
              </Text>
              {!!subtitulo && (
                <Text style={s.subtitulo} numberOfLines={1}>
                  {subtitulo}
                </Text>
              )}
            </View>

            {largo && acoes}

            <TouchableOpacity
              style={s.sino}
              onPress={() => ir("/admin/denuncias?etapa=RECEBIDA")}
              activeOpacity={0.8}
              accessibilityLabel={`${novas} denúncias novas`}
            >
              <Feather name="bell" size={19} color={COR.textoSec} />
              {novas > 0 && (
                <View style={s.sinoBadge}>
                  <Text style={s.sinoBadgeTexto}>{novas > 9 ? "9+" : novas}</Text>
                </View>
              )}
            </TouchableOpacity>

            <Pressable onPress={() => setMenuUsuario((v) => !v)} style={s.usuario}>
              <View style={s.avatar}>
                <Text style={s.avatarTexto}>{iniciais(usuario?.nome)}</Text>
              </View>
              {largo && (
                <View>
                  <Text style={s.usuarioNome} numberOfLines={1}>
                    {usuario?.nome ?? "Administrador"}
                  </Text>
                  <Text style={s.usuarioPapel}>Administrador</Text>
                </View>
              )}
              <Feather name="chevron-down" size={16} color={COR.textoMudo} />
            </Pressable>
          </View>

          {!largo && !!acoes && <View style={{ paddingHorizontal: 14, paddingBottom: 8 }}>{acoes}</View>}

          <ScrollView
            contentContainerStyle={[s.conteudo, !largo && { paddingHorizontal: 14 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>

          {menuUsuario && (
            <>
              <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenuUsuario(false)} />
              <View style={s.menuUsuario}>
                <Text style={s.menuNome}>{usuario?.nome}</Text>
                <Text style={s.menuEmail}>{usuario?.email}</Text>
                <View style={s.menuSep} />
                <TouchableOpacity style={s.menuItem} onPress={() => ir("/admin/configuracoes")}>
                  <Feather name="settings" size={15} color={COR.textoSec} />
                  <Text style={s.menuItemTexto}>Configurações da conta</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.menuItem} onPress={handleSair}>
                  <Feather name="log-out" size={15} color="#F87171" />
                  <Text style={[s.menuItemTexto, { color: "#F87171" }]}>Sair</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>

      {!largo && gavetaAberta && (
        <View style={StyleSheet.absoluteFill}>
          <Pressable style={s.veu} onPress={() => setGavetaAberta(false)} />
          {sidebar}
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COR.fundo },
  linha: { flex: 1, flexDirection: "row" },

  sidebar: {
    width: 240,
    backgroundColor: "#0A0F1D",
    borderRightWidth: 1,
    borderRightColor: "#182036",
    paddingHorizontal: 14,
    paddingVertical: 18,
  },
  gaveta: { position: "absolute", top: 0, bottom: 0, left: 0, width: 260, zIndex: 20 },
  veu: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },

  logo: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 6, paddingBottom: 18 },
  logoIcone: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#3B82F61F",
    borderWidth: 1,
    borderColor: "#3B82F655",
    alignItems: "center",
    justifyContent: "center",
  },
  logoTitulo: { color: COR.texto, fontSize: 15, fontWeight: "800" },
  logoSub: { color: COR.textoMudo, fontSize: 11 },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  itemAtivo: { backgroundColor: "#1D4ED8" },
  itemTexto: { color: COR.textoSec, fontSize: 14, fontWeight: "600", flex: 1 },
  badge: {
    minWidth: 22,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeFlutuante: { position: "absolute", top: 4, right: 6, minWidth: 18, height: 16 },
  badgeTexto: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },

  status: {
    backgroundColor: "#0F1526",
    borderWidth: 1,
    borderColor: "#182036",
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  statusPonto: { width: 8, height: 8, borderRadius: 4 },
  statusTexto: { color: COR.texto, fontSize: 12, fontWeight: "700" },
  statusSub: { color: COR.textoMudo, fontSize: 11 },

  topo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 28,
    paddingTop: 18,
    paddingBottom: 14,
  },
  hamburguer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COR.superficie,
    borderWidth: 1,
    borderColor: COR.borda,
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: { color: COR.texto, fontSize: 26, fontWeight: "800", letterSpacing: -0.4 },
  subtitulo: { color: COR.textoMudo, fontSize: 13, marginTop: 2 },
  sino: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COR.superficie,
    borderWidth: 1,
    borderColor: COR.borda,
    alignItems: "center",
    justifyContent: "center",
  },
  sinoBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COR.fundo,
  },
  sinoBadgeTexto: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  usuario: { flexDirection: "row", alignItems: "center", gap: 10, maxWidth: 260 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#26304A",
    borderWidth: 1,
    borderColor: "#34405E",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTexto: { color: COR.texto, fontSize: 14, fontWeight: "800" },
  usuarioNome: { color: COR.texto, fontSize: 14, fontWeight: "700", maxWidth: 180 },
  usuarioPapel: { color: COR.textoMudo, fontSize: 12 },

  conteudo: { paddingHorizontal: 28, paddingBottom: 40, gap: 20 },

  menuUsuario: {
    position: "absolute",
    top: 66,
    right: 20,
    width: 260,
    backgroundColor: "#141A2B",
    borderWidth: 1,
    borderColor: "#2A3350",
    borderRadius: 12,
    padding: 8,
    zIndex: 30,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  menuNome: { color: COR.texto, fontSize: 14, fontWeight: "800", paddingHorizontal: 10, paddingTop: 6 },
  menuEmail: { color: COR.textoMudo, fontSize: 12, paddingHorizontal: 10, paddingBottom: 6 },
  menuSep: { height: 1, backgroundColor: COR.borda, marginVertical: 4 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 8 },
  menuItemTexto: { color: COR.textoSec, fontSize: 13, fontWeight: "600" },
});
