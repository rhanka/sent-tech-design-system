<script lang="ts" module>
  /**
   * PointAndFigureChart — Point & Figure à partir d'une série de prix (façon
   * Highcharts Stock « pointandfigure »). Des colonnes de X (hausse) ou de O
   * (baisse) selon le mouvement de prix, calé sur une grille de `boxSize`. On
   * empile des X tant que le prix monte d'au moins un `box` ; on ne change de
   * colonne (vers des O) que lorsque le prix recule d'au moins `reversal`×`box`
   * en sens inverse — et réciproquement. X = ton success, O = ton error. Axe Y
   * prix gradué (niceTicks), PAS d'axe temps régulier (colonnes équidistantes).
   * a11y : `role="img"` + `data-chart-key` + liste accessible des colonnes.
   * API canonique (référence Svelte, React/Vue/Angular doivent s'aligner).
   *
   * Props obligatoires :
   *   data   PointAndFigureChartDatum[]  - série de prix {date, close}
   *
   * Props optionnelles :
   *   boxSize  number  (taille d'une case ; défaut auto ~ (max-min)/20)
   *   reversal number  (nombre de cases pour inverser ; défaut 3)
   *   label    string
   *   width    number  (défaut 640)
   *   height   number  (défaut 320)
   *   size     number  (non utilisé pour le rendu ; réservé parité d'API)
   *   class    string
   */
  export type PointAndFigureChartMark = "x" | "o";

  export type PointAndFigureChartDatum = {
    /** Position temporelle (timestamp ou index) — ignorée pour l'empilement. */
    date: number;
    /** Prix de clôture : pilote la formation des colonnes. */
    close: number;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type PointAndFigureChartProps = {
    data: PointAndFigureChartDatum[];
    boxSize?: number;
    reversal?: number;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
  };

  let {
    data = [],
    boxSize,
    reversal = 3,
    label,
    width = 640,
    height = 320,
    size,
    class: className
  }: PointAndFigureChartProps = $props();

  const MARGIN = { top: 16, right: 18, bottom: 36, left: 52 };

  function niceTicks(min: number, max: number, target = 5): number[] {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
      return [Number.isFinite(max) ? max : 0];
    }
    const range = max - min;
    const rough = range / Math.max(target - 1, 1);
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / pow;
    let step: number;
    if (norm < 1.5) step = pow;
    else if (norm < 3) step = 2 * pow;
    else if (norm < 7) step = 5 * pow;
    else step = 10 * pow;
    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;
    const ticks: number[] = [];
    for (let v = start; v <= end + step / 2; v += step) ticks.push(Number(v.toFixed(10)));
    return ticks;
  }

  function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number) {
    if (d1 === d0) return r0;
    return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
  }

  function fmt(v: number): string {
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    return Number.isInteger(v) ? String(v) : v.toFixed(1);
  }

  let hoveredKey: string | null = $state(null);

  // Points valides : date et close finis.
  const validData = $derived(
    data.filter((d) => d && Number.isFinite(d.date) && Number.isFinite(d.close))
  );

  // Taille de case effective : `boxSize` fini > 0, sinon auto ~ (max-min)/20.
  const effectiveBox = $derived.by(() => {
    if (Number.isFinite(boxSize) && (boxSize as number) > 0) return boxSize as number;
    const closes = validData.map((d) => d.close);
    if (closes.length === 0) return 1;
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const span = max - min;
    return span > 0 ? span / 20 : 1;
  });

  // Nombre de cases pour inverser : entier ≥ 1 (défaut 3).
  const reversalBoxes = $derived(
    Math.max(1, Math.floor(Number.isFinite(reversal) ? reversal : 3))
  );

  // Une colonne = une suite de X (hausse) OU de O (baisse). Une colonne porte
  // ses cases occupées sous forme d'indices de case [low..high]. On change de
  // colonne quand le prix recule d'au moins `reversal` cases en sens inverse.
  const pnfColumns = $derived.by(() => {
    const box = effectiveBox;
    const cols: { mark: PointAndFigureChartMark; low: number; high: number }[] = [];
    if (validData.length === 0 || box <= 0) return cols;

    const closes = validData.map((d) => d.close);
    const baseMin = Math.min(...closes);
    // Indice de case (entier) d'un prix : quantifié sur la grille de `box`.
    const boxIndex = (price: number) => Math.floor((price - baseMin) / box + 1e-9);

    let mark: PointAndFigureChartMark | null = null;
    let low = 0;
    let high = 0;

    for (let i = 0; i < closes.length; i++) {
      const idx = boxIndex(closes[i]);
      if (mark === null) {
        mark = "x";
        low = idx;
        high = idx;
        continue;
      }
      if (mark === "x") {
        if (idx > high) {
          high = idx; // poursuite de la hausse
        } else if (idx <= high - reversalBoxes) {
          cols.push({ mark, low, high }); // fige la colonne X
          mark = "o";
          high = high - 1; // une colonne O repart un cran sous le sommet
          low = idx;
        }
      } else {
        if (idx < low) {
          low = idx; // poursuite de la baisse
        } else if (idx >= low + reversalBoxes) {
          cols.push({ mark, low, high }); // fige la colonne O
          mark = "x";
          low = low + 1; // une colonne X repart un cran au-dessus du creux
          high = idx;
        }
      }
    }
    if (mark !== null && high >= low) cols.push({ mark, low, high });
    // Annote chaque colonne avec les prix de ses cases [low..high].
    return cols.map((c) => ({
      mark: c.mark,
      low: c.low,
      high: c.high,
      priceLow: baseMin + c.low * box,
      priceHigh: baseMin + (c.high + 1) * box
    }));
  });

  const priceRange = $derived.by(() => {
    if (pnfColumns.length === 0) {
      const closes = validData.map((d) => d.close);
      const min = closes.length ? Math.min(...closes) : 0;
      const max = closes.length ? Math.max(...closes) : 0;
      return { min, max };
    }
    let min = Infinity;
    let max = -Infinity;
    for (const c of pnfColumns) {
      if (c.priceLow < min) min = c.priceLow;
      if (c.priceHigh > max) max = c.priceHigh;
    }
    return { min, max };
  });

  const scales = $derived.by(() => {
    const { min, max } = priceRange;
    const yTicks = niceTicks(min, max);
    const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
    const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
    return {
      yTicks,
      yMin: yTicks[0],
      yMax: yTicks[yTicks.length - 1],
      plotW,
      plotH
    };
  });

  // Grille prix × colonnes : chaque colonne pose un glyphe par case [low..high].
  const marks = $derived.by(() => {
    const { yMin, yMax, plotW, plotH } = scales;
    const box = effectiveBox;
    const n = pnfColumns.length;
    if (n === 0) return [];
    const colW = plotW / n;
    const glyph = Math.min(colW, scaleLinear(box, 0, Math.max(yMax - yMin, box), 0, plotH)) * 0.7;
    const out: {
      key: string;
      mark: PointAndFigureChartMark;
      cx: number;
      cy: number;
      r: number;
      priceLow: number;
      priceHigh: number;
    }[] = [];
    pnfColumns.forEach((c, ci) => {
      const cx = MARGIN.left + colW * ci + colW / 2;
      for (let b = c.low; b <= c.high; b++) {
        const priceMid = priceRangeBase(b, box);
        const cy = MARGIN.top + scaleLinear(priceMid, yMin, yMax, plotH, 0);
        out.push({
          key: `${ci}-${b}`,
          mark: c.mark,
          cx,
          cy,
          r: Math.max(glyph / 2, 2),
          priceLow: c.priceLow,
          priceHigh: c.priceHigh
        });
      }
    });
    return out;
  });

  // Prix du centre d'une case (index de case → prix milieu), repère commun.
  function priceRangeBase(boxIdx: number, box: number): number {
    const closes = validData.map((d) => d.close);
    const baseMin = closes.length ? Math.min(...closes) : 0;
    return baseMin + (boxIdx + 0.5) * box;
  }

  const dataValueItems = $derived(
    pnfColumns.map(
      (c, i) => `${c.mark === "x" ? "X" : "O"} ${fmt(c.priceLow)} → ${fmt(c.priceHigh)}`
    )
  );

  function handlePointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredKey = null;
      return;
    }
    hoveredKey = target.getAttribute("data-chart-key");
  }

  const hoveredMark = $derived.by(() => {
    if (hoveredKey === null) return null;
    return marks.find((m) => m.key === hoveredKey) ?? null;
  });

  const classes = () => ["st-pointAndFigureChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-pointAndFigureChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handlePointerMove}
    onpointerleave={() => (hoveredKey = null)}
  >
    <svg
      viewBox="0 0 {width} {height}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
      <!-- gridlines + ticks Y (prix) -->
      {#each scales.yTicks as t (t)}
        {@const y = MARGIN.top + scaleLinear(t, scales.yMin, scales.yMax, scales.plotH, 0)}
        <line class="st-pointAndFigureChart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={y} y2={y} />
        <text class="st-pointAndFigureChart__tick" x={MARGIN.left - 6} y={y} text-anchor="end" dominant-baseline="middle">{fmt(t)}</text>
      {/each}

      <!-- axes -->
      <line class="st-pointAndFigureChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
      <line class="st-pointAndFigureChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

      <!-- glyphes X / O par colonne et par case -->
      {#each marks as m (m.key)}
        {#if m.mark === "x"}
          <g
            class="st-pointAndFigureChart__mark st-pointAndFigureChart__mark--x"
            class:st-pointAndFigureChart__mark--dim={hoveredKey !== null && hoveredKey !== m.key}
            data-chart-key={m.key}
          >
            <line class="st-pointAndFigureChart__glyph" x1={m.cx - m.r} y1={m.cy - m.r} x2={m.cx + m.r} y2={m.cy + m.r} data-chart-key={m.key} />
            <line class="st-pointAndFigureChart__glyph" x1={m.cx - m.r} y1={m.cy + m.r} x2={m.cx + m.r} y2={m.cy - m.r} data-chart-key={m.key} />
          </g>
        {:else}
          <circle
            class="st-pointAndFigureChart__mark st-pointAndFigureChart__mark--o st-pointAndFigureChart__glyph"
            class:st-pointAndFigureChart__mark--dim={hoveredKey !== null && hoveredKey !== m.key}
            cx={m.cx}
            cy={m.cy}
            r={m.r}
            data-chart-key={m.key}
          />
        {/if}
      {/each}
    </svg>
  </div>

  <ChartDataList label={label ?? "point and figure"} items={dataValueItems} />

  {#if hoveredMark}
    {@const m = hoveredMark}
    <div
      class="st-pointAndFigureChart__tooltip"
      role="presentation"
      style="left: {(m.cx / width) * 100}%; top: {(m.cy / height) * 100}%"
    >
      <span class="st-pointAndFigureChart__tooltipLabel">{m.mark === "x" ? "X" : "O"}</span>
      <span class="st-pointAndFigureChart__tooltipValue">{fmt(m.priceLow)} → {fmt(m.priceHigh)}</span>
    </div>
  {/if}
</div>

<style>
  .st-pointAndFigureChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-pointAndFigureChart svg {
    display: block;
    overflow: visible;
  }

  .st-pointAndFigureChart__visual {
    display: block;
  }

  .st-pointAndFigureChart__grid {
    opacity: 0.5;
    stroke: var(--st-semantic-border-subtle);
    stroke-dasharray: 2 3;
    stroke-width: 1;
  }

  .st-pointAndFigureChart__axis {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-pointAndFigureChart__tick {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
  }

  .st-pointAndFigureChart__mark {
    transition: opacity 120ms ease;
  }

  .st-pointAndFigureChart__mark--dim {
    opacity: 0.35;
  }

  .st-pointAndFigureChart__glyph {
    cursor: pointer;
    fill: none;
    stroke-linecap: round;
    stroke-width: 2;
  }

  .st-pointAndFigureChart__mark--x .st-pointAndFigureChart__glyph,
  .st-pointAndFigureChart__mark--x.st-pointAndFigureChart__glyph {
    stroke: var(--st-semantic-feedback-success);
  }

  .st-pointAndFigureChart__mark--o .st-pointAndFigureChart__glyph,
  .st-pointAndFigureChart__mark--o.st-pointAndFigureChart__glyph {
    stroke: var(--st-semantic-feedback-error);
  }

  .st-pointAndFigureChart__tooltip {
    background: var(--st-semantic-surface-inverse);
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-semantic-text-inverse);
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

  .st-pointAndFigureChart__tooltipLabel {
    font-weight: 600;
  }

  .st-pointAndFigureChart__tooltipValue {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-pointAndFigureChart__mark {
      transition: none;
    }
  }
</style>
