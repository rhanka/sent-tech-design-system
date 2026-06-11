<script lang="ts" module>
  export type AreaChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type AreaChartDatum = {
    x: number | string;
    y: number;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";
  import {
    resolveAnnotations,
    annotationDataListItems,
    polygonPoints,
    type ChartAnnotation
  } from "./chartAnnotations.js";
  import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";
  import { keyForX, resolveActiveIndex } from "./chartCrosshair.js";

  type AreaChartProps = {
    data: (number | AreaChartDatum)[];
    width?: number;
    height?: number;
    tone?: AreaChartTone;
    smooth?: boolean;
    label: string;
    /**
     * Annotation overlay in DATA space (points, labels, axis lines, regions,
     * polygons), resolved to pixels via the chart scales. Regions render behind
     * the area, every other kind above it. Additive: absent ⇒ unchanged.
     */
    annotations?: ChartAnnotation[];
    /**
     * Per-point value labels. `false`/absent (default) → none. `true` → each
     * point's value with the chart's numeric formatter. Object → `format(value)`
     * and/or a `position` override. Default position is `top` (above the point).
     * Labels are `aria-hidden` — the values already live in the accessible
     * ChartDataList.
     */
    dataLabels?: DataLabelsProp;
    /**
     * CONTROLLED synchronised hover key (FR-3). A datum's key is `String(x)`. When
     * provided (string or null), the crosshair + tooltip track this key instead of
     * the chart's internal pointer hover (null ⇒ nothing shown), letting a parent
     * share one hover channel across several aligned charts. Absent (`undefined`)
     * keeps the legacy uncontrolled behaviour.
     */
    hoverKey?: string | null;
    /**
     * Emitted when the user hovers a datum (its key) or leaves the plot (`null`).
     * Always fired on pointer move/leave — even while CONTROLLED — so dataviz can
     * keep the shared hover channel in sync.
     */
    onHoverKeyChange?: (key: string | null) => void;
    class?: string;
  };

  let {
    data = [],
    width = 480,
    height = 240,
    tone = "category1",
    smooth = false,
    label,
    annotations,
    dataLabels,
    hoverKey,
    onHoverKeyChange,
    class: className
  }: AreaChartProps = $props();

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

  const normalizedData = $derived.by(() => {
    return data.map((d, i) => {
      if (typeof d === "number") {
        return { x: i, y: d } as AreaChartDatum;
      }
      return d;
    });
  });

  const dataValueItems = $derived([
    ...normalizedData.map((d) => `${d.x}: ${d.y}`),
    ...annotationDataListItems(annotations)
  ]);

  let hoveredIndex: number | null = $state(null);

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  const xDomain = $derived.by(() => {
    if (normalizedData.length === 0) return { kind: "ordinal" as const, values: [] as (number | string)[] };
    const allNumeric = normalizedData.every((d) => isNumeric(d.x));
    if (allNumeric) {
      const xs = normalizedData.map((d) => d.x as number);
      return { kind: "numeric" as const, min: Math.min(...xs), max: Math.max(...xs) };
    }
    return { kind: "ordinal" as const, values: normalizedData.map((d) => d.x) };
  });

  const yTicks = $derived.by(() => {
    const ys = normalizedData.map((d) => d.y);
    if (ys.length === 0) return [0];
    const minRaw = Math.min(...ys);
    const maxRaw = Math.max(...ys);
    const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
    const minTickVal = Math.min(0, minRaw - padded);
    return niceTicks(minTickVal, maxRaw + padded, 5);
  });

  const yDomain = $derived.by(() => {
    if (yTicks.length === 0) return { min: 0, max: 1 };
    return { min: yTicks[0], max: yTicks[yTicks.length - 1] };
  });

  const points = $derived.by(() => {
    if (normalizedData.length === 0) return [];
    return normalizedData.map((d, i) => {
      let x: number;
      if (xDomain.kind === "numeric") {
        x = scaleLinear(d.x as number, xDomain.min, xDomain.max, 0, plotWidth);
      } else {
        const denom = Math.max(normalizedData.length - 1, 1);
        x = normalizedData.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
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

  // --- Annotation overlay ---------------------------------------------------
  // `xScale` honours the ordinal/numeric x domain; `yScale` mirrors the point
  // y mapping. Out-of-domain coordinates yield `null` → the resolver drops them.
  const annotationXScale = $derived((v: number | string): number | null => {
    if (xDomain.kind === "numeric") {
      if (typeof v !== "number" || !Number.isFinite(v)) return null;
      if (v < xDomain.min || v > xDomain.max) return null;
      return scaleLinear(v, xDomain.min, xDomain.max, 0, plotWidth);
    }
    const i = normalizedData.findIndex((d) => d.x === v);
    if (i < 0) return null;
    const denom = Math.max(normalizedData.length - 1, 1);
    return normalizedData.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
  });
  const annotationYScale = $derived((v: number): number | null => {
    if (!Number.isFinite(v) || v < yDomain.min || v > yDomain.max) return null;
    return scaleLinear(v, yDomain.min, yDomain.max, plotHeight, 0);
  });
  const resolvedAnnotations = $derived(
    resolveAnnotations(annotations, {
      xScale: annotationXScale,
      yScale: annotationYScale,
      plotLeft: MARGIN.left,
      plotTop: MARGIN.top,
      plotWidth,
      plotHeight
    })
  );
  const annotationRegions = $derived(resolvedAnnotations.filter((a) => a.kind === "region"));
  const annotationAbove = $derived(resolvedAnnotations.filter((a) => a.kind !== "region"));

  // --- Data labels ----------------------------------------------------------
  // One value label per point. Default `top`: just above the dot. `center` sits
  // on the dot. aria-hidden (values are in the ChartDataList already).
  const dataLabelOpts = $derived(normalizeDataLabels(dataLabels));
  const dataLabelItems = $derived.by(() => {
    if (!dataLabelOpts.enabled) return [] as { key: number; x: number; y: number; text: string; baseline: string }[];
    return points.map((p) => {
      const text = formatDataLabel(p.datum.y, dataLabelOpts, formatTick);
      const center = dataLabelOpts.position === "center" || dataLabelOpts.position === "inside";
      return { key: p.index, x: p.x, y: center ? p.y : p.y - 8, text, baseline: center ? "middle" : "auto" };
    });
  });

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
    if (points.length === 0) return "";
    const base = MARGIN.top + scaleLinear(Math.max(0, yDomain.min), yDomain.min, yDomain.max, plotHeight, 0);
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
    if (normalizedData.length === 0) return [];
    if (xDomain.kind === "ordinal") {
      return points.map((p, i) => ({
        x: p.x,
        label: String(normalizedData[i].x)
      }));
    }
    const target = Math.min(5, normalizedData.length);
    const stride = Math.max(1, Math.round((normalizedData.length - 1) / (target - 1 || 1)));
    const entries: { x: number; label: string }[] = [];
    for (let i = 0; i < normalizedData.length; i += stride) {
      entries.push({ x: points[i].x, label: String(normalizedData[i].x) });
    }
    const lastIdx = normalizedData.length - 1;
    if (entries[entries.length - 1]?.label !== String(normalizedData[lastIdx].x)) {
      entries.push({ x: points[lastIdx].x, label: String(normalizedData[lastIdx].x) });
    }
    return entries;
  });

  // Stable key per datum (FR-3): `String(x)` of the normalised datum (a bare
  // number becomes its index). Resolves a controlled `hoverKey` to an index and
  // feeds `onHoverKeyChange` from pointer events.
  const hoverKeys = $derived(normalizedData.map((d) => keyForX(d.x)));
  function emitHoverKey(index: number | null) {
    onHoverKeyChange?.(index == null ? null : hoverKeys[index] ?? null);
  }
  function handleLeave() {
    hoveredIndex = null;
    emitHoverKey(null);
  }
  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredIndex = null;
      emitHoverKey(null);
      return;
    }
    const raw = Number(target.getAttribute("data-chart-index"));
    const index = Number.isInteger(raw) ? raw : null;
    hoveredIndex = index;
    emitHoverKey(index);
  }

  // Index whose crosshair/tooltip is DISPLAYED: the controlled `hoverKey` when
  // provided (resolved against `hoverKeys`), else the internal pointer index.
  const activeIndex = $derived(resolveActiveIndex(hoverKey, hoveredIndex, hoverKeys));

  // Generates a unique gradient id to avoid conflicts when rendering multiple charts on the same page
  const gradientId = $derived.by(() => {
    return `st-areachart-gradient-${Math.random().toString(36).substring(2, 9)}`;
  });

  const classes = () =>
    ["st-areaChart", `st-areaChart--${tone}`, className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-areaChart__visual"
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
    <defs>
      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="currentColor" stop-opacity="0.3" />
        <stop offset="100%" stop-color="currentColor" stop-opacity="0.0" />
      </linearGradient>
    </defs>

    <!-- gridlines + Y axis ticks -->
    {#each gridLines as g (g.value)}
      <line
        class="st-areaChart__grid"
        x1={MARGIN.left}
        x2={width - MARGIN.right}
        y1={g.y}
        y2={g.y}
      />
      <text
        class="st-areaChart__tickLabel"
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
      class="st-areaChart__axis"
      x1={MARGIN.left}
      x2={MARGIN.left}
      y1={MARGIN.top}
      y2={height - MARGIN.bottom}
    />
    <line
      class="st-areaChart__axis"
      x1={MARGIN.left}
      x2={width - MARGIN.right}
      y1={height - MARGIN.bottom}
      y2={height - MARGIN.bottom}
    />

    <!-- X tick labels -->
    {#each xTickEntries as tick, i (i)}
      <text
        class="st-areaChart__tickLabel"
        x={tick.x}
        y={height - MARGIN.bottom + 16}
        text-anchor="middle"
      >
        {tick.label}
      </text>
    {/each}

    <!-- Annotation regions sit BEHIND the area. -->
    {#if annotationRegions.length > 0}
      <g class="st-areaChart__annotations st-areaChart__annotations--behind">
        {#each annotationRegions as a (a.key)}
          {#if a.kind === "region"}
            <rect class="st-areaChart__annotationRegion" x={a.x} y={a.y} width={a.width} height={a.height} />
            {#if a.label}
              <text class="st-areaChart__annotationLabel" x={a.x + 4} y={a.y + 11}>{a.label}</text>
            {/if}
          {/if}
        {/each}
      </g>
    {/if}

    {#if areaPath}
      <path class="st-areaChart__area" d={areaPath} fill="url(#{gradientId})" />
    {/if}
    {#if linePath}
      <path
        class="st-areaChart__line"
        d={linePath}
        fill="none"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    {/if}

    {#each points as p (p.index)}
      <circle
        class="st-areaChart__dot"
        cx={p.x}
        cy={p.y}
        r="4"
        data-chart-index={p.index}
      />
    {/each}

    <!-- Annotations ABOVE the area: lines, shapes, points, labels. -->
    {#if annotationAbove.length > 0}
      <g class="st-areaChart__annotations st-areaChart__annotations--above">
        {#each annotationAbove as a (a.key)}
          {#if a.kind === "line"}
            <line class="st-areaChart__annotationLine" x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} />
            {#if a.label}
              <text
                class="st-areaChart__annotationLabel"
                x={a.axis === "x" ? a.x1 + 4 : MARGIN.left + plotWidth - 4}
                y={a.axis === "x" ? MARGIN.top + 11 : a.y1 - 4}
                text-anchor={a.axis === "x" ? "start" : "end"}
              >{a.label}</text>
            {/if}
          {:else if a.kind === "shape"}
            <polygon class="st-areaChart__annotationShape" points={polygonPoints(a.points)} />
            {#if a.label}
              <text class="st-areaChart__annotationLabel" x={a.labelX} y={a.labelY} text-anchor="middle">{a.label}</text>
            {/if}
          {:else if a.kind === "point"}
            <circle class="st-areaChart__annotationPoint" cx={a.x} cy={a.y} r="4.5" />
            {#if a.label}
              <text class="st-areaChart__annotationLabel" x={a.x} y={a.y - 8} text-anchor="middle">{a.label}</text>
            {/if}
          {:else}
            <text class="st-areaChart__annotationText" x={a.x} y={a.y} text-anchor={a.anchor}>{a.text}</text>
          {/if}
        {/each}
      </g>
    {/if}

    <!-- Data labels — one value per point, drawn on top. aria-hidden. -->
    {#if dataLabelItems.length > 0}
      <g class="st-areaChart__dataLabels" aria-hidden="true">
        {#each dataLabelItems as d (d.key)}
          <text class="st-areaChart__dataLabel" x={d.x} y={d.y} text-anchor="middle" dominant-baseline={d.baseline}>{d.text}</text>
        {/each}
      </g>
    {/if}

    <!-- Crosshair (FR-3) — a tokenised vertical line + marker at the active key.
         Decorative (aria-hidden); the value is in the tooltip + ChartDataList. -->
    {#if activeIndex >= 0 && points[activeIndex]}
      {@const cp = points[activeIndex]}
      <g class="st-areaChart__crosshair" aria-hidden="true">
        <line class="st-areaChart__crosshairLine" x1={cp.x} x2={cp.x} y1={MARGIN.top} y2={MARGIN.top + plotHeight} />
        <circle class="st-areaChart__crosshairMarker" cx={cp.x} cy={cp.y} r="5" />
      </g>
    {/if}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if activeIndex >= 0 && points[activeIndex]}
    {@const p = points[activeIndex]}
    <div
      class="st-areaChart__tooltip"
      role="presentation"
      style="left: {(p.x / width) * 100}%; top: {(p.y / height) * 100}%"
    >
      <span class="st-areaChart__tooltipLabel">{p.datum.x}</span>
      <span class="st-areaChart__tooltipValue">{p.datum.y}</span>
    </div>
  {/if}
</div>

<style>
  .st-areaChart {
    color: var(--st-semantic-data-category1);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-areaChart--category1 { color: var(--st-semantic-data-category1); }
  .st-areaChart--category2 { color: var(--st-semantic-data-category2); }
  .st-areaChart--category3 { color: var(--st-semantic-data-category3); }
  .st-areaChart--category4 { color: var(--st-semantic-data-category4); }
  .st-areaChart--category5 { color: var(--st-semantic-data-category5); }
  .st-areaChart--category6 { color: var(--st-semantic-data-category6); }
  .st-areaChart--category7 { color: var(--st-semantic-data-category7); }
  .st-areaChart--category8 { color: var(--st-semantic-data-category8); }

  .st-areaChart svg {
    display: block;
    overflow: visible;
  }

  .st-areaChart__visual {
    display: block;
  }

  .st-areaChart__grid {
    stroke: var(--st-component-areaChart-gridStroke, var(--st-semantic-border-subtle));
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-areaChart__axis {
    stroke: var(--st-component-areaChart-axisStroke, var(--st-semantic-border-subtle));
    stroke-width: 1;
  }

  .st-areaChart__tickLabel {
    fill: var(--st-component-areaChart-labelColor, var(--st-semantic-text-secondary));
    font-size: 0.6875rem;
  }

  .st-areaChart__line {
    stroke: currentColor;
  }

  .st-areaChart__area {
    stroke: none;
  }

  .st-areaChart__dot {
    fill: currentColor;
    stroke: var(--st-semantic-surface-default);
    stroke-width: 1.5;
    cursor: pointer;
    transition: r 120ms ease;
  }

  .st-areaChart__dot:hover {
    r: 5.5;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-areaChart__dot {
      transition: none;
    }
  }

  .st-areaChart__tooltip {
    background: var(--st-component-areaChart-tooltipBackground, var(--st-semantic-surface-inverse));
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-component-areaChart-tooltipText, var(--st-semantic-text-inverse));
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

  .st-areaChart__tooltipLabel {
    font-weight: 600;
  }

  .st-areaChart__tooltipValue {
    opacity: 0.85;
  }

  /* --- Annotation layer ----------------------------------------------------
     Regions render BEHIND the area; lines/shapes/points/labels render ABOVE. */
  .st-areaChart__annotationRegion {
    fill: color-mix(in srgb, var(--st-semantic-feedback-info) 12%, transparent);
    stroke: none;
  }
  .st-areaChart__annotationLine {
    stroke: var(--st-semantic-feedback-info);
    stroke-width: 1.5;
    stroke-dasharray: 4 3;
  }
  .st-areaChart__annotationShape {
    fill: color-mix(in srgb, var(--st-semantic-feedback-info) 14%, transparent);
    stroke: var(--st-semantic-feedback-info);
    stroke-width: 1.5;
  }
  .st-areaChart__annotationPoint {
    fill: var(--st-semantic-feedback-info);
    stroke: var(--st-semantic-surface-default);
    stroke-width: 1.5;
  }
  .st-areaChart__annotationLabel,
  .st-areaChart__annotationText {
    fill: var(--st-semantic-text-primary);
    font-size: 0.625rem;
    font-weight: 600;
  }

  /* Data labels — per-point value, drawn on top. Token-only colour. */
  .st-areaChart__dataLabel {
    fill: var(--st-semantic-text-primary);
    font-size: 0.6875rem;
    font-weight: 600;
  }

  /* --- Crosshair layer (FR-3) ----------------------------------------------
     A tokenised dashed vertical line at the active (hovered/controlled) key,
     plus an emphasised marker on the point. Decorative (aria-hidden). */
  .st-areaChart__crosshairLine {
    stroke: var(--st-semantic-border-strong);
    stroke-width: 1;
    stroke-dasharray: 3 3;
    opacity: 0.7;
  }
  .st-areaChart__crosshairMarker {
    fill: currentColor;
    stroke: var(--st-semantic-surface-default);
    stroke-width: 2;
  }
</style>
