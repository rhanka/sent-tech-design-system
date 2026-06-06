<script lang="ts" module>
  /**
   * MarimekkoChart - rectangles largeur (part catégorie) × hauteur (segments %).
   * API canonique (référence Svelte, React/Vue doivent s'aligner)
   *
   * Props obligatoires :
   *   data   MarimekkoChartDatum[]  - tableau {label, width, segments[]}
   *   label  string
   *
   * Props optionnelles :
   *   width   number  (défaut 480)
   *   height  number  (défaut 300)
   *   class   string
   */
  export type MarimekkoChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type MarimekkoChartSegment = {
    label: string;
    value: number;
    tone?: MarimekkoChartTone;
  };

  export type MarimekkoChartDatum = {
    label: string;
    width: number;
    segments: MarimekkoChartSegment[];
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";
  import { contrastTextForTone } from "./chartContrast";

  const TONES: MarimekkoChartTone[] = [
    "category1","category2","category3","category4",
    "category5","category6","category7","category8"
  ];

  type MarimekkoChartProps = {
    data: MarimekkoChartDatum[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
  };

  let {
    data = [],
    label,
    width = 480,
    height = 300,
    class: className
  }: MarimekkoChartProps = $props();

  const MARGIN = { top: 12, right: 16, bottom: 32, left: 8 };

  let hoveredKey: string | null = $state(null);

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  // FIX #4 : ignorer (skip) largeurs non-finies ou <=0, PAS de Math.abs
  const totalWidth = $derived.by(() => {
    const sum = data.reduce((acc, d) => {
      const w = d.width;
      return acc + (Number.isFinite(w) && w > 0 ? w : 0);
    }, 0);
    return sum > 0 ? sum : 1;
  });

  const cells = $derived.by(() => {
    let xCursor = MARGIN.left;
    const result: {
      key: string;
      catLabel: string;
      segLabel: string;
      tone: MarimekkoChartTone;
      x: number;
      y: number;
      w: number;
      h: number;
      cx: number;
      cy: number;
      pct: number;
      colPct: number;
    }[] = [];

    for (const datum of data) {
      const safeW = (Number.isFinite(datum.width) && datum.width > 0) ? datum.width : 0;
      // FIX #4 : skip colonnes invalides (largeur 0 ou non-finie)
      if (safeW <= 0) continue;
      const colW = (safeW / totalWidth) * plotWidth;
      const colPct = safeW / totalWidth;

      // FIX #4 : ignorer segments non-finis ou <=0 (PAS de Math.abs, PAS de plancher 0.5px)
      const validSegs = datum.segments.filter((s) => Number.isFinite(s.value) && s.value > 0);
      const segSum = validSegs.reduce((acc, s) => acc + s.value, 0);
      const safeSum = segSum > 0 ? segSum : 1;

      let yCursor = MARGIN.top;
      for (let si = 0; si < validSegs.length; si++) {
        const seg = validSegs[si];
        const pct = seg.value / safeSum;
        const segH = pct * plotHeight;
        const tone = seg.tone ?? TONES[si % TONES.length];
        result.push({
          key: `${datum.label}-${seg.label}`,
          catLabel: datum.label,
          segLabel: seg.label,
          tone,
          x: xCursor,
          y: yCursor,
          // FIX #4 : pas de plancher min 0.5px pour les zéros (ils sont filtrés)
          w: Math.max(colW - 1, 1),
          h: Math.max(segH, 1),
          cx: xCursor + colW / 2,
          cy: yCursor + segH / 2,
          pct,
          colPct
        });
        yCursor += segH;
      }
      xCursor += colW;
    }
    return result;
  });

  // FIX #4 a11y : SR inclut la part de LARGEUR (colPct) en plus du % de segment
  const dataValueItems = $derived(
    cells.map((c) => `${c.catLabel}, ${c.segLabel}: ${Math.round(c.pct * 100)}% (colonne ${Math.round(c.colPct * 100)}%)`)
  );

  function handlePointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) { hoveredKey = null; return; }
    hoveredKey = target.getAttribute("data-chart-key") ?? null;
  }

  const hoveredCell = $derived(hoveredKey !== null ? cells.find((c) => c.key === hoveredKey) ?? null : null);

  const classes = () => ["st-marimekkoChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-marimekkoChart__visual"
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
      <!-- axis -->
      <line
        class="st-marimekkoChart__axis"
        x1={MARGIN.left}
        x2={width - MARGIN.right}
        y1={height - MARGIN.bottom}
        y2={height - MARGIN.bottom}
      />

      <!-- cells -->
      {#each cells as cell (cell.key)}
        <rect
          class="st-marimekkoChart__cell st-marimekkoChart__cell--{cell.tone}"
          class:st-marimekkoChart__cell--dim={hoveredKey !== null && hoveredKey !== cell.key}
          x={cell.x}
          y={cell.y}
          width={cell.w}
          height={cell.h}
          data-chart-key={cell.key}
        />
        {#if cell.w > 28 && cell.h > 14}
          <text
            class="st-marimekkoChart__cellLabel"
            x={cell.cx}
            y={cell.cy}
            text-anchor="middle"
            dominant-baseline="middle"
            style="fill: {contrastTextForTone(cell.tone)}"
            pointer-events="none"
          >
            {Math.round(cell.pct * 100)}%
          </text>
        {/if}
      {/each}

      <!-- category labels below axis -->
      {#each data as datum, i (datum.label)}
        {#if Number.isFinite(datum.width) && datum.width > 0}
          {@const safeW = datum.width}
          {@const colW = (safeW / totalWidth) * plotWidth}
          {@const startX = cells.find(c => c.catLabel === datum.label)?.x ?? MARGIN.left}
          <text
            class="st-marimekkoChart__catLabel"
            x={startX + colW / 2}
            y={height - MARGIN.bottom + 16}
            text-anchor="middle"
          >
            {datum.label}
          </text>
        {/if}
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredCell !== null}
    <div
      class="st-marimekkoChart__tooltip"
      role="presentation"
      style="left: {(hoveredCell.cx / width) * 100}%; top: {(hoveredCell.cy / height) * 100}%"
    >
      <span class="st-marimekkoChart__tooltipLabel">{hoveredCell.catLabel} / {hoveredCell.segLabel}</span>
      <span class="st-marimekkoChart__tooltipValue">{Math.round(hoveredCell.pct * 100)}%</span>
    </div>
  {/if}
</div>

<style>
  .st-marimekkoChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-marimekkoChart svg {
    display: block;
    overflow: visible;
  }

  .st-marimekkoChart__visual {
    display: block;
  }

  .st-marimekkoChart__axis {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-marimekkoChart__cell {
    cursor: pointer;
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1;
    transition: opacity 120ms ease;
  }

  .st-marimekkoChart__cell--dim {
    opacity: 0.4;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-marimekkoChart__cell {
      transition: none;
    }
  }

  .st-marimekkoChart__cell--category1 { fill: var(--st-semantic-data-category1); }
  .st-marimekkoChart__cell--category2 { fill: var(--st-semantic-data-category2); }
  .st-marimekkoChart__cell--category3 { fill: var(--st-semantic-data-category3); }
  .st-marimekkoChart__cell--category4 { fill: var(--st-semantic-data-category4); }
  .st-marimekkoChart__cell--category5 { fill: var(--st-semantic-data-category5); }
  .st-marimekkoChart__cell--category6 { fill: var(--st-semantic-data-category6); }
  .st-marimekkoChart__cell--category7 { fill: var(--st-semantic-data-category7); }
  .st-marimekkoChart__cell--category8 { fill: var(--st-semantic-data-category8); }

  .st-marimekkoChart__cellLabel {
    font-size: 0.625rem;
    pointer-events: none;
  }

  .st-marimekkoChart__catLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
  }

  .st-marimekkoChart__tooltip {
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

  .st-marimekkoChart__tooltipLabel {
    font-weight: 600;
  }

  .st-marimekkoChart__tooltipValue {
    opacity: 0.85;
  }
</style>
