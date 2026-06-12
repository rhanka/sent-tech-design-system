<script lang="ts" module>
  /**
   * CandlestickChart - OHLC (open/high/low/close), bougies vertes/rouges.
   * API canonique (référence Svelte, React/Vue doivent s'aligner)
   *
   * Props obligatoires :
   *   data   CandlestickChartDatum[]  - tableau {label, open, high, low, close}
   *   label  string
   *
   * Props optionnelles :
   *   width            number  (défaut 480)
   *   height           number  (défaut 240)
   *   annotations      ChartAnnotation[]  - overlay support/résistance/zones/events
   *   dataLabels       boolean | { format?, position? }  - étiquette close par bougie
   *   hoverKey         string | null  - crosshair contrôlé (clé = date/catégorie)
   *   onHoverKeyChange (key) => void   - émet la date survolée (ou null)
   *   keyboardNav      boolean         - navigation clavier (roving tabindex)
   *   onSelectKey      (key) => void   - sélection clavier (Enter/Space) ; null = Escape
   *   class            string
   */
  export type CandlestickChartDatum = {
    label: string;
    open: number;
    high: number;
    low: number;
    close: number;
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
  import { resolveActiveIndex } from "./chartCrosshair.js";
  import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from "./chartKeyboardNav.js";

  type CandlestickChartProps = {
    data: CandlestickChartDatum[];
    label: string;
    width?: number;
    height?: number;
    annotations?: ChartAnnotation[];
    dataLabels?: DataLabelsProp;
    hoverKey?: string | null;
    onHoverKeyChange?: (key: string | null) => void;
    keyboardNav?: boolean;
    onSelectKey?: (key: string | null) => void;
    class?: string;
  };

  let {
    data = [],
    label,
    width = 480,
    height = 240,
    annotations,
    dataLabels,
    hoverKey,
    onHoverKeyChange,
    keyboardNav,
    onSelectKey,
    class: className
  }: CandlestickChartProps = $props();

  const MARGIN = { top: 12, right: 16, bottom: 32, left: 52 };

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

  let hoveredIndex: number | null = $state(null);
  // FR-5 — roving keyboard focus over the data points (separate from hover).
  let focusedIndex: number = $state(-1);
  let datapointRefs: Array<SVGRectElement | null> = [];

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  // FIX #1 : filtrer les bougies invalides AVANT le domaine
  const validData = $derived(
    data.filter((d) =>
      Number.isFinite(d.open) &&
      Number.isFinite(d.high) &&
      Number.isFinite(d.low) &&
      Number.isFinite(d.close)
    )
  );

  const domainBounds = $derived.by(() => {
    const allVals: number[] = [];
    for (const d of validData) {
      // Domaine inclut open/high/low/close (pas seulement high/low)
      allVals.push(d.open, d.high, d.low, d.close);
    }
    if (allVals.length === 0) return { rawMin: 0, rawMax: 1 };
    const rawMin = Math.min(...allVals);
    const rawMax = Math.max(...allVals);
    // Domaine plat → fallback range 1 pour éviter division par 0
    return { rawMin, rawMax: rawMax === rawMin ? rawMin + 1 : rawMax };
  });

  const ticks = $derived(niceTicks(domainBounds.rawMin, domainBounds.rawMax, 5));
  const domainMin = $derived(ticks[0]);
  const domainMax = $derived(ticks[ticks.length - 1]);

  const candles = $derived.by(() => {
    if (validData.length === 0) return [];
    const band = plotWidth / validData.length;
    const bodyW = band * 0.55;

    return validData.map((d, i) => {
      // FIX #1 : clamp high/low pour garantir high≥max(O,C) et low≤min(O,C)
      const clampedHigh = Math.max(d.high, d.open, d.close);
      const clampedLow = Math.min(d.low, d.open, d.close);

      const bullish = d.close >= d.open;
      const centerX = MARGIN.left + band * i + band / 2;

      const bodyTop = MARGIN.top + scaleLinear(Math.max(d.open, d.close), domainMin, domainMax, plotHeight, 0);
      const bodyBot = MARGIN.top + scaleLinear(Math.min(d.open, d.close), domainMin, domainMax, plotHeight, 0);
      const highY = MARGIN.top + scaleLinear(clampedHigh, domainMin, domainMax, plotHeight, 0);
      const lowY = MARGIN.top + scaleLinear(clampedLow, domainMin, domainMax, plotHeight, 0);

      return {
        datum: d,
        index: i,
        bullish,
        centerX,
        band,
        bodyX: centerX - bodyW / 2,
        bodyY: bodyTop,
        bodyW,
        bodyH: Math.max(bodyBot - bodyTop, 0.5),
        wickHighY: highY,
        wickLowY: lowY,
        tooltipY: bodyTop
      };
    });
  });

  // --- Annotation overlay ---------------------------------------------------
  // The x coordinate is CATEGORICAL (a candle `label` → centre of band); the y
  // coordinate is a price-axis number. Regions render behind the candles, every
  // other kind above. The resolver maps each x via `xScale` (category → pixel)
  // and each y via `yScale` (price → pixel), relative to the plot origin.
  const priceY = $derived((v: number): number | null => {
    if (!Number.isFinite(v)) return null;
    return scaleLinear(v, domainMin, domainMax, plotHeight, 0);
  });
  const categoryPixel = $derived((v: number | string): number | null => {
    const candle = candles.find((c) => c.datum.label === String(v));
    if (!candle) return null;
    return candle.centerX - MARGIN.left;
  });
  const resolvedAnnotations = $derived(
    resolveAnnotations(annotations, {
      xScale: categoryPixel,
      yScale: priceY,
      plotLeft: MARGIN.left,
      plotTop: MARGIN.top,
      plotWidth,
      plotHeight
    })
  );
  const annotationRegions = $derived(resolvedAnnotations.filter((a) => a.kind === "region"));
  const annotationAbove = $derived(resolvedAnnotations.filter((a) => a.kind !== "region"));

  // --- Data labels ----------------------------------------------------------
  // One `close` value label per candle, placed just above it. aria-hidden.
  const dataLabelOpts = $derived(normalizeDataLabels(dataLabels));
  const dataLabelItems = $derived.by(() => {
    if (!dataLabelOpts.enabled) return [] as { key: string; x: number; y: number; text: string }[];
    return candles.map((candle) => ({
      key: candle.datum.label,
      x: candle.centerX,
      y: candle.wickHighY - 6,
      text: formatDataLabel(candle.datum.close, dataLabelOpts, formatTick)
    }));
  });

  const dataValueItems = $derived([
    ...validData.map((d) => `${d.label}: O ${d.open} H ${d.high} L ${d.low} C ${d.close}`),
    ...annotationDataListItems(annotations)
  ]);

  // Stable key per candle (FR-3): its `label`. Resolves a controlled `hoverKey`
  // to an index and feeds `onHoverKeyChange` from pointer events.
  const hoverKeys = $derived(candles.map((c) => c.datum.label));
  function emitHoverKey(index: number | null) {
    onHoverKeyChange?.(index == null ? null : hoverKeys[index] ?? null);
  }
  function handleLeave() {
    hoveredIndex = null;
    emitHoverKey(null);
  }
  function handlePointerMove(event: PointerEvent) {
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

  // --- Keyboard navigation (FR-5) ------------------------------------------
  // Active when wired explicitly (`keyboardNav`) or implicitly (`onSelectKey`).
  const navEnabled = $derived((keyboardNav === true || onSelectKey !== undefined) && candles.length > 0);
  function focusDatum(index: number) {
    focusedIndex = index;
    datapointRefs[index]?.focus();
    emitHoverKey(index);
  }
  function handleDatapointKeyDown(event: KeyboardEvent, index: number) {
    const action = datapointNavAction(event.key, index, candles.length);
    if (!action) return;
    event.preventDefault();
    if (action.kind === "move") {
      focusDatum(action.index);
    } else if (action.kind === "select") {
      onSelectKey?.(candles[index].datum.label);
    } else {
      focusedIndex = -1;
      emitHoverKey(null);
      onSelectKey?.(null);
      (event.currentTarget as SVGElement).blur();
    }
  }
  function ohlcAriaLabel(d: CandlestickChartDatum): string {
    return datapointAriaLabel(d.label, `O ${d.open} H ${d.high} L ${d.low} C ${d.close}`);
  }

  const classes = () => ["st-candlestickChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-candlestickChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handlePointerMove}
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
      <!-- gridlines + tick labels -->
      {#each ticks as tick (tick)}
        {@const ty = MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0)}
        <line class="st-candlestickChart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={ty} y2={ty} />
        <text class="st-candlestickChart__tickLabel" x={MARGIN.left - 6} y={ty} text-anchor="end" dominant-baseline="middle">
          {formatTick(tick)}
        </text>
      {/each}

      <!-- axes -->
      <line class="st-candlestickChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
      <line class="st-candlestickChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

      <!-- Annotation regions sit BEHIND the candles (filled bands). -->
      {#if annotationRegions.length > 0}
        <g class="st-candlestickChart__annotations st-candlestickChart__annotations--behind">
          {#each annotationRegions as a (a.key)}
            {#if a.kind === "region"}
              <rect class="st-candlestickChart__annotationRegion" x={a.x} y={a.y} width={a.width} height={a.height} />
              {#if a.label}
                <text class="st-candlestickChart__annotationLabel" x={a.x + 4} y={a.y + 11}>{a.label}</text>
              {/if}
            {/if}
          {/each}
        </g>
      {/if}

      <!-- FIX #7 : clé composite pour éviter les doublons -->
      {#each candles as c, i (`${i}-${c.datum.label}`)}
        <!-- wick -->
        <line
          class="st-candlestickChart__wick st-candlestickChart__wick--{c.bullish ? 'up' : 'down'}"
          x1={c.centerX}
          x2={c.centerX}
          y1={c.wickHighY}
          y2={c.wickLowY}
          data-chart-index={i}
        />
        <!-- body -->
        <rect
          class="st-candlestickChart__body st-candlestickChart__body--{c.bullish ? 'up' : 'down'}"
          class:st-candlestickChart__body--dim={hoveredIndex !== null && hoveredIndex !== i}
          x={c.bodyX}
          y={c.bodyY}
          width={c.bodyW}
          height={c.bodyH}
          rx="1"
          data-chart-index={i}
        />
        <!-- category label -->
        <text
          class="st-candlestickChart__categoryLabel"
          x={c.centerX}
          y={height - MARGIN.bottom + 16}
          text-anchor="middle"
        >
          {c.datum.label}
        </text>
      {/each}

      <!-- Annotations ABOVE the candles: lines, shapes, points, labels. -->
      {#if annotationAbove.length > 0}
        <g class="st-candlestickChart__annotations st-candlestickChart__annotations--above">
          {#each annotationAbove as a (a.key)}
            {#if a.kind === "line"}
              <line class="st-candlestickChart__annotationLine" x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} />
              {#if a.label}
                <text
                  class="st-candlestickChart__annotationLabel"
                  x={a.axis === "x" ? a.x1 + 4 : MARGIN.left + plotWidth - 4}
                  y={a.axis === "x" ? MARGIN.top + 11 : a.y1 - 4}
                  text-anchor={a.axis === "x" ? "start" : "end"}
                >{a.label}</text>
              {/if}
            {:else if a.kind === "shape"}
              <polygon class="st-candlestickChart__annotationShape" points={polygonPoints(a.points)} />
              {#if a.label}
                <text class="st-candlestickChart__annotationLabel" x={a.labelX} y={a.labelY} text-anchor="middle">{a.label}</text>
              {/if}
            {:else if a.kind === "point"}
              <circle class="st-candlestickChart__annotationPoint" cx={a.x} cy={a.y} r="4.5" />
              {#if a.label}
                <text class="st-candlestickChart__annotationLabel" x={a.x} y={a.y - 8} text-anchor="middle">{a.label}</text>
              {/if}
            {:else}
              <text class="st-candlestickChart__annotationText" x={a.x} y={a.y} text-anchor={a.anchor}>{a.text}</text>
            {/if}
          {/each}
        </g>
      {/if}

      <!-- Data labels — one close value per candle, drawn on top. aria-hidden. -->
      {#if dataLabelItems.length > 0}
        <g class="st-candlestickChart__dataLabels" aria-hidden="true">
          {#each dataLabelItems as d (d.key)}
            <text class="st-candlestickChart__dataLabel" x={d.x} y={d.y} text-anchor="middle" dominant-baseline="auto">{d.text}</text>
          {/each}
        </g>
      {/if}

      <!-- Crosshair (FR-3) — a tokenised dashed vertical line at the active candle.
           Decorative (aria-hidden); the value is in the tooltip + ChartDataList. -->
      {#if activeIndex >= 0 && candles[activeIndex]}
        {@const cc = candles[activeIndex]}
        <g class="st-candlestickChart__crosshair" aria-hidden="true">
          <line class="st-candlestickChart__crosshairLine" x1={cc.centerX} x2={cc.centerX} y1={MARGIN.top} y2={MARGIN.top + plotHeight} />
        </g>
      {/if}
    </svg>

    <!-- Keyboard navigation overlay (FR-5) — a focusable, transparent hit layer
         over the candles. NOT aria-hidden: it is the accessible roving cursor. -->
    {#if navEnabled}
      <svg
        class="st-candlestickChart__navLayer"
        viewBox="0 0 {width} {height}"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        role="group"
        aria-label={`${label} — points de données`}
      >
        {#each candles as candle, i (`${i}-${candle.datum.label}`)}
          <rect
            bind:this={datapointRefs[i]}
            class="st-candlestickChart__navDatum"
            x={candle.centerX - candle.band / 2}
            y={MARGIN.top}
            width={candle.band}
            height={plotHeight}
            role="img"
            tabindex={rovingTabIndex(i, focusedIndex, candles.length)}
            aria-label={ohlcAriaLabel(candle.datum)}
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

  {#if activeIndex >= 0 && candles[activeIndex]}
    {@const c = candles[activeIndex]}
    <div
      class="st-candlestickChart__tooltip"
      role="presentation"
      style="left: {(c.centerX / width) * 100}%; top: {(c.tooltipY / height) * 100}%"
    >
      <span class="st-candlestickChart__tooltipLabel">{c.datum.label}</span>
      <span class="st-candlestickChart__tooltipValue">O {c.datum.open} H {c.datum.high} L {c.datum.low} C {c.datum.close}</span>
    </div>
  {/if}
</div>

<style>
  .st-candlestickChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-candlestickChart svg {
    display: block;
    overflow: visible;
  }

  .st-candlestickChart__visual {
    display: block;
    position: relative;
  }

  .st-candlestickChart__axis {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-candlestickChart__grid {
    stroke: var(--st-semantic-border-subtle);
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-candlestickChart__wick {
    stroke-width: 1.5;
  }

  .st-candlestickChart__wick--up {
    stroke: var(--st-semantic-feedback-success);
  }

  .st-candlestickChart__wick--down {
    stroke: var(--st-semantic-feedback-error);
  }

  .st-candlestickChart__body {
    cursor: pointer;
    transition: opacity 120ms ease;
  }

  .st-candlestickChart__body--dim {
    opacity: 0.4;
  }

  .st-candlestickChart__body--up {
    fill: var(--st-semantic-feedback-success);
  }

  .st-candlestickChart__body--down {
    fill: var(--st-semantic-feedback-error);
  }

  /* --- Annotation layer ----------------------------------------------------
     Regions render BEHIND the candles; lines/shapes/points/labels render ABOVE. */
  .st-candlestickChart__annotationRegion {
    fill: color-mix(in srgb, var(--st-semantic-feedback-info) 12%, transparent);
    stroke: none;
  }
  .st-candlestickChart__annotationLine {
    stroke: var(--st-semantic-feedback-info);
    stroke-width: 1.5;
    stroke-dasharray: 4 3;
  }
  .st-candlestickChart__annotationShape {
    fill: color-mix(in srgb, var(--st-semantic-feedback-info) 14%, transparent);
    stroke: var(--st-semantic-feedback-info);
    stroke-width: 1.5;
  }
  .st-candlestickChart__annotationPoint {
    fill: var(--st-semantic-feedback-info);
    stroke: var(--st-semantic-surface-default);
    stroke-width: 1.5;
  }
  .st-candlestickChart__annotationLabel,
  .st-candlestickChart__annotationText {
    fill: var(--st-semantic-text-primary);
    font-size: 0.625rem;
    font-weight: 600;
  }

  /* Data labels — per-candle close value, drawn on top. Token-only colour. */
  .st-candlestickChart__dataLabel {
    fill: var(--st-semantic-text-primary);
    font-size: 0.6875rem;
    font-weight: 600;
  }

  /* Crosshair (FR-3) — a tokenised dashed vertical line at the active candle. */
  .st-candlestickChart__crosshairLine {
    stroke: var(--st-semantic-border-strong);
    stroke-width: 1;
    stroke-dasharray: 3 3;
    opacity: 0.7;
  }

  /* Keyboard navigation layer (FR-5) — a focusable, transparent overlay of one
     hit-rect per candle. Carries the roving tab stop; the focus ring is tokenised. */
  .st-candlestickChart__navLayer {
    inset: 0;
    position: absolute;
  }
  .st-candlestickChart__navDatum {
    fill: transparent;
    outline: none;
  }
  .st-candlestickChart__navDatum:focus-visible {
    fill: color-mix(in srgb, var(--st-semantic-border-interactive) 12%, transparent);
    outline: 2px solid var(--st-semantic-border-interactive);
    outline-offset: 1px;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-candlestickChart__body {
      transition: none;
    }
  }

  .st-candlestickChart__tickLabel,
  .st-candlestickChart__categoryLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
  }

  .st-candlestickChart__tooltip {
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

  .st-candlestickChart__tooltipLabel {
    font-weight: 600;
  }

  .st-candlestickChart__tooltipValue {
    opacity: 0.85;
  }
</style>
