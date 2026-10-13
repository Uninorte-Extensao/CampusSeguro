import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buscarUsuarioAtual,
  CriarUsuarioPayload,
  criarUsuario as apiCriarUsuario,
  login as apiLogin,
  setAuthToken,
  Usuario,
} from "../services/api";

const CHAVE_TOKEN = "@campus_seguro:token";
const CHAVE_USUARIO = "@campus_seguro:usuario";

interface AuthContextData {
  token: string | null;
  usuario: Usuario | null;
  carregando: boolean;
  autenticado: boolean;
  entrar: (identificador: string, senha: string) => Promise<void>;
  registrar: (payload: CriarUsuarioPayload) => Promise<Usuario>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Restaura a sessão salva ao abrir o app
  useEffect(() => {
    (async () => {
      try {
        const [tokenSalvo, usuarioSalvo] = await Promise.all([
          AsyncStorage.getItem(CHAVE_TOKEN),
          AsyncStorage.getItem(CHAVE_USUARIO),
        ]);

        if (tokenSalvo) {
          setToken(tokenSalvo);
          setAuthToken(tokenSalvo);
        }
        if (usuarioSalvo) {
          setUsuario(JSON.parse(usuarioSalvo));
        } else if (tokenSalvo) {
          // Sessão restaurada só com token (ex.: login anterior): busca o usuário.
          try {
            const atual = await buscarUsuarioAtual();
            setUsuario(atual);
            await AsyncStorage.setItem(CHAVE_USUARIO, JSON.stringify(atual));
          } catch {
            // Token inválido/expirado: segue, telas protegidas tratam o 401.
          }
        }
      } catch {
        // Sessão corrompida/ausente: segue deslogado.
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  const persistirSessao = useCallback(
    async (novoToken: string, novoUsuario: Usuario | null) => {
      setToken(novoToken);
      setAuthToken(novoToken);
      setUsuario(novoUsuario);

      await AsyncStorage.setItem(CHAVE_TOKEN, novoToken);
      if (novoUsuario) {
        await AsyncStorage.setItem(
          CHAVE_USUARIO,
          JSON.stringify(novoUsuario)
        );
      } else {
        await AsyncStorage.removeItem(CHAVE_USUARIO);
      }
    },
    []
  );

  const entrar = useCallback(
    async (identificador: string, senha: string) => {
      const resposta = await apiLogin(identificador, senha);
      // O /login devolve só o token; buscamos o usuário para exibir nome/perfil.
      setAuthToken(resposta.access_token);

      let usuarioLogado: Usuario | null = null;
      try {
        usuarioLogado = await buscarUsuarioAtual();
      } catch {
        // Se falhar, segue autenticado só com o token.
      }

      await persistirSessao(resposta.access_token, usuarioLogado);
    },
    [persistirSessao]
  );

  const registrar = useCallback(
    async (payload: CriarUsuarioPayload) => {
      const resposta = await apiCriarUsuario(payload);
      await persistirSessao(resposta.access_token, resposta.usuario);
      return resposta.usuario;
    },
    [persistirSessao]
  );

  const sair = useCallback(async () => {
    setToken(null);
    setUsuario(null);
    setAuthToken(null);
    await AsyncStorage.multiRemove([CHAVE_TOKEN, CHAVE_USUARIO]);
  }, []);

  const value = useMemo(
    () => ({
      token,
      usuario,
      carregando,
      autenticado: Boolean(token),
      entrar,
      registrar,
      sair,
    }),
    [token, usuario, carregando, entrar, registrar, sair]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
