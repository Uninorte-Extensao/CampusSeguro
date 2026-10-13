import { Feather } from "@expo/vector-icons";
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
    listarOcorrencias,
    Ocorrencia,
    StatusOcorrencia,
} from "../services/api";
import { useAuth } from "./AuthContext";

export type StatusRelato = "ATIVO" | "EM ANÁLISE" | "EM ATENDIMENTO" | "CONCLUÍDO";

export type TipoNotificacao = "denuncia" | "emergencia" | "alerta" | "sistema";

export type IconeFeather = React.ComponentProps<typeof Feather>["name"];

export interface Relato {
  id: string;
  tipo: string;
  status: StatusRelato;
  local: string;
  data: string;
  hora: string;
  descricao: string;
  icone: IconeFeather;
}

export interface Notificacao {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  tempo: string;
  lida: boolean;
  protocolo?: string;
  registroId?: string;
}

type NovoRelato = Omit<Relato, "id"> & {
  id?: string;
};

interface CampusSeguroContextData {
  relatos: Relato[];
  notificacoes: Notificacao[];
  naoLidas: number;
  carregandoRelatos: boolean;
  erroRelatos: string | null;
  buscarRelatoPorId: (id?: string | null) => Relato | undefined;
  adicionarRelato: (relato: NovoRelato) => Relato;
  recarregar: () => Promise<void>;
  marcarNotificacaoLida: (id: string) => void;
  marcarTodasNotificacoesLidas: () => void;
}

const CampusSeguroContext = createContext<CampusSeguroContextData | null>(null);

// --- Mapeamento backend -> UI ---
const STATUS_MAP: Record<StatusOcorrencia, StatusRelato> = {
  ABERTO: "ATIVO",
  EM_ATENDIMENTO: "EM ATENDIMENTO",
  RESOLVIDO: "CONCLUÍDO",
};

function iconePorTipo(tipo: string): IconeFeather {
  const t = (tipo || "").toLowerCase();
  if (t.includes("roubo") || t.includes("furto")) return "lock";
  if (t.includes("vandal")) return "monitor";
  if (t.includes("suspeit")) return "eye";
  if (t.includes("emerg")) return "alert-octagon";
  if (t.includes("assédio") || t.includes("assedio")) return "alert-triangle";
  return "alert-circle";
}

function formatarData(iso: string): { data: string; hora: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return { data: "—", hora: "--:--" };
  }

  const hora = `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;

  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  const mesmaData = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  let data: string;
  if (mesmaData(d, hoje)) data = "Hoje";
  else if (mesmaData(d, ontem)) data = "Ontem";
  else
    data = `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;

  return { data, hora };
}

function mapearOcorrencia(o: Ocorrencia): Relato {
  const { data, hora } = formatarData(o.horario_ocorrencia || o.data_criacao);

  return {
    id: o.id,
    tipo: o.tipo_incidente || "Ocorrência",
    status: STATUS_MAP[o.status] ?? "ATIVO",
    local: o.localizacao || "Local não informado",
    data,
    hora,
    descricao: o.descricao || o.descricao_resumida || "",
    icone: iconePorTipo(o.tipo_incidente),
  };
}

function gerarIdNotificacao() {
  return `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function CampusSeguroProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();

  const [relatos, setRelatos] = useState<Relato[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [carregandoRelatos, setCarregandoRelatos] = useState(false);
  const [erroRelatos, setErroRelatos] = useState<string | null>(null);

  const naoLidas = useMemo(
    () => notificacoes.filter((notificacao) => !notificacao.lida).length,
    [notificacoes]
  );

  const recarregar = useCallback(async () => {
    if (!token) {
      setRelatos([]);
      return;
    }

    setCarregandoRelatos(true);
    setErroRelatos(null);

    try {
      const ocorrencias = await listarOcorrencias();
      const mapeadas = ocorrencias
        .map(mapearOcorrencia)
        .sort((a, b) => (a.data === "Hoje" ? -1 : 0)); // recentes primeiro (best-effort)
      setRelatos(mapeadas);
    } catch (error) {
      setErroRelatos(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os relatos."
      );
    } finally {
      setCarregandoRelatos(false);
    }
  }, [token]);

  // Recarrega sempre que o usuário autentica/desloga
  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const buscarRelatoPorId = useCallback(
    (id?: string | null) => {
      if (!id) return undefined;
      const alvo = id.replace("#", "");
      return relatos.find((relato) => relato.id === alvo);
    },
    [relatos]
  );

  // Inserção otimista local (a tela de sucesso navega antes do refetch terminar)
  const adicionarRelato = useCallback((novoRelato: NovoRelato) => {
    const relato: Relato = {
      ...novoRelato,
      id: novoRelato.id ?? `local-${Date.now()}`,
    };

    setRelatos((prev) => [relato, ...prev]);
    setNotificacoes((prev) => [
      {
        id: gerarIdNotificacao(),
        tipo: relato.status === "ATIVO" ? "emergencia" : "denuncia",
        titulo: "Sua denúncia foi recebida",
        mensagem: `A ocorrência #${relato.id} foi registrada e encaminhada para análise.`,
        tempo: "agora",
        lida: false,
        protocolo: `#${relato.id}`,
        registroId: relato.id,
      },
      ...prev,
    ]);

    return relato;
  }, []);

  const marcarNotificacaoLida = useCallback((id: string) => {
    setNotificacoes((prev) =>
      prev.map((notificacao) =>
        notificacao.id === id ? { ...notificacao, lida: true } : notificacao
      )
    );
  }, []);

  const marcarTodasNotificacoesLidas = useCallback(() => {
    setNotificacoes((prev) =>
      prev.map((notificacao) => ({ ...notificacao, lida: true }))
    );
  }, []);

  const value = useMemo(
    () => ({
      relatos,
      notificacoes,
      naoLidas,
      carregandoRelatos,
      erroRelatos,
      buscarRelatoPorId,
      adicionarRelato,
      recarregar,
      marcarNotificacaoLida,
      marcarTodasNotificacoesLidas,
    }),
    [
      relatos,
      notificacoes,
      naoLidas,
      carregandoRelatos,
      erroRelatos,
      buscarRelatoPorId,
      adicionarRelato,
      recarregar,
      marcarNotificacaoLida,
      marcarTodasNotificacoesLidas,
    ]
  );

  return (
    <CampusSeguroContext.Provider value={value}>
      {children}
    </CampusSeguroContext.Provider>
  );
}

export function useCampusSeguro() {
  const context = useContext(CampusSeguroContext);

  if (!context) {
    throw new Error("useCampusSeguro deve ser usado dentro de CampusSeguroProvider.");
  }

  return context;
}
