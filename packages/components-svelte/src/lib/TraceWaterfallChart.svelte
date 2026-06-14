<script lang="ts" module>
  /**
   * TraceWaterfallChart - spans distribués imbriqués (trace waterfall, ~gantt
   * hiérarchique). Chaque span = une barre sur l'axe temps (start → start +
   * duration). Les spans sont ordonnés par parcours en profondeur (DFS) depuis
   * les racines (parentSpanId == null), indentés par profondeur ; une ligne par
   * span (libellé = service). Axe temps gradué (niceTicks) comme GanttChart.
   * API canonique (référence Svelte, React/Vue doivent s'aligner).
   *
   * Modèle : une rangée Y par span avec un OFFSET de départ (x0 = start) et une
   * largeur (duration), sur un axe X commun gradué. La couleur suit `service`
   * (cycle sur category1..8). Étiquette de service à gauche, indentée selon la
   * profondeur. Légende des services sous le graphe.
   *
   * Props obligatoires :
   *   data   { spans: TraceSpan[] }
   *
   * Props optionnelles :
   *   label   string
   *   width   number  (défaut 640)
   *   height  number  (défaut 320)
   *   size    number  (alias de width)
   *   class   string
   */
  export type TraceSpan = {
    spanId: string;
    parentSpanId?: string | null;
    service: string;
    start: number;
    duration: number;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type TraceWaterfallChartProps = {
    data: { spans: TraceSpan[] };
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
  };

  let {
    data = { spans: [] },
    label,
    width,
    height = 320,
    size,
    class: className
  }: TraceWaterfallChartProps = $props();

  const resolvedWidth = $derived(width ?? size ?? 640);

  const MARGIN = { top: 16, right: 16, bottom: 32, left: 152 };
  const INDENT = 10;

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

  const plotWidth = $derived(Math.max(resolvedWidth - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  // Normalise : filtre les spans sans id/service ou de durée non finie/négative.
  const validSpans = $derived(
    (data?.spans ?? []).filter(
      (s) =>
        s &&
        typeof s.spanId === "string" &&
        s.spanId.length > 0 &&
        typeof s.service === "string" &&
        s.service.length > 0 &&
        Number.isFinite(s.start) &&
        Number.isFinite(s.duration)
    )
  );

  // Ordre hiérarchique : DFS depuis les racines (parentSpanId absent/inconnu).
  // Chaque span garde sa profondeur pour l'indentation du libellé.
  type OrderedSpan = { span: TraceSpan; depth: number };

  const ordered = $derived.by<OrderedSpan[]>(() => {
    if (validSpans.length === 0) return [];
    const byId = new Map<string, TraceSpan>();
    for (const s of validSpans) if (!byId.has(s.spanId)) byId.set(s.spanId, s);

    const childrenOf = new Map<string, TraceSpan[]>();
    const roots: TraceSpan[] = [];
    for (const s of validSpans) {
      const p = s.parentSpanId;
      if (p == null || !byId.has(p) || p === s.spanId) {
        roots.push(s);
      } else {
        const list = childrenOf.get(p) ?? [];
        list.push(s);
        childrenOf.set(p, list);
      }
    }

    const out: OrderedSpan[] = [];
    const seen = new Set<string>();
    const visit = (s: TraceSpan, depth: number) => {
      if (seen.has(s.spanId)) return;
      seen.add(s.spanId);
      out.push({ span: s, depth });
      for (const k of childrenOf.get(s.spanId) ?? []) visit(k, depth + 1);
    };
    for (const r of roots) visit(r, 0);
    // Spans orphelins (cycle non couvert) ajoutés en racine pour ne rien perdre.
    for (const s of validSpans) if (!seen.has(s.spanId)) visit(s, 0);
    return out;
  });

  // Services distincts (ordre d'apparition DFS) → index categoryN (1..8, cyclé).
  const serviceOrder = $derived.by(() => {
    const seen: string[] = [];
    for (const o of ordered) {
      if (!seen.includes(o.span.service)) seen.push(o.span.service);
    }
    return seen;
  });
  const toneOf = (service: string): string => {
    const idx = serviceOrder.indexOf(service);
    return `category${((idx < 0 ? 0 : idx) % 8) + 1}`;
  };
  const legendItems = $derived(serviceOrder.map((service) => ({ service, tone: toneOf(service) })));
  const hasLegend = $derived(serviceOrder.length > 0);

  const domainBounds = $derived.by(() => {
    const vals: number[] = [];
    for (const o of ordered) {
      vals.push(o.span.start, o.span.start + Math.max(o.span.duration, 0));
    }
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
    if (ordered.length === 0) return [];
    const band = plotHeight / ordered.length;
    const barHeight = Math.min(band * 0.62, 24);
    return ordered.map((o, i) => {
      const x0 = xOf(o.span.start);
      const x1 = xOf(o.span.start + Math.max(o.span.duration, 0));
      const x = Math.min(x0, x1);
      const w = Math.max(Math.abs(x1 - x0), 1);
      const y = MARGIN.top + band * i + (band - barHeight) / 2;
      return {
        span: o.span,
        depth: o.depth,
        index: i,
        x,
        y,
        width: w,
        height: barHeight,
        rowCenterY: MARGIN.top + band * (i + 0.5),
        cx: x + w / 2,
        tone: toneOf(o.span.service)
      };
    });
  });

  const dataValueItems = $derived(
    ordered.map(
      (o) =>
        `${"·".repeat(o.depth)}${o.span.service}: ${o.span.start} → ${o.span.start + Math.max(o.span.duration, 0)}`
    )
  );

  function handlePointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredIndex = null;
      return;
    }
    const idx = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(idx) ? idx : null;
  }

  const classes = () => ["st-traceWaterfallChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-traceWaterfallChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handlePointerMove}
    onpointerleave={() => (hoveredIndex = null)}
  >
    <svg
      viewBox="0 0 {resolvedWidth} {height}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
      <!-- gridlines + tick labels (axe X temporel) -->
      {#each ticks as tick (tick)}
        {@const tx = xOf(tick)}
        <line class="st-traceWaterfallChart__grid" x1={tx} x2={tx} y1={MARGIN.top} y2={height - MARGIN.bottom} />
        <text class="st-traceWaterfallChart__tickLabel" x={tx} y={height - MARGIN.bottom + 16} text-anchor="middle">
          {formatTick(tick)}
        </text>
      {/each}

      <!-- axes -->
      <line class="st-traceWaterfallChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
      <line class="st-traceWaterfallChart__axis" x1={MARGIN.left} x2={resolvedWidth - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

      <!-- une barre par span + étiquette de service à gauche, indentée -->
      {#each bars as bar, i (`${i}-${bar.span.spanId}`)}
        <text
          class="st-traceWaterfallChart__spanLabel"
          x={MARGIN.left - 8}
          y={bar.rowCenterY}
          text-anchor="end"
          dominant-baseline="middle"
        >
          {ellipsize(bar.span.service, Math.max(2, 16 - bar.depth))}
        </text>
        <rect
          class="st-traceWaterfallChart__bar st-traceWaterfallChart__bar--{bar.tone}"
          class:st-traceWaterfallChart__bar--dim={hoveredIndex !== null && hoveredIndex !== i}
          x={bar.x + bar.depth * INDENT}
          y={bar.y}
          width={Math.max(bar.width - bar.depth * INDENT, 1)}
          height={bar.height}
          rx="2"
          data-chart-index={i}
        />
      {/each}
    </svg>
  </div>

  {#if hasLegend}
    <ul class="st-traceWaterfallChart__legend" aria-label={`Services de ${label ?? "trace"}`}>
      {#each legendItems as item (item.service)}
        <li class="st-traceWaterfallChart__legendItem">
          <span class="st-traceWaterfallChart__legendSwatch st-traceWaterfallChart__legendSwatch--{item.tone}" aria-hidden="true"></span>
          {item.service}
        </li>
      {/each}
    </ul>
  {/if}

  <ChartDataList label={label ?? "trace waterfall"} items={dataValueItems} />

  {#if hoveredIndex !== null && bars[hoveredIndex]}
    {@const bar = bars[hoveredIndex]}
    <div
      class="st-traceWaterfallChart__tooltip"
      role="presentation"
      style="left: {(bar.cx / resolvedWidth) * 100}%; top: {(bar.rowCenterY / height) * 100}%"
    >
      <span class="st-traceWaterfallChart__tooltipLabel">{bar.span.service}</span>
      <span class="st-traceWaterfallChart__tooltipValue">{bar.span.start} → {bar.span.start + Math.max(bar.span.duration, 0)}</span>
    </div>
  {/if}
</div>

<style>
  .st-traceWaterfallChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-traceWaterfallChart svg {
    display: block;
    overflow: visible;
  }

  .st-traceWaterfallChart__visual {
    display: block;
  }

  .st-traceWaterfallChart__axis {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-traceWaterfallChart__grid {
    stroke: var(--st-semantic-border-subtle);
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-traceWaterfallChart__tickLabel,
  .st-traceWaterfallChart__spanLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
  }

  .st-traceWaterfallChart__bar {
    cursor: pointer;
    transition: opacity 120ms ease;
  }

  .st-traceWaterfallChart__bar--dim {
    opacity: 0.4;
  }

  .st-traceWaterfallChart__bar--category1 { fill: var(--st-semantic-data-category1); }
  .st-traceWaterfallChart__bar--category2 { fill: var(--st-semantic-data-category2); }
  .st-traceWaterfallChart__bar--category3 { fill: var(--st-semantic-data-category3); }
  .st-traceWaterfallChart__bar--category4 { fill: var(--st-semantic-data-category4); }
  .st-traceWaterfallChart__bar--category5 { fill: var(--st-semantic-data-category5); }
  .st-traceWaterfallChart__bar--category6 { fill: var(--st-semantic-data-category6); }
  .st-traceWaterfallChart__bar--category7 { fill: var(--st-semantic-data-category7); }
  .st-traceWaterfallChart__bar--category8 { fill: var(--st-semantic-data-category8); }

  .st-traceWaterfallChart__legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-3, 0.75rem);
    list-style: none;
    margin: var(--st-spacing-2, 0.5rem) 0 0 0;
    padding: 0;
  }

  .st-traceWaterfallChart__legendItem {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    font-size: 0.75rem;
    gap: var(--st-spacing-1, 0.25rem);
    line-height: 1;
  }

  .st-traceWaterfallChart__legendSwatch {
    border-radius: var(--st-radius-sm, 0.25rem);
    display: inline-block;
    height: 0.625rem;
    width: 0.625rem;
  }
  .st-traceWaterfallChart__legendSwatch--category1 { background: var(--st-semantic-data-category1); }
  .st-traceWaterfallChart__legendSwatch--category2 { background: var(--st-semantic-data-category2); }
  .st-traceWaterfallChart__legendSwatch--category3 { background: var(--st-semantic-data-category3); }
  .st-traceWaterfallChart__legendSwatch--category4 { background: var(--st-semantic-data-category4); }
  .st-traceWaterfallChart__legendSwatch--category5 { background: var(--st-semantic-data-category5); }
  .st-traceWaterfallChart__legendSwatch--category6 { background: var(--st-semantic-data-category6); }
  .st-traceWaterfallChart__legendSwatch--category7 { background: var(--st-semantic-data-category7); }
  .st-traceWaterfallChart__legendSwatch--category8 { background: var(--st-semantic-data-category8); }

  .st-traceWaterfallChart__tooltip {
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

  .st-traceWaterfallChart__tooltipLabel {
    font-weight: 600;
  }

  .st-traceWaterfallChart__tooltipValue {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-traceWaterfallChart__bar {
      transition: none;
    }
  }
</style>
