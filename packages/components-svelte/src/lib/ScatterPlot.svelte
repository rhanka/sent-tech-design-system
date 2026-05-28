<script lang="ts" module>
  export type ScatterPlotTone =
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  export type ScatterPlotDatum = {
    x: number;
    y: number;
    label?: string;
    tone?: ScatterPlotTone;
  };
</script>

<script lang="ts">
  type ScatterPlotProps = {
    data: ScatterPlotDatum[];
    width?: number;
    height?: number;
    xLabel?: string;
    yLabel?: string;
    radius?: number;
    label: string;
    class?: string;
  };

  let {
    data,
    width = 480,
    height = 280,
    xLabel,
    yLabel,
    radius = 5,
    label,
    class: className
  }: ScatterPlotProps = $props();

  const MARGIN = { top: 14, right: 18, bottom: 36, left: 48 };

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

  let hoveredIndex: number | null = $state(null);

  const TONES = ["category1","category2","category3","category4","category5","category6","category7","category8"] as const;

  const scales = $derived.by(() => {
    const xs = data.map((d) => d.x);
    const ys = data.map((d) => d.y);
    const xTicks = niceTicks(Math.min(...xs), Math.max(...xs));
    const yTicks = niceTicks(Math.min(...ys), Math.max(...ys));
    const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
    const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
    return {
      xTicks, yTicks,
      xMin: xTicks[0], xMax: xTicks[xTicks.length - 1],
      yMin: yTicks[0], yMax: yTicks[yTicks.length - 1],
      plotW, plotH
    };
  });

  const points = $derived.by(() => {
    const { xMin, xMax, yMin, yMax, plotW, plotH } = scales;
    return data.map((d, i) => ({
      cx: MARGIN.left + scaleLinear(d.x, xMin, xMax, 0, plotW),
      cy: MARGIN.top + scaleLinear(d.y, yMin, yMax, plotH, 0),
      datum: d,
      tone: d.tone ?? TONES[i % TONES.length]
    }));
  });

  const classes = () => ["st-scatterPlot", className].filter(Boolean).join(" ");
</script>

<div class={classes()} role="img" aria-label={label}>
  <svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
    <!-- gridlines + ticks Y -->
    {#each scales.yTicks as t (t)}
      {@const y = MARGIN.top + scaleLinear(t, scales.yMin, scales.yMax, scales.plotH, 0)}
      <line class="st-scatterPlot__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={y} y2={y} />
      <text class="st-scatterPlot__tick" x={MARGIN.left - 6} y={y} text-anchor="end" dominant-baseline="middle">{fmt(t)}</text>
    {/each}
    <!-- ticks X -->
    {#each scales.xTicks as t (t)}
      {@const x = MARGIN.left + scaleLinear(t, scales.xMin, scales.xMax, 0, scales.plotW)}
      <text class="st-scatterPlot__tick" x={x} y={height - MARGIN.bottom + 16} text-anchor="middle">{fmt(t)}</text>
    {/each}

    <!-- axes -->
    <line class="st-scatterPlot__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
    <line class="st-scatterPlot__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

    {#if xLabel}
      <text class="st-scatterPlot__axisLabel" x={MARGIN.left + scales.plotW / 2} y={height - 4} text-anchor="middle">{xLabel}</text>
    {/if}
    {#if yLabel}
      <text class="st-scatterPlot__axisLabel" x={12} y={MARGIN.top + scales.plotH / 2} text-anchor="middle" transform="rotate(-90 12 {MARGIN.top + scales.plotH / 2})">{yLabel}</text>
    {/if}

    <!-- points -->
    {#each points as p, i (i)}
      <circle
        class="st-scatterPlot__point st-scatterPlot__point--{p.tone}"
        cx={p.cx}
        cy={p.cy}
        r={radius}
        tabindex="0"
        role="img"
        aria-label="{p.datum.label ? p.datum.label + ': ' : ''}x {p.datum.x}, y {p.datum.y}"
        onmouseenter={() => (hoveredIndex = i)}
        onmouseleave={() => (hoveredIndex = null)}
        onfocus={() => (hoveredIndex = i)}
        onblur={() => (hoveredIndex = null)}
      />
    {/each}
  </svg>

  {#if hoveredIndex !== null && points[hoveredIndex]}
    {@const p = points[hoveredIndex]}
    <div class="st-scatterPlot__tooltip" role="presentation" style="left: {(p.cx / width) * 100}%; top: {(p.cy / height) * 100}%">
      {#if p.datum.label}<span class="st-scatterPlot__tooltipLabel">{p.datum.label}</span>{/if}
      <span class="st-scatterPlot__tooltipValue">x {p.datum.x} · y {p.datum.y}</span>
    </div>
  {/if}
</div>

<style>
  .st-scatterPlot { color: var(--st-semantic-text-secondary); display: block; font-family: inherit; position: relative; width: 100%; }
  .st-scatterPlot svg { display: block; overflow: visible; }
  .st-scatterPlot__grid { stroke: var(--st-semantic-border-subtle); stroke-dasharray: 2 3; stroke-width: 1; opacity: 0.7; }
  .st-scatterPlot__axis { stroke: var(--st-semantic-border-subtle); stroke-width: 1; }
  .st-scatterPlot__tick { fill: var(--st-semantic-text-secondary); font-size: 0.6875rem; }
  .st-scatterPlot__axisLabel { fill: var(--st-semantic-text-secondary); font-size: 0.75rem; font-weight: 600; }
  .st-scatterPlot__point { cursor: pointer; fill-opacity: 0.85; transition: fill-opacity 120ms ease, r 120ms ease; }
  .st-scatterPlot__point:hover, .st-scatterPlot__point:focus-visible { fill-opacity: 1; }
  .st-scatterPlot__point:focus-visible { outline: 2px solid var(--st-semantic-border-interactive); outline-offset: 1px; }
  .st-scatterPlot__point--category1 { fill: var(--st-semantic-data-category1); }
  .st-scatterPlot__point--category2 { fill: var(--st-semantic-data-category2); }
  .st-scatterPlot__point--category3 { fill: var(--st-semantic-data-category3); }
  .st-scatterPlot__point--category4 { fill: var(--st-semantic-data-category4); }
  .st-scatterPlot__point--category5 { fill: var(--st-semantic-data-category5); }
  .st-scatterPlot__point--category6 { fill: var(--st-semantic-data-category6); }
  .st-scatterPlot__point--category7 { fill: var(--st-semantic-data-category7); }
  .st-scatterPlot__point--category8 { fill: var(--st-semantic-data-category8); }
  .st-scatterPlot__tooltip {
    background: var(--st-semantic-surface-inverse); border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-semantic-text-inverse); display: inline-flex; flex-direction: column;
    font-size: 0.75rem; gap: 0.125rem; line-height: 1.2; padding: 0.375rem 0.5rem;
    pointer-events: none; position: absolute; transform: translate(-50%, calc(-100% - 8px)); white-space: nowrap; z-index: 1;
  }
  .st-scatterPlot__tooltipLabel { font-weight: 600; }
  .st-scatterPlot__tooltipValue { opacity: 0.85; }
</style>
