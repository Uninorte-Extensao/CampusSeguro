import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Painel } from "../../components/admin/Graficos";
import { AdminShell, iniciais } from "../../components/admin/Shell";
import { useAuth } from "../../contexts/AuthContext";
import { adminAlterarPerfil, adminCriarAdministrador, adminListarUsuarios, UsuarioAdmin } from "../../services/api";
import { alerta } from "../../utils/alerta";
import { confirmar, COR } from "../../utils/admin";

type Filtro = "ADMINISTRADOR" | "ALUNO";

export default function UsuariosScreen() {
  const { usuario } = useAuth();
  const { width } = useWindowDimensions();
  const largo = width >= 1100;
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("ADMINISTRADOR");
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState<string | null>(null);
  const [formAberto, setFormAberto] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setUsuarios(await adminListarUsuarios());
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível carregar os usuários.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const admins = usuarios.filter((u) => u.tipo_perfil === "ADMINISTRADOR");
  const alunos = usuarios.filter((u) => u.tipo_perfil !== "ADMINISTRADOR");

  const lista = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return (filtro === "ADMINISTRADOR" ? admins : alunos).filter(
      (u) => !t || [u.nome, u.email].filter(Boolean).some((x) => String(x).toLowerCase().includes(t))
    );
  }, [admins, alunos, filtro, busca]);

  async function removerAcesso(u: UsuarioAdmin) {
    const ok = await confirmar(
      "Remover administrador",
      `${u.nome} perderá o acesso ao painel administrativo. Para devolver o acesso, será preciso cadastrar o administrador de novo.`,
      "Remover"
    );
    if (!ok) return;
    setSalvando(u.id);
    try {
      const atualizado = await adminAlterarPerfil(u.id, "ALUNO");
      setUsuarios((lst) => lst.map((x) => (x.id === u.id ? atualizado : x)));
    } catch (e) {
      alerta("Não foi possível remover", e instanceof Error ? e.message : "Tente novamente.");
    } finally {
      setSalvando(null);
    }
  }

  const botaoAdicionar = (
    <TouchableOpacity style={s.adicionar} onPress={() => setFormAberto(true)} activeOpacity={0.85}>
      <Feather name="user-plus" size={16} color="#FFF" />
      <Text style={s.adicionarTexto}>Adicionar administrador</Text>
    </TouchableOpacity>
  );

  return (
    <AdminShell
      secao="usuarios"
      titulo="Usuários e Permissões"
      subtitulo="Administradores com acesso ao painel e alunos cadastrados"
      acoes={botaoAdicionar}
    >
      <View style={s.resumo}>
        <Resumo icone="shield" cor="#8B5CF6" valor={admins.length} rotulo="Administradores" />
        <Resumo icone="user" cor="#22C55E" valor={alunos.length} rotulo="Alunos cadastrados" />
        <Resumo icone="users" cor="#3B82F6" valor={usuarios.length} rotulo="Total de contas" />
      </View>

      <Painel
        titulo={filtro === "ADMINISTRADOR" ? "Administradores" : "Alunos"}
        icone={filtro === "ADMINISTRADOR" ? "shield" : "users"}
        acao={!largo ? botaoAdicionar : undefined}
      >
        <View style={[{ gap: 10 }, largo && { flexDirection: "row", alignItems: "center" }]}>
          <View style={s.abas}>
            {(["ADMINISTRADOR", "ALUNO"] as Filtro[]).map((f) => (
              <TouchableOpacity key={f} onPress={() => setFiltro(f)} style={[s.aba, filtro === f && s.abaAtiva]}>
                <Text style={[s.abaTexto, filtro === f && { color: "#FFF" }]}>
                  {f === "ADMINISTRADOR" ? `Administradores (${admins.length})` : `Alunos (${alunos.length})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[s.busca, largo && { width: 340 }]}>
            <Feather name="search" size={15} color={COR.textoMudo} />
            <TextInput
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar por nome ou e-mail"
              placeholderTextColor={COR.textoMudo}
              style={s.buscaInput}
            />
          </View>
        </View>

        {filtro === "ALUNO" && (
          <View style={s.aviso}>
            <Feather name="info" size={14} color="#93C5FD" />
            <Text style={s.avisoTexto}>
              Alunos não podem virar administradores. Para dar acesso ao painel, use “Adicionar administrador” e crie
              uma conta própria para a função.
            </Text>
          </View>
        )}

        {carregando ? (
          <ActivityIndicator color={COR.destaque} />
        ) : erro ? (
          <Text style={s.erro}>{erro}</Text>
        ) : lista.length === 0 ? (
          <Text style={s.vazio}>Nenhum usuário encontrado.</Text>
        ) : (
          <View>
            {largo && (
              <View style={s.thLinha}>
                <Text style={[s.th, { flex: 1 }]}>{filtro === "ADMINISTRADOR" ? "ADMINISTRADOR" : "ALUNO"}</Text>
                <Text style={[s.th, { width: 160 }]}>PERFIL</Text>
                {filtro === "ALUNO" && <Text style={[s.th, { width: 140 }]}>CADASTRO</Text>}
                {filtro === "ALUNO" && <Text style={[s.th, { width: 160 }]}>DENÚNCIAS IDENTIF.</Text>}
                {filtro === "ADMINISTRADOR" && <Text style={[s.th, { width: 200 }]}>ACESSO</Text>}
              </View>
            )}
            {lista.map((u) => {
              const admin = u.tipo_perfil === "ADMINISTRADOR";
              const eu = u.id === usuario?.id;
              return (
                <View key={u.id} style={[s.tr, !largo && { flexWrap: "wrap", gap: 10 }]}>
                  <View style={{ flex: 1, minWidth: 220, flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={[s.avatar, admin && { backgroundColor: "#8B5CF633" }]}>
                      <Text style={s.avatarTexto}>{iniciais(u.nome)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.nome} numberOfLines={1}>
                        {u.nome} {eu && <Text style={s.voce}>(você)</Text>}
                      </Text>
                      <Text style={s.email} numberOfLines={1}>
                        {u.email || "sem e-mail (cadastro rápido)"}
                      </Text>
                    </View>
                  </View>
                  <View style={{ width: largo ? 160 : undefined }}>
                    <View style={[s.pill, admin ? s.pillAdmin : s.pillAluno]}>
                      <Feather name={admin ? "shield" : "user"} size={11} color={admin ? "#C4B5FD" : COR.textoSec} />
                      <Text style={[s.pillTexto, { color: admin ? "#C4B5FD" : COR.textoSec }]}>{admin ? "Administrador" : "Aluno"}</Text>
                    </View>
                  </View>
                  {!admin && largo && <Text style={[s.td, { width: 140 }]}>{u.cadastro_completo ? "Completo" : "Rápido"}</Text>}
                  {!admin && largo && <Text style={[s.td, { width: 160 }]}>{u.total_denuncias}</Text>}
                  {admin && (
                    <View style={{ width: largo ? 200 : undefined }}>
                      {eu ? (
                        <Text style={s.email}>Sua conta</Text>
                      ) : (
                        <TouchableOpacity disabled={salvando === u.id} onPress={() => removerAcesso(u)} style={s.botaoRemover}>
                          {salvando === u.id ? (
                            <ActivityIndicator size="small" color={COR.texto} />
                          ) : (
                            <>
                              <Feather name="user-minus" size={13} color="#FCA5A5" />
                              <Text style={s.botaoRemoverTexto}>Remover acesso</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
        <Text style={s.nota}>
          A contagem de denúncias considera só as identificadas: denúncias anônimas não ficam ligadas a nenhum usuário.
          Cadastros e remoções de administradores ficam no registro de atividades.
        </Text>
      </Painel>

      <FormNovoAdmin
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        onCriado={(u) => {
          setUsuarios((lst) => [...lst, u]);
          setFiltro("ADMINISTRADOR");
          setFormAberto(false);
          alerta("Administrador cadastrado", `${u.nome} já pode entrar no painel com o e-mail ${u.email}.`);
        }}
      />
    </AdminShell>
  );
}

function FormNovoAdmin({
  aberto,
  onFechar,
  onCriado,
}: {
  aberto: boolean;
  onFechar: () => void;
  onCriado: (u: UsuarioAdmin) => void;
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const regras = [
    { ok: senha.length >= 8, texto: "8+ caracteres" },
    { ok: /[A-Z]/.test(senha), texto: "uma maiúscula" },
    { ok: /[0-9]/.test(senha), texto: "um número" },
    { ok: /[!@#$%^&*(),.?":{}|<>]/.test(senha), texto: "um caractere especial" },
  ];

  function limpar() {
    setNome("");
    setEmail("");
    setSenha("");
    setConfirmacao("");
    setErro(null);
  }

  async function salvar() {
    setErro(null);
    if (nome.trim().length < 3) return setErro("Informe o nome completo.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErro("Informe um e-mail válido.");
    if (regras.some((r) => !r.ok)) return setErro("A senha não atende aos requisitos.");
    if (senha !== confirmacao) return setErro("A confirmação não confere com a senha.");
    setEnviando(true);
    try {
      const u = await adminCriarAdministrador({ nome: nome.trim(), email: email.trim().toLowerCase(), senha });
      limpar();
      onCriado(u);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível cadastrar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal visible={aberto} transparent animationType="fade" onRequestClose={onFechar}>
      <View style={s.modalFundo}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onFechar} />
        <View style={s.modal}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={s.modalIcone}>
              <Feather name="user-plus" size={18} color="#C4B5FD" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.modalTitulo}>Adicionar administrador</Text>
              <Text style={s.email}>Cria uma conta nova com acesso ao painel</Text>
            </View>
            <TouchableOpacity onPress={onFechar} style={s.fechar}>
              <Feather name="x" size={18} color={COR.textoSec} />
            </TouchableOpacity>
          </View>

          <Campo rotulo="Nome completo" valor={nome} onChange={setNome} placeholder="Ex.: Maria Helena Duarte" />
          <Campo rotulo="E-mail institucional" valor={email} onChange={setEmail} placeholder="nome@campusseguro.edu.br" email />
          <Campo
            rotulo="Senha inicial"
            valor={senha}
            onChange={setSenha}
            placeholder="••••••••"
            senha={!verSenha}
            direita={
              <TouchableOpacity onPress={() => setVerSenha((v) => !v)}>
                <Feather name={verSenha ? "eye-off" : "eye"} size={16} color={COR.textoMudo} />
              </TouchableOpacity>
            }
          />
          <View style={s.regras}>
            {regras.map((r) => (
              <View key={r.texto} style={s.regra}>
                <Feather name={r.ok ? "check-circle" : "circle"} size={12} color={r.ok ? "#4ADE80" : COR.textoMudo} />
                <Text style={[s.regraTexto, r.ok && { color: "#4ADE80" }]}>{r.texto}</Text>
              </View>
            ))}
          </View>
          <Campo rotulo="Confirmar senha" valor={confirmacao} onChange={setConfirmacao} placeholder="••••••••" senha={!verSenha} />

          {!!erro && <Text style={s.erro}>{erro}</Text>}

          <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
            <TouchableOpacity style={s.cancelar} onPress={onFechar}>
              <Text style={s.cancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.adicionar, { flex: 1, justifyContent: "center" }]} onPress={salvar} disabled={enviando}>
              {enviando ? <ActivityIndicator color="#FFF" /> : <Text style={s.adicionarTexto}>Cadastrar administrador</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Campo({
  rotulo,
  valor,
  onChange,
  placeholder,
  senha,
  email,
  direita,
}: {
  rotulo: string;
  valor: string;
  onChange: (t: string) => void;
  placeholder: string;
  senha?: boolean;
  email?: boolean;
  direita?: React.ReactNode;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.rotulo}>{rotulo}</Text>
      <View style={s.campo}>
        <TextInput
          value={valor}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={COR.textoMudo}
          secureTextEntry={senha}
          autoCapitalize={email || senha !== undefined ? "none" : "words"}
          keyboardType={email ? "email-address" : "default"}
          autoCorrect={false}
          style={s.campoInput}
        />
        {direita}
      </View>
    </View>
  );
}

function Resumo({ icone, cor, valor, rotulo }: { icone: React.ComponentProps<typeof Feather>["name"]; cor: string; valor: number | string; rotulo: string }) {
  return (
    <View style={s.resumoCard}>
      <View style={[s.resumoIcone, { backgroundColor: cor }]}>
        <Feather name={icone} size={20} color="#FFF" />
      </View>
      <View>
        <Text style={s.resumoValor}>{valor}</Text>
        <Text style={s.resumoRotulo}>{rotulo}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  resumo: { flexDirection: "row", flexWrap: "wrap", gap: 20 },
  resumoCard: { flex: 1, minWidth: 220, flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: COR.superficie, borderWidth: 1, borderColor: COR.borda, borderRadius: 16, padding: 18 },
  resumoIcone: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  resumoValor: { color: COR.texto, fontSize: 24, fontWeight: "800" },
  resumoRotulo: { color: COR.textoSec, fontSize: 13 },

  adicionar: { flexDirection: "row", alignItems: "center", gap: 8, height: 42, paddingHorizontal: 16, borderRadius: 10, backgroundColor: "#7C3AED" },
  adicionarTexto: { color: "#FFF", fontSize: 13.5, fontWeight: "800" },

  abas: { flexDirection: "row", backgroundColor: COR.superficie2, borderRadius: 10, padding: 3, gap: 3, alignSelf: "flex-start" },
  aba: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  abaAtiva: { backgroundColor: "#2563EB" },
  abaTexto: { color: COR.textoSec, fontSize: 12.5, fontWeight: "800" },
  busca: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: COR.superficie2, borderWidth: 1, borderColor: COR.borda, borderRadius: 10, paddingHorizontal: 12 },
  buscaInput: { flex: 1, color: COR.texto, fontSize: 13, paddingVertical: 10, outlineStyle: "none" } as any,
  aviso: { flexDirection: "row", gap: 10, backgroundColor: "#1E3A8A33", borderWidth: 1, borderColor: "#3B82F644", borderRadius: 10, padding: 12 },
  avisoTexto: { color: "#BFDBFE", fontSize: 12.5, lineHeight: 18, flex: 1 },

  thLinha: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, backgroundColor: COR.superficie2, borderRadius: 8 },
  th: { color: COR.textoMudo, fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  tr: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COR.grade },
  td: { color: COR.textoSec, fontSize: 13 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#26304A", alignItems: "center", justifyContent: "center" },
  avatarTexto: { color: COR.texto, fontSize: 12, fontWeight: "800" },
  nome: { color: COR.texto, fontSize: 14, fontWeight: "700" },
  voce: { color: COR.textoMudo, fontWeight: "500" },
  email: { color: COR.textoMudo, fontSize: 12 },
  pill: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 5, borderRadius: 999, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 3 },
  pillAdmin: { backgroundColor: "#8B5CF61F", borderColor: "#8B5CF655" },
  pillAluno: { backgroundColor: COR.superficie2, borderColor: COR.borda },
  pillTexto: { fontSize: 11.5, fontWeight: "800" },
  botaoRemover: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1, borderColor: "#EF444455", borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12, alignSelf: "flex-start", minWidth: 150 },
  botaoRemoverTexto: { color: "#FCA5A5", fontSize: 12, fontWeight: "800" },
  nota: { color: COR.textoMudo, fontSize: 12, lineHeight: 17 },
  vazio: { color: COR.textoMudo, fontSize: 13, textAlign: "center", paddingVertical: 16 },
  erro: { color: "#FCA5A5", fontSize: 13 },

  modalFundo: { flex: 1, backgroundColor: "rgba(3,6,14,0.75)", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { width: "100%", maxWidth: 460, backgroundColor: "#121829", borderWidth: 1, borderColor: "#2A3350", borderRadius: 16, padding: 22, gap: 14 },
  modalIcone: { width: 38, height: 38, borderRadius: 11, backgroundColor: "#8B5CF626", alignItems: "center", justifyContent: "center" },
  modalTitulo: { color: COR.texto, fontSize: 17, fontWeight: "800" },
  fechar: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: COR.superficie2 },
  rotulo: { color: COR.textoSec, fontSize: 12, fontWeight: "700" },
  campo: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: COR.superficie2, borderWidth: 1, borderColor: COR.borda, borderRadius: 10, paddingHorizontal: 12 },
  campoInput: { flex: 1, color: COR.texto, fontSize: 14, paddingVertical: 11, outlineStyle: "none" } as any,
  regras: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: -6 },
  regra: { flexDirection: "row", alignItems: "center", gap: 4 },
  regraTexto: { color: COR.textoMudo, fontSize: 11.5 },
  cancelar: { height: 42, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: COR.borda, alignItems: "center", justifyContent: "center" },
  cancelarTexto: { color: COR.textoSec, fontSize: 13.5, fontWeight: "700" },
});
