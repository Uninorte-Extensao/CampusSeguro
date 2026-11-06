import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { abrirArquivo, VisualizadorImagem } from "../../components/VisualizadorImagem";
import {
  adicionarAtualizacao,
  Atualizacao,
  buscarOcorrencia,
  EvidenciaResponse,
  listarAtualizacoes,
  listarEvidencias,
  Ocorrencia,
} from "../../services/api";
import { ETAPAS_ALUNO, EtapaAluno, etapaDoAluno, infoEtapa } from "../../utils/acompanhamento";
import { formatarData, normalizarGravidade } from "../../utils/admin";
import { alerta } from "../../utils/alerta";

export default function AcompanhamentoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [oc, setOc] = useState<Ocorrencia | null>(null);
  const [eventos, setEventos] = useState<Atualizacao[]>([]);
  const [anexos, setAnexos] = useState<EvidenciaResponse[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [imagem, setImagem] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async () => {
    if (!id) return;
    try {
      const [o, tl, ev] = await Promise.all([
        buscarOcorrencia(id),
        listarAtualizacoes(id).catch(() => [] as Atualizacao[]),
        listarEvidencias(id).catch(() => [] as EvidenciaResponse[]),
      ]);
      setOc(o);
      setEventos(tl);
      setAnexos(ev);
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível carregar a denúncia.");
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const voltar = () => (router.canGoBack() ? router.back() : router.replace("/minhas-denuncias" as any));

  if (carregando || !oc) {
    return (
      <SafeAreaView style={s.container} edges={["top", "bottom"]}>
        <View style={[s.scroll, { paddingTop: 16 }]}>
          <Cabecalho onVoltar={voltar} />
          {carregando ? <ActivityIndicator color="#40DBD5" style={{ marginTop: 40 }} /> : <Text style={s.erro}>{erro}</Text>}
        </View>
      </SafeAreaView>
    );
  }

  const respostas = eventos.filter((e) => e.tipo === "RESPOSTA");
  const etapa = etapaDoAluno(oc.status, respostas.length > 0);
  const info = infoEtapa(etapa);
  const indice = ETAPAS_ALUNO.findIndex((e) => e.chave === etapa);
  const finalizada = oc.status === "RESOLVIDO";

  // Data em que cada etapa aconteceu
  const quando: Record<EtapaAluno, string | null> = {
    RECEBIDA: oc.data_criacao,
    ANALISE:
      eventos.find((e) => e.tipo === "STATUS" && /verifica/i.test(e.mensagem_acao))?.data_atualizado ??
      (oc.status !== "ABERTO" ? respostas[0]?.data_atualizado ?? null : null),
    RESPONDIDA: respostas[0]?.data_atualizado ?? null,
    FINALIZADA: finalizada ? oc.data_resolucao ?? null : null,
  };

  async function enviarMensagem() {
    const texto = mensagem.trim();
    if (!texto) return;
    setEnviando(true);
    try {
      await adicionarAtualizacao(id, texto);
      setMensagem("");
      await carregar();
    } catch (e) {
      alerta("Não foi possível enviar", e instanceof Error ? e.message : "Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  const conversa = eventos.filter((e) => e.tipo === "RESPOSTA" || e.tipo === "MENSAGEM");
  const grav = normalizarGravidade(oc.gravidade);

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Cabecalho onVoltar={voltar} />

        {/* Situação atual */}
        <View style={[s.banner, { borderColor: `${info.cor}55`, backgroundColor: `${info.cor}14` }]}>
          <View style={[s.bannerIcone, { backgroundColor: `${info.cor}26` }]}>
            <Feather name={info.icone as any} size={22} color={info.cor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.bannerRotulo}>SITUAÇÃO ATUAL</Text>
            <Text style={[s.bannerTitulo, { color: info.cor }]}>{finalizada ? "Denúncia finalizada" : info.label}</Text>
            <Text style={s.bannerTexto}>
              {finalizada ? `Encerrada pela direção em ${formatarData(oc.data_resolucao)}.` : info.descricao}
            </Text>
          </View>
        </View>

        {/* Etapas */}
        <View style={s.card}>
          <Text style={s.secao}>Andamento</Text>
          {ETAPAS_ALUNO.map((e, i) => {
            const feita = i <= indice;
            const atual = i === indice && !finalizada;
            return (
              <View key={e.chave} style={s.passo}>
                <View style={{ alignItems: "center" }}>
                  <View style={[s.bola, { borderColor: feita ? e.cor : "#30364B", backgroundColor: feita && !atual ? e.cor : "#0F1728" }]}>
                    <Feather name={(feita && !atual ? "check" : e.icone) as any} size={13} color={feita && !atual ? "#0B1020" : feita ? e.cor : "#454D66"} />
                  </View>
                  {i < ETAPAS_ALUNO.length - 1 && <View style={[s.trilho, { backgroundColor: i < indice ? ETAPAS_ALUNO[i + 1].cor : "#26304A" }]} />}
                </View>
                <View style={{ flex: 1, paddingBottom: 16 }}>
                  <Text style={[s.passoTitulo, !feita && { color: "#5B6380" }]}>
                    {e.label}
                    {atual ? "  ·  agora" : ""}
                  </Text>
                  <Text style={s.passoTexto}>{feita ? (quando[e.chave] ? formatarData(quando[e.chave]) : e.descricao) : "Ainda não"}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Retorno da direção */}
        <View style={s.card}>
          <Text style={s.secao}>Retorno da direção</Text>
          {conversa.length === 0 ? (
            <View style={s.vazio}>
              <Feather name="message-circle" size={26} color="#30364B" />
              <Text style={s.vazioTexto}>
                {finalizada ? "A denúncia foi finalizada sem mensagens." : "Ainda não há resposta. Você será informado aqui."}
              </Text>
            </View>
          ) : (
            conversa.map((m) =>
              m.tipo === "RESPOSTA" ? (
                <View key={m.id} style={s.respostaBox}>
                  <View style={s.respostaTopo}>
                    <Feather name="shield" size={13} color="#40DBD5" />
                    <Text style={s.respostaAutor}>Direção · {m.autor_nome ?? "Administração"}</Text>
                    <Text style={s.data}>{formatarData(m.data_atualizado)}</Text>
                  </View>
                  <Text style={s.respostaTexto}>{m.mensagem_acao}</Text>
                </View>
              ) : (
                <View key={m.id} style={s.minhaBox}>
                  <View style={s.respostaTopo}>
                    <Text style={s.minhaAutor}>Você</Text>
                    <Text style={s.data}>{formatarData(m.data_atualizado)}</Text>
                  </View>
                  <Text style={s.respostaTexto}>{m.mensagem_acao}</Text>
                </View>
              )
            )
          )}

          {!finalizada ? (
            <View style={s.enviarLinha}>
              <TextInput
                value={mensagem}
                onChangeText={setMensagem}
                placeholder="Escreva uma mensagem para a direção..."
                placeholderTextColor="#5B6380"
                style={s.input}
                multiline
                editable={!enviando}
              />
              <TouchableOpacity style={[s.enviar, (!mensagem.trim() || enviando) && { opacity: 0.4 }]} onPress={enviarMensagem} disabled={!mensagem.trim() || enviando}>
                {enviando ? <ActivityIndicator color="#0B1020" /> : <Feather name="send" size={18} color="#0B1020" />}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.finalizada}>
              <Feather name="check-circle" size={16} color="#34D399" />
              <Text style={s.finalizadaTexto}>
                Caso encerrado em {formatarData(oc.data_resolucao)}. Se algo acontecer de novo, faça uma nova denúncia.
              </Text>
            </View>
          )}
        </View>

        {/* Sua denúncia */}
        <View style={s.card}>
          <Text style={s.secao}>Sua denúncia</Text>
          <Text style={s.tipo}>{oc.tipo_incidente}</Text>
          <Linha icone="hash" texto={`Protocolo ${oc.id.slice(0, 8).toUpperCase()}`} />
          <Linha icone="map-pin" texto={oc.localizacao} />
          <Linha icone="clock" texto={`Ocorrido em ${formatarData(oc.horario_ocorrencia)}`} />
          <Linha icone="send" texto={`Enviada em ${formatarData(oc.data_criacao)}`} />
          {grav && <Linha icone="alert-triangle" texto={`Gravidade informada: ${grav}`} />}
          <View style={s.relato}>
            <Text style={s.relatoTexto}>{oc.descricao || oc.descricao_resumida}</Text>
          </View>

          {anexos.length > 0 && (
            <>
              <Text style={[s.secao, { fontSize: 13, marginTop: 4 }]}>Anexos ({anexos.length})</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {anexos.map((a) =>
                  a.tipo_midia === "Foto" ? (
                    <TouchableOpacity key={a.id} onPress={() => setImagem(a.url)} activeOpacity={0.85}>
                      <Image source={{ uri: a.url }} style={s.miniatura} resizeMode="cover" />
                      <View style={s.zoom}>
                        <Feather name="maximize-2" size={12} color="#FFF" />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity key={a.id} style={s.arquivo} onPress={() => abrirArquivo(a.url)}>
                      <Feather name={a.tipo_midia === "Vídeo" ? "video" : a.tipo_midia === "Áudio" ? "mic" : "file-text"} size={16} color="#40DBD5" />
                      <Text style={s.arquivoTexto}>Abrir {a.tipo_midia.toLowerCase()}</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </>
          )}
        </View>

        <Text style={s.rodape}>
          Volte a esta tela para ver novas respostas da direção.
        </Text>
      </ScrollView>

      <VisualizadorImagem url={imagem} titulo="Anexo da sua denúncia" onFechar={() => setImagem(null)} />
    </SafeAreaView>
  );
}

function Cabecalho({ onVoltar }: { onVoltar: () => void }) {
  return (
    <View style={s.header}>
      <TouchableOpacity style={s.voltar} onPress={onVoltar}>
        <Feather name="arrow-left" size={20} color="#C9D3FF" />
      </TouchableOpacity>
      <Text style={s.headerTitulo}>Acompanhamento</Text>
      <View style={{ width: 38 }} />
    </View>
  );
}

function Linha({ icone, texto }: { icone: React.ComponentProps<typeof Feather>["name"]; texto: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Feather name={icone} size={13} color="#8D90A1" />
      <Text style={s.linhaTexto}>{texto}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1020" },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, gap: 14, width: "100%", maxWidth: 720, alignSelf: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  voltar: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#171D2E", borderWidth: 1, borderColor: "#1F2638", alignItems: "center", justifyContent: "center" },
  headerTitulo: { color: "#EAF0FF", fontSize: 16, fontWeight: "800" },

  banner: { flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1, borderRadius: 18, padding: 16 },
  bannerIcone: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  bannerRotulo: { color: "#8D90A1", fontSize: 10.5, fontWeight: "900", letterSpacing: 0.8 },
  bannerTitulo: { fontSize: 19, fontWeight: "800", marginTop: 2 },
  bannerTexto: { color: "#AAB4C8", fontSize: 13, marginTop: 2 },

  card: { backgroundColor: "#171D2E", borderWidth: 1, borderColor: "#26304A", borderRadius: 18, padding: 16, gap: 12 },
  secao: { color: "#EAF0FF", fontSize: 15, fontWeight: "800" },

  passo: { flexDirection: "row", gap: 12 },
  bola: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  trilho: { width: 2, flex: 1, marginTop: 2 },
  passoTitulo: { color: "#EAF0FF", fontSize: 14, fontWeight: "800", marginTop: 5 },
  passoTexto: { color: "#8D90A1", fontSize: 12.5, marginTop: 2 },

  vazio: { alignItems: "center", gap: 8, paddingVertical: 14 },
  vazioTexto: { color: "#8D90A1", fontSize: 13, textAlign: "center" },
  respostaBox: { backgroundColor: "#0F1728", borderLeftWidth: 3, borderLeftColor: "#40DBD5", borderRadius: 12, padding: 12, gap: 6, marginRight: 24 },
  minhaBox: { backgroundColor: "#1E2A48", borderRadius: 12, padding: 12, gap: 6, marginLeft: 24 },
  respostaTopo: { flexDirection: "row", alignItems: "center", gap: 6 },
  respostaAutor: { color: "#40DBD5", fontSize: 12, fontWeight: "800", flex: 1 },
  minhaAutor: { color: "#A5B4FC", fontSize: 12, fontWeight: "800", flex: 1 },
  data: { color: "#8D90A1", fontSize: 11 },
  respostaTexto: { color: "#EAF0FF", fontSize: 14, lineHeight: 20 },
  enviarLinha: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
  input: { flex: 1, minHeight: 46, maxHeight: 120, backgroundColor: "#0F1728", borderWidth: 1, borderColor: "#26304A", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, color: "#EAF0FF", fontSize: 14 },
  enviar: { width: 46, height: 46, borderRadius: 12, backgroundColor: "#40DBD5", alignItems: "center", justifyContent: "center" },
  finalizada: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#34D3991A", borderRadius: 12, padding: 12 },
  finalizadaTexto: { color: "#6EE7B7", fontSize: 13, flex: 1, lineHeight: 18 },

  tipo: { color: "#EAF0FF", fontSize: 17, fontWeight: "800" },
  linhaTexto: { color: "#AAB4C8", fontSize: 13, flex: 1 },
  relato: { backgroundColor: "#0F1728", borderRadius: 12, padding: 12 },
  relatoTexto: { color: "#EAF0FF", fontSize: 14, lineHeight: 20 },
  miniatura: { width: 150, height: 100, borderRadius: 10, backgroundColor: "#0F1728" },
  zoom: { position: "absolute", right: 6, bottom: 6, width: 22, height: 22, borderRadius: 6, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" },
  arquivo: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#0F1728", borderWidth: 1, borderColor: "#26304A", borderRadius: 10, padding: 12 },
  arquivoTexto: { color: "#EAF0FF", fontSize: 13, fontWeight: "700" },
  rodape: { color: "#5B6380", fontSize: 11.5, textAlign: "center" },
  erro: { color: "#FCA5A5", fontSize: 13, marginTop: 20 },
});
