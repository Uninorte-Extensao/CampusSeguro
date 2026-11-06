import { abrirArquivo, VisualizadorImagem } from "@/components/VisualizadorImagem";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Painel } from "../../components/admin/Graficos";
import { SeloEtapa, SeloGravidade } from "../../components/admin/Selos";
import { AdminShell } from "../../components/admin/Shell";
import { useAdmin } from "../../contexts/AdminContext";
import {
  adicionarAtualizacao,
  adminBuscarOcorrencia,
  Atualizacao,
  atualizarOcorrencia,
  EvidenciaResponse,
  listarAtualizacoes,
  listarEvidencias,
  OcorrenciaAdmin,
  StatusOcorrencia,
  TipoAtualizacao,
} from "../../services/api";
import { alerta } from "../../utils/alerta";
import {
  confirmar,
  COR,
  ETAPA_COR,
  ETAPAS,
  etapaAtual,
  formatarData,
  GRAVIDADE_COR,
  GRAVIDADES,
  Gravidade,
  normalizarGravidade,
  tempoRelativo,
} from "../../utils/admin";

type IconeFeather = React.ComponentProps<typeof Feather>["name"];
type Modo = "RESPOSTA" | "NOTA_INTERNA";

const TIPO_EVENTO: Record<TipoAtualizacao, { label: string; cor: string; icone: IconeFeather }> = {
  RESPOSTA: { label: "Resposta ao denunciante", cor: "#40DBD5", icone: "message-circle" },
  NOTA_INTERNA: { label: "Nota interna · só administradores", cor: "#7C869E", icone: "lock" },
  STATUS: { label: "Mudança de etapa", cor: "#60A5FA", icone: "git-commit" },
  MENSAGEM: { label: "Mensagem do denunciante", cor: "#A78BFA", icone: "user" },
};

