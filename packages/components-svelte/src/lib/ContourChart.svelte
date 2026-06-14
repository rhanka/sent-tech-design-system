<script lang="ts" module>
  /**
   * ContourChart — lignes/zones de contour sur une grille 2D régulière (façon
   * Highcharts « contour » / carte topographique). Chaque cellule de la grille
   * est peinte d'une bande de couleur fonction de sa `value` normalisée, sur
   * l'échelle catégorielle continue category1..8 (reprise de AnomalySwimLane /
   * Density2D). Axes X/Y gradués (mêmes « niceTicks » que les autres charts) et
   * légende des paliers. a11y : `role="img"` + liste accessible des points.
   * API canonique (référence Svelte, React/Vue/Angular doivent s'aligner).
   *
   * La grille est supposée régulière : les valeurs distinctes de `x` et `y`
   * définissent les colonnes et lignes ; chaque cellule est un rectangle peint
   * du ton correspondant à sa `value`, découpée en `levels` paliers.
   *
   * Props obligatoires :
   *   data   ContourChartDatum[]  - {x, y, value}
   *
   * Props optionnelles :
   *   levels  number  (nombre de paliers de couleur ; défaut 6)
   *   label   string
   *   width   number  (défaut 640)
   *   height  number  (défaut 320)
   *   size    number  (non utilisé pour le rendu ; réservé parité d'API)
   *   class   string
   */
  export type ContourChartTone =
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  export type ContourChartDatum = {
    x: number;
    y: number;
    /** Valeur scalaire de la cellule : pilote la bande de couleur. */
    value: number;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type ContourChartProps = {
    data: ContourChartDatum[];
    levels?: number;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
  };

  let {
    data = [],
    levels = 6,
    label,
    width = 640,
    height = 320,
    size,
    class: className
  }: ContourChartProps = $props();

  const MARGIN = { top: 16, right: 18, bottom: 36, left: 48 };

  const TONES = [
    "category1","category2","category3","category4",
    "category5","category6","category7","category8"
  ] as const;

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

  // Points valides : coordonnées finies, valeur finie.
  const validData = $derived(
    data.filter(
      (d) =>
        d &&
        Number.isFinite(d.x) &&
        Number.isFinite(d.y) &&
        Number.isFinite(d.value)
    )
  );

  // Nombre de paliers effectif : entier ≥ 1, plafonné à 8 (les tons disponibles).
  const levelCount = $derived(
    Math.max(1, Math.min(TONES.length, Math.floor(Number.isFinite(levels) ? levels : 6)))
  );

  const valueRange = $derived.by(() => {
    const vals = validData.map((d) => d.value);
    const min = vals.length ? Math.min(...vals) : 0;
    const max = vals.length ? Math.max(...vals) : 0;
    return { min, max };
  });

  // Palier (0..levelCount-1) puis ton catégoriel : valeur normalisée 0..1 → bande.
  function bandOf(value: number): { band: number; tone: ContourChartTone } {
    const { min, max } = valueRange;
    const ratio = max > min ? (value - min) / (max - min) : 0;
    const band = Math.max(0, Math.min(levelCount - 1, Math.floor(ratio * levelCount)));
    const toneIndex = Math.max(0, Math.min(TONES.length - 1, Math.floor((band / Math.max(levelCount - 1, 1)) * (TONES.length - 1))));
    return { band, tone: TONES[toneIndex] };
  }

  const scales = $derived.by(() => {
    const xs = validData.map((d) => d.x);
    const ys = validData.map((d) => d.y);
    const xValues = Array.from(new Set(xs)).sort((a, b) => a - b);
    const yValues = Array.from(new Set(ys)).sort((a, b) => a - b);
    const xTicks = niceTicks(Math.min(...xs), Math.max(...xs));
    const yTicks = niceTicks(Math.min(...ys), Math.max(...ys));
    const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
    const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
    return {
      xValues, yValues,
      xTicks, yTicks,
      xMin: xTicks[0], xMax: xTicks[xTicks.length - 1],
      yMin: yTicks[0], yMax: yTicks[yTicks.length - 1],
      plotW, plotH
    };
  });

  // Largeur/hauteur d'une cellule en espace data (grille régulière), avec repli.
  const cellSpan = $derived.by(() => {
    const { xValues, yValues } = scales;
    const dx = xValues.length > 1 ? xValues[1] - xValues[0] : 1;
    const dy = yValues.length > 1 ? yValues[1] - yValues[0] : 1;
    return { dx, dy };
  });

  // Une bande rectangulaire par cellule de grille, peinte selon sa value.
  const cells = $derived.by(() => {
    const { xMin, xMax, yMin, yMax, plotW, plotH } = scales;
    const { dx, dy } = cellSpan;
    return validData.map((d, i) => {
      const left = MARGIN.left + scaleLinear(d.x - dx / 2, xMin, xMax, 0, plotW);
      const right = MARGIN.left + scaleLinear(d.x + dx / 2, xMin, xMax, 0, plotW);
      const top = MARGIN.top + scaleLinear(d.y + dy / 2, yMin, yMax, plotH, 0);
      const bottom = MARGIN.top + scaleLinear(d.y - dy / 2, yMin, yMax, plotH, 0);
      const { tone } = bandOf(d.value);
      return {
        key: `${i}`,
        datum: d,
        x: Math.min(left, right),
        y: Math.min(top, bottom),
        width: Math.abs(right - left),
        height: Math.abs(bottom - top),
        cx: (left + right) / 2,
        cy: (top + bottom) / 2,
        tone
      };
    });
  });

  const dataValueItems = $derived(
    validData.map((d) => `x ${d.x}, y ${d.y} · ${fmt(d.value)}`)
  );

  const legendItems = $derived(
    Array.from({ length: levelCount }, (_, band) => {
      const toneIndex = Math.max(0, Math.min(TONES.length - 1, Math.floor((band / Math.max(levelCount - 1, 1)) * (TONES.length - 1))));
      return { band, tone: TONES[toneIndex] };
    })
  );
  const hasLegend = $derived(validData.length > 0);

  function handlePointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredKey = null;
      return;
    }
    hoveredKey = target.getAttribute("data-chart-key");
  }

  const hoveredCell = $derived.by(() => {
    if (hoveredKey === null) return null;
    return cells.find((c) => c.key === hoveredKey) ?? null;
  });

  const classes = () => ["st-contourChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-contourChart__visual"
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
      <!-- bandes de contour : une cellule peinte par point de grille -->
      {#each cells as cell (cell.key)}
        <rect
          class="st-contourChart__cell st-contourChart__cell--{cell.tone}"
          class:st-contourChart__cell--dim={hoveredKey !== null && hoveredKey !== cell.key}
          x={cell.x}
          y={cell.y}
          width={cell.width}
          height={cell.height}
          data-chart-key={cell.key}
        />
      {/each}

      <!-- gridlines + ticks Y -->
      {#each scales.yTicks as t (t)}
        {@const y = MARGIN.top + scaleLinear(t, scales.yMin, scales.yMax, scales.plotH, 0)}
        <line class="st-contourChart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={y} y2={y} />
        <text class="st-contourChart__tick" x={MARGIN.left - 6} y={y} text-anchor="end" dominant-baseline="middle">{fmt(t)}</text>
      {/each}
      <!-- ticks X -->
      {#each scales.xTicks as t (t)}
        {@const x = MARGIN.left + scaleLinear(t, scales.xMin, scales.xMax, 0, scales.plotW)}
        <text class="st-contourChart__tick" x={x} y={height - MARGIN.bottom + 16} text-anchor="middle">{fmt(t)}</text>
      {/each}

      <!-- axes -->
      <line class="st-contourChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
      <line class="st-contourChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />
    </svg>
  </div>

  {#if hasLegend}
    <div class="st-contourChart__legend" aria-hidden="true">
      <span class="st-contourChart__legendText">Low</span>
      <span class="st-contourChart__legendRamp">
        {#each legendItems as item (item.band)}
          <span class="st-contourChart__legendSwatch st-contourChart__legendSwatch--{item.tone}"></span>
        {/each}
      </span>
      <span class="st-contourChart__legendText">High</span>
    </div>
  {/if}

  <ChartDataList label={label ?? "contour"} items={dataValueItems} />

  {#if hoveredCell}
    {@const cell = hoveredCell}
    <div
      class="st-contourChart__tooltip"
      role="presentation"
      style="left: {(cell.cx / width) * 100}%; top: {(cell.cy / height) * 100}%"
    >
      <span class="st-contourChart__tooltipLabel">x {cell.datum.x} · y {cell.datum.y}</span>
      <span class="st-contourChart__tooltipValue">{fmt(cell.datum.value)}</span>
    </div>
  {/if}
</div>

<style>
  .st-contourChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-contourChart svg {
    display: block;
    overflow: visible;
  }

  .st-contourChart__visual {
    display: block;
  }

  .st-contourChart__grid {
    opacity: 0.5;
    stroke: var(--st-semantic-border-subtle);
    stroke-dasharray: 2 3;
    stroke-width: 1;
  }

  .st-contourChart__axis {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-contourChart__tick {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
  }

  .st-contourChart__cell {
    cursor: pointer;
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 0.5;
    transition: opacity 120ms ease;
  }

  .st-contourChart__cell--dim {
    opacity: 0.35;
  }

  .st-contourChart__cell--category1 { fill: var(--st-semantic-data-category1); }
  .st-contourChart__cell--category2 { fill: var(--st-semantic-data-category2); }
  .st-contourChart__cell--category3 { fill: var(--st-semantic-data-category3); }
  .st-contourChart__cell--category4 { fill: var(--st-semantic-data-category4); }
  .st-contourChart__cell--category5 { fill: var(--st-semantic-data-category5); }
  .st-contourChart__cell--category6 { fill: var(--st-semantic-data-category6); }
  .st-contourChart__cell--category7 { fill: var(--st-semantic-data-category7); }
  .st-contourChart__cell--category8 { fill: var(--st-semantic-data-category8); }

  .st-contourChart__legend {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: flex;
    font-size: 0.6875rem;
    gap: 0.375rem;
    margin-top: 0.5rem;
  }

  .st-contourChart__legendRamp {
    display: inline-flex;
  }

  .st-contourChart__legendSwatch {
    display: inline-block;
    height: 0.75rem;
    width: 1.25rem;
  }

  .st-contourChart__legendSwatch--category1 { background: var(--st-semantic-data-category1); }
  .st-contourChart__legendSwatch--category2 { background: var(--st-semantic-data-category2); }
  .st-contourChart__legendSwatch--category3 { background: var(--st-semantic-data-category3); }
  .st-contourChart__legendSwatch--category4 { background: var(--st-semantic-data-category4); }
  .st-contourChart__legendSwatch--category5 { background: var(--st-semantic-data-category5); }
  .st-contourChart__legendSwatch--category6 { background: var(--st-semantic-data-category6); }
  .st-contourChart__legendSwatch--category7 { background: var(--st-semantic-data-category7); }
  .st-contourChart__legendSwatch--category8 { background: var(--st-semantic-data-category8); }

  .st-contourChart__tooltip {
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

  .st-contourChart__tooltipLabel {
    font-weight: 600;
  }

  .st-contourChart__tooltipValue {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-contourChart__cell {
      transition: none;
    }
  }
</style>
