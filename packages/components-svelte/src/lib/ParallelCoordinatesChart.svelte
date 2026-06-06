<script lang="ts" module>
  /**
   * ParallelCoordinatesChart - axes verticaux parallèles, polylignes par enregistrement.
   * API canonique (référence Svelte, React/Vue doivent s'aligner)
   *
   * Props obligatoires :
   *   axes   ParallelAxis[]         - définition des axes {key, label, min?, max?}
   *   data   Array<Record<string, unknown>>  - enregistrements
   *   label  string                 - aria-label
   *
   * Props optionnelles :
   *   tones      tone par série (string[])  - one tone per datum row, cycled
   *   width      number  (défaut 480)
   *   height     number  (défaut 300)
   *   class      string
   */
  export type ParallelCoordinatesChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type ParallelAxis = {
    key: string;
    label: string;
    min?: number;
    max?: number;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  const TONES: ParallelCoordinatesChartTone[] = [
    "category1","category2","category3","category4",
    "category5","category6","category7","category8"
  ];

  type ParallelCoordinatesChartProps = {
    axes: ParallelAxis[];
    data: Record<string, unknown>[];
    label: string;
    // FIX #5 : renommage tone → tones (cohérence avec les autres charts)
    tones?: ParallelCoordinatesChartTone[];
    width?: number;
    height?: number;
    class?: string;
  };

  let {
    axes = [],
    data = [],
    label,
    tones,
    width = 480,
    height = 300,
    class: className
  }: ParallelCoordinatesChartProps = $props();

  const MARGIN = { top: 32, right: 24, bottom: 16, left: 24 };

  let hoveredIndex: number | null = $state(null);

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  // FIX #5 : domaines par axe explicites, sans coercion Number() silencieuse
  function axisDomain(axis: ParallelAxis): { min: number; max: number } {
    // Parse STRICT : seules les valeurs finies comptent
    const vals = data
      .map((d) => {
        const raw = d[axis.key];
        if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
        if (typeof raw === "string" && raw !== "") {
          const n = Number(raw);
          return Number.isFinite(n) ? n : null;
        }
        return null;
      })
      .filter((v): v is number => v !== null);

    const rawMin = vals.length > 0 ? Math.min(...vals) : 0;
    const rawMax = vals.length > 0 ? Math.max(...vals) : 1;
    const safeMax = rawMax === rawMin ? rawMin + 1 : rawMax;

    return {
      min: Number.isFinite(axis.min) ? (axis.min as number) : rawMin,
      max: Number.isFinite(axis.max) ? (axis.max as number) : safeMax
    };
  }

  const axisX = $derived(
    axes.map((_, i) => MARGIN.left + (axes.length <= 1 ? plotWidth / 2 : (i / (axes.length - 1)) * plotWidth))
  );

  /**
   * FIX #5 : parse STRICT d'une valeur de ligne.
   * Retourne null si la valeur n'est pas finie → crée un GAP dans le path.
   */
  function parseStrictFinite(raw: unknown): number | null {
    if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
    if (typeof raw === "string" && raw !== "") {
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  }

  /**
   * Construit un path SVG avec GAP (M...L... / M...) pour les points null.
   * Un segment contenant un point null ne sera pas tracé.
   */
  function buildPathWithGaps(points: ({ x: number; y: number } | null)[]): string {
    const parts: string[] = [];
    let segment: { x: number; y: number }[] = [];

    for (const pt of points) {
      if (pt === null) {
        if (segment.length > 0) {
          parts.push(segment.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" "));
          segment = [];
        }
      } else {
        segment.push(pt);
      }
    }
    if (segment.length > 0) {
      parts.push(segment.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" "));
    }
    return parts.join(" ");
  }

  const lines = $derived.by(() => {
    return data.map((row, ri) => {
      const seriesTones = tones ?? [];
      const rowTone = seriesTones[ri] ?? TONES[ri % TONES.length];
      const points: ({ x: number; y: number } | null)[] = axes.map((axis, ai) => {
        const domain = axisDomain(axis);
        // FIX #5 : parse strict → null si invalide
        const val = parseStrictFinite(row[axis.key]);
        if (val === null) return null; // GAP
        // FIX #5 : clamp aux bornes du domaine
        const clamped = Math.min(Math.max(val, domain.min), domain.max);
        const t = domain.max === domain.min ? 0.5 : (clamped - domain.min) / (domain.max - domain.min);
        return {
          x: axisX[ai],
          y: MARGIN.top + (1 - t) * plotHeight
        };
      });
      return { points, tone: rowTone, index: ri, row, path: buildPathWithGaps(points) };
    });
  });

  const dataValueItems = $derived(
    data.map((row) =>
      axes.map((axis) => `${axis.label}: ${row[axis.key] ?? ""}`).join(", ")
    )
  );

  function formatTick(v: number): string {
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`;
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(1);
  }

  function handlePointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) { hoveredIndex = null; return; }
    const idx = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(idx) ? idx : null;
  }

  const classes = () => ["st-parallelCoordinatesChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-parallelCoordinatesChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handlePointerMove}
    onpointerleave={() => (hoveredIndex = null)}
  >
    <svg
      viewBox="0 0 {width} {height}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
      <!-- polylines (draw non-hovered first, then hovered on top) -->
      {#each lines as line (line.index)}
        <path
          class="st-parallelCoordinatesChart__line st-parallelCoordinatesChart__line--{line.tone}"
          class:st-parallelCoordinatesChart__line--dim={hoveredIndex !== null && hoveredIndex !== line.index}
          class:st-parallelCoordinatesChart__line--active={hoveredIndex === line.index}
          d={line.path}
          fill="none"
          data-chart-index={line.index}
        />
      {/each}

      <!-- axes and labels -->
      {#each axes as axis, ai (axis.key)}
        {@const domain = axisDomain(axis)}
        {@const ax = axisX[ai]}
        <line
          class="st-parallelCoordinatesChart__axis"
          x1={ax}
          x2={ax}
          y1={MARGIN.top}
          y2={MARGIN.top + plotHeight}
        />
        <text
          class="st-parallelCoordinatesChart__axisLabel"
          x={ax}
          y={MARGIN.top - 10}
          text-anchor="middle"
        >
          {axis.label}
        </text>
        <!-- min/max ticks -->
        <text
          class="st-parallelCoordinatesChart__tickLabel"
          x={ax + 4}
          y={MARGIN.top + plotHeight}
          dominant-baseline="auto"
        >
          {formatTick(domain.min)}
        </text>
        <text
          class="st-parallelCoordinatesChart__tickLabel"
          x={ax + 4}
          y={MARGIN.top}
          dominant-baseline="hanging"
        >
          {formatTick(domain.max)}
        </text>
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />
</div>

<style>
  .st-parallelCoordinatesChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-parallelCoordinatesChart svg {
    display: block;
    overflow: visible;
  }

  .st-parallelCoordinatesChart__visual {
    display: block;
  }

  .st-parallelCoordinatesChart__axis {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1.5;
  }

  .st-parallelCoordinatesChart__axisLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
    font-weight: 600;
  }

  .st-parallelCoordinatesChart__tickLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.5625rem;
  }

  .st-parallelCoordinatesChart__line {
    cursor: pointer;
    stroke-width: 1.5;
    stroke-opacity: 0.65;
    transition: stroke-opacity 120ms ease, stroke-width 120ms ease;
  }

  .st-parallelCoordinatesChart__line--dim {
    stroke-opacity: 0.12;
  }

  .st-parallelCoordinatesChart__line--active {
    stroke-opacity: 1;
    stroke-width: 2.5;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-parallelCoordinatesChart__line {
      transition: none;
    }
  }

  .st-parallelCoordinatesChart__line--category1 { stroke: var(--st-semantic-data-category1); }
  .st-parallelCoordinatesChart__line--category2 { stroke: var(--st-semantic-data-category2); }
  .st-parallelCoordinatesChart__line--category3 { stroke: var(--st-semantic-data-category3); }
  .st-parallelCoordinatesChart__line--category4 { stroke: var(--st-semantic-data-category4); }
  .st-parallelCoordinatesChart__line--category5 { stroke: var(--st-semantic-data-category5); }
  .st-parallelCoordinatesChart__line--category6 { stroke: var(--st-semantic-data-category6); }
  .st-parallelCoordinatesChart__line--category7 { stroke: var(--st-semantic-data-category7); }
  .st-parallelCoordinatesChart__line--category8 { stroke: var(--st-semantic-data-category8); }
</style>