export default function AdminDetalheScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { width } = useWindowDimensions();
  const largo = width >= 1180;
  const { recarregar: recarregarPainel } = useAdmin();

  const [ocorrencia, setOcorrencia] = useState<OcorrenciaAdmin | null>(null);
  const [evidencias, setEvidencias] = useState<EvidenciaResponse[]>([]);
  const [imagemAberta, setImagemAberta] = useState<string | null>(null);
  const [linhaTempo, setLinhaTempo] = useState<Atualizacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [modo, setModo] = useState<Modo>("RESPOSTA");
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    if (!id) return;
    setErro(null);
    try {
      const [oc, evs, tl] = await Promise.all([
        adminBuscarOcorrencia(id),
        listarEvidencias(id).catch(() => [] as EvidenciaResponse[]),
        listarAtualizacoes(id).catch(() => [] as Atualizacao[]),
      ]);
      setOcorrencia(oc);
      setEvidencias(evs);
      setLinhaTempo(tl);
      if (oc.anonimo) setModo("NOTA_INTERNA");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível carregar a denúncia.");
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function executar(acao: () => Promise<unknown>, erroTitulo: string) {
    setSalvando(true);
    try {
      await acao();
      await carregar();
      recarregarPainel();
      return true;
    } catch (e) {
      alerta(erroTitulo, e instanceof Error ? e.message : "Tente novamente.");
      return false;
    } finally {
      setSalvando(false);
    }
  }

  async function mudarEtapa(status: StatusOcorrencia, titulo: string, mensagem: string) {
    if (!(await confirmar(titulo, mensagem))) return;
    await executar(() => atualizarOcorrencia(id, { status }), "Não foi possível atualizar");
  }

  async function classificar(g: Gravidade) {
    if (normalizarGravidade(ocorrencia?.gravidade) === g) return;
    await executar(() => atualizarOcorrencia(id, { gravidade: g }), "Não foi possível classificar");
  }

  async function enviarTexto() {
    const msg = texto.trim();
    if (!msg) {
      alerta(
        modo === "RESPOSTA" ? "Resposta vazia" : "Nota vazia",
        modo === "RESPOSTA"
          ? "Escreva o retorno que o denunciante vai receber."
          : "Escreva a anotação da verificação."
      );
      return;
    }
    if (modo === "RESPOSTA") {
      const ok = await confirmar(
        "Enviar resposta ao denunciante",
        `O denunciante verá esta mensagem no histórico da denúncia:\n\n"${msg}"`,
        "Enviar"
      );
      if (!ok) return;
    }
    if (await executar(() => adicionarAtualizacao(id, msg, modo), "Não foi possível enviar")) setTexto("");
  }

  const voltar = () => (router.canGoBack() ? router.back() : router.replace("/admin"));

  if (carregando || erro || !ocorrencia) {
    return (
      <AdminShell secao="denuncias" titulo="Denúncia" subtitulo="Carregando...">
        <Cabecalho onVoltar={voltar} />
        {carregando ? (
          <ActivityIndicator color={COR.destaque} style={{ marginTop: 40 }} />
        ) : (
          <Text style={s.erroText}>{erro ?? "Denúncia não encontrada."}</Text>
        )}
      </AdminShell>
    );
  }

  const etapa = etapaAtual(ocorrencia);
  const indiceEtapa = ETAPAS.findIndex((e) => e.chave === etapa);
  const gravidade = normalizarGravidade(ocorrencia.gravidade);
  const podeFinalizar = ocorrencia.respondida || ocorrencia.anonimo;

  // ---------- Coluna principal ----------
  const principal = (
    <View style={{ gap: 16, flex: largo ? 1 : undefined }}>
      <View style={s.card}>
        <View style={s.topo}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={s.tipo}>{ocorrencia.tipo_incidente || "Ocorrência"}</Text>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <SeloGravidade gravidade={ocorrencia.gravidade} />
              <SeloEtapa o={ocorrencia} />
            </View>
          </View>
          <Text style={s.protocolo} selectable>
            Protocolo{"\n"}#{ocorrencia.id.slice(0, 8).toUpperCase()}
          </Text>
        </View>

        {/* Etapas */}
        <View style={s.stepper}>
          {ETAPAS.map((e, i) => {
            const feito = i < indiceEtapa || etapa === "RESOLVIDA";
            const atual = i === indiceEtapa;
            const cor = feito || atual ? ETAPA_COR[e.chave] : "#3A4360";
            return (
              <View key={e.chave} style={s.passo}>
                <View style={s.passoLinhaWrap}>
                  <View style={[s.passoLinha, { backgroundColor: i === 0 ? "transparent" : i <= indiceEtapa ? cor : "#2A3248" }]} />
                  <View style={[s.passoBola, { borderColor: cor, backgroundColor: feito ? cor : atual ? `${cor}26` : COR.superficie }]}>
                    <Feather name={feito ? "check" : (e.icone as IconeFeather)} size={13} color={feito ? COR.fundo : cor} />
                  </View>
                  <View
                    style={[
                      s.passoLinha,
                      { backgroundColor: i === ETAPAS.length - 1 ? "transparent" : i < indiceEtapa ? ETAPA_COR[ETAPAS[i + 1].chave] : "#2A3248" },
                    ]}
                  />
                </View>
                <Text style={[s.passoTexto, (feito || atual) && { color: COR.texto }]}>{e.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <Painel titulo="Relato">
        {!!ocorrencia.descricao_resumida && ocorrencia.descricao_resumida !== ocorrencia.descricao && (
          <View style={s.resumoBox}>
            <Text style={s.rotulo}>RESUMO</Text>
            <Text style={s.descText}>{ocorrencia.descricao_resumida}</Text>
          </View>
        )}
        <Text style={s.descText}>{ocorrencia.descricao || "Sem descrição."}</Text>
      </Painel>

      <Painel titulo="Linha do tempo" subtitulo="Respostas e mudanças de etapa são visíveis ao denunciante; notas internas não.">
        {linhaTempo.length === 0 ? (
          <Text style={s.vazio}>Nada registrado ainda.</Text>
        ) : (
          linhaTempo.map((a, i) => {
            const info = TIPO_EVENTO[a.tipo] ?? TIPO_EVENTO.STATUS;
            return (
              <View key={a.id} style={s.evento}>
                <View style={{ alignItems: "center" }}>
                  <View style={[s.eventoIcone, { backgroundColor: `${info.cor}1F`, borderColor: `${info.cor}55` }]}>
                    <Feather name={info.icone} size={12} color={info.cor} />
                  </View>
                  {i < linhaTempo.length - 1 && <View style={s.eventoTrilho} />}
                </View>
                <View style={{ flex: 1, paddingBottom: 14 }}>
                  <Text style={s.eventoTopo}>
                    <Text style={{ color: info.cor, fontWeight: "800" }}>{info.label}</Text>
                    {a.autor_nome ? `  ·  ${a.autor_nome}` : ""}
                  </Text>
                  <View style={[s.eventoCorpo, a.tipo === "RESPOSTA" && s.eventoResposta]}>
                    <Text style={s.eventoTexto}>{a.mensagem_acao}</Text>
                  </View>
                  <Text style={s.eventoData}>
                    {formatarData(a.data_atualizado)} · {tempoRelativo(a.data_atualizado)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </Painel>

      <Painel titulo={`Evidências (${evidencias.length})`}>
        {evidencias.length === 0 ? (
          <Text style={s.vazio}>Nenhum anexo nesta denúncia.</Text>
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {evidencias.map((ev) =>
              ev.tipo_midia === "Foto" ? (
                <TouchableOpacity key={ev.id} activeOpacity={0.9} onPress={() => (ev.tipo_midia === "Foto" ? setImagemAberta(ev.url) : abrirArquivo(ev.url))}>
                  <Image source={{ uri: ev.url }} style={s.imagem} resizeMode="cover" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity key={ev.id} style={s.arquivo} activeOpacity={0.8} onPress={() => (ev.tipo_midia === "Foto" ? setImagemAberta(ev.url) : abrirArquivo(ev.url))}>
                  <Feather
                    name={ev.tipo_midia === "Vídeo" ? "video" : ev.tipo_midia === "Áudio" ? "mic" : "file-text"}
                    size={16}
                    color={COR.destaque}
                  />
                  <Text style={s.arquivoTexto}>Abrir {ev.tipo_midia.toLowerCase()}</Text>
                  <Feather name="external-link" size={14} color={COR.textoMudo} />
                </TouchableOpacity>
              )
            )}
          </View>
        )}
      </Painel>
    </View>
  );

  // ---------- Coluna de ações ----------
  const lateral = (
    <View style={{ gap: 16, width: largo ? 400 : undefined }}>
      <Painel titulo="Próximo passo" subtitulo={proximoPasso(etapa, ocorrencia.anonimo)}>
        {/* Urgência */}
        {etapa !== "RESOLVIDA" && (
          <View style={{ gap: 8 }}>
            <Text style={s.rotulo}>URGÊNCIA</Text>
            <View style={s.gravidades}>
              {GRAVIDADES.map((g) => {
                const ativo = gravidade === g;
                return (
                  <TouchableOpacity
                    key={g}
                    disabled={salvando}
                    onPress={() => classificar(g)}
                    activeOpacity={0.85}
                    style={[s.gravBtn, ativo && { borderColor: GRAVIDADE_COR[g], backgroundColor: `${GRAVIDADE_COR[g]}22` }]}
                  >
                    <View style={[s.gravPonto, { backgroundColor: GRAVIDADE_COR[g] }]} />
                    <Text style={[s.gravTexto, ativo && { color: COR.texto }]}>{g}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {etapa === "RECEBIDA" && (
          <BotaoAcao
            icone="search"
            texto="Iniciar verificação"
            cor={ETAPA_COR.VERIFICACAO}
            cheio
            disabled={salvando}
            onPress={() =>
              mudarEtapa(
                "EM_ATENDIMENTO",
                "Iniciar verificação",
                "Você ficará como responsável e o denunciante verá que a denúncia está em verificação."
              )
            }
          />
        )}

        {(etapa === "VERIFICACAO" || etapa === "RESPONDIDA" || etapa === "RECEBIDA") && (
          <View style={{ gap: 10 }}>
            <View style={s.abas}>
              {(["RESPOSTA", "NOTA_INTERNA"] as Modo[]).map((m) => {
                const bloqueado = m === "RESPOSTA" && ocorrencia.anonimo;
                const ativo = modo === m;
                return (
                  <TouchableOpacity
                    key={m}
                    disabled={bloqueado}
                    onPress={() => setModo(m)}
                    style={[s.aba, ativo && s.abaAtiva, bloqueado && { opacity: 0.4 }]}
                    activeOpacity={0.85}
                  >
                    <Feather name={m === "RESPOSTA" ? "message-circle" : "lock"} size={13} color={ativo ? COR.texto : COR.textoMudo} />
                    <Text style={[s.abaTexto, ativo && { color: COR.texto }]}>
                      {m === "RESPOSTA" ? "Responder denunciante" : "Nota interna"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {ocorrencia.anonimo && (
              <Text style={s.aviso}>
                Denúncia anônima: fica registrada e é acompanhada pela direção, mas não recebe feedback individual.
                Registre a apuração como nota interna.
              </Text>
            )}
            <TextInput
              value={texto}
              onChangeText={setTexto}
              placeholder={
                modo === "RESPOSTA"
                  ? "Ex.: Recebemos sua denúncia, a equipe de segurança foi ao local e o caso foi encaminhado à coordenação..."
                  : "Ex.: Câmeras do bloco C solicitadas; vigilante do turno ouvido..."
              }
              placeholderTextColor={COR.textoMudo}
              style={s.input}
              multiline
              editable={!salvando}
            />
            <BotaoAcao
              icone={modo === "RESPOSTA" ? "send" : "save"}
              texto={modo === "RESPOSTA" ? "Enviar resposta ao denunciante" : "Salvar nota interna"}
              cor={modo === "RESPOSTA" ? COR.destaque : COR.textoSec}
              cheio={modo === "RESPOSTA"}
              disabled={salvando}
              carregando={salvando}
              onPress={enviarTexto}
            />
          </View>
        )}

        {(etapa === "VERIFICACAO" || etapa === "RESPONDIDA") && (
          <View style={s.separador}>
            <BotaoAcao
              icone="check-circle"
              texto="Finalizar como resolvida"
              cor={ETAPA_COR.RESOLVIDA}
              cheio={podeFinalizar}
              disabled={salvando || !podeFinalizar}
              onPress={() =>
                mudarEtapa("RESOLVIDO", "Finalizar denúncia", "A denúncia será marcada como resolvida para o denunciante.")
              }
            />
            {!podeFinalizar && <Text style={s.aviso}>Envie uma resposta ao denunciante para poder finalizar.</Text>}
          </View>
        )}

        {etapa === "RESOLVIDA" && (
          <View style={{ gap: 10 }}>
            <View style={s.resolvidaBox}>
              <Feather name="check-circle" size={18} color={ETAPA_COR.RESOLVIDA} />
              <Text style={s.resolvidaTexto}>
                Resolvida em {formatarData(ocorrencia.data_resolucao)}
                {ocorrencia.responsavel_nome ? ` por ${ocorrencia.responsavel_nome}` : ""}.
              </Text>
            </View>
            <BotaoAcao
              icone="rotate-ccw"
              texto="Reabrir para verificação"
              cor={COR.textoSec}
              disabled={salvando}
              onPress={() =>
                mudarEtapa("EM_ATENDIMENTO", "Reabrir denúncia", "A denúncia volta para a etapa de verificação.")
              }
            />
          </View>
        )}
      </Painel>

      <Painel titulo="Informações">
        <Info icone={ocorrencia.anonimo ? "eye-off" : "user"} rotulo="Denunciante" valor={ocorrencia.anonimo ? "Anônimo" : ocorrencia.autor_nome || "—"} sub={ocorrencia.anonimo ? undefined : ocorrencia.autor_email || undefined} />
        <Info icone="map-pin" rotulo="Local" valor={ocorrencia.localizacao || "Não informado"} />
        <Info icone="clock" rotulo="Ocorrido em" valor={formatarData(ocorrencia.horario_ocorrencia)} />
        <Info icone="inbox" rotulo="Recebida" valor={formatarData(ocorrencia.data_criacao)} sub={tempoRelativo(ocorrencia.data_criacao)} />
        <Info icone="shield" rotulo="Responsável" valor={ocorrencia.responsavel_nome || "Ninguém assumiu ainda"} />
        <Info icone="hash" rotulo="Protocolo completo" valor={ocorrencia.id} />
      </Painel>
    </View>
  );

  return (
    <AdminShell
      secao="denuncias"
      titulo={`Denúncia #${ocorrencia.id.slice(0, 6).toUpperCase()}`}
      subtitulo={`${ocorrencia.tipo_incidente} · ${ocorrencia.anonimo ? "denúncia anônima" : "denunciante identificado"}`}
    >
      <Cabecalho onVoltar={voltar} />
      <View style={[{ gap: 16 }, largo && { flexDirection: "row", alignItems: "flex-start" }]}>
        {largo ? (
          <>
            {principal}
            {lateral}
          </>
        ) : (
          <>
            {lateral}
            {principal}
          </>
        )}
      </View>
      <VisualizadorImagem url={imagemAberta} titulo="Evidência anexada" onFechar={() => setImagemAberta(null)} />
    </AdminShell>
  );
}

function proximoPasso(etapa: ReturnType<typeof etapaAtual>, anonimo: boolean): string {
  switch (etapa) {
    case "RECEBIDA":
      return "Classifique a urgência e inicie a verificação.";
    case "VERIFICACAO":
      return anonimo
        ? "Apure o caso e finalize quando concluir."
        : "Apure o caso e envie um retorno ao denunciante.";
    case "RESPONDIDA":
      return "Denunciante já respondido. Finalize quando o caso estiver concluído.";
    default:
      return "Caso encerrado.";
  }
}

function Cabecalho({ onVoltar }: { onVoltar: () => void }) {
  return (
    <View style={s.header}>
      <TouchableOpacity style={s.voltar} onPress={onVoltar} activeOpacity={0.8}>
        <Feather name="arrow-left" size={16} color={COR.textoSec} />
        <Text style={s.voltarTexto}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

function BotaoAcao({
  icone,
  texto,
  cor,
  cheio,
  disabled,
  carregando,
  onPress,
}: {
  icone: IconeFeather;
  texto: string;
  cor: string;
  cheio?: boolean;
  disabled?: boolean;
  carregando?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        s.botao,
        cheio ? { backgroundColor: cor, borderColor: cor } : { borderColor: `${cor}66` },
        disabled && { opacity: 0.45 },
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={cheio ? COR.fundo : cor} />
      ) : (
        <>
          <Feather name={icone} size={16} color={cheio ? COR.fundo : cor} />
          <Text style={[s.botaoTexto, { color: cheio ? COR.fundo : cor }]}>{texto}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function Info({ icone, rotulo, valor, sub }: { icone: IconeFeather; rotulo: string; valor: string; sub?: string }) {
  return (
    <View style={s.info}>
      <Feather name={icone} size={14} color={COR.textoMudo} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={s.infoRotulo}>{rotulo}</Text>
        <Text style={s.infoValor} selectable>
          {valor}
        </Text>
        {!!sub && <Text style={s.infoSub}>{sub}</Text>}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COR.fundo },
  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  conteudo: { width: "100%", maxWidth: 1280, alignSelf: "center", gap: 16 },

  header: { flexDirection: "row", alignItems: "center" },
  voltar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 10,
    backgroundColor: COR.superficie,
    borderWidth: 1,
    borderColor: COR.borda,
  },
  voltarTexto: { color: COR.textoSec, fontSize: 13, fontWeight: "700" },

  card: {
    backgroundColor: COR.superficie,
    borderWidth: 1,
    borderColor: COR.borda,
    borderRadius: 16,
    padding: 18,
    gap: 20,
  },
  topo: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  tipo: { color: COR.texto, fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  protocolo: { color: COR.textoMudo, fontSize: 11, textAlign: "right", fontWeight: "700" },

  stepper: { flexDirection: "row" },
  passo: { flex: 1, alignItems: "center", gap: 8 },
  passoLinhaWrap: { flexDirection: "row", alignItems: "center", alignSelf: "stretch" },
  passoLinha: { flex: 1, height: 2 },
  passoBola: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  passoTexto: { color: COR.textoMudo, fontSize: 12, fontWeight: "700", textAlign: "center" },

  rotulo: { color: COR.textoMudo, fontSize: 10.5, fontWeight: "800", letterSpacing: 0.7 },
  resumoBox: { backgroundColor: COR.superficie2, borderRadius: 10, padding: 12, gap: 4 },
  descText: { color: COR.texto, fontSize: 14, lineHeight: 21 },

  evento: { flexDirection: "row", gap: 12 },
  eventoIcone: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  eventoTrilho: { width: 2, flex: 1, backgroundColor: COR.grade, marginTop: 4 },
  eventoTopo: { color: COR.textoMudo, fontSize: 12 },
  eventoCorpo: { marginTop: 6 },
  eventoResposta: {
    backgroundColor: "#40DBD512",
    borderLeftWidth: 3,
    borderLeftColor: COR.destaque,
    borderRadius: 6,
    padding: 10,
  },
  eventoTexto: { color: COR.texto, fontSize: 13.5, lineHeight: 20 },
  eventoData: { color: COR.textoMudo, fontSize: 11, marginTop: 6 },

  gravidades: { flexDirection: "row", gap: 6 },
  gravBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COR.borda,
    backgroundColor: COR.superficie2,
  },
  gravPonto: { width: 8, height: 8, borderRadius: 2 },
  gravTexto: { color: COR.textoSec, fontSize: 12, fontWeight: "700" },

  abas: { flexDirection: "row", backgroundColor: COR.superficie2, borderRadius: 10, padding: 3, gap: 3 },
  aba: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, borderRadius: 8 },
  abaAtiva: { backgroundColor: "#26304A" },
  abaTexto: { color: COR.textoMudo, fontSize: 12, fontWeight: "700" },

  input: {
    minHeight: 110,
    backgroundColor: COR.superficie2,
    borderWidth: 1,
    borderColor: COR.borda,
    borderRadius: 10,
    padding: 12,
    color: COR.texto,
    fontSize: 13.5,
    lineHeight: 20,
    textAlignVertical: "top",
  },
  aviso: { color: "#FBBF24", fontSize: 12, lineHeight: 17 },
  separador: { borderTopWidth: 1, borderTopColor: COR.borda, paddingTop: 14, gap: 8 },

  botao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  botaoTexto: { fontSize: 13.5, fontWeight: "800" },

  resolvidaBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#34D39914",
    borderRadius: 10,
    padding: 12,
  },
  resolvidaTexto: { color: COR.texto, fontSize: 13, flex: 1 },

  info: { flexDirection: "row", gap: 10 },
  infoRotulo: { color: COR.textoMudo, fontSize: 11.5, fontWeight: "700" },
  infoValor: { color: COR.texto, fontSize: 13.5, marginTop: 1 },
  infoSub: { color: COR.textoMudo, fontSize: 11.5, marginTop: 1 },

  vazio: { color: COR.textoMudo, fontSize: 13 },
  erroText: { color: "#FCA5A5", fontSize: 13, marginTop: 20 },

  imagem: { width: 180, height: 130, borderRadius: 10, backgroundColor: COR.superficie2 },
  arquivo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COR.superficie2,
    borderWidth: 1,
    borderColor: COR.borda,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  arquivoTexto: { color: COR.texto, fontSize: 13, fontWeight: "700" },
});
