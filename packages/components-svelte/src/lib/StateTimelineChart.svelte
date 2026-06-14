<script lang="ts" module>
  /**
   * StateTimelineChart - bandes d'états DISCRETS dans le temps (façon Grafana
   * « state timeline » / Highcharts xrange). Une ligne (series) = une séquence
   * de segments contigus qui pavent l'axe temporel X ; la couleur encode l'état.
   * API canonique (référence Svelte, React/Vue doivent s'aligner).
   *
   * Modèle : une lane par series, empilées verticalement. Chaque segment a un
   * OFFSET de départ (x0 = start) et une largeur (end - start) sur un axe X
   * commun gradué (niceTicks). La couleur suit `tone` si fourni, sinon dérive
   * une teinte stable par `state` (cycle sur category1..8). Étiquette de series à
   * gauche (ellipsis). Légende des états sous le graphe.
   *
   * Props obligatoires :
   *   data   StateTimelineSeries[]  - tableau {series, segments[]}
   *
   * Props optionnelles :
   *   label   string
   *   width   number  (défaut 640)
   *   height  number  (défaut 320)
   *   class   string
   */
  export type StateTimelineTone =
    | "neutral" | "info" | "success" | "warning" | "error"
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  export type StateTimelineSegment = {
    start: number;
    end: number;
    state: string | number;
    tone?: StateTimelineTone;
  };

  export type StateTimelineSeries = {
    series: string;
    segments: StateTimelineSegment[];
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type StateTimelineChartProps = {
    data: StateTimelineSeries[];
    label?: string;
    width?: number;
    height?: number;
    class?: string;
  };

  let {
    data = [],
    label,
    width = 640,
    height = 320,
    class: className
  }: StateTimelineChartProps = $props();

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

  let hoveredKey: string | null = $state(null);

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  // Normalise start ≤ end, filtre les segments non finis et les lanes sans
  // libellé. Une lane sans segment valide est conservée (ligne vide).
  const validData = $derived(
    data
      .filter((d) => typeof d.series === "string" && d.series.length > 0)
      .map((d) => ({
        series: d.series,
        segments: (d.segments ?? [])
          .filter((s) => Number.isFinite(s.start) && Number.isFinite(s.end))
          .map((s) => ({
            start: Math.min(s.start, s.end),
            end: Math.max(s.start, s.end),
            state: s.state,
            tone: s.tone
          }))
      }))
  );

  // États distincts (ordre d'apparition) → index categoryN (1..8, cyclé) si
  // aucun `tone` explicite. Un `tone` sur un segment l'emporte sur la dérivation.
  const stateOrder = $derived.by(() => {
    const seen: string[] = [];
    for (const d of validData) {
      for (const s of d.segments) {
        const key = String(s.state);
        if (!seen.includes(key)) seen.push(key);
      }
    }
    return seen;
  });
  const explicitToneByState = $derived.by(() => {
    const map = new Map<string, StateTimelineTone>();
    for (const d of validData) {
      for (const s of d.segments) {
        if (s.tone) map.set(String(s.state), s.tone);
      }
    }
    return map;
  });
  const toneOf = (segment: { state: string | number; tone?: StateTimelineTone }): StateTimelineTone => {
    if (segment.tone) return segment.tone;
    const key = String(segment.state);
    const explicit = explicitToneByState.get(key);
    if (explicit) return explicit;
    const idx = stateOrder.indexOf(key);
    return `category${((idx < 0 ? 0 : idx) % 8) + 1}` as StateTimelineTone;
  };
  const legendItems = $derived(
    stateOrder.map((state) => ({ state, tone: toneOf({ state }) }))
  );
  const hasLegend = $derived(stateOrder.length > 0);

  const domainBounds = $derived.by(() => {
    const vals: number[] = [];
    for (const d of validData) {
      for (const s of d.segments) vals.push(s.start, s.end);
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

  const lanes = $derived.by(() => {
    if (validData.length === 0) return [];
    const band = plotHeight / validData.length;
    const laneHeight = Math.min(band * 0.62, 28);
    return validData.map((d, i) => {
      const y = MARGIN.top + band * i + (band - laneHeight) / 2;
      const segments = d.segments.map((s, j) => {
        const x0 = xOf(s.start);
        const x1 = xOf(s.end);
        const x = Math.min(x0, x1);
        const w = Math.max(Math.abs(x1 - x0), 1);
        return {
          key: `${i}-${j}`,
          datum: s,
          x,
          width: w,
          cx: x + w / 2,
          tone: toneOf(s)
        };
      });
      return {
        datum: d,
        index: i,
        y,
        height: laneHeight,
        rowCenterY: MARGIN.top + band * (i + 0.5),
        segments
      };
    });
  });

  const dataValueItems = $derived(
    validData.map(
      (d) =>
        `${d.series}: ${d.segments.map((s) => `${s.state} [${s.start} → ${s.end}]`).join(", ")}`
    )
  );

  function handlePointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredKey = null;
      return;
    }
    const key = target.getAttribute("data-chart-key");
    hoveredKey = key ?? null;
  }

  const hoveredSegment = $derived.by(() => {
    if (hoveredKey === null) return null;
    for (const lane of lanes) {
      for (const seg of lane.segments) {
        if (seg.key === hoveredKey) return { lane, seg };
      }
    }
    return null;
  });

  const classes = () => ["st-stateTimelineChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-stateTimelineChart__visual"
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
      <!-- gridlines + tick labels (axe X temporel) -->
      {#each ticks as tick (tick)}
        {@const tx = xOf(tick)}
        <line class="st-stateTimelineChart__grid" x1={tx} x2={tx} y1={MARGIN.top} y2={height - MARGIN.bottom} />
        <text class="st-stateTimelineChart__tickLabel" x={tx} y={height - MARGIN.bottom + 16} text-anchor="middle">
          {formatTick(tick)}
        </text>
      {/each}

      <!-- axes -->
      <line class="st-stateTimelineChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
      <line class="st-stateTimelineChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

      <!-- une lane par series : étiquette à gauche + segments d'états contigus -->
      {#each lanes as lane (`${lane.index}-${lane.datum.series}`)}
        <text
          class="st-stateTimelineChart__seriesLabel"
          x={MARGIN.left - 8}
          y={lane.rowCenterY}
          text-anchor="end"
          dominant-baseline="middle"
        >
          {ellipsize(lane.datum.series, 18)}
        </text>
        {#each lane.segments as seg (seg.key)}
          <rect
            class="st-stateTimelineChart__segment st-stateTimelineChart__segment--{seg.tone}"
            class:st-stateTimelineChart__segment--dim={hoveredKey !== null && hoveredKey !== seg.key}
            x={seg.x}
            y={lane.y}
            width={seg.width}
            height={lane.height}
            rx="2"
            data-chart-key={seg.key}
          />
        {/each}
      {/each}
    </svg>
  </div>

  {#if hasLegend}
    <ul class="st-stateTimelineChart__legend" aria-label={`États de ${label ?? "timeline"}`}>
      {#each legendItems as item (item.state)}
        <li class="st-stateTimelineChart__legendItem">
          <span class="st-stateTimelineChart__legendSwatch st-stateTimelineChart__legendSwatch--{item.tone}" aria-hidden="true"></span>
          {item.state}
        </li>
      {/each}
    </ul>
  {/if}

  <ChartDataList label={label ?? "state timeline"} items={dataValueItems} />

  {#if hoveredSegment}
    {@const seg = hoveredSegment.seg}
    {@const lane = hoveredSegment.lane}
    <div
      class="st-stateTimelineChart__tooltip"
      role="presentation"
      style="left: {(seg.cx / width) * 100}%; top: {(lane.rowCenterY / height) * 100}%"
    >
      <span class="st-stateTimelineChart__tooltipLabel">{lane.datum.series} · {seg.datum.state}</span>
      <span class="st-stateTimelineChart__tooltipValue">{seg.datum.start} → {seg.datum.end}</span>
    </div>
  {/if}
</div>

<style>
  .st-stateTimelineChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-stateTimelineChart svg {
    display: block;
    overflow: visible;
  }

  .st-stateTimelineChart__visual {
    display: block;
  }

  .st-stateTimelineChart__axis {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-stateTimelineChart__grid {
    stroke: var(--st-semantic-border-subtle);
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-stateTimelineChart__tickLabel,
  .st-stateTimelineChart__seriesLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
  }

  .st-stateTimelineChart__segment {
    cursor: pointer;
    transition: opacity 120ms ease;
  }

  .st-stateTimelineChart__segment--dim {
    opacity: 0.4;
  }

  .st-stateTimelineChart__segment--neutral { fill: var(--st-semantic-border-strong, var(--st-semantic-surface-subtle)); }
  .st-stateTimelineChart__segment--info { fill: var(--st-semantic-feedback-info, var(--st-semantic-action-primary)); }
  .st-stateTimelineChart__segment--success { fill: var(--st-semantic-feedback-success); }
  .st-stateTimelineChart__segment--warning { fill: var(--st-semantic-feedback-warning); }
  .st-stateTimelineChart__segment--error { fill: var(--st-semantic-feedback-error); }

  .st-stateTimelineChart__segment--category1 { fill: var(--st-semantic-data-category1); }
  .st-stateTimelineChart__segment--category2 { fill: var(--st-semantic-data-category2); }
  .st-stateTimelineChart__segment--category3 { fill: var(--st-semantic-data-category3); }
  .st-stateTimelineChart__segment--category4 { fill: var(--st-semantic-data-category4); }
  .st-stateTimelineChart__segment--category5 { fill: var(--st-semantic-data-category5); }
  .st-stateTimelineChart__segment--category6 { fill: var(--st-semantic-data-category6); }
  .st-stateTimelineChart__segment--category7 { fill: var(--st-semantic-data-category7); }
  .st-stateTimelineChart__segment--category8 { fill: var(--st-semantic-data-category8); }

  .st-stateTimelineChart__legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-3, 0.75rem);
    list-style: none;
    margin: var(--st-spacing-2, 0.5rem) 0 0 0;
    padding: 0;
  }

  .st-stateTimelineChart__legendItem {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    font-size: 0.75rem;
    gap: var(--st-spacing-1, 0.25rem);
    line-height: 1;
  }

  .st-stateTimelineChart__legendSwatch {
    border-radius: var(--st-radius-sm, 0.25rem);
    display: inline-block;
    height: 0.625rem;
    width: 0.625rem;
  }
  .st-stateTimelineChart__legendSwatch--neutral { background: var(--st-semantic-border-strong, var(--st-semantic-surface-subtle)); }
  .st-stateTimelineChart__legendSwatch--info { background: var(--st-semantic-feedback-info, var(--st-semantic-action-primary)); }
  .st-stateTimelineChart__legendSwatch--success { background: var(--st-semantic-feedback-success); }
  .st-stateTimelineChart__legendSwatch--warning { background: var(--st-semantic-feedback-warning); }
  .st-stateTimelineChart__legendSwatch--error { background: var(--st-semantic-feedback-error); }
  .st-stateTimelineChart__legendSwatch--category1 { background: var(--st-semantic-data-category1); }
  .st-stateTimelineChart__legendSwatch--category2 { background: var(--st-semantic-data-category2); }
  .st-stateTimelineChart__legendSwatch--category3 { background: var(--st-semantic-data-category3); }
  .st-stateTimelineChart__legendSwatch--category4 { background: var(--st-semantic-data-category4); }
  .st-stateTimelineChart__legendSwatch--category5 { background: var(--st-semantic-data-category5); }
  .st-stateTimelineChart__legendSwatch--category6 { background: var(--st-semantic-data-category6); }
  .st-stateTimelineChart__legendSwatch--category7 { background: var(--st-semantic-data-category7); }
  .st-stateTimelineChart__legendSwatch--category8 { background: var(--st-semantic-data-category8); }

  .st-stateTimelineChart__tooltip {
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

  .st-stateTimelineChart__tooltipLabel {
    font-weight: 600;
  }

  .st-stateTimelineChart__tooltipValue {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-stateTimelineChart__segment {
      transition: none;
    }
  }
</style>
