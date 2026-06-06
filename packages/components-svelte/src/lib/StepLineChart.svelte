<script lang="ts" module>
  export type StepLineChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type StepLineChartDatum = {
    x: number | string;
    y: number;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type StepLineChartProps = {
    data: StepLineChartDatum[];
    width?: number;
    height?: number;
    tone?: StepLineChartTone;
    label: string;
    class?: string;
  };

  let {
    data = [],
    width = 480,
    height = 240,
    tone = "category1",
    label,
    class: className
  }: StepLineChartProps = $props();

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

  function isValidDatum(datum: StepLineChartDatum): boolean {
    return Number.isFinite(datum.y) && (typeof datum.x === "string" || isNumeric(datum.x));
  }

  let hoveredIndex: number | null = $state(null);

  const safeData = $derived(data.filter(isValidDatum));
  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  const xDomain = $derived.by(() => {
    if (safeData.length === 0) return { kind: "ordinal" as const, values: [] as (number | string)[] };
    const allNumeric = safeData.every((d) => isNumeric(d.x));
    if (allNumeric) {
      const xs = safeData.map((d) => d.x as number);
      return { kind: "numeric" as const, min: Math.min(...xs), max: Math.max(...xs) };
    }
    return { kind: "ordinal" as const, values: safeData.map((d) => d.x) };
  });

  const yTicks = $derived.by(() => {
    const ys = safeData.map((d) => d.y);
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
    if (safeData.length === 0) return [];
    return safeData.map((d, i) => {
      let x: number;
      if (xDomain.kind === "numeric") {
        x = scaleLinear(d.x as number, xDomain.min, xDomain.max, 0, plotWidth);
      } else {
        const denom = Math.max(safeData.length - 1, 1);
        x = safeData.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
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

  const dataValueItems = $derived(safeData.map((d) => `${d.x}: ${d.y}`));

  function buildStepPath(pts: { x: number; y: number }[]): string {
    if (pts.length === 0) return "";
    let path = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
    for (let i = 1; i < pts.length; i++) {
      const point = pts[i];
      path += ` H${point.x.toFixed(2)} V${point.y.toFixed(2)}`;
    }
    return path;
  }

  const linePath = $derived(buildStepPath(points));

  const gridLines = $derived(
    yTicks.map((tick) => ({
      value: tick,
      y: MARGIN.top + scaleLinear(tick, yDomain.min, yDomain.max, plotHeight, 0)
    }))
  );

  const xTickEntries = $derived.by(() => {
    if (safeData.length === 0) return [];
    if (xDomain.kind === "ordinal") {
      return points.map((p, i) => ({
        x: p.x,
        label: String(safeData[i].x)
      }));
    }
    const target = Math.min(5, safeData.length);
    const stride = Math.max(1, Math.round((safeData.length - 1) / (target - 1 || 1)));
    const entries: { x: number; label: string }[] = [];
    for (let i = 0; i < safeData.length; i += stride) {
      entries.push({ x: points[i].x, label: String(safeData[i].x) });
    }
    const lastIdx = safeData.length - 1;
    if (entries[entries.length - 1]?.label !== String(safeData[lastIdx].x)) {
      entries.push({ x: points[lastIdx].x, label: String(safeData[lastIdx].x) });
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
    ["st-stepLineChart", `st-stepLineChart--${tone}`, className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-stepLineChart__visual"
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
      {#each gridLines as g (g.value)}
        <line
          class="st-stepLineChart__grid"
          x1={MARGIN.left}
          x2={width - MARGIN.right}
          y1={g.y}
          y2={g.y}
        />
        <text
          class="st-stepLineChart__tickLabel"
          x={MARGIN.left - 6}
          y={g.y}
          text-anchor="end"
          dominant-baseline="middle"
        >
          {formatTick(g.value)}
        </text>
      {/each}

      <line
        class="st-stepLineChart__axis"
        x1={MARGIN.left}
        x2={MARGIN.left}
        y1={MARGIN.top}
        y2={height - MARGIN.bottom}
      />
      <line
        class="st-stepLineChart__axis"
        x1={MARGIN.left}
        x2={width - MARGIN.right}
        y1={height - MARGIN.bottom}
        y2={height - MARGIN.bottom}
      />

      {#each xTickEntries as tick, i (i)}
        <text
          class="st-stepLineChart__tickLabel"
          x={tick.x}
          y={height - MARGIN.bottom + 16}
          text-anchor="middle"
        >
          {tick.label}
        </text>
      {/each}

      {#if linePath}
        <path
          class="st-stepLineChart__line"
          d={linePath}
          fill="none"
          stroke-width="2"
          stroke-linecap="butt"
          stroke-linejoin="round"
        />
      {/if}

      {#each points as p (p.index)}
        <circle
          class="st-stepLineChart__dot"
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
      class="st-stepLineChart__tooltip"
      role="presentation"
      style="left: {(p.x / width) * 100}%; top: {(p.y / height) * 100}%"
    >
      <span class="st-stepLineChart__tooltipLabel">{p.datum.x}</span>
      <span class="st-stepLineChart__tooltipValue">{p.datum.y}</span>
    </div>
  {/if}
</div>

<style>
  .st-stepLineChart {
    color: var(--st-semantic-data-category1);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-stepLineChart--category1 { color: var(--st-semantic-data-category1); }
  .st-stepLineChart--category2 { color: var(--st-semantic-data-category2); }
  .st-stepLineChart--category3 { color: var(--st-semantic-data-category3); }
  .st-stepLineChart--category4 { color: var(--st-semantic-data-category4); }
  .st-stepLineChart--category5 { color: var(--st-semantic-data-category5); }
  .st-stepLineChart--category6 { color: var(--st-semantic-data-category6); }
  .st-stepLineChart--category7 { color: var(--st-semantic-data-category7); }
  .st-stepLineChart--category8 { color: var(--st-semantic-data-category8); }

  .st-stepLineChart svg {
    display: block;
    overflow: visible;
  }

  .st-stepLineChart__visual {
    display: block;
  }

  .st-stepLineChart__grid {
    stroke: var(--st-component-stepLineChart-gridStroke, var(--st-semantic-border-subtle));
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-stepLineChart__axis {
    stroke: var(--st-component-stepLineChart-axisStroke, var(--st-semantic-border-subtle));
    stroke-width: 1;
  }

  .st-stepLineChart__tickLabel {
    fill: var(--st-component-stepLineChart-labelColor, var(--st-semantic-text-secondary));
    font-size: 0.6875rem;
  }

  .st-stepLineChart__line {
    stroke: currentColor;
  }

  .st-stepLineChart__dot {
    fill: currentColor;
    stroke: var(--st-semantic-surface-default);
    stroke-width: 1.5;
    cursor: pointer;
    transition: r 120ms ease;
  }

  .st-stepLineChart__dot:hover {
    r: 5.5;
  }

  .st-stepLineChart__tooltip {
    background: var(--st-component-stepLineChart-tooltipBackground, var(--st-semantic-surface-inverse));
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-component-stepLineChart-tooltipText, var(--st-semantic-text-inverse));
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

  .st-stepLineChart__tooltipLabel {
    font-weight: 600;
  }

  .st-stepLineChart__tooltipValue {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-stepLineChart__dot {
      transition: none;
    }
  }
</style>
