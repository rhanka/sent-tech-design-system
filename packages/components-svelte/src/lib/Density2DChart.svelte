<script lang="ts" module>
  /**
   * Density2DChart - densité 2D NON-géographique sur axes numériques (heatmap
   * binned, façon Tableau/Dataiku density). On agrège des points (x,y) en cellules
   * d'une grille régulière `bins×bins` sur l'étendue [minX,maxX]×[minY,maxY] ; la
   * couleur d'une cellule encode la DENSITÉ (somme des poids) normalisée sur
   * l'échelle catégorielle continue category1..8 (reprise de HeatmapChart /
   * AnomalySwimLane). Axes X/Y gradués (niceTicks) + légende rampe Low→High.
   * API canonique (référence Svelte, React/Vue doivent s'aligner).
   *
   * Props obligatoires :
   *   data   Density2DPoint[]  - tableau { x, y, weight? }
   *
   * Props optionnelles :
   *   bins    number  (nb de bins par axe, défaut 12)
   *   label   string
   *   width   number  (défaut 640)
   *   height  number  (défaut 320)
   *   size    number  (alias de width)
   *   class   string
   */
  export type Density2DTone =
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  export type Density2DPoint = {
    x: number;
    y: number;
    weight?: number;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type Density2DChartProps = {
    data: Density2DPoint[];
    bins?: number;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
  };

  let {
    data = [],
    bins = 12,
    label,
    width,
    height = 320,
    size,
    class: className
  }: Density2DChartProps = $props();

  const resolvedWidth = $derived(width ?? size ?? 640);

  const MARGIN = { top: 16, right: 18, bottom: 36, left: 48 };
  const TONES = [
    "category1","category2","category3","category4","category5","category6","category7","category8"
  ] as const;

  // Échelle continue : densité normalisée 0..max → category1..8 (reprise de
  // HeatmapChart). max ≤ 0 ou densité non finie → category1 (intensité plancher).
  function toneForDensity(density: number, densityMax: number): Density2DTone {
    if (!Number.isFinite(density) || densityMax <= 0) return "category1";
    const ratio = Math.max(0, Math.min(1, density / densityMax));
    const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(ratio * TONES.length)));
    return TONES[index];
  }

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

  function formatTick(v: number): string {
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    return Number.isInteger(v) ? String(v) : v.toFixed(1);
  }

  let hoveredKey: string | null = $state(null);

  const plotWidth = $derived(Math.max(resolvedWidth - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  // Nombre de bins effectif : entier ≥ 1, plafonné pour rester lisible.
  const binCount = $derived(
    Math.max(1, Math.min(40, Math.floor(Number.isFinite(bins) ? bins : 12)))
  );

  // Normalise : ne garde que les points aux coordonnées finies.
  const validData = $derived(
    data.filter((d) => d && Number.isFinite(d.x) && Number.isFinite(d.y))
  );

  // Étendue [minX,maxX]×[minY,maxY] + ticks « nice » pour les axes.
  const scales = $derived.by(() => {
    const xs = validData.map((d) => d.x);
    const ys = validData.map((d) => d.y);
    const xTicks = niceTicks(xs.length ? Math.min(...xs) : 0, xs.length ? Math.max(...xs) : 1);
    const yTicks = niceTicks(ys.length ? Math.min(...ys) : 0, ys.length ? Math.max(...ys) : 1);
    return {
      xTicks,
      yTicks,
      xMin: xTicks[0],
      xMax: xTicks[xTicks.length - 1],
      yMin: yTicks[0],
      yMax: yTicks[yTicks.length - 1]
    };
  });

  type Bin = {
    key: string;
    ix: number;
    iy: number;
    density: number;
    x: number;
    y: number;
    width: number;
    height: number;
    cx: number;
    cy: number;
    x0: number;
    x1: number;
    y0: number;
    y1: number;
    tone: Density2DTone;
  };

  // Binning régulier : grille binCount×binCount sur l'étendue ; chaque point
  // tombe dans une cellule, sa densité = somme des poids (défaut 1).
  const layout = $derived.by(() => {
    const { xMin, xMax, yMin, yMax } = scales;
    if (validData.length === 0 || xMax === xMin || yMax === yMin) {
      return { bins: [] as Bin[], densityMax: 0 };
    }
    const counts = new Float64Array(binCount * binCount);
    const idx = (ix: number, iy: number) => iy * binCount + ix;
    for (const d of validData) {
      const fx = (d.x - xMin) / (xMax - xMin);
      const fy = (d.y - yMin) / (yMax - yMin);
      const ix = Math.max(0, Math.min(binCount - 1, Math.floor(fx * binCount)));
      const iy = Math.max(0, Math.min(binCount - 1, Math.floor(fy * binCount)));
      const w = typeof d.weight === "number" && Number.isFinite(d.weight) ? d.weight : 1;
      counts[idx(ix, iy)] += w;
    }
    let densityMax = 0;
    for (let i = 0; i < counts.length; i++) densityMax = Math.max(densityMax, counts[i]);

    const cellW = plotWidth / binCount;
    const cellH = plotHeight / binCount;
    const out: Bin[] = [];
    for (let iy = 0; iy < binCount; iy++) {
      for (let ix = 0; ix < binCount; ix++) {
        const density = counts[idx(ix, iy)];
        if (density <= 0) continue;
        // iy=0 en bas (y croissant vers le haut) → inverse l'axe écran.
        const x = MARGIN.left + ix * cellW;
        const y = MARGIN.top + (binCount - 1 - iy) * cellH;
        const x0 = xMin + (ix / binCount) * (xMax - xMin);
        const x1 = xMin + ((ix + 1) / binCount) * (xMax - xMin);
        const y0 = yMin + (iy / binCount) * (yMax - yMin);
        const y1 = yMin + ((iy + 1) / binCount) * (yMax - yMin);
        out.push({
          key: `${ix}-${iy}`,
          ix,
          iy,
          density,
          x,
          y,
          width: Math.max(cellW - 1, 1),
          height: Math.max(cellH - 1, 1),
          cx: x + cellW / 2,
          cy: y + cellH / 2,
          x0,
          x1,
          y0,
          y1,
          tone: toneForDensity(density, densityMax)
        });
      }
    }
    return { bins: out, densityMax };
  });

  const binCells = $derived(layout.bins);

  const xAxisTicks = $derived.by(() => {
    const { xTicks, xMin, xMax } = scales;
    return xTicks.map((t) => ({
      value: t,
      x: MARGIN.left + scaleLinear(t, xMin, xMax, 0, plotWidth)
    }));
  });

  const yAxisTicks = $derived.by(() => {
    const { yTicks, yMin, yMax } = scales;
    return yTicks.map((t) => ({
      value: t,
      y: MARGIN.top + scaleLinear(t, yMin, yMax, plotHeight, 0)
    }));
  });

  const dataValueItems = $derived(
    binCells.map(
      (b) => `[${formatTick(b.x0)}–${formatTick(b.x1)}] × [${formatTick(b.y0)}–${formatTick(b.y1)}]: ${b.density}`
    )
  );

  const legendItems = $derived(TONES.map((tone) => ({ tone })));
  const hasLegend = $derived(binCells.length > 0);

  function handlePointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredKey = null;
      return;
    }
    const key = target.getAttribute("data-chart-key");
    hoveredKey = key ?? null;
  }

  const hoveredCell = $derived.by(() => {
    if (hoveredKey === null) return null;
    return binCells.find((b) => b.key === hoveredKey) ?? null;
  });

  const classes = () => ["st-density2DChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-density2DChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handlePointerMove}
    onpointerleave={() => (hoveredKey = null)}
  >
    <svg
      viewBox="0 0 {resolvedWidth} {height}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
      <!-- tick labels (axe Y) -->
      {#each yAxisTicks as tick (tick.value)}
        <text class="st-density2DChart__tickLabel" x={MARGIN.left - 8} y={tick.y} text-anchor="end" dominant-baseline="middle">
          {formatTick(tick.value)}
        </text>
      {/each}

      <!-- tick labels (axe X) -->
      {#each xAxisTicks as tick (tick.value)}
        <text class="st-density2DChart__tickLabel" x={tick.x} y={height - MARGIN.bottom + 16} text-anchor="middle">
          {formatTick(tick.value)}
        </text>
      {/each}

      <!-- axes -->
      <line class="st-density2DChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
      <line class="st-density2DChart__axis" x1={MARGIN.left} x2={resolvedWidth - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

      <!-- cellules de densité (grille bins×bins, couleur ∝ densité) -->
      {#each binCells as cell (cell.key)}
        <rect
          class="st-density2DChart__cell st-density2DChart__cell--{cell.tone}"
          class:st-density2DChart__cell--dim={hoveredKey !== null && hoveredKey !== cell.key}
          x={cell.x}
          y={cell.y}
          width={cell.width}
          height={cell.height}
          rx="1"
          data-chart-key={cell.key}
        />
      {/each}
    </svg>
  </div>

  {#if hasLegend}
    <div class="st-density2DChart__legend" aria-hidden="true">
      <span class="st-density2DChart__legendText">Low</span>
      <span class="st-density2DChart__legendRamp">
        {#each legendItems as item (item.tone)}
          <span class="st-density2DChart__legendSwatch st-density2DChart__legendSwatch--{item.tone}"></span>
        {/each}
      </span>
      <span class="st-density2DChart__legendText">High</span>
    </div>
  {/if}

  <ChartDataList label={label ?? "density 2d"} items={dataValueItems} />

  {#if hoveredCell}
    {@const cell = hoveredCell}
    <div
      class="st-density2DChart__tooltip"
      role="presentation"
      style="left: {(cell.cx / resolvedWidth) * 100}%; top: {(cell.cy / height) * 100}%"
    >
      <span class="st-density2DChart__tooltipLabel">[{formatTick(cell.x0)}–{formatTick(cell.x1)}] × [{formatTick(cell.y0)}–{formatTick(cell.y1)}]</span>
      <span class="st-density2DChart__tooltipValue">{cell.density}</span>
    </div>
  {/if}
</div>

<style>
  .st-density2DChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-density2DChart svg {
    display: block;
    overflow: visible;
  }

  .st-density2DChart__visual {
    display: block;
  }

  .st-density2DChart__axis {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-density2DChart__tickLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
  }

  .st-density2DChart__cell {
    cursor: pointer;
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 0.5;
    transition: opacity 120ms ease;
  }

  .st-density2DChart__cell--dim {
    opacity: 0.4;
  }

  .st-density2DChart__cell--category1,
  .st-density2DChart__legendSwatch--category1 { fill: var(--st-semantic-data-category1); background: var(--st-semantic-data-category1); }
  .st-density2DChart__cell--category2,
  .st-density2DChart__legendSwatch--category2 { fill: var(--st-semantic-data-category2); background: var(--st-semantic-data-category2); }
  .st-density2DChart__cell--category3,
  .st-density2DChart__legendSwatch--category3 { fill: var(--st-semantic-data-category3); background: var(--st-semantic-data-category3); }
  .st-density2DChart__cell--category4,
  .st-density2DChart__legendSwatch--category4 { fill: var(--st-semantic-data-category4); background: var(--st-semantic-data-category4); }
  .st-density2DChart__cell--category5,
  .st-density2DChart__legendSwatch--category5 { fill: var(--st-semantic-data-category5); background: var(--st-semantic-data-category5); }
  .st-density2DChart__cell--category6,
  .st-density2DChart__legendSwatch--category6 { fill: var(--st-semantic-data-category6); background: var(--st-semantic-data-category6); }
  .st-density2DChart__cell--category7,
  .st-density2DChart__legendSwatch--category7 { fill: var(--st-semantic-data-category7); background: var(--st-semantic-data-category7); }
  .st-density2DChart__cell--category8,
  .st-density2DChart__legendSwatch--category8 { fill: var(--st-semantic-data-category8); background: var(--st-semantic-data-category8); }

  .st-density2DChart__legend {
    align-items: center;
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    margin-top: var(--st-spacing-2, 0.5rem);
  }

  .st-density2DChart__legendRamp {
    display: inline-grid;
    grid-template-columns: repeat(8, minmax(0.75rem, 1fr));
    min-width: 8rem;
  }

  .st-density2DChart__legendSwatch {
    display: block;
    height: 0.5rem;
  }

  .st-density2DChart__legendText {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
  }

  .st-density2DChart__tooltip {
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

  .st-density2DChart__tooltipLabel {
    font-weight: 600;
  }

  .st-density2DChart__tooltipValue {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-density2DChart__cell {
      transition: none;
    }
  }
</style>
