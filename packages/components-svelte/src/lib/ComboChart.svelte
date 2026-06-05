<script lang="ts" module>
  export type ComboChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type ComboChartBarSeries = {
    label: string;
    data: number[];
    tone?: ComboChartTone;
  };

  export type ComboChartLineSeries = {
    label: string;
    data: number[];
    tone?: ComboChartTone;
    smooth?: boolean;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type ComboChartProps = {
    categories: string[];
    bars?: ComboChartBarSeries[];
    lines?: ComboChartLineSeries[];
    leftAxisLabel?: string;
    rightAxisLabel?: string;
    legend?: boolean;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };

  let {
    categories,
    bars = [],
    lines = [],
    leftAxisLabel,
    rightAxisLabel,
    legend = true,
    width = 480,
    height = 240,
    label,
    class: className
  }: ComboChartProps = $props();

  const MARGIN = { top: 12, right: 52, bottom: 32, left: 52 };

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

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  // Left axis (bars): include zero in the domain so bars rest on a baseline.
  const leftScale = $derived.by(() => {
    const values = bars.flatMap((s) => s.data);
    const minRaw = Math.min(0, ...(values.length ? values : [0]));
    const maxRaw = Math.max(0, ...(values.length ? values : [0]));
    const ticks = niceTicks(minRaw, maxRaw, 5);
    return { ticks, domainMin: ticks[0], domainMax: ticks[ticks.length - 1] };
  });

  // Right axis (lines): padded domain like LineChart.
  const rightScale = $derived.by(() => {
    const values = lines.flatMap((s) => s.data);
    if (values.length === 0) {
      const ticks = niceTicks(0, 1, 5);
      return { ticks, domainMin: ticks[0], domainMax: ticks[ticks.length - 1] };
    }
    const minRaw = Math.min(...values);
    const maxRaw = Math.max(...values);
    const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
    const ticks = niceTicks(minRaw - padded, maxRaw + padded, 5);
    return { ticks, domainMin: ticks[0], domainMax: ticks[ticks.length - 1] };
  });

  // Categories are ordinal: each gets a band centred at the band midpoint.
  function bandCenter(i: number): number {
    const band = plotWidth / Math.max(categories.length, 1);
    return MARGIN.left + band * (i + 0.5);
  }

  // A point is missing when its category index is absent or non-finite. Missing
  // bar values render NO bar (not a zero-height baseline artefact); missing line
  // values break the line into gaps. Values are never silently coerced to 0.
  const isPresent = (v: number | undefined): v is number => typeof v === "number" && Number.isFinite(v);

  const barGroups = $derived.by(() => {
    if (categories.length === 0 || bars.length === 0) return [];
    const { domainMin, domainMax } = leftScale;
    const band = plotWidth / categories.length;
    const groupWidth = band * 0.62;
    const barWidth = groupWidth / bars.length;
    const zeroY = scaleLinear(0, domainMin, domainMax, plotHeight, 0);
    return categories.map((_, ci) => {
      const groupX = MARGIN.left + band * ci + (band - groupWidth) / 2;
      const segments = bars
        .map((series, si) => {
          const raw = series.data[ci];
          if (!isPresent(raw)) return null;
          const value = raw;
          const valueY = scaleLinear(value, domainMin, domainMax, plotHeight, 0);
          const y = Math.min(valueY, zeroY);
          const h = Math.abs(zeroY - valueY);
          return {
            x: groupX + barWidth * si,
            y: MARGIN.top + y,
            width: barWidth,
            height: Math.max(h, 0.5),
            cx: groupX + barWidth * (si + 0.5),
            cy: MARGIN.top + valueY,
            value,
            seriesLabel: series.label,
            category: categories[ci],
            si,
            tone: series.tone ?? `category${(si % 8) + 1}`
          };
        })
        .filter((seg): seg is NonNullable<typeof seg> => seg !== null);
      return segments;
    });
  });

  const flatBars = $derived(barGroups.flat());

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

  const lineSeries = $derived.by(() => {
    if (categories.length === 0 || lines.length === 0) return [];
    const { domainMin, domainMax } = rightScale;
    return lines.map((series, li) => {
      const points = categories.map((_, ci) => {
        const value = series.data[ci] ?? 0;
        return {
          x: bandCenter(ci),
          y: MARGIN.top + scaleLinear(value, domainMin, domainMax, plotHeight, 0),
          value,
          category: categories[ci]
        };
      });
      const path = series.smooth ? buildSmoothPath(points) : buildLinearPath(points);
      return {
        path,
        points,
        seriesLabel: series.label,
        tone: series.tone ?? `category${((bars.length + li) % 8) + 1}`
      };
    });
  });

  const leftGridLines = $derived(
    leftScale.ticks.map((tick) => ({
      value: tick,
      y: MARGIN.top + scaleLinear(tick, leftScale.domainMin, leftScale.domainMax, plotHeight, 0)
    }))
  );

  const rightTickEntries = $derived(
    lines.length === 0
      ? []
      : rightScale.ticks.map((tick) => ({
          value: tick,
          y: MARGIN.top + scaleLinear(tick, rightScale.domainMin, rightScale.domainMax, plotHeight, 0)
        }))
  );

  const legendItems = $derived([
    ...bars.map((s, i) => ({
      key: `bar-${i}`,
      label: s.label,
      tone: s.tone ?? `category${(i % 8) + 1}`,
      kind: "bar" as const
    })),
    ...lines.map((s, i) => ({
      key: `line-${i}`,
      label: s.label,
      tone: s.tone ?? `category${((bars.length + i) % 8) + 1}`,
      kind: "line" as const
    }))
  ]);

  const dataValueItems = $derived([
    ...bars.flatMap((s) =>
      categories.map((c, ci) => `${s.label}, ${c}: ${s.data[ci] ?? 0}`)
    ),
    ...lines.flatMap((s) =>
      categories.map((c, ci) => `${s.label}, ${c}: ${s.data[ci] ?? 0}`)
    )
  ]);

  type Hover =
    | { kind: "bar"; gi: number; si: number }
    | { kind: "line"; li: number; pi: number }
    | null;
  let hovered: Hover = $state(null);

  function handleLeave() {
    hovered = null;
  }
  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hovered = null;
      return;
    }
    const kind = target.getAttribute("data-chart-kind");
    const a = Number(target.getAttribute("data-chart-a"));
    const b = Number(target.getAttribute("data-chart-b"));
    if (kind === "bar" && Number.isInteger(a) && Number.isInteger(b)) {
      hovered = { kind: "bar", gi: a, si: b };
    } else if (kind === "line" && Number.isInteger(a) && Number.isInteger(b)) {
      hovered = { kind: "line", li: a, pi: b };
    } else {
      hovered = null;
    }
  }

  const tooltip = $derived.by(() => {
    if (!hovered) return null;
    if (hovered.kind === "bar") {
      const seg = barGroups[hovered.gi]?.[hovered.si];
      if (!seg) return null;
      return { cx: seg.cx, cy: seg.cy, label: `${seg.seriesLabel} · ${seg.category}`, value: seg.value };
    }
    const series = lineSeries[hovered.li];
    const p = series?.points[hovered.pi];
    if (!series || !p) return null;
    return { cx: p.x, cy: p.y, label: `${series.seriesLabel} · ${p.category}`, value: p.value };
  });

  const classes = () => ["st-comboChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-comboChart__visual"
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
      <!-- gridlines + left (bar) axis ticks -->
      {#each leftGridLines as g (g.value)}
        <line class="st-comboChart__grid" x1={MARGIN.left} x2={MARGIN.left + plotWidth} y1={g.y} y2={g.y} />
        <text
          class="st-comboChart__tickLabel"
          x={MARGIN.left - 6}
          y={g.y}
          text-anchor="end"
          dominant-baseline="middle"
        >
          {formatTick(g.value)}
        </text>
      {/each}

      <!-- right (line) axis ticks -->
      {#each rightTickEntries as g (g.value)}
        <text
          class="st-comboChart__tickLabel"
          x={MARGIN.left + plotWidth + 6}
          y={g.y}
          text-anchor="start"
          dominant-baseline="middle"
        >
          {formatTick(g.value)}
        </text>
      {/each}

      <!-- axes -->
      <line class="st-comboChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
      <line
        class="st-comboChart__axis"
        x1={MARGIN.left}
        x2={width - MARGIN.right}
        y1={height - MARGIN.bottom}
        y2={height - MARGIN.bottom}
      />
      {#if lines.length > 0}
        <line
          class="st-comboChart__axis"
          x1={MARGIN.left + plotWidth}
          x2={MARGIN.left + plotWidth}
          y1={MARGIN.top}
          y2={height - MARGIN.bottom}
        />
      {/if}

      <!-- axis labels -->
      {#if leftAxisLabel}
        <text
          class="st-comboChart__axisLabel"
          text-anchor="middle"
          transform="translate({MARGIN.left - 40}, {MARGIN.top + plotHeight / 2}) rotate(-90)"
        >
          {leftAxisLabel}
        </text>
      {/if}
      {#if rightAxisLabel}
        <text
          class="st-comboChart__axisLabel"
          text-anchor="middle"
          transform="translate({MARGIN.left + plotWidth + 40}, {MARGIN.top + plotHeight / 2}) rotate(90)"
        >
          {rightAxisLabel}
        </text>
      {/if}

      <!-- category labels -->
      {#each categories as category, ci (ci)}
        <text
          class="st-comboChart__categoryLabel"
          x={bandCenter(ci)}
          y={height - MARGIN.bottom + 16}
          text-anchor="middle"
        >
          {category}
        </text>
      {/each}

      <!-- bars -->
      {#each barGroups as group, gi (gi)}
        {#each group as seg, si (si)}
          <rect
            class="st-comboChart__bar st-comboChart__bar--{seg.tone}"
            x={seg.x}
            y={seg.y}
            width={seg.width}
            height={seg.height}
            rx="2"
            data-chart-kind="bar"
            data-chart-a={gi}
            data-chart-b={si}
          />
        {/each}
      {/each}

      <!-- lines -->
      {#each lineSeries as series, li (li)}
        <path
          class="st-comboChart__line st-comboChart__line--{series.tone}"
          d={series.path}
          fill="none"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        {#each series.points as p, pi (pi)}
          <circle
            class="st-comboChart__dot st-comboChart__dot--{series.tone}"
            cx={p.x}
            cy={p.y}
            r="4"
            data-chart-kind="line"
            data-chart-a={li}
            data-chart-b={pi}
          />
        {/each}
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if legend && legendItems.length > 0}
    <ul class="st-comboChart__legend" aria-hidden="true">
      {#each legendItems as item (item.key)}
        <li class="st-comboChart__legendItem">
          <span
            class="st-comboChart__legendSwatch st-comboChart__legendSwatch--{item.kind} st-comboChart__legendSwatch--{item.tone}"
          ></span>
          {item.label}
        </li>
      {/each}
    </ul>
  {/if}

  {#if tooltip}
    <div
      class="st-comboChart__tooltip"
      role="presentation"
      style="left: {(tooltip.cx / width) * 100}%; top: {(tooltip.cy / height) * 100}%"
    >
      <span class="st-comboChart__tooltipLabel">{tooltip.label}</span>
      <span class="st-comboChart__tooltipValue">{tooltip.value}</span>
    </div>
  {/if}
</div>

<style>
  .st-comboChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-comboChart svg {
    display: block;
    overflow: visible;
  }

  .st-comboChart__visual {
    display: block;
  }

  .st-comboChart__grid {
    stroke: var(--st-component-comboChart-gridStroke, var(--st-semantic-border-subtle));
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-comboChart__axis {
    stroke: var(--st-component-comboChart-axisStroke, var(--st-semantic-border-subtle));
    stroke-width: 1;
  }

  .st-comboChart__tickLabel,
  .st-comboChart__categoryLabel {
    fill: var(--st-component-comboChart-labelColor, var(--st-semantic-text-secondary));
    font-size: 0.6875rem;
  }

  .st-comboChart__axisLabel {
    fill: var(--st-component-comboChart-labelColor, var(--st-semantic-text-secondary));
    font-size: 0.6875rem;
    font-weight: 600;
  }

  .st-comboChart__bar {
    cursor: pointer;
    transition: opacity 120ms ease;
  }

  .st-comboChart__bar:hover {
    opacity: 0.82;
  }

  .st-comboChart__bar--category1 { fill: var(--st-semantic-data-category1); }
  .st-comboChart__bar--category2 { fill: var(--st-semantic-data-category2); }
  .st-comboChart__bar--category3 { fill: var(--st-semantic-data-category3); }
  .st-comboChart__bar--category4 { fill: var(--st-semantic-data-category4); }
  .st-comboChart__bar--category5 { fill: var(--st-semantic-data-category5); }
  .st-comboChart__bar--category6 { fill: var(--st-semantic-data-category6); }
  .st-comboChart__bar--category7 { fill: var(--st-semantic-data-category7); }
  .st-comboChart__bar--category8 { fill: var(--st-semantic-data-category8); }

  .st-comboChart__line--category1 { stroke: var(--st-semantic-data-category1); }
  .st-comboChart__line--category2 { stroke: var(--st-semantic-data-category2); }
  .st-comboChart__line--category3 { stroke: var(--st-semantic-data-category3); }
  .st-comboChart__line--category4 { stroke: var(--st-semantic-data-category4); }
  .st-comboChart__line--category5 { stroke: var(--st-semantic-data-category5); }
  .st-comboChart__line--category6 { stroke: var(--st-semantic-data-category6); }
  .st-comboChart__line--category7 { stroke: var(--st-semantic-data-category7); }
  .st-comboChart__line--category8 { stroke: var(--st-semantic-data-category8); }

  .st-comboChart__dot {
    stroke: var(--st-semantic-surface-default);
    stroke-width: 1.5;
    cursor: pointer;
    transition: r 120ms ease;
  }

  .st-comboChart__dot:hover {
    r: 5.5;
  }

  .st-comboChart__dot--category1 { fill: var(--st-semantic-data-category1); }
  .st-comboChart__dot--category2 { fill: var(--st-semantic-data-category2); }
  .st-comboChart__dot--category3 { fill: var(--st-semantic-data-category3); }
  .st-comboChart__dot--category4 { fill: var(--st-semantic-data-category4); }
  .st-comboChart__dot--category5 { fill: var(--st-semantic-data-category5); }
  .st-comboChart__dot--category6 { fill: var(--st-semantic-data-category6); }
  .st-comboChart__dot--category7 { fill: var(--st-semantic-data-category7); }
  .st-comboChart__dot--category8 { fill: var(--st-semantic-data-category8); }

  @media (prefers-reduced-motion: reduce) {
    .st-comboChart__bar,
    .st-comboChart__dot {
      transition: none;
    }
  }

  .st-comboChart__legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-3, 0.75rem);
    list-style: none;
    margin: var(--st-spacing-2, 0.5rem) 0 0;
    padding: 0;
  }

  .st-comboChart__legendItem {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    font-size: 0.75rem;
    gap: var(--st-spacing-1, 0.25rem);
  }

  .st-comboChart__legendSwatch {
    display: inline-block;
    flex: none;
  }

  .st-comboChart__legendSwatch--bar {
    border-radius: 2px;
    height: 0.75rem;
    width: 0.75rem;
  }

  .st-comboChart__legendSwatch--line {
    border-radius: 999px;
    height: 0.25rem;
    width: 1rem;
  }

  .st-comboChart__legendSwatch--category1 { background: var(--st-semantic-data-category1); }
  .st-comboChart__legendSwatch--category2 { background: var(--st-semantic-data-category2); }
  .st-comboChart__legendSwatch--category3 { background: var(--st-semantic-data-category3); }
  .st-comboChart__legendSwatch--category4 { background: var(--st-semantic-data-category4); }
  .st-comboChart__legendSwatch--category5 { background: var(--st-semantic-data-category5); }
  .st-comboChart__legendSwatch--category6 { background: var(--st-semantic-data-category6); }
  .st-comboChart__legendSwatch--category7 { background: var(--st-semantic-data-category7); }
  .st-comboChart__legendSwatch--category8 { background: var(--st-semantic-data-category8); }

  .st-comboChart__tooltip {
    background: var(--st-component-comboChart-tooltipBackground, var(--st-semantic-surface-inverse));
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-component-comboChart-tooltipText, var(--st-semantic-text-inverse));
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

  .st-comboChart__tooltipLabel {
    font-weight: 600;
  }

  .st-comboChart__tooltipValue {
    opacity: 0.85;
  }
</style>
