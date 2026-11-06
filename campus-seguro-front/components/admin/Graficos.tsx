import { Feather } from "@expo/vector-icons";
import { ReactNode, useMemo, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from "react-native-svg";
import { COR } from "../../utils/admin";

type IconeFeather = React.ComponentProps<typeof Feather>["name"];

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

/** Curva suave que não "passa do ponto" (monotone cubic / Fritsch–Carlson). */
function caminhoSuave(pts: { x: number; y: number }[]): string {
  const n = pts.length;
  if (n === 0) return "";
  if (n === 1) return `M${pts[0].x},${pts[0].y}`;
  const dx: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1].x - pts[i].x);
    m.push((pts[i + 1].y - pts[i].y) / (dx[i] || 1));
  }
  const t: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2);
  t.push(m[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
      continue;
    }
    const a = t[i] / m[i];
    const b = t[i + 1] / m[i];
    const h = a * a + b * b;
    if (h > 9) {
      const k = 3 / Math.sqrt(h);
      t[i] = k * a * m[i];
      t[i + 1] = k * b * m[i];
    }
  }
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C${pts[i].x + h},${pts[i].y + h * t[i]} ${pts[i + 1].x - h},${pts[i + 1].y - h * t[i + 1]} ${pts[i + 1].x},${pts[i + 1].y}`;
  }
  return d;
}

function maximoBonito(v: number): number {
  if (v <= 4) return 4;
  const pot = Math.pow(10, Math.floor(Math.log10(v)));
  for (const f of [1, 2, 2.5, 5, 10]) if (f * pot >= v) return f * pot;
  return 10 * pot;
}

// ---------------------------------------------------------------------------
// Blocos
// ---------------------------------------------------------------------------

export function Painel({
  titulo,
  subtitulo,
  icone,
  acao,
  children,
  style,
}: {
  titulo: string;
  subtitulo?: string;
  icone?: IconeFeather;
  acao?: ReactNode;
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
}) {
  return (
    <View style={[g.painel, style as any]}>
      <View style={g.painelTopo}>
        {icone && (
          <View style={g.painelIcone}>
            <Feather name={icone} size={16} color="#60A5FA" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={g.painelTitulo}>{titulo}</Text>
          {!!subtitulo && <Text style={g.painelSub}>{subtitulo}</Text>}
        </View>
        {acao}
      </View>
      {children}
    </View>
  );
}

/** Mini-gráfico de tendência para os indicadores. */
export function Sparkline({ valores, cor, largura = 120, altura = 42 }: { valores: number[]; cor: string; largura?: number; altura?: number }) {
  const id = useMemo(() => `sp${Math.random().toString(36).slice(2, 8)}`, []);
  if (valores.length < 2) return <View style={{ width: largura, height: altura }} />;
  const max = Math.max(1, ...valores);
  const pts = valores.map((v, i) => ({
    x: (i / (valores.length - 1)) * (largura - 4) + 2,
    y: altura - 3 - (v / max) * (altura - 8),
  }));
  const linha = caminhoSuave(pts);
  const area = `${linha} L${pts[pts.length - 1].x},${altura} L${pts[0].x},${altura} Z`;
  return (
    <Svg width={largura} height={altura}>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={cor} stopOpacity={0.35} />
          <Stop offset="1" stopColor={cor} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={area} fill={`url(#${id})`} />
      <Path d={linha} stroke={cor} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/** Indicador: ícone colorido, número, variação vs. período anterior e tendência. */
export function KpiCard({
  rotulo,
  valor,
  icone,
  cor,
  variacao,
  subidaBoa,
  serie,
  legendaVariacao = "vs. período anterior",
  onPress,
}: {
  rotulo: string;
  valor: number | string;
  icone: IconeFeather;
  cor: string;
  variacao: number | null;
  subidaBoa: boolean;
  serie: number[];
  legendaVariacao?: string;
  onPress?: () => void;
}) {
  const sobe = (variacao ?? 0) > 0;
  const estavel = variacao === 0 || variacao === null;
  const corVar = estavel ? COR.textoMudo : sobe === subidaBoa ? "#22C55E" : "#F87171";
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ hovered }: any) => [g.kpi, hovered && onPress ? { borderColor: "#34405E" } : null]}
    >
      <View style={g.kpiTopo}>
        <View style={[g.kpiIcone, { backgroundColor: cor }]}>
          <Feather name={icone} size={22} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={g.kpiRotulo} numberOfLines={2}>
            {rotulo}
          </Text>
          <Text style={g.kpiValor}>{valor}</Text>
        </View>
        <Sparkline valores={serie} cor={cor} largura={84} altura={40} />
      </View>
      <Text style={[g.kpiVar, { color: corVar }]} numberOfLines={1}>
        {variacao === null ? "Novo" : `${sobe ? "↑" : variacao! < 0 ? "↓" : "="} ${Math.abs(variacao)}%`}
        <Text style={g.kpiVarLegenda}>
          {variacao === null ? "  sem dados no período anterior" : `  ${legendaVariacao}`}
        </Text>
      </Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Gráfico de área (várias séries, mesmo eixo) com tooltip
