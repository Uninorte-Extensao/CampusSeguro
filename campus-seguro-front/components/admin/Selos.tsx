import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { OcorrenciaAdmin } from "../../services/api";
import {
  COR,
  ETAPA_COR,
  ETAPAS,
  etapaAtual,
  GRAVIDADE_COR,
  normalizarGravidade,
  SEM_GRAVIDADE_COR,
} from "../../utils/admin";

/** Urgência: cor + ícone + texto (nunca só a cor). */
export function SeloGravidade({ gravidade }: { gravidade?: string | null }) {
  const g = normalizarGravidade(gravidade);
  const cor = g ? GRAVIDADE_COR[g] : SEM_GRAVIDADE_COR;
  return (
    <View style={[s.selo, { borderColor: `${cor}66`, backgroundColor: `${cor}1A` }]}>
      <Feather name={g === "Crítica" || g === "Alta" ? "alert-triangle" : "alert-circle"} size={11} color={cor} />
      <Text style={s.seloTexto}>{g ?? "Sem classif."}</Text>
    </View>
  );
}

export function SeloEtapa({ o }: { o: Pick<OcorrenciaAdmin, "status" | "respondida"> }) {
  const e = etapaAtual(o);
  const info = ETAPAS.find((x) => x.chave === e)!;
  return (
    <View style={[s.selo, { borderColor: `${ETAPA_COR[e]}66`, backgroundColor: `${ETAPA_COR[e]}14` }]}>
      <Feather name={info.icone as any} size={11} color={ETAPA_COR[e]} />
      <Text style={s.seloTexto}>{info.label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  selo: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  seloTexto: { color: COR.texto, fontSize: 11, fontWeight: "700" },
});
