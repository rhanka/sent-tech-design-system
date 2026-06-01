<script lang="ts" module>
  export type LineChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type LineChartDatum = {
    x: number | string;
    y: number;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type LineChartProps = {
    data: LineChartDatum[];
    width?: number;
    height?: number;
    tone?: LineChartTone;
    smooth?: boolean;
    area?: boolean;
    label: string;
    class?: string;
  };

  let {
    data,
    width = 480,
    height = 240,
    tone = "category1",
    smooth = false,
    area = false,
    label,
    class: className
  }: LineChartProps = $props();

  const MARGIN = { top: 12, right: 16, bottom: 32, left: 44 };

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

  function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number) {
    if (d1 === d0) return r0;
    return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
  }

  function formatTick(v: number): string {
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(1);
  }

  function isNumeric(x: number | string): x is number {
    return typeof x === "number" && Number.isFinite(x);
  }

  let hoveredIndex: number | null = $state(null);

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  const xDomain = $derived.by(() => {
    if (data.length === 0) return { kind: "ordinal" as const, values: [] as (number | string)[] };
    const allNumeric = data.every((d) => isNumeric(d.x));
    if (allNumeric) {
      const xs = data.map((d) => d.x as number);
      return { kind: "numeric" as const, min: Math.min(...xs), max: Math.max(...xs) };
    }
    return { kind: "ordinal" as const, values: data.map((d) => d.x) };
  });

  const yTicks = $derived.by(() => {
    const ys = data.map((d) => d.y);
    if (ys.length === 0) return [0];
    const minRaw = Math.min(...ys);
    const maxRaw = Math.max(...ys);
    const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
    return niceTicks(minRaw - padded, maxRaw + padded, 5);
  });

  const yDomain = $derived.by(() => {
    if (yTicks.length === 0) return { min: 0, max: 1 };
    return { min: yTicks[0], max: yTicks[yTicks.length - 1] };
  });

  const points = $derived.by(() => {
    if (data.length === 0) return [];
    return data.map((d, i) => {
      let x: number;
      if (xDomain.kind === "numeric") {
        x = scaleLinear(d.x as number, xDomain.min, xDomain.max, 0, plotWidth);
      } else {
        // ordinal: distribute evenly
        const denom = Math.max(data.length - 1, 1);
        x = data.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
      }
      const y = scaleLinear(d.y, yDomain.min, yDomain.max, plotHeight, 0);
      return {
        x: MARGIN.left + x,
        y: MARGIN.top + y,
        datum: d,
        index: i
      };
    });
  });

  const dataValueItems = $derived(data.map((d) => `${d.x}: ${d.y}`));

  function buildLinearPath(pts: { x: number; y: number }[]): string {
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  }

  function buildSmoothPath(pts: { x: number; y: number }[]): string {
    if (pts.length < 2) return buildLinearPath(pts);
    const t = 0.18;
    let d = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? p2;
      const c1x = p1.x + (p2.x - p0.x) * t;
      const c1y = p1.y + (p2.y - p0.y) * t;
      const c2x = p2.x - (p3.x - p1.x) * t;
      const c2y = p2.y - (p3.y - p1.y) * t;
      d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
    }
    return d;
  }

  const linePath = $derived(
    points.length === 0 ? "" : smooth ? buildSmoothPath(points) : buildLinearPath(points)
  );

  const areaPath = $derived.by(() => {
    if (!area || points.length === 0) return "";
    const base = MARGIN.top + plotHeight;
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L${last.x.toFixed(2)},${base.toFixed(2)} L${first.x.toFixed(2)},${base.toFixed(2)} Z`;
  });

  const gridLines = $derived(
    yTicks.map((tick) => ({
      value: tick,
      y: MARGIN.top + scaleLinear(tick, yDomain.min, yDomain.max, plotHeight, 0)
    }))
  );

  const xTickEntries = $derived.by(() => {
    if (data.length === 0) return [];
    if (xDomain.kind === "ordinal") {
      return points.map((p, i) => ({
        x: p.x,
        label: String(data[i].x)
      }));
    }
    const target = Math.min(5, data.length);
    const stride = Math.max(1, Math.round((data.length - 1) / (target - 1 || 1)));
    const entries: { x: number; label: string }[] = [];
    for (let i = 0; i < data.length; i += stride) {
      entries.push({ x: points[i].x, label: String(data[i].x) });
    }
    const lastIdx = data.length - 1;
    if (entries[entries.length - 1]?.label !== String(data[lastIdx].x)) {
      entries.push({ x: points[lastIdx].x, label: String(data[lastIdx].x) });
    }
    return entries;
  });

  function handleLeave() {
    hoveredIndex = null;
  }
  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredIndex = null;
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(index) ? index : null;
  }

  const classes = () =>
    ["st-lineChart", `st-lineChart--${tone}`, className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-lineChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handleVisualPointerMove}
    onpointerleave={handleLeave}
  >
    <svg
      viewBox="0 0 {width} {height}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
    <!-- gridlines + Y axis ticks -->
    {#each gridLines as g (g.value)}
      <line
        class="st-lineChart__grid"
        x1={MARGIN.left}
        x2={width - MARGIN.right}
        y1={g.y}
        y2={g.y}
      />
      <text
        class="st-lineChart__tickLabel"
        x={MARGIN.left - 6}
        y={g.y}
        text-anchor="end"
        dominant-baseline="middle"
      >
        {formatTick(g.value)}
      </text>
    {/each}

    <!-- axes -->
    <line
      class="st-lineChart__axis"
      x1={MARGIN.left}
      x2={MARGIN.left}
      y1={MARGIN.top}
      y2={height - MARGIN.bottom}
    />
    <line
      class="st-lineChart__axis"
      x1={MARGIN.left}
      x2={width - MARGIN.right}
      y1={height - MARGIN.bottom}
      y2={height - MARGIN.bottom}
    />

    <!-- X tick labels -->
    {#each xTickEntries as tick, i (i)}
      <text
        class="st-lineChart__tickLabel"
        x={tick.x}
        y={height - MARGIN.bottom + 16}
        text-anchor="middle"
      >
        {tick.label}
      </text>
    {/each}

    {#if area && areaPath}
      <path class="st-lineChart__area" d={areaPath} />
    {/if}
    {#if linePath}
      <path
        class="st-lineChart__line"
        d={linePath}
        fill="none"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    {/if}

    {#each points as p (p.index)}
      <circle
        class="st-lineChart__dot"
        cx={p.x}
        cy={p.y}
        r="4"
        data-chart-index={p.index}
      />
    {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && points[hoveredIndex]}
    {@const p = points[hoveredIndex]}
    <div
      class="st-lineChart__tooltip"
      role="presentation"
      style="left: {(p.x / width) * 100}%; top: {(p.y / height) * 100}%"
    >
      <span class="st-lineChart__tooltipLabel">{p.datum.x}</span>
      <span class="st-lineChart__tooltipValue">{p.datum.y}</span>
    </div>
  {/if}
</div>

<style>
  .st-lineChart {
    color: var(--st-semantic-data-category1);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-lineChart--category1 { color: var(--st-semantic-data-category1); }
  .st-lineChart--category2 { color: var(--st-semantic-data-category2); }
  .st-lineChart--category3 { color: var(--st-semantic-data-category3); }
  .st-lineChart--category4 { color: var(--st-semantic-data-category4); }
  .st-lineChart--category5 { color: var(--st-semantic-data-category5); }
  .st-lineChart--category6 { color: var(--st-semantic-data-category6); }
  .st-lineChart--category7 { color: var(--st-semantic-data-category7); }
  .st-lineChart--category8 { color: var(--st-semantic-data-category8); }

  .st-lineChart svg {
    display: block;
    overflow: visible;
  }

  .st-lineChart__visual {
    display: block;
  }

  .st-lineChart__grid {
    stroke: var(--st-component-lineChart-gridStroke, var(--st-semantic-border-subtle));
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-lineChart__axis {
    stroke: var(--st-component-lineChart-axisStroke, var(--st-semantic-border-subtle));
    stroke-width: 1;
  }

  .st-lineChart__tickLabel {
    fill: var(--st-component-lineChart-labelColor, var(--st-semantic-text-secondary));
    font-size: 0.6875rem;
  }

  .st-lineChart__line {
    stroke: currentColor;
  }

  .st-lineChart__area {
    fill: currentColor;
    opacity: 0.18;
    stroke: none;
  }

  .st-lineChart__dot {
    fill: currentColor;
    stroke: var(--st-semantic-surface-default);
    stroke-width: 1.5;
    cursor: pointer;
    transition: r 120ms ease;
  }

  .st-lineChart__dot:hover {
    r: 5.5;
  }

  .st-lineChart__tooltip {
    background: var(--st-component-lineChart-tooltipBackground, var(--st-semantic-surface-inverse));
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-component-lineChart-tooltipText, var(--st-semantic-text-inverse));
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

  .st-lineChart__tooltipLabel {
    font-weight: 600;
  }

  .st-lineChart__tooltipValue {
    opacity: 0.85;
  }
</style>