// ---------------------------------------------------------------------------

export interface SerieArea {
  chave: string;
  label: string;
  cor: string;
  valores: number[];
}

export function GraficoArea({
  series,
  rotulosX,
  dicas,
  altura = 230,
}: {
  series: SerieArea[];
  rotulosX: string[];
  dicas: string[];
  altura?: number;
}) {
  const [largura, setLargura] = useState(0);
  const [foco, setFoco] = useState<number | null>(null);
  const idBase = useMemo(() => `ga${Math.random().toString(36).slice(2, 8)}`, []);

  const n = rotulosX.length;
  const eixoY = 34;
  const w = Math.max(0, largura - eixoY);
  const topo = 8;
  const h = altura - topo;
  const max = maximoBonito(Math.max(0, ...series.flatMap((s) => s.valores)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));
  const x = (i: number) => (n <= 1 ? w / 2 : (i / (n - 1)) * w);
  const y = (v: number) => topo + h - (v / max) * h;

  // Séries maiores atrás, menores na frente
  const ordem = [...series].sort(
    (a, b) => b.valores.reduce((s, v) => s + v, 0) - a.valores.reduce((s, v) => s + v, 0)
  );

  const onLayout = (e: LayoutChangeEvent) => setLargura(e.nativeEvent.layout.width);

  // Rótulos do eixo X: no máximo ~6, sem colidir
  const passoX = Math.max(1, Math.ceil(n / 6));

  return (
    <View>
      <View style={{ height: altura + 1 }} onLayout={onLayout}>
        {largura > 0 && (
          <>
            {/* eixo Y */}
            {ticks.map((t) => (
              <Text key={t} style={[g.eixoY, { top: y(t) - 7 }]}>
                {t}
              </Text>
            ))}
            <Svg width={w} height={altura + 1} style={{ position: "absolute", left: eixoY }}>
              <Defs>
                {series.map((s) => (
                  <LinearGradient key={s.chave} id={`${idBase}${s.chave}`} x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={s.cor} stopOpacity={0.32} />
                    <Stop offset="1" stopColor={s.cor} stopOpacity={0.02} />
                  </LinearGradient>
                ))}
              </Defs>
              {ticks.map((t) => (
                <Line key={t} x1={0} x2={w} y1={y(t)} y2={y(t)} stroke={t === 0 ? "#323B55" : COR.grade} strokeWidth={1} />
              ))}
              {ordem.map((s) => {
                const pts = s.valores.map((v, i) => ({ x: x(i), y: y(v) }));
                const linha = caminhoSuave(pts);
                const area = `${linha} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z`;
                return (
                  <Path key={`a${s.chave}`} d={area} fill={`url(#${idBase}${s.chave})`} />
                );
              })}
              {ordem.map((s) => (
                <Path
                  key={`l${s.chave}`}
                  d={caminhoSuave(s.valores.map((v, i) => ({ x: x(i), y: y(v) })))}
                  stroke={s.cor}
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                />
              ))}
              {foco !== null && (
                <>
                  <Line x1={x(foco)} x2={x(foco)} y1={topo} y2={y(0)} stroke="#8EA0C7" strokeWidth={1} strokeDasharray="4 4" />
                  {series.map((s) => (
                    <Circle key={s.chave} cx={x(foco)} cy={y(s.valores[foco] ?? 0)} r={5} fill={s.cor} stroke={COR.superficie} strokeWidth={2} />
                  ))}
                </>
              )}
            </Svg>

            {/* áreas de hover (maiores que o ponto) */}
            <View style={[StyleSheet.absoluteFill, { left: eixoY, flexDirection: "row" }]}>
              {rotulosX.map((_, i) => (
                <Pressable
                  key={i}
                  style={{ flex: 1 }}
                  onHoverIn={() => setFoco(i)}
                  onHoverOut={() => setFoco((f) => (f === i ? null : f))}
                  onPress={() => setFoco(i)}
                />
              ))}
            </View>

            {foco !== null && (
              <View
                pointerEvents="none"
                style={[
                  g.tooltip,
                  x(foco) + eixoY > largura - 170
                    ? { right: largura - (x(foco) + eixoY) + 12 }
                    : { left: x(foco) + eixoY + 12 },
                ]}
              >
                <Text style={g.tooltipTitulo}>{dicas[foco]}</Text>
                {series.map((s) => (
                  <View key={s.chave} style={g.tooltipLinha}>
                    <View style={[g.tooltipPonto, { backgroundColor: s.cor }]} />
                    <Text style={g.tooltipRotulo}>{s.label}</Text>
                    <Text style={g.tooltipValor}>{s.valores[foco] ?? 0}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>

      {/* eixo X */}
      <View style={{ height: 18, marginLeft: eixoY, marginTop: 6 }}>
        {largura > 0 &&
          rotulosX.map((r, i) =>
            i % passoX === 0 || i === n - 1 ? (
              <Text
                key={i}
                style={[g.eixoX, { left: Math.min(Math.max(x(i) - 24, -6), w - 44) }]}
                numberOfLines={1}
              >
                {i === n - 1 || n - 1 - i >= passoX * 0.6 ? r : ""}
              </Text>
            ) : null
          )}
      </View>

      {/* legenda */}
      <View style={g.legenda}>
        {series.map((s) => (
          <View key={s.chave} style={g.legendaItem}>
            <View style={[g.legendaPonto, { backgroundColor: s.cor }]} />
            <Text style={g.legendaTexto}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Rosca (gravidade)
// ---------------------------------------------------------------------------

export interface FatiaRosca {
  chave: string;
  label: string;
  valor: number;
  cor: string;
}

export function Rosca({
  fatias,
  tamanho = 180,
  rotuloCentro = "Denúncias",
  selecionado,
  onSelecionar,
}: {
  fatias: FatiaRosca[];
  tamanho?: number;
  rotuloCentro?: string;
  selecionado?: string | null;
  onSelecionar?: (chave: string) => void;
}) {
  const total = fatias.reduce((a, f) => a + f.valor, 0);
  const esp = 26;
  const r = (tamanho - esp) / 2;
  const c = 2 * Math.PI * r;
  const visiveis = fatias.filter((f) => f.valor > 0);
  const vao = visiveis.length > 1 ? 3 : 0;
  let acumulado = 0;

  return (
    <View style={g.roscaLinha}>
      <View style={{ width: tamanho, height: tamanho }}>
        <Svg width={tamanho} height={tamanho} style={{ transform: [{ rotate: "-90deg" }] }}>
          <Circle cx={tamanho / 2} cy={tamanho / 2} r={r} stroke={COR.superficie2} strokeWidth={esp} fill="none" />
          {total > 0 &&
            visiveis.map((f) => {
              const comp = (f.valor / total) * c;
              const el = (
                <Circle
                  key={f.chave}
                  cx={tamanho / 2}
                  cy={tamanho / 2}
                  r={r}
                  stroke={f.cor}
                  strokeWidth={esp}
                  fill="none"
                  strokeDasharray={`${Math.max(0, comp - vao)} ${c}`}
                  strokeDashoffset={-acumulado}
                  opacity={selecionado && selecionado !== f.chave ? 0.3 : 1}
                />
              );
              acumulado += comp;
              return el;
            })}
        </Svg>
        <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]} pointerEvents="none">
          <Text style={g.roscaTotal}>{total}</Text>
          <Text style={g.roscaRotulo}>{rotuloCentro}</Text>
        </View>
      </View>

      <View style={{ flex: 1, gap: 6, minWidth: 150 }}>
        {fatias.map((f) => {
          const pct = total ? Math.round((f.valor / total) * 100) : 0;
          const apagado = selecionado && selecionado !== f.chave;
          return (
            <Pressable
              key={f.chave}
              onPress={onSelecionar ? () => onSelecionar(f.chave) : undefined}
              style={({ hovered }: any) => [g.roscaItem, hovered && onSelecionar ? { backgroundColor: "#1A2136" } : null]}
            >
              <View style={[g.roscaQuadrado, { backgroundColor: f.cor, opacity: apagado ? 0.35 : 1 }]} />
              <Text style={[g.roscaItemTexto, apagado ? { color: COR.textoMudo } : null]} numberOfLines={1}>
                {f.label}
              </Text>
              <Text style={g.roscaItemValor}>
                {f.valor} <Text style={g.roscaItemPct}>({pct}%)</Text>
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Barras horizontais
// ---------------------------------------------------------------------------

export interface ItemBarra {
  chave: string;
  label: string;
  valor: number;
  cor?: string;
}

export function BarrasHorizontais({
  itens,
  corPadrao = "#60A5FA",
  selecionado,
  onSelecionar,
  vazio = "Sem dados no período.",
}: {
  itens: ItemBarra[];
  corPadrao?: string;
  selecionado?: string | null;
  onSelecionar?: (chave: string) => void;
  vazio?: string;
}) {
  const max = Math.max(1, ...itens.map((i) => i.valor));
  const total = itens.reduce((a, i) => a + i.valor, 0);
  if (total === 0) return <Text style={g.vazio}>{vazio}</Text>;

  return (
    <View style={{ gap: 10 }}>
      {itens.map((item) => {
        const pct = total ? Math.round((item.valor / total) * 100) : 0;
        const apagado = selecionado && selecionado !== item.chave;
        return (
          <Pressable
            key={item.chave}
            onPress={onSelecionar ? () => onSelecionar(item.chave) : undefined}
            disabled={!onSelecionar}
            style={({ hovered }: any) => [g.barraLinha, hovered && onSelecionar ? g.barraHover : null]}
            accessibilityLabel={`${item.label}: ${item.valor} (${pct}%)`}
          >
            <View style={g.barraCabecalho}>
              <Text style={[g.barraRotulo, apagado ? { color: COR.textoMudo } : null]} numberOfLines={1}>
                {item.label}
              </Text>
              <Text style={g.barraValor}>
                {item.valor}
                <Text style={g.barraPct}>  {pct}%</Text>
              </Text>
            </View>
            <View style={g.trilho}>
              <View
                style={[
                  g.barra,
                  {
                    width: `${Math.max(item.valor ? 2 : 0, (item.valor / max) * 100)}%`,
                    backgroundColor: item.cor ?? corPadrao,
                    opacity: apagado ? 0.35 : 1,
                  },
                ]}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const g = StyleSheet.create({
  painel: {
    backgroundColor: COR.superficie,
    borderWidth: 1,
    borderColor: COR.borda,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  painelTopo: { flexDirection: "row", alignItems: "center", gap: 10 },
  painelIcone: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: "#3B82F61A",
    alignItems: "center",
    justifyContent: "center",
  },
  painelTitulo: { color: COR.texto, fontSize: 16, fontWeight: "800" },
  painelSub: { color: COR.textoMudo, fontSize: 12, marginTop: 2 },

  kpiTopo: { flexDirection: "row", alignItems: "center", gap: 12 },
  kpi: {
    flex: 1,
    minWidth: 240,
    gap: 10,
    backgroundColor: COR.superficie,
    borderWidth: 1,
    borderColor: COR.borda,
    borderRadius: 16,
    padding: 18,
  },
  kpiIcone: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  kpiRotulo: { color: COR.textoSec, fontSize: 14, fontWeight: "600" },
  kpiValor: { color: COR.texto, fontSize: 30, fontWeight: "800", letterSpacing: -0.5, marginVertical: 2 },
  kpiVar: { fontSize: 12.5, fontWeight: "800" },
  kpiVarLegenda: { color: COR.textoMudo, fontWeight: "500" },

  eixoY: { position: "absolute", left: 0, width: 28, textAlign: "right", color: COR.textoMudo, fontSize: 11 },
  eixoX: { position: "absolute", width: 48, textAlign: "center", color: COR.textoMudo, fontSize: 11 },
  tooltip: {
    position: "absolute",
    top: 6,
    backgroundColor: "#0B1020F2",
    borderWidth: 1,
    borderColor: "#2A3350",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
    minWidth: 150,
  },
  tooltipTitulo: { color: COR.texto, fontSize: 12, fontWeight: "800", marginBottom: 2 },
  tooltipLinha: { flexDirection: "row", alignItems: "center", gap: 6 },
  tooltipPonto: { width: 8, height: 8, borderRadius: 4 },
  tooltipRotulo: { color: COR.textoSec, fontSize: 12, flex: 1 },
  tooltipValor: { color: COR.texto, fontSize: 12, fontWeight: "800" },

  legenda: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 18, marginTop: 10 },
  legendaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendaPonto: { width: 9, height: 9, borderRadius: 5 },
  legendaTexto: { color: COR.textoSec, fontSize: 12 },

  roscaLinha: { flexDirection: "row", alignItems: "center", gap: 22, flexWrap: "wrap" },
  roscaTotal: { color: COR.texto, fontSize: 30, fontWeight: "800" },
  roscaRotulo: { color: COR.textoSec, fontSize: 12 },
  roscaItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6, paddingHorizontal: 6, borderRadius: 8 },
  roscaQuadrado: { width: 12, height: 12, borderRadius: 3 },
  roscaItemTexto: { color: COR.texto, fontSize: 14, flex: 1 },
  roscaItemValor: { color: COR.texto, fontSize: 14, fontWeight: "700" },
  roscaItemPct: { color: COR.textoMudo, fontWeight: "500" },

  vazio: { color: COR.textoMudo, fontSize: 13, paddingVertical: 18, textAlign: "center" },

  barraLinha: { gap: 6, borderRadius: 8, paddingVertical: 2 },
  barraHover: { backgroundColor: "#1A2136" },
  barraCabecalho: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  barraRotulo: { color: COR.texto, fontSize: 13, fontWeight: "600", flexShrink: 1 },
  barraValor: { color: COR.texto, fontSize: 13, fontWeight: "800" },
  barraPct: { color: COR.textoMudo, fontSize: 11, fontWeight: "600" },
  trilho: { height: 8, borderRadius: 4, backgroundColor: COR.superficie2, overflow: "hidden" },
  barra: { height: 8, borderRadius: 4 },
});
