<script lang="ts" module>
  export type StackedBarTone =
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  export type StackedBarSegment = {
    label: string;
    value: number;
    tone?: StackedBarTone;
  };

  export type StackedBarDatum = {
    label: string;
    segments: StackedBarSegment[];
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";
  import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";

  type StackedBarChartProps = {
    data: StackedBarDatum[];
    width?: number;
    height?: number;
    label: string;
    showLegend?: boolean;
    /**
     * Per-segment value labels. `false`/absent (default) → none. `true` → each
     * segment's value with the chart's numeric formatter. Object → `format(value)`
     * and/or a `position` override (default `center` of the segment). Segments too
     * short to host a legible label are skipped. Labels are `aria-hidden` — the
     * values already live in the accessible ChartDataList.
     */
    dataLabels?: DataLabelsProp;
    /**
     * Interactive legend (FR-4). Ids/labels of series hidden from the render
     * (controlled by the parent; default = all visible). Each segment whose
     * `label` ∈ `hiddenSeries` is omitted and its legend item is shown "off"
     * (`aria-pressed`). Undefined → legacy non-interactive legend, unless
     * `onToggleSeries` is provided.
     */
    hiddenSeries?: string[];
    /** Emitted on click / Enter / Space on a legend item. */
    onToggleSeries?: (seriesId: string) => void;
    class?: string;
  };

  let {
    data,
    width = 480,
    height = 260,
    label,
    showLegend = true,
    dataLabels,
    hiddenSeries,
    onToggleSeries,
    class: className
  }: StackedBarChartProps = $props();

  // Interactive legend is active as soon as the parent wires either prop.
  const legendInteractive = $derived(onToggleSeries !== undefined || hiddenSeries !== undefined);
  const hiddenSet = $derived(new Set(hiddenSeries ?? []));

  const MARGIN = { top: 14, right: 16, bottom: 34, left: 44 };
  const TONES = ["category1","category2","category3","category4","category5","category6","category7","category8"] as const;

  // A segment must be at least this tall (px) to host a legible label.
  const DATA_LABEL_MIN_SEG_PX = 14;

  function niceTicks(min: number, max: number, target = 5): number[] {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return [Number.isFinite(max) ? max : 0];
    const range = max - min;
    const rough = range / Math.max(target - 1, 1);
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / pow;
    const step = norm < 1.5 ? pow : norm < 3 ? 2 * pow : norm < 7 ? 5 * pow : 10 * pow;
    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;
    const ticks: number[] = [];
    for (let v = start; v <= end + step / 2; v += step) ticks.push(Number(v.toFixed(10)));
    return ticks;
  }
  const scaleLinear = (v: number, d0: number, d1: number, r0: number, r1: number) =>
    d1 === d0 ? r0 : r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
  const fmt = (v: number) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : Number.isInteger(v) ? String(v) : v.toFixed(1));

  // Légende : tones par label de série (ordre de la 1re barre).
  const legend = $derived.by(() => {
    const seen = new Map<string, StackedBarTone>();
    data.forEach((bar) => bar.segments.forEach((seg, i) => {
      if (!seen.has(seg.label)) seen.set(seg.label, seg.tone ?? TONES[i % TONES.length]);
    }));
    return [...seen.entries()].map(([seriesLabel, tone]) => ({ seriesLabel, tone }));
  });

  let hovered: { bar: number; seg: number } | null = $state(null);

  const scales = $derived.by(() => {
    const totals = data.map((b) =>
      b.segments.reduce((s, x) => (hiddenSet.has(x.label) ? s : s + Math.max(x.value, 0)), 0)
    );
    const ticks = niceTicks(0, Math.max(0, ...totals));
    return {
      ticks, domainMax: ticks[ticks.length - 1],
      plotW: Math.max(width - MARGIN.left - MARGIN.right, 1),
      plotH: Math.max(height - MARGIN.top - MARGIN.bottom, 1)
    };
  });

  const bars = $derived.by(() => {
    const { domainMax, plotW, plotH } = scales;
    if (data.length === 0) return [];
    const band = plotW / data.length;
    const barWidth = band * 0.6;
    return data.map((bar, bi) => {
      const x = MARGIN.left + band * bi + (band - barWidth) / 2;
      let acc = 0;
      // Tone is bound to the original segment index so it stays stable when a
      // series is toggled off; hidden segments are dropped before stacking.
      const segs = bar.segments
        .map((seg, si) => ({ seg, tone: seg.tone ?? TONES[si % TONES.length] }))
        .filter(({ seg }) => !hiddenSet.has(seg.label))
        .map(({ seg, tone }) => {
          const v = Math.max(seg.value, 0);
          const yTop = MARGIN.top + scaleLinear(acc + v, 0, domainMax, plotH, 0);
          const yBottom = MARGIN.top + scaleLinear(acc, 0, domainMax, plotH, 0);
          acc += v;
          return {
            x, y: yTop, width: barWidth, height: Math.max(yBottom - yTop, 0),
            seg, tone,
            cx: x + barWidth / 2, cy: yTop + (yBottom - yTop) / 2
          };
        });
      return { x, band, label: bar.label, segs, cxLabel: MARGIN.left + band * (bi + 0.5) };
    });
  });

  const dataValueItems = $derived(
    data.flatMap((bar) =>
      bar.segments
        .filter((seg) => !hiddenSet.has(seg.label))
        .map((seg) => `${bar.label}, ${seg.label}: ${seg.value}`)
    )
  );

  // --- Data labels ----------------------------------------------------------
  // One value label centred in each segment (default `center`). Segments shorter
  // than DATA_LABEL_MIN_SEG_PX are skipped so labels stay legible. aria-hidden
  // (values are in the ChartDataList already).
  const dataLabelOpts = $derived(normalizeDataLabels(dataLabels));
  const dataLabelItems = $derived(
    dataLabelOpts.enabled
      ? bars.flatMap((bar) =>
          bar.segs
            .filter((s) => s.height >= DATA_LABEL_MIN_SEG_PX)
            .map((s) => ({
              key: `${bar.label}-${s.seg.label}`,
              x: s.cx,
              y: s.cy,
              text: formatDataLabel(s.seg.value, dataLabelOpts, fmt)
            }))
        )
      : []
  );

  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hovered = null;
      return;
    }
    const bar = Number(target.getAttribute("data-bar-index"));
    const seg = Number(target.getAttribute("data-segment-index"));
    hovered = Number.isInteger(bar) && Number.isInteger(seg) ? { bar, seg } : null;
  }

  const classes = () => ["st-stackedBar", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-stackedBar__visual"
    role="img"
    aria-label={label}
    onpointermove={handleVisualPointerMove}
    onpointerleave={() => (hovered = null)}
  >
    <svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
      {#each scales.ticks as t (t)}
        {@const y = MARGIN.top + scaleLinear(t, 0, scales.domainMax, scales.plotH, 0)}
        <line class="st-stackedBar__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={y} y2={y} />
        <text class="st-stackedBar__tick" x={MARGIN.left - 6} y={y} text-anchor="end" dominant-baseline="middle">{fmt(t)}</text>
      {/each}

      <line class="st-stackedBar__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
      <line class="st-stackedBar__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

      {#each bars as bar, bi (bar.label)}
        <text class="st-stackedBar__categoryLabel" x={bar.cxLabel} y={height - MARGIN.bottom + 16} text-anchor="middle">{bar.label}</text>
        {#each bar.segs as s, si (s.seg.label)}
          <rect
            class="st-stackedBar__seg st-stackedBar__seg--{s.tone}"
            class:st-stackedBar__seg--dim={hovered !== null && !(hovered.bar === bi && hovered.seg === si)}
            x={s.x} y={s.y} width={s.width} height={s.height}
            data-bar-index={bi}
            data-segment-index={si}
          />
        {/each}
      {/each}

      <!-- Data labels — one value per segment, drawn on top. aria-hidden. -->
      {#if dataLabelItems.length > 0}
        <g class="st-stackedBar__dataLabels" aria-hidden="true">
          {#each dataLabelItems as d (d.key)}
            <text class="st-stackedBar__dataLabel" x={d.x} y={d.y} text-anchor="middle" dominant-baseline="central">{d.text}</text>
          {/each}
        </g>
      {/if}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hovered && bars[hovered.bar]?.segs[hovered.seg]}
    {@const s = bars[hovered.bar].segs[hovered.seg]}
    <div class="st-stackedBar__tooltip" role="presentation" style="left: {(s.cx / width) * 100}%; top: {(s.cy / height) * 100}%">
      <span class="st-stackedBar__tooltipLabel">{s.seg.label}</span>
      <span class="st-stackedBar__tooltipValue">{s.seg.value}</span>
    </div>
  {/if}

  {#if showLegend && legend.length > 0}
    <ul class="st-stackedBar__legend">
      {#each legend as item (item.seriesLabel)}
        {@const off = hiddenSet.has(item.seriesLabel)}
        <li class="st-stackedBar__legendItem" class:st-stackedBar__legendItem--off={legendInteractive && off}>
          {#if legendInteractive}
            <button
              type="button"
              class="st-stackedBar__legendButton"
              aria-pressed={off}
              onclick={() => onToggleSeries?.(item.seriesLabel)}
            >
              <span class="st-stackedBar__legendSwatch st-stackedBar__legendSwatch--{item.tone}" aria-hidden="true"></span>
              {item.seriesLabel}
            </button>
          {:else}
            <span class="st-stackedBar__legendSwatch st-stackedBar__legendSwatch--{item.tone}" aria-hidden="true"></span>
            {item.seriesLabel}
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .st-stackedBar { color: var(--st-semantic-text-secondary); display: block; font-family: inherit; position: relative; width: 100%; }
  .st-stackedBar svg, .st-stackedBar__visual { display: block; overflow: visible; }
  .st-stackedBar__grid { stroke: var(--st-semantic-border-subtle); stroke-dasharray: 2 3; stroke-width: 1; opacity: 0.7; }
  .st-stackedBar__axis { stroke: var(--st-semantic-border-subtle); stroke-width: 1; }
  .st-stackedBar__tick, .st-stackedBar__categoryLabel { fill: var(--st-semantic-text-secondary); font-size: 0.6875rem; }
  .st-stackedBar__seg { cursor: pointer; stroke: var(--st-semantic-surface-default, #fff); stroke-width: 1; transition: opacity 120ms ease; }
  .st-stackedBar__seg--dim { opacity: 0.45; }
  .st-stackedBar__seg--category1 { fill: var(--st-semantic-data-category1); }
  .st-stackedBar__seg--category2 { fill: var(--st-semantic-data-category2); }
  .st-stackedBar__seg--category3 { fill: var(--st-semantic-data-category3); }
  .st-stackedBar__seg--category4 { fill: var(--st-semantic-data-category4); }
  .st-stackedBar__seg--category5 { fill: var(--st-semantic-data-category5); }
  .st-stackedBar__seg--category6 { fill: var(--st-semantic-data-category6); }
  .st-stackedBar__seg--category7 { fill: var(--st-semantic-data-category7); }
  .st-stackedBar__seg--category8 { fill: var(--st-semantic-data-category8); }
  /* Data labels — per-segment value, centred. Token-only colour. */
  .st-stackedBar__dataLabel { fill: var(--st-semantic-text-inverse); font-size: 0.6875rem; font-weight: 600; }
  .st-stackedBar__tooltip {
    background: var(--st-semantic-surface-inverse); border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-semantic-text-inverse); display: inline-flex; flex-direction: column; font-size: 0.75rem;
    gap: 0.125rem; line-height: 1.2; padding: 0.375rem 0.5rem; pointer-events: none; position: absolute;
    transform: translate(-50%, calc(-100% - 8px)); white-space: nowrap; z-index: 1;
  }
  .st-stackedBar__tooltipLabel { font-weight: 600; }
  .st-stackedBar__tooltipValue { opacity: 0.85; }
  .st-stackedBar__legend { display: flex; flex-wrap: wrap; gap: 0.75rem; list-style: none; margin: 0.5rem 0 0; padding: 0; }
  .st-stackedBar__legendItem { align-items: center; color: var(--st-semantic-text-secondary); display: inline-flex; font-size: 0.75rem; gap: 0.35rem; }
  .st-stackedBar__legendItem--off { opacity: 0.45; }
  .st-stackedBar__legendButton {
    align-items: center; background: none; border: 0; border-radius: var(--st-radius-sm, 0.25rem);
    color: inherit; cursor: pointer; display: inline-flex; font: inherit; gap: 0.35rem; padding: 0.125rem 0.25rem;
  }
  .st-stackedBar__legendButton:focus-visible { outline: 2px solid var(--st-semantic-border-interactive); outline-offset: 2px; }
  .st-stackedBar__legendSwatch { border-radius: 2px; height: 0.7rem; width: 0.7rem; }
  .st-stackedBar__legendSwatch--category1 { background: var(--st-semantic-data-category1); }
  .st-stackedBar__legendSwatch--category2 { background: var(--st-semantic-data-category2); }
  .st-stackedBar__legendSwatch--category3 { background: var(--st-semantic-data-category3); }
  .st-stackedBar__legendSwatch--category4 { background: var(--st-semantic-data-category4); }
  .st-stackedBar__legendSwatch--category5 { background: var(--st-semantic-data-category5); }
  .st-stackedBar__legendSwatch--category6 { background: var(--st-semantic-data-category6); }
  .st-stackedBar__legendSwatch--category7 { background: var(--st-semantic-data-category7); }
  .st-stackedBar__legendSwatch--category8 { background: var(--st-semantic-data-category8); }
</style>
