<script lang="ts" module>
  /**
   * BellCurveChart — chart STATISTIQUE. À partir d'un échantillon de nombres
   * bruts (`number[]`), calcule la moyenne μ et l'écart-type d'échantillon σ
   * (n-1), puis trace la densité de la loi normale
   *   pdf(x) = exp(-((x-μ)²/(2σ²))) / (σ·√(2π))
   * sur l'intervalle μ-4σ → μ+4σ, sous forme d'aire lissée + ligne.
   * Repères : ligne verticale à μ et marques à μ±σ, μ±2σ.
   * API canonique (référence Svelte ; React/Vue s'alignent).
   *
   * Props obligatoires :
   *   data   number[]  - échantillon de valeurs brutes
   *   label  string    - aria-label du graphique
   *
   * Props optionnelles :
   *   tone       "category1".."category8"  (défaut "category1")
   *   width      number  (défaut 480)
   *   height     number  (défaut 240)
   *   smooth     boolean (défaut true)  - courbe lissée vs polyligne
   *   intervals  number  (défaut 64)    - points d'échantillonnage de la courbe
   *   class      string
   *
   * Si l'échantillon contient moins de 2 valeurs finies, ou si σ vaut 0
   * (toutes les valeurs identiques), un état vide accessible est rendu sans
   * planter (aucune courbe, message dans la liste accessible).
   */
  export type BellCurveChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type BellCurveChartProps = {
    data: number[];
    width?: number;
    height?: number;
    tone?: BellCurveChartTone;
    smooth?: boolean;
    intervals?: number;
    label: string;
    class?: string;
  };

  let {
    data = [],
    width = 480,
    height = 240,
    tone = "category1",
    smooth = true,
    intervals = 64,
    label,
    class: className
  }: BellCurveChartProps = $props();

  const MARGIN = { top: 12, right: 16, bottom: 32, left: 44 };
  const SQRT_2PI = Math.sqrt(2 * Math.PI);

  function niceTicks(min: number, max: number, target = 5): number[] {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
      const base = Number.isFinite(max) ? max : 0;
      return [base];
    }
    const range = max - min;
    const rough = range / Math.max(target - 1, 1);
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / pow;
    let step: number;
    if (norm < 1.5) step = 1 * pow;
    else if (norm < 3) step = 2 * pow;
    else if (norm < 7) step = 5 * pow;
    else step = 10 * pow;
    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;
    const ticks: number[] = [];
    for (let v = start; v <= end + step / 2; v += step) {
      ticks.push(Number(v.toFixed(10)));
    }
    return ticks;
  }

  function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number) {
    if (d1 === d0) return r0;
    return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
  }

  function formatTick(v: number): string {
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(1);
  }

  function buildLinearPath(pts: { x: number; y: number }[]): string {
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  }

  function buildSmoothPath(pts: { x: number; y: number }[]): string {
    if (pts.length < 2) return buildLinearPath(pts);
    const t = 0.18;
    let d = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? p2;
      const c1x = p1.x + (p2.x - p0.x) * t;
      const c1y = p1.y + (p2.y - p0.y) * t;
      const c2x = p2.x - (p3.x - p1.x) * t;
      const c2y = p2.y - (p3.y - p1.y) * t;
      d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
    }
    return d;
  }

  // Valeurs finies seulement.
  const sample = $derived(data.filter((d) => Number.isFinite(d)));

  // Statistiques : μ = moyenne, σ = écart-type d'échantillon (n-1).
  const stats = $derived.by(() => {
    const n = sample.length;
    if (n < 2) return null;
    const mean = sample.reduce((a, b) => a + b, 0) / n;
    const variance = sample.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (n - 1);
    const sd = Math.sqrt(variance);
    if (!(sd > 0) || !Number.isFinite(sd)) return null;
    return { mean, sd, n };
  });

  function pdf(x: number, mean: number, sd: number): number {
    const z = (x - mean) / sd;
    return Math.exp(-(z * z) / 2) / (sd * SQRT_2PI);
  }

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  const sampleCount = $derived(Math.max(8, Math.floor(intervals) || 64));

  const xDomain = $derived.by(() => {
    if (!stats) return { min: 0, max: 1 };
    return { min: stats.mean - 4 * stats.sd, max: stats.mean + 4 * stats.sd };
  });

  // Densité maximale = pic en x=μ : pdf(μ) = 1/(σ·√(2π)).
  const yMax = $derived(stats ? pdf(stats.mean, stats.mean, stats.sd) : 1);

  const yDomain = $derived({ min: 0, max: yMax * 1.08 });

  const xTicks = $derived.by(() => {
    if (!stats) return [0];
    return niceTicks(xDomain.min, xDomain.max, 5);
  });

  const curvePoints = $derived.by(() => {
    if (!stats) return [];
    const pts: { x: number; y: number; vx: number }[] = [];
    for (let i = 0; i <= sampleCount; i++) {
      const vx = xDomain.min + ((xDomain.max - xDomain.min) * i) / sampleCount;
      const vy = pdf(vx, stats.mean, stats.sd);
      pts.push({
        x: MARGIN.left + scaleLinear(vx, xDomain.min, xDomain.max, 0, plotWidth),
        y: MARGIN.top + scaleLinear(vy, yDomain.min, yDomain.max, plotHeight, 0),
        vx
      });
    }
    return pts;
  });

  const linePath = $derived(
    curvePoints.length === 0 ? "" : smooth ? buildSmoothPath(curvePoints) : buildLinearPath(curvePoints)
  );

  const areaPath = $derived.by(() => {
    if (curvePoints.length === 0) return "";
    const base = MARGIN.top + plotHeight;
    const first = curvePoints[0];
    const last = curvePoints[curvePoints.length - 1];
    return `${linePath} L${last.x.toFixed(2)},${base.toFixed(2)} L${first.x.toFixed(2)},${base.toFixed(2)} Z`;
  });

  const baseY = $derived(MARGIN.top + plotHeight);

  // Repères verticaux : μ (mean) et μ±σ, μ±2σ (sd markers).
  const meanMark = $derived.by(() => {
    if (!stats) return null;
    return {
      x: MARGIN.left + scaleLinear(stats.mean, xDomain.min, xDomain.max, 0, plotWidth),
      yTop: MARGIN.top + scaleLinear(yMax, yDomain.min, yDomain.max, plotHeight, 0)
    };
  });

  const sdMarks = $derived.by(() => {
    if (!stats) return [];
    const offsets = [-2, -1, 1, 2];
    return offsets.map((k) => {
      const vx = stats.mean + k * stats.sd;
      const vy = pdf(vx, stats.mean, stats.sd);
      return {
        k,
        x: MARGIN.left + scaleLinear(vx, xDomain.min, xDomain.max, 0, plotWidth),
        yTop: MARGIN.top + scaleLinear(vy, yDomain.min, yDomain.max, plotHeight, 0)
      };
    });
  });

  const gridLines = $derived(
    xTicks.map((tick) => ({
      value: tick,
      x: MARGIN.left + scaleLinear(tick, xDomain.min, xDomain.max, 0, plotWidth)
    }))
  );

  function roundStat(v: number): number {
    return Math.round(v * 100) / 100;
  }

  const dataValueItems = $derived.by(() => {
    if (!stats) {
      return [
        sample.length < 2
          ? "Échantillon insuffisant (au moins 2 valeurs requises)"
          : "Écart-type nul (valeurs identiques)"
      ];
    }
    return [
      `Moyenne (μ): ${roundStat(stats.mean)}`,
      `Écart-type (σ): ${roundStat(stats.sd)}`,
      `Taille de l'échantillon (n): ${stats.n}`
    ];
  });

  const ariaLabel = $derived(
    stats
      ? `${label} — μ ${roundStat(stats.mean)}, σ ${roundStat(stats.sd)}, n ${stats.n}`
      : label
  );

  let hoveredIndex: number | null = $state(null);

  function handleLeave() {
    hoveredIndex = null;
  }
  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredIndex = null;
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(index) ? index : null;
  }

  // Identifiant de dégradé unique pour éviter les conflits entre plusieurs charts.
  const gradientId = $derived(`st-bellcurve-gradient-${Math.random().toString(36).substring(2, 9)}`);

  const classes = () =>
    ["st-bellCurveChart", `st-bellCurveChart--${tone}`, className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-bellCurveChart__visual"
    role="img"
    aria-label={ariaLabel}
    onpointermove={handleVisualPointerMove}
    onpointerleave={handleLeave}
  >
    <svg
      viewBox="0 0 {width} {height}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="currentColor" stop-opacity="0.3" />
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.0" />
        </linearGradient>
      </defs>

      <!-- gridlines + X axis ticks -->
      {#each gridLines as g (g.value)}
        <line
          class="st-bellCurveChart__grid"
          x1={g.x}
          x2={g.x}
          y1={MARGIN.top}
          y2={baseY}
        />
        <text
          class="st-bellCurveChart__tickLabel"
          x={g.x}
          y={baseY + 16}
          text-anchor="middle"
        >
          {formatTick(g.value)}
        </text>
      {/each}

      <!-- axes -->
      <line class="st-bellCurveChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={baseY} />
      <line class="st-bellCurveChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={baseY} y2={baseY} />

      {#if areaPath}
        <path class="st-bellCurveChart__area" d={areaPath} fill="url(#{gradientId})" />
      {/if}
      {#if linePath}
        <path
          class="st-bellCurveChart__line"
          d={linePath}
          fill="none"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      {/if}

      <!-- σ marks at μ±σ, μ±2σ -->
      {#each sdMarks as m (m.k)}
        <line
          class="st-bellCurveChart__sdMark"
          x1={m.x}
          x2={m.x}
          y1={m.yTop}
          y2={baseY}
        />
      {/each}

      <!-- mean (μ) reference line -->
      {#if meanMark}
        <line
          class="st-bellCurveChart__mean"
          x1={meanMark.x}
          x2={meanMark.x}
          y1={meanMark.yTop}
          y2={baseY}
        />
        <text
          class="st-bellCurveChart__meanLabel"
          x={meanMark.x}
          y={MARGIN.top - 2}
          text-anchor="middle"
        >
          μ
        </text>
      {/if}

      <!-- hover hit-points along the curve -->
      {#each curvePoints as p, i (i)}
        <circle
          class="st-bellCurveChart__hit"
          cx={p.x}
          cy={p.y}
          r="6"
          data-chart-index={i}
        />
      {/each}
    </svg>
  </div>

  <ChartDataList label={ariaLabel} items={dataValueItems} />

  {#if hoveredIndex !== null && curvePoints[hoveredIndex] && stats}
    {@const p = curvePoints[hoveredIndex]}
    <div
      class="st-bellCurveChart__tooltip"
      role="presentation"
      style="left: {(p.x / width) * 100}%; top: {(p.y / height) * 100}%"
    >
      <span class="st-bellCurveChart__tooltipLabel">x ≈ {roundStat(p.vx)}</span>
      <span class="st-bellCurveChart__tooltipValue">densité {p.y === baseY ? 0 : roundStat(pdf(p.vx, stats.mean, stats.sd))}</span>
    </div>
  {/if}
</div>

<style>
  .st-bellCurveChart {
    color: var(--st-semantic-data-category1);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-bellCurveChart--category1 { color: var(--st-semantic-data-category1); }
  .st-bellCurveChart--category2 { color: var(--st-semantic-data-category2); }
  .st-bellCurveChart--category3 { color: var(--st-semantic-data-category3); }
  .st-bellCurveChart--category4 { color: var(--st-semantic-data-category4); }
  .st-bellCurveChart--category5 { color: var(--st-semantic-data-category5); }
  .st-bellCurveChart--category6 { color: var(--st-semantic-data-category6); }
  .st-bellCurveChart--category7 { color: var(--st-semantic-data-category7); }
  .st-bellCurveChart--category8 { color: var(--st-semantic-data-category8); }

  .st-bellCurveChart svg {
    display: block;
    overflow: visible;
  }

  .st-bellCurveChart__visual {
    display: block;
    position: relative;
  }

  .st-bellCurveChart__grid {
    stroke: var(--st-component-bellCurveChart-gridStroke, var(--st-semantic-border-subtle));
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-bellCurveChart__axis {
    stroke: var(--st-component-bellCurveChart-axisStroke, var(--st-semantic-border-subtle));
    stroke-width: 1;
  }

  .st-bellCurveChart__tickLabel {
    fill: var(--st-component-bellCurveChart-labelColor, var(--st-semantic-text-secondary));
    font-size: 0.6875rem;
  }

  .st-bellCurveChart__line {
    stroke: currentColor;
  }

  .st-bellCurveChart__area {
    stroke: none;
  }

  .st-bellCurveChart__sdMark {
    stroke: currentColor;
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.5;
  }

  .st-bellCurveChart__mean {
    stroke: currentColor;
    stroke-dasharray: 4 3;
    stroke-width: 1.5;
    opacity: 0.85;
  }

  .st-bellCurveChart__meanLabel {
    fill: currentColor;
    font-size: 0.6875rem;
    font-weight: 600;
  }

  .st-bellCurveChart__hit {
    fill: transparent;
    cursor: pointer;
  }

  .st-bellCurveChart__tooltip {
    background: var(--st-component-bellCurveChart-tooltipBackground, var(--st-semantic-surface-inverse));
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-component-bellCurveChart-tooltipText, var(--st-semantic-text-inverse));
    display: inline-flex;
    flex-direction: column;
    font-size: 0.75rem;
    gap: 0.125rem;
    line-height: 1.2;
    padding: 0.375rem 0.5rem;
    pointer-events: none;
    position: absolute;
    transform: translate(-50%, calc(-100% - 8px));
    white-space: nowrap;
    z-index: 1;
  }

  .st-bellCurveChart__tooltipLabel {
    font-weight: 600;
  }

  .st-bellCurveChart__tooltipValue {
    opacity: 0.85;
  }
</style>
