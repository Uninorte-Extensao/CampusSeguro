import { Feather } from "@expo/vector-icons";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

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
  buscarRelatoPorId: (id?: string | null) => Relato | undefined;
  adicionarRelato: (relato: NovoRelato) => Relato;
  marcarNotificacaoLida: (id: string) => void;
  marcarTodasNotificacoesLidas: () => void;
}

const RELATOS_INICIAIS: Relato[] = [
  {
    id: "88291",
    tipo: "Ocorrência Emergencial",
    status: "ATIVO",
    local: "Bloco A – UniNorte",
    data: "Hoje",
    hora: "14:32",
    descricao: "Indivíduo suspeito avistado tentando acessar uma área restrita do bloco A.",
    icone: "alert-octagon",
  },
  {
    id: "88275",
    tipo: "Atividade Suspeita",
    status: "EM ANÁLISE",
    local: "Estacionamento Leste",
    data: "Hoje",
    hora: "12:15",
    descricao: "Dois indivíduos permaneceram por muito tempo próximos aos veículos no estacionamento.",
    icone: "eye",
  },
  {
    id: "88240",
    tipo: "Roubo/Furto",
    status: "EM ATENDIMENTO",
    local: "Biblioteca Central",
    data: "Ontem",
    hora: "09:40",
    descricao: "Notebook foi retirado da área de estudos individuais sem autorização do proprietário.",
    icone: "lock",
  },
  {
    id: "88198",
    tipo: "Vandalismo",
    status: "CONCLUÍDO",
    local: "Quadra Esportiva",
    data: "28/03/2026",
    hora: "18:20",
    descricao: "Foram encontradas pichações nas paredes externas da quadra esportiva.",
    icone: "monitor",
  },
];

const NOTIFICACOES_INICIAIS: Notificacao[] = [
  {
    id: "n1",
    tipo: "denuncia",
    titulo: "Sua denúncia foi recebida",
    mensagem: "A denúncia #88291 foi encaminhada para nossa equipe de patrulha.",
    tempo: "agora",
    lida: false,
    protocolo: "#88291",
    registroId: "88291",
  },
  {
    id: "n2",
    tipo: "emergencia",
    titulo: "Atendimento iniciado",
    mensagem: "Equipe de segurança foi acionada e está acompanhando a ocorrência.",
    tempo: "2 min",
    lida: false,
    protocolo: "#88291",
    registroId: "88291",
  },
  {
    id: "n3",
    tipo: "denuncia",
    titulo: "Status atualizado: Em análise",
    mensagem: "Sua denúncia #88275 está sendo analisada pela coordenação.",
    tempo: "12 min",
    lida: false,
    protocolo: "#88275",
    registroId: "88275",
  },
  {
    id: "n4",
    tipo: "alerta",
    titulo: "Atividade suspeita próxima",
    mensagem: "Aviso de segurança no Bloco C – evite a área se possível.",
    tempo: "1 h",
    lida: true,
  },
  {
    id: "n5",
    tipo: "denuncia",
    titulo: "Denúncia concluída",
    mensagem: "A ocorrência #88198 foi finalizada com sucesso pela equipe.",
    tempo: "Ontem",
    lida: true,
    protocolo: "#88198",
    registroId: "88198",
  },
  {
    id: "n6",
    tipo: "sistema",
    titulo: "Bem-vindo ao Campus Seguro",
    mensagem: "Mantenha seus dados atualizados para uma melhor experiência.",
    tempo: "2 d",
    lida: true,
  },
];

const CampusSeguroContext = createContext<CampusSeguroContextData | null>(null);

function gerarIdRelato() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

function gerarIdNotificacao() {
  return `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function CampusSeguroProvider({ children }: { children: ReactNode }) {
  const [relatos, setRelatos] = useState<Relato[]>(RELATOS_INICIAIS);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(NOTIFICACOES_INICIAIS);

  const naoLidas = useMemo(
    () => notificacoes.filter((notificacao) => !notificacao.lida).length,
    [notificacoes]
  );

  const buscarRelatoPorId = useCallback(
    (id?: string | null) => {
      if (!id) return undefined;
      return relatos.find((relato) => relato.id === id.replace("#", ""));
    },
    [relatos]
  );

  const adicionarRelato = useCallback((novoRelato: NovoRelato) => {
    const relato: Relato = {
      ...novoRelato,
      id: novoRelato.id ?? gerarIdRelato(),
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
      buscarRelatoPorId,
      adicionarRelato,
      marcarNotificacaoLida,
      marcarTodasNotificacoesLidas,
    }),
    [
      relatos,
      notificacoes,
      naoLidas,
      buscarRelatoPorId,
      adicionarRelato,
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