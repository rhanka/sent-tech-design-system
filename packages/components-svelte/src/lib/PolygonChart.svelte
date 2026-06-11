<script lang="ts" module>
  export type PolygonChartTone =
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  export type PolygonChartPoint = {
    x: number;
    y: number;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type PolygonChartProps = {
    data: PolygonChartPoint[];
    label: string;
    tone?: PolygonChartTone;
    width?: number;
    height?: number;
    class?: string;
  };

  let {
    data,
    label,
    tone = "category1",
    width = 480,
    height = 360,
    class: className
  }: PolygonChartProps = $props();

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

  // Non-finite coordinates are dropped before anything else.
  const validData = $derived(
    (data ?? []).filter((d) => Number.isFinite(d.x) && Number.isFinite(d.y))
  );

  const scales = $derived.by(() => {
    const xs = validData.map((d) => d.x);
    const ys = validData.map((d) => d.y);
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
    return validData.map((d) => ({
      cx: MARGIN.left + scaleLinear(d.x, xMin, xMax, 0, plotW),
      cy: MARGIN.top + scaleLinear(d.y, yMin, yMax, plotH, 0),
      datum: d
    }));
  });

  const polygonPoints = $derived(points.map((p) => `${p.cx},${p.cy}`).join(" "));

  const dataValueItems = $derived(validData.map((d) => `x ${d.x}, y ${d.y}`));

  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredIndex = null;
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(index) ? index : null;
  }

  const classes = () => ["st-polygonChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-polygonChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handleVisualPointerMove}
    onpointerleave={() => (hoveredIndex = null)}
  >
    <svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
      <!-- gridlines + ticks Y -->
      {#each scales.yTicks as t (t)}
        {@const y = MARGIN.top + scaleLinear(t, scales.yMin, scales.yMax, scales.plotH, 0)}
        <line class="st-polygonChart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={y} y2={y} />
        <text class="st-polygonChart__tick" x={MARGIN.left - 6} y={y} text-anchor="end" dominant-baseline="middle">{fmt(t)}</text>
      {/each}
      <!-- ticks X -->
      {#each scales.xTicks as t (t)}
        {@const x = MARGIN.left + scaleLinear(t, scales.xMin, scales.xMax, 0, scales.plotW)}
        <text class="st-polygonChart__tick" x={x} y={height - MARGIN.bottom + 16} text-anchor="middle">{fmt(t)}</text>
      {/each}

      <!-- axes -->
      <line class="st-polygonChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
      <line class="st-polygonChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

      <!-- closed filled polygon connecting the points in order -->
      {#if points.length >= 2}
        <polygon class="st-polygonChart__polygon st-polygonChart__polygon--{tone}" points={polygonPoints} />
      {/if}

      <!-- vertex markers -->
      {#each points as p, i (i)}
        <circle
          class="st-polygonChart__vertex st-polygonChart__vertex--{tone}"
          cx={p.cx}
          cy={p.cy}
          r="3.5"
          data-chart-index={i}
        />
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && points[hoveredIndex]}
    {@const p = points[hoveredIndex]}
    <div class="st-polygonChart__tooltip" role="presentation" style="left: {(p.cx / width) * 100}%; top: {(p.cy / height) * 100}%">
      <span class="st-polygonChart__tooltipValue">x {p.datum.x} · y {p.datum.y}</span>
    </div>
  {/if}
</div>

<style>
  .st-polygonChart { color: var(--st-semantic-text-secondary); display: block; font-family: inherit; position: relative; width: 100%; }
  .st-polygonChart svg, .st-polygonChart__visual { display: block; overflow: visible; }
  .st-polygonChart__grid { stroke: var(--st-semantic-border-subtle); stroke-dasharray: 2 3; stroke-width: 1; opacity: 0.7; }
  .st-polygonChart__axis { stroke: var(--st-semantic-border-subtle); stroke-width: 1; }
  .st-polygonChart__tick { fill: var(--st-semantic-text-secondary); font-size: 0.6875rem; }
  .st-polygonChart__polygon { fill: currentColor; fill-opacity: 0.18; stroke: currentColor; stroke-width: 2; stroke-linejoin: round; }
  .st-polygonChart__vertex { fill: currentColor; }
  .st-polygonChart__polygon--category1, .st-polygonChart__vertex--category1 { color: var(--st-semantic-data-category1); }
  .st-polygonChart__polygon--category2, .st-polygonChart__vertex--category2 { color: var(--st-semantic-data-category2); }
  .st-polygonChart__polygon--category3, .st-polygonChart__vertex--category3 { color: var(--st-semantic-data-category3); }
  .st-polygonChart__polygon--category4, .st-polygonChart__vertex--category4 { color: var(--st-semantic-data-category4); }
  .st-polygonChart__polygon--category5, .st-polygonChart__vertex--category5 { color: var(--st-semantic-data-category5); }
  .st-polygonChart__polygon--category6, .st-polygonChart__vertex--category6 { color: var(--st-semantic-data-category6); }
  .st-polygonChart__polygon--category7, .st-polygonChart__vertex--category7 { color: var(--st-semantic-data-category7); }
  .st-polygonChart__polygon--category8, .st-polygonChart__vertex--category8 { color: var(--st-semantic-data-category8); }
  .st-polygonChart__tooltip {
    background: var(--st-semantic-surface-inverse); border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-semantic-text-inverse); display: inline-flex; flex-direction: column;
    font-size: 0.75rem; gap: 0.125rem; line-height: 1.2; padding: 0.375rem 0.5rem;
    pointer-events: none; position: absolute; transform: translate(-50%, calc(-100% - 8px)); white-space: nowrap; z-index: 1;
  }
  .st-polygonChart__tooltipValue { opacity: 0.85; }
</style>
