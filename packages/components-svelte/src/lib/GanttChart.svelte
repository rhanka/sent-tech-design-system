<script lang="ts" module>
  /**
   * GanttChart - planning xrange : une ligne (rangée Y) par tâche, une barre
   * horizontale couvrant `start → end` sur un axe temporel numérique (X).
   * API canonique (référence Svelte, React/Vue doivent s'aligner).
   *
   * Modèle : une tâche = une barre avec un OFFSET de départ (x0 = start) et une
   * largeur (end - start), sur un axe X commun gradué (niceTicks). La couleur
   * suit `category` (catégorie → categoryN, 8 teintes) ou reste unie si aucune
   * catégorie n'est fournie. Étiquette de tâche à gauche (ellipsis). Marqueur
   * « aujourd'hui » optionnel via `marker`.
   *
   * Props obligatoires :
   *   data   GanttChartTask[]  - tableau {task, start, end, category?}
   *   label  string
   *
   * Props optionnelles :
   *   width   number  (défaut 640)
   *   height  number  (défaut 320)
   *   marker  number  - position d'un repère vertical (ex. « aujourd'hui »)
   *   class   string
   */
  export type GanttChartTask = {
    task: string;
    start: number;
    end: number;
    category?: string;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type GanttChartProps = {
    data: GanttChartTask[];
    label: string;
    width?: number;
    height?: number;
    marker?: number;
    class?: string;
  };

  let {
    data = [],
    label,
    width = 640,
    height = 320,
    marker,
    class: className
  }: GanttChartProps = $props();

  const MARGIN = { top: 16, right: 16, bottom: 32, left: 132 };

  function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number) {
    if (d1 === d0) return r0;
    return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
  }

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

  function formatTick(v: number): string {
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(1);
  }

  // Tronque une étiquette à la largeur de la marge gauche (approx. par char).
  function ellipsize(text: string, maxChars: number): string {
    if (text.length <= maxChars) return text;
    if (maxChars <= 1) return "…";
    return `${text.slice(0, maxChars - 1)}…`;
  }

  let hoveredIndex: number | null = $state(null);

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  // Normalise start ≤ end et filtre les tâches non finies (ou sans libellé).
  const validData = $derived(
    data
      .filter(
        (d) =>
          typeof d.task === "string" &&
          d.task.length > 0 &&
          Number.isFinite(d.start) &&
          Number.isFinite(d.end)
      )
      .map((d) => ({
        task: d.task,
        start: Math.min(d.start, d.end),
        end: Math.max(d.start, d.end),
        category: d.category
      }))
  );

  // Catégories distinctes (ordre d'apparition) → index categoryN (1..8, cyclé).
  const categoryOrder = $derived.by(() => {
    const seen: string[] = [];
    for (const d of validData) {
      if (d.category && !seen.includes(d.category)) seen.push(d.category);
    }
    return seen;
  });
  const hasCategories = $derived(categoryOrder.length > 0);
  const toneOf = (category: string | undefined): string => {
    if (!category) return "category1";
    const idx = categoryOrder.indexOf(category);
    return `category${(idx % 8) + 1}`;
  };
  const legendItems = $derived(categoryOrder.map((category) => ({ category, tone: toneOf(category) })));

  const domainBounds = $derived.by(() => {
    const vals: number[] = [];
    for (const d of validData) vals.push(d.start, d.end);
    if (typeof marker === "number" && Number.isFinite(marker)) vals.push(marker);
    if (vals.length === 0) return { rawMin: 0, rawMax: 1 };
    const rawMin = Math.min(...vals);
    const rawMax = Math.max(...vals);
    return { rawMin, rawMax: rawMax === rawMin ? rawMin + 1 : rawMax };
  });

  const ticks = $derived(niceTicks(domainBounds.rawMin, domainBounds.rawMax, 5));
  const domainMin = $derived(ticks[0]);
  const domainMax = $derived(ticks[ticks.length - 1]);

  const xOf = $derived(
    (v: number) => MARGIN.left + scaleLinear(v, domainMin, domainMax, 0, plotWidth)
  );

  const bars = $derived.by(() => {
    if (validData.length === 0) return [];
    const band = plotHeight / validData.length;
    const barHeight = Math.min(band * 0.62, 28);
    return validData.map((d, i) => {
      const x0 = xOf(d.start);
      const x1 = xOf(d.end);
      const x = Math.min(x0, x1);
      const w = Math.max(Math.abs(x1 - x0), 1);
      const y = MARGIN.top + band * i + (band - barHeight) / 2;
      return {
        datum: d,
        index: i,
        x,
        y,
        width: w,
        height: barHeight,
        rowCenterY: MARGIN.top + band * (i + 0.5),
        cx: x + w / 2,
        tone: toneOf(d.category)
      };
    });
  });

  const markerGeom = $derived.by(() => {
    if (typeof marker !== "number" || !Number.isFinite(marker)) return null;
    return { x: xOf(marker), value: marker };
  });

  const dataValueItems = $derived(validData.map((d) => `${d.task}: ${d.start} → ${d.end}`));

  function handlePointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredIndex = null;
      return;
    }
    const idx = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(idx) ? idx : null;
  }

  const classes = () => ["st-ganttChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-ganttChart__visual"
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
      <!-- gridlines + tick labels (axe X temporel) -->
      {#each ticks as tick (tick)}
        {@const tx = xOf(tick)}
        <line class="st-ganttChart__grid" x1={tx} x2={tx} y1={MARGIN.top} y2={height - MARGIN.bottom} />
        <text class="st-ganttChart__tickLabel" x={tx} y={height - MARGIN.bottom + 16} text-anchor="middle">
          {formatTick(tick)}
        </text>
      {/each}

      <!-- axes -->
      <line class="st-ganttChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
      <line class="st-ganttChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

      <!-- une barre par tâche + étiquette de tâche à gauche -->
      {#each bars as bar, i (`${i}-${bar.datum.task}`)}
        <text
          class="st-ganttChart__taskLabel"
          x={MARGIN.left - 8}
          y={bar.rowCenterY}
          text-anchor="end"
          dominant-baseline="middle"
        >
          {ellipsize(bar.datum.task, 18)}
        </text>
        <rect
          class="st-ganttChart__bar st-ganttChart__bar--{bar.tone}"
          class:st-ganttChart__bar--dim={hoveredIndex !== null && hoveredIndex !== i}
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          rx="2"
          data-chart-index={i}
        />
      {/each}

      <!-- marqueur « aujourd'hui » -->
      {#if markerGeom}
        <line
          class="st-ganttChart__marker"
          x1={markerGeom.x}
          x2={markerGeom.x}
          y1={MARGIN.top}
          y2={height - MARGIN.bottom}
        />
      {/if}
    </svg>
  </div>

  {#if hasCategories}
    <ul class="st-ganttChart__legend" aria-label={`Catégories de ${label}`}>
      {#each legendItems as item (item.category)}
        <li class="st-ganttChart__legendItem">
          <span class="st-ganttChart__legendSwatch st-ganttChart__legendSwatch--{item.tone}" aria-hidden="true"></span>
          {item.category}
        </li>
      {/each}
    </ul>
  {/if}

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && bars[hoveredIndex]}
    {@const bar = bars[hoveredIndex]}
    <div
      class="st-ganttChart__tooltip"
      role="presentation"
      style="left: {(bar.cx / width) * 100}%; top: {(bar.rowCenterY / height) * 100}%"
    >
      <span class="st-ganttChart__tooltipLabel">{bar.datum.task}</span>
      <span class="st-ganttChart__tooltipValue">{bar.datum.start} → {bar.datum.end}</span>
    </div>
  {/if}
</div>

<style>
  .st-ganttChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-ganttChart svg {
    display: block;
    overflow: visible;
  }

  .st-ganttChart__visual {
    display: block;
  }

  .st-ganttChart__axis {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-ganttChart__grid {
    stroke: var(--st-semantic-border-subtle);
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-ganttChart__tickLabel,
  .st-ganttChart__taskLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
  }

  .st-ganttChart__bar {
    cursor: pointer;
    transition: opacity 120ms ease;
  }

  .st-ganttChart__bar--dim {
    opacity: 0.4;
  }

  .st-ganttChart__bar--category1 { fill: var(--st-semantic-data-category1); }
  .st-ganttChart__bar--category2 { fill: var(--st-semantic-data-category2); }
  .st-ganttChart__bar--category3 { fill: var(--st-semantic-data-category3); }
  .st-ganttChart__bar--category4 { fill: var(--st-semantic-data-category4); }
  .st-ganttChart__bar--category5 { fill: var(--st-semantic-data-category5); }
  .st-ganttChart__bar--category6 { fill: var(--st-semantic-data-category6); }
  .st-ganttChart__bar--category7 { fill: var(--st-semantic-data-category7); }
  .st-ganttChart__bar--category8 { fill: var(--st-semantic-data-category8); }

  .st-ganttChart__marker {
    stroke: var(--st-semantic-feedback-error);
    stroke-width: 1.5;
    stroke-dasharray: 4 3;
  }

  .st-ganttChart__legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-3, 0.75rem);
    list-style: none;
    margin: var(--st-spacing-2, 0.5rem) 0 0 0;
    padding: 0;
  }

  .st-ganttChart__legendItem {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    font-size: 0.75rem;
    gap: var(--st-spacing-1, 0.25rem);
    line-height: 1;
  }

  .st-ganttChart__legendSwatch {
    border-radius: var(--st-radius-sm, 0.25rem);
    display: inline-block;
    height: 0.625rem;
    width: 0.625rem;
  }
  .st-ganttChart__legendSwatch--category1 { background: var(--st-semantic-data-category1); }
  .st-ganttChart__legendSwatch--category2 { background: var(--st-semantic-data-category2); }
  .st-ganttChart__legendSwatch--category3 { background: var(--st-semantic-data-category3); }
  .st-ganttChart__legendSwatch--category4 { background: var(--st-semantic-data-category4); }
  .st-ganttChart__legendSwatch--category5 { background: var(--st-semantic-data-category5); }
  .st-ganttChart__legendSwatch--category6 { background: var(--st-semantic-data-category6); }
  .st-ganttChart__legendSwatch--category7 { background: var(--st-semantic-data-category7); }
  .st-ganttChart__legendSwatch--category8 { background: var(--st-semantic-data-category8); }

  .st-ganttChart__tooltip {
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

  .st-ganttChart__tooltipLabel {
    font-weight: 600;
  }

  .st-ganttChart__tooltipValue {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-ganttChart__bar {
      transition: none;
    }
  }
</style>
