<script lang="ts" module>
  export type ScatterPlotTone =
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  export type ScatterPlotDatum = {
    x: number;
    y: number;
    label?: string;
    tone?: ScatterPlotTone;
    /**
     * Per-datum radius, clamped to a sane maximum (32). Non-finite or
     * negative ⇒ falls back to the global `radius`.
     */
    r?: number;
  };

  /** Cluster centroid marker (ring + cross), drawn above the data points. */
  export type ScatterPlotCentroid = {
    x: number;
    y: number;
    tone?: ScatterPlotTone;
    label?: string;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";
  import {
    annotationDataListItems,
    polygonPoints,
    resolveAnnotations,
    type ChartAnnotation,
  } from "./chartAnnotations.js";
  import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";
  import { resolveActiveIndex } from "./chartCrosshair.js";
  import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from "./chartKeyboardNav.js";

  type ScatterPlotProps = {
    data: ScatterPlotDatum[];
    width?: number;
    height?: number;
    xLabel?: string;
    yLabel?: string;
    radius?: number;
    /**
     * Cluster centroid markers (ring + cross), drawn above the points. Their
     * coordinates are folded into the axis domain. Non-finite x/y are skipped.
     */
    centroids?: ScatterPlotCentroid[];
    /**
     * Annotation overlay in DATA space (points, labels, axis lines, regions,
     * polygons). Both axes are continuous (linear). Additive: absent ⇒ unchanged.
     */
    annotations?: ChartAnnotation[];
    /**
     * Per-point value labels. `false`/absent → none. `true` → each point's value
     * (the datum `label` wins when present). Object → `format`/`position`.
     * Default position `top`. Labels are `aria-hidden`.
     */
    dataLabels?: DataLabelsProp;
    /**
     * CONTROLLED synchronised hover key (FR-3). A point's key is its `label` when
     * present, otherwise `"x,y"`. Absent (`undefined`) keeps the uncontrolled
     * behaviour.
     */
    hoverKey?: string | null;
    /** Emitted on hover (the key) / leave (`null`); fired even while controlled. */
    onHoverKeyChange?: (key: string | null) => void;
    /** FR-5 — roving-tabindex keyboard navigation of the data points. */
    keyboardNav?: boolean;
    /** Emitted on Enter/Space select (the key) / Escape (`null`); enables nav. */
    onSelectKey?: (key: string | null) => void;
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
    centroids,
    annotations,
    dataLabels,
    hoverKey,
    onHoverKeyChange,
    keyboardNav,
    onSelectKey,
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
  // FR-5 — roving keyboard focus over the data points (separate from hover).
  let focusedIndex: number = $state(-1);
  let datapointRefs: Array<SVGRectElement | null> = [];

  const TONES = ["category1","category2","category3","category4","category5","category6","category7","category8"] as const;

  // Sane upper bound for a per-datum radius (keeps oversized bubbles inside
  // the plot); non-finite/negative values fall back to the global radius.
  const MAX_POINT_RADIUS = 32;

  /** Stable hover/selection key of a point: its label, else `"x,y"`. */
  function keyForPoint(d: ScatterPlotDatum): string {
    return d.label ?? `${d.x},${d.y}`;
  }

  // Centroids guarded once: non-finite coordinates are skipped entirely.
  const validCentroids = $derived(
    (centroids ?? []).filter((c) => Number.isFinite(c.x) && Number.isFinite(c.y))
  );

  const scales = $derived.by(() => {
    // Centroid coordinates are folded into the domain so markers always sit
    // inside the plot (and a centroids-only chart still gets a real scale).
    const xs = [...data.map((d) => d.x), ...validCentroids.map((c) => c.x)].filter(Number.isFinite);
    const ys = [...data.map((d) => d.y), ...validCentroids.map((c) => c.y)].filter(Number.isFinite);
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
      r: typeof d.r === "number" && Number.isFinite(d.r) && d.r >= 0 ? Math.min(d.r, MAX_POINT_RADIUS) : radius,
      datum: d,
      index: i,
      tone: d.tone ?? TONES[i % TONES.length]
    }));
  });

  const centroidMarks = $derived.by(() => {
    const { xMin, xMax, yMin, yMax, plotW, plotH } = scales;
    return validCentroids.map((c, i) => ({
      cx: MARGIN.left + scaleLinear(c.x, xMin, xMax, 0, plotW),
      cy: MARGIN.top + scaleLinear(c.y, yMin, yMax, plotH, 0),
      tone: c.tone ?? TONES[i % TONES.length],
      label: c.label
    }));
  });

  // --- Annotation overlay ----------------------------------------------------
  // Both axes continuous: linear `xScale`/`yScale`, out-of-domain ⇒ null.
  const annotationXScale = $derived((v: number | string): number | null => {
    const { xMin, xMax, plotW } = scales;
    if (typeof v !== "number" || !Number.isFinite(v)) return null;
    if (v < xMin || v > xMax) return null;
    return scaleLinear(v, xMin, xMax, 0, plotW);
  });
  const annotationYScale = $derived((v: number): number | null => {
    const { yMin, yMax, plotH } = scales;
    if (!Number.isFinite(v)) return null;
    if (v < yMin || v > yMax) return null;
    return scaleLinear(v, yMin, yMax, plotH, 0);
  });
  const resolvedAnnotations = $derived(
    resolveAnnotations(annotations, {
      xScale: annotationXScale,
      yScale: annotationYScale,
      plotLeft: MARGIN.left,
      plotTop: MARGIN.top,
      plotWidth: scales.plotW,
      plotHeight: scales.plotH
    })
  );
  const annotationRegions = $derived(resolvedAnnotations.filter((a) => a.kind === "region"));
  const annotationAbove = $derived(resolvedAnnotations.filter((a) => a.kind !== "region"));

  // --- Data labels -----------------------------------------------------------
  // One label per point. Default `top`. The datum `label` wins; else the y.
  const dataLabelOpts = $derived(normalizeDataLabels(dataLabels));
  const dataLabelItems = $derived(
    dataLabelOpts.enabled
      ? points.map((p) => {
          const text = p.datum.label ?? formatDataLabel(p.datum.y, dataLabelOpts, fmt);
          const center = dataLabelOpts.position === "center" || dataLabelOpts.position === "inside";
          return {
            key: p.index,
            x: p.cx,
            y: center ? p.cy : p.cy - (p.r + 5),
            text,
            baseline: (center ? "middle" : "auto") as "middle" | "auto"
          };
        })
      : []
  );

  const dataValueItems = $derived([
    ...data.map((d) => (d.label ? `${d.label}: x ${d.x}, y ${d.y}` : `x ${d.x}, y ${d.y}`)),
    ...validCentroids.map((c) =>
      c.label ? `Centroïde ${c.label}: (${c.x}, ${c.y})` : `Centroïde: (${c.x}, ${c.y})`
    ),
    ...annotationDataListItems(annotations)
  ]);

  // Stable key per point (FR-3): `label` else `"x,y"`.
  const hoverKeys = $derived(data.map((d) => keyForPoint(d)));
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

  // --- Keyboard navigation (FR-5) --------------------------------------------
  // Active when wired explicitly (`keyboardNav`) or implicitly (`onSelectKey`).
  const navEnabled = $derived((keyboardNav === true || onSelectKey !== undefined) && points.length > 0);
  // Comfortable square hit area centred on each dot.
  const NAV_HIT = 18;
  function focusDatum(index: number) {
    focusedIndex = index;
    datapointRefs[index]?.focus();
    emitHoverKey(index);
  }
  function handleDatapointKeyDown(event: KeyboardEvent, index: number) {
    const action = datapointNavAction(event.key, index, points.length);
    if (!action) return;
    event.preventDefault();
    if (action.kind === "move") {
      focusDatum(action.index);
    } else if (action.kind === "select") {
      onSelectKey?.(hoverKeys[index] ?? null);
    } else {
      focusedIndex = -1;
      emitHoverKey(null);
      onSelectKey?.(null);
      (event.currentTarget as SVGElement).blur();
    }
  }

  const classes = () => ["st-scatterPlot", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-scatterPlot__visual"
    role="img"
    aria-label={label}
    onpointermove={handleVisualPointerMove}
    onpointerleave={handleLeave}
  >
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

      <!-- Annotation regions sit BEHIND the points (filled bands). -->
      {#if annotationRegions.length > 0}
        <g class="st-scatterPlot__annotations st-scatterPlot__annotations--behind">
          {#each annotationRegions as a (a.key)}
            {#if a.kind === "region"}
              <rect class="st-scatterPlot__annotationRegion" x={a.x} y={a.y} width={a.width} height={a.height} />
              {#if a.label}
                <text class="st-scatterPlot__annotationLabel" x={a.x + 4} y={a.y + 11}>{a.label}</text>
              {/if}
            {/if}
          {/each}
        </g>
      {/if}

      <!-- points -->
      {#each points as p, i (i)}
        <circle
          class="st-scatterPlot__point st-scatterPlot__point--{p.tone}"
          cx={p.cx}
          cy={p.cy}
          r={p.r}
          data-chart-index={i}
        />
      {/each}

      <!-- cluster centroids — distinct ring + cross markers, above the points -->
      {#each centroidMarks as c, i (i)}
        <g class="st-scatterPlot__centroid st-scatterPlot__centroid--{c.tone}">
          <circle class="st-scatterPlot__centroidRing" cx={c.cx} cy={c.cy} r="7" />
          <line class="st-scatterPlot__centroidCross" x1={c.cx - 3.5} x2={c.cx + 3.5} y1={c.cy} y2={c.cy} />
          <line class="st-scatterPlot__centroidCross" x1={c.cx} x2={c.cx} y1={c.cy - 3.5} y2={c.cy + 3.5} />
        </g>
      {/each}

      <!-- Annotations ABOVE the points: lines, shapes, points, labels. -->
      {#if annotationAbove.length > 0}
        <g class="st-scatterPlot__annotations st-scatterPlot__annotations--above">
          {#each annotationAbove as a (a.key)}
            {#if a.kind === "line"}
              <line class="st-scatterPlot__annotationLine" x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} />
              {#if a.label}
                <text
                  class="st-scatterPlot__annotationLabel"
                  x={a.axis === "x" ? a.x1 + 4 : MARGIN.left + scales.plotW - 4}
                  y={a.axis === "x" ? MARGIN.top + 11 : a.y1 - 4}
                  text-anchor={a.axis === "x" ? "start" : "end"}
                >{a.label}</text>
              {/if}
            {:else if a.kind === "shape"}
              <polygon class="st-scatterPlot__annotationShape" points={polygonPoints(a.points)} />
              {#if a.label}
                <text class="st-scatterPlot__annotationLabel" x={a.labelX} y={a.labelY} text-anchor="middle">{a.label}</text>
              {/if}
            {:else if a.kind === "point"}
              <circle class="st-scatterPlot__annotationPoint" cx={a.x} cy={a.y} r="4.5" />
              {#if a.label}
                <text class="st-scatterPlot__annotationLabel" x={a.x} y={a.y - 8} text-anchor="middle">{a.label}</text>
              {/if}
            {:else if a.kind === "label"}
              <text class="st-scatterPlot__annotationText" x={a.x} y={a.y} text-anchor={a.anchor}>{a.text}</text>
            {/if}
          {/each}
        </g>
      {/if}

      <!-- Data labels — one value/label per point, drawn on top. aria-hidden. -->
      {#if dataLabelItems.length > 0}
        <g class="st-scatterPlot__dataLabels" aria-hidden="true">
          {#each dataLabelItems as d (d.key)}
            <text class="st-scatterPlot__dataLabel" x={d.x} y={d.y} text-anchor="middle" dominant-baseline={d.baseline}>{d.text}</text>
          {/each}
        </g>
      {/if}

      <!-- Crosshair (FR-3) — a tokenised CROSSED pair (vertical + horizontal) at
           the active key, plus a marker on the point. Decorative (aria-hidden). -->
      {#if activeIndex >= 0 && points[activeIndex]}
        {@const cp = points[activeIndex]}
        <g class="st-scatterPlot__crosshair" aria-hidden="true">
          <line class="st-scatterPlot__crosshairLine" x1={cp.cx} x2={cp.cx} y1={MARGIN.top} y2={MARGIN.top + scales.plotH} />
          <line class="st-scatterPlot__crosshairLine" x1={MARGIN.left} x2={MARGIN.left + scales.plotW} y1={cp.cy} y2={cp.cy} />
          <circle class="st-scatterPlot__crosshairMarker" cx={cp.cx} cy={cp.cy} r="5" />
        </g>
      {/if}
    </svg>

    <!-- Keyboard navigation overlay (FR-5) — a focusable, transparent hit layer
         over the points. NOT aria-hidden: it is the accessible roving cursor.
         Each rect announces its key + value; the focus ring is tokenised via
         CSS. Absent unless keyboard nav is enabled. -->
    {#if navEnabled}
      <svg
        class="st-scatterPlot__navLayer"
        viewBox="0 0 {width} {height}"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        role="group"
        aria-label={`${label} — points de données`}
      >
        {#each points as p, i (p.index)}
          <rect
            bind:this={datapointRefs[i]}
            class="st-scatterPlot__navDatum"
            x={p.cx - NAV_HIT / 2}
            y={p.cy - NAV_HIT / 2}
            width={NAV_HIT}
            height={NAV_HIT}
            rx="3"
            role="img"
            tabindex={rovingTabIndex(i, focusedIndex, points.length)}
            aria-label={datapointAriaLabel(p.datum.label ?? `${p.datum.x}, ${p.datum.y}`, p.datum.y)}
            onkeydown={(event) => handleDatapointKeyDown(event, i)}
            onfocus={() => {
              focusedIndex = i;
              emitHoverKey(i);
            }}
          />
        {/each}
      </svg>
    {/if}
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if activeIndex >= 0 && points[activeIndex]}
    {@const p = points[activeIndex]}
    <div class="st-scatterPlot__tooltip" role="presentation" style="left: {(p.cx / width) * 100}%; top: {(p.cy / height) * 100}%">
      {#if p.datum.label}<span class="st-scatterPlot__tooltipLabel">{p.datum.label}</span>{/if}
      <span class="st-scatterPlot__tooltipValue">x {p.datum.x} · y {p.datum.y}</span>
    </div>
  {/if}
</div>

<style>
  .st-scatterPlot { color: var(--st-semantic-text-secondary); display: block; font-family: inherit; position: relative; width: 100%; }
  .st-scatterPlot svg, .st-scatterPlot__visual { display: block; overflow: visible; }
  .st-scatterPlot__grid { stroke: var(--st-semantic-border-subtle); stroke-dasharray: 2 3; stroke-width: 1; opacity: 0.7; }
  .st-scatterPlot__axis { stroke: var(--st-semantic-border-subtle); stroke-width: 1; }
  .st-scatterPlot__tick { fill: var(--st-semantic-text-secondary); font-size: 0.6875rem; }
  .st-scatterPlot__axisLabel { fill: var(--st-semantic-text-secondary); font-size: 0.75rem; font-weight: 600; }
  .st-scatterPlot__point { cursor: pointer; fill-opacity: 0.85; transition: fill-opacity 120ms ease, r 120ms ease; }
  .st-scatterPlot__point:hover { fill-opacity: 1; }
  .st-scatterPlot__point--category1 { fill: var(--st-semantic-data-category1); }
  .st-scatterPlot__point--category2 { fill: var(--st-semantic-data-category2); }
  .st-scatterPlot__point--category3 { fill: var(--st-semantic-data-category3); }
  .st-scatterPlot__point--category4 { fill: var(--st-semantic-data-category4); }
  .st-scatterPlot__point--category5 { fill: var(--st-semantic-data-category5); }
  .st-scatterPlot__point--category6 { fill: var(--st-semantic-data-category6); }
  .st-scatterPlot__point--category7 { fill: var(--st-semantic-data-category7); }
  .st-scatterPlot__point--category8 { fill: var(--st-semantic-data-category8); }
  /* Centroid markers — non-interactive ring + cross, toned via currentColor. */
  .st-scatterPlot__centroid { pointer-events: none; }
  .st-scatterPlot__centroidRing { fill: none; stroke: currentColor; stroke-width: 2; }
  .st-scatterPlot__centroidCross { stroke: currentColor; stroke-width: 2; stroke-linecap: round; }
  .st-scatterPlot__centroid--category1 { color: var(--st-semantic-data-category1); }
  .st-scatterPlot__centroid--category2 { color: var(--st-semantic-data-category2); }
  .st-scatterPlot__centroid--category3 { color: var(--st-semantic-data-category3); }
  .st-scatterPlot__centroid--category4 { color: var(--st-semantic-data-category4); }
  .st-scatterPlot__centroid--category5 { color: var(--st-semantic-data-category5); }
  .st-scatterPlot__centroid--category6 { color: var(--st-semantic-data-category6); }
  .st-scatterPlot__centroid--category7 { color: var(--st-semantic-data-category7); }
  .st-scatterPlot__centroid--category8 { color: var(--st-semantic-data-category8); }
  /* --- Annotation layer ----------------------------------------------------
     Regions render BEHIND the points (color-mix tint, never raw opacity so the
     data keeps contrast); lines/shapes/points/labels render ABOVE. */
  .st-scatterPlot__annotationRegion { fill: color-mix(in srgb, var(--st-semantic-feedback-info) 12%, transparent); stroke: none; }
  .st-scatterPlot__annotationLine { stroke: var(--st-semantic-feedback-info); stroke-width: 1.5; stroke-dasharray: 4 3; }
  .st-scatterPlot__annotationShape { fill: color-mix(in srgb, var(--st-semantic-feedback-info) 14%, transparent); stroke: var(--st-semantic-feedback-info); stroke-width: 1.5; }
  .st-scatterPlot__annotationPoint { fill: var(--st-semantic-feedback-info); stroke: var(--st-semantic-surface-default); stroke-width: 1.5; }
  .st-scatterPlot__annotationLabel, .st-scatterPlot__annotationText { fill: var(--st-semantic-text-primary); font-size: 0.625rem; font-weight: 600; }
  /* Data labels — per-point value/label, drawn on top. Token-only colour. */
  .st-scatterPlot__dataLabel { fill: var(--st-semantic-text-primary); font-size: 0.6875rem; font-weight: 600; }
  /* --- Crosshair layer (FR-3) — tokenised CROSSED pair + marker. -------------- */
  .st-scatterPlot__crosshairLine { stroke: var(--st-semantic-border-strong); stroke-width: 1; stroke-dasharray: 3 3; opacity: 0.7; }
  .st-scatterPlot__crosshairMarker { fill: currentColor; stroke: var(--st-semantic-surface-default); stroke-width: 2; }
  /* --- Keyboard navigation layer (FR-5) — focusable transparent hit-rects. ---- */
  .st-scatterPlot__navLayer { inset: 0; position: absolute; }
  .st-scatterPlot__navDatum { fill: transparent; outline: none; }
  .st-scatterPlot__navDatum:focus-visible { fill: color-mix(in srgb, var(--st-semantic-border-interactive) 12%, transparent); outline: 2px solid var(--st-semantic-border-interactive); outline-offset: 1px; }
  @media (prefers-reduced-motion: reduce) {
    .st-scatterPlot__point { transition: none; }
  }
  .st-scatterPlot__tooltip {
    background: var(--st-semantic-surface-inverse); border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-semantic-text-inverse); display: inline-flex; flex-direction: column;
    font-size: 0.75rem; gap: 0.125rem; line-height: 1.2; padding: 0.375rem 0.5rem;
    pointer-events: none; position: absolute; transform: translate(-50%, calc(-100% - 8px)); white-space: nowrap; z-index: 1;
  }
  .st-scatterPlot__tooltipLabel { font-weight: 600; }
  .st-scatterPlot__tooltipValue { opacity: 0.85; }
</style>
