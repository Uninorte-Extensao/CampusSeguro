import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { adminListarOcorrencias, OcorrenciaAdmin } from "../services/api";

/**
 * Denúncias carregadas uma vez para toda a área do administrador
 * (dashboard, lista, badge do menu e sino de notificações).
 */
interface AdminDados {
  ocorrencias: OcorrenciaAdmin[];
  carregando: boolean;
  erro: string | null;
  online: boolean;
  atualizadoEm: Date | null;
  recarregar: () => Promise<void>;
}

const AdminContext = createContext<AdminDados | null>(null);

const INTERVALO_ATUALIZACAO_MS = 60_000;

export function AdminProvider({ children }: { children: ReactNode }) {
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null);

  const recarregar = useCallback(async () => {
    try {
      setOcorrencias(await adminListarOcorrencias());
      setErro(null);
      setOnline(true);
      setAtualizadoEm(new Date());
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível carregar as denúncias.");
      setOnline(false);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Carrega ao entrar e atualiza sozinho a cada minuto (novas denúncias)
  useEffect(() => {
    recarregar();
    const t = setInterval(recarregar, INTERVALO_ATUALIZACAO_MS);
    return () => clearInterval(t);
  }, [recarregar]);

  const value = useMemo(
    () => ({ ocorrencias, carregando, erro, online, atualizadoEm, recarregar }),
    [ocorrencias, carregando, erro, online, atualizadoEm, recarregar]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin deve ser usado dentro de AdminProvider.");
  return ctx;
}
