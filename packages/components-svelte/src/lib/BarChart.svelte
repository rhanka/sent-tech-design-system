<script lang="ts" module>
  export type BarChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type BarChartDatum = {
    label: string;
    value: number;
    tone?: BarChartTone;
    /** Lower error-bar extent (value-axis units). Drawn only when finite. */
    errorLow?: number;
    /** Upper error-bar extent (value-axis units). Drawn only when finite. */
    errorHigh?: number;
  };

  /**
   * Semantic tone for an analytical overlay (reference line / band / goal).
   * Maps to the feedback token family — markers, not categorical series.
   */
  export type ChartOverlayTone = "neutral" | "success" | "warning" | "error" | "info";

  export type ChartReferenceLine = {
    value: number;
    label?: string;
    tone?: ChartOverlayTone;
    axis?: "x" | "y";
  };

  export type ChartBand = {
    from: number;
    to: number;
    label?: string;
    tone?: ChartOverlayTone;
  };

  export type ChartGoalLine = {
    value: number;
    label?: string;
  };

  /** Value-axis scale type. `log` requires strictly positive values. */
  export type ChartScale = "linear" | "log";
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type BarChartProps = {
    data: BarChartDatum[];
    width?: number;
    height?: number;
    orientation?: "vertical" | "horizontal";
    label: string;
    /**
     * Fixed value-axis domain `[min, max]`. When provided (and finite), the
     * value scale uses it instead of the data-derived min/max — letting several
     * BarCharts in a grid share one scale (small multiples). When absent or
     * invalid, the scale falls back to the auto data range (unchanged).
     */
    domain?: [number, number];
    /**
     * Keys of the currently selected bars (a bar's key is its `label`).
     * CONTROLLED — the parent owns the toggle; the component never stores
     * selection. When non-empty the selected bars stay full opacity (+ accent)
     * and the rest dim; when empty every bar is normal. Defaults to [].
     */
    selectedKeys?: string[];
    /**
     * Called with the bar's key (its `label`) when the user selects it. When
     * provided, an ACCESSIBLE row of filter chips (real <button>s) is rendered
     * OUTSIDE the aria-hidden SVG — that is the keyboard + screen-reader surface.
     * The SVG bars themselves stay decorative (aria-hidden) and only offer a
     * mouse click shortcut for sighted pointer users. When omitted the chart is
     * purely presentational (no interactivity, unchanged).
     */
    onSelect?: (key: string) => void;
    /** Reference lines on the value axis (default `axis: "y"`). */
    referenceLines?: ChartReferenceLine[];
    /** Shaded value-axis bands between `from`..`to`. */
    bands?: ChartBand[];
    /** A single goal line, emphasised above the bars. */
    goalLine?: ChartGoalLine;
    /**
     * Value-axis scale. `"linear"` (default) is unchanged. `"log"` switches the
     * value axis to a base-10 logarithmic scale — values `<= 0` are ignored for
     * domain/ticks and clamped to the lowest tick when positioned, since the log
     * of a non-positive number is undefined.
     */
    scale?: ChartScale;
    /** Inverts the value axis (high values toward the origin). Default false. */
    invertAxis?: boolean;
    /**
     * Toggles the legend if the chart has one. BarChart has no separate legend
     * surface (its filter chips double as one), so this prop is accepted for
     * cross-chart parity and otherwise ignored.
     */
    showLegend?: boolean;
    class?: string;
  };

  let {
    data,
    width = 480,
    height = 240,
    orientation = "vertical",
    label,
    domain,
    selectedKeys = [],
    onSelect,
    referenceLines,
    bands,
    goalLine,
    scale = "linear",
    invertAxis = false,
    showLegend,
    class: className
  }: BarChartProps = $props();

  // `showLegend` has no dedicated legend surface on BarChart (the filter chips
  // double as one); it is part of the contract for cross-chart parity and is a
  // deliberate no-op here. Intentionally destructured-but-unused.

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

  const uniqueSortedTicks = (values: number[]) =>
    Array.from(new Set(values.filter(Number.isFinite).map((v) => Number(v.toFixed(10))))).sort((a, b) => a - b);

  function fixedTicks(min: number, max: number, target = 5): number[] {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) return niceTicks(min, max, target);
    return uniqueSortedTicks([min, ...niceTicks(min, max, target).filter((tick) => tick > min && tick < max), max]);
  }

  // Lowest strictly-positive value across the data + finite overlays; used as a
  // floor for a log domain when the raw min is <= 0.
  function smallestPositive(...vals: number[]): number {
    let lo = Infinity;
    for (const v of vals) if (Number.isFinite(v) && v > 0 && v < lo) lo = v;
    return Number.isFinite(lo) ? lo : 1;
  }

  // "Nice" decade ticks for a log axis: powers of ten spanning [min, max].
  function logTicks(min: number, max: number): number[] {
    const lo = min > 0 ? min : 1;
    const hi = max > lo ? max : lo * 10;
    const startExp = Math.floor(Math.log10(lo));
    const endExp = Math.ceil(Math.log10(hi));
    const ticks: number[] = [];
    for (let e = startExp; e <= endExp; e++) ticks.push(Number(Math.pow(10, e).toFixed(10)));
    return ticks.length ? ticks : [lo];
  }

  function fixedLogTicks(min: number, max: number): number[] {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || min >= max) return logTicks(min, max);
    return uniqueSortedTicks([min, ...logTicks(min, max).filter((tick) => tick > min && tick < max), max]);
  }

  function validLinearDomainCandidate(value: [number, number] | undefined): [number, number] | null {
    return value && Number.isFinite(value[0]) && Number.isFinite(value[1]) && value[0] < value[1] ? value : null;
  }

  function validLogDomainCandidate(value: [number, number] | undefined): [number, number] | null {
    return value && Number.isFinite(value[0]) && Number.isFinite(value[1]) && value[0] > 0 && value[0] < value[1]
      ? value
      : null;
  }

  function clampFraction(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.min(1, Math.max(0, value));
  }

  function formatTick(v: number): string {
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(1);
  }

  // --- Analytical overlay helpers (inline; parity with chartScale) ----------
  function overlayToneClass(prefix: string, t: ChartOverlayTone | undefined): string {
    return `${prefix}--${t ?? "neutral"}`;
  }

  function extendValueDomain(
    minV: number,
    maxV: number,
    refs: ChartReferenceLine[] | undefined,
    bnds: ChartBand[] | undefined,
    goal: ChartGoalLine | null,
    extras: number[],
    referenceAxis: "x" | "y" = "y"
  ): [number, number] {
    let lo = minV;
    let hi = maxV;
    const fold = (v: number | undefined) => {
      if (v === undefined || !Number.isFinite(v)) return;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    };
    for (const r of refs ?? []) if ((r.axis ?? "y") === referenceAxis) fold(r.value);
    for (const b of bnds ?? []) {
      fold(b.from);
      fold(b.to);
    }
    if (goal) fold(goal.value);
    for (const v of extras) fold(v);
    return [lo, hi];
  }

  function overlayDataListItems(
    refs: ChartReferenceLine[] | undefined,
    bnds: ChartBand[] | undefined,
    goal: ChartGoalLine | null
  ): string[] {
    const items: string[] = [];
    for (const r of refs ?? []) {
      if (!Number.isFinite(r.value)) continue;
      items.push(r.label ? `Référence: ${r.label} = ${r.value}` : `Référence: ${r.value}`);
    }
    for (const b of bnds ?? []) {
      if (!Number.isFinite(b.from) || !Number.isFinite(b.to)) continue;
      const lo = Math.min(b.from, b.to);
      const hi = Math.max(b.from, b.to);
      items.push(b.label ? `Bande: ${b.label} (${lo}–${hi})` : `Bande: ${lo}–${hi}`);
    }
    if (goal && Number.isFinite(goal.value)) {
      items.push(goal.label ? `Objectif: ${goal.label} = ${goal.value}` : `Objectif: ${goal.value}`);
    }
    return items;
  }

  let hoveredIndex: number | null = $state(null);

  // Selection (controlled): fast lookup + "is any bar selected" flag. Only when
  // something is selected do we dim the non-selected bars.
  const selectedSet = $derived(new Set<string>(selectedKeys));
  const hasSelection = $derived(selectedSet.size > 0);
  const interactive = $derived(typeof onSelect === "function");

  const isLog = $derived(scale === "log");

  // A domain is honoured only when both bounds are finite and ordered (min<max).
  // Otherwise we fall back to the auto data range.
  const validDomain = $derived.by<[number, number] | null>(() => {
    return isLog ? validLogDomainCandidate(domain) : validLinearDomainCandidate(domain);
  });

  // A finite goal value is required; otherwise the goal line is ignored.
  const goal = $derived(goalLine && Number.isFinite(goalLine.value) ? goalLine : null);

  const valueAxis = $derived(orientation === "vertical" ? "y" : "x");

  const scales = $derived.by(() => {
    const values = data.map((d) => d.value);
    const errorExtents = data.flatMap((d) =>
      [d.errorLow, d.errorHigh].filter((v): v is number => v !== undefined && Number.isFinite(v))
    );
    let minRaw: number;
    let maxRaw: number;
    if (isLog) {
      // A log axis is undefined for values <= 0; the floor is the smallest
      // strictly-positive value across the data + finite overlays, the ceil the
      // largest. The "0 baseline" of a linear axis has no meaning here.
      const posOverlays = [
        ...(referenceLines ?? []).filter((r) => (r.axis ?? "y") === valueAxis).map((r) => r.value),
        ...(bands ?? []).flatMap((b) => [b.from, b.to]),
        ...(goal ? [goal.value] : []),
        ...errorExtents
      ];
      if (validDomain) {
        minRaw = validDomain[0];
        maxRaw = validDomain[1];
      } else {
        minRaw = smallestPositive(...values, ...posOverlays);
        maxRaw = Math.max(minRaw, ...values.filter((v) => v > 0), ...posOverlays.filter((v) => v > 0));
      }
      const ticks = validDomain ? fixedLogTicks(minRaw, maxRaw) : logTicks(minRaw, maxRaw);
      const domainMin = ticks[0];
      const domainMax = ticks[ticks.length - 1];
      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
      return { ticks, domainMin, domainMax, plotWidth, plotHeight };
    }
    minRaw = validDomain ? validDomain[0] : Math.min(0, ...values);
    maxRaw = validDomain ? validDomain[1] : Math.max(0, ...values);
    // A pinned domain is authoritative (small-multiples); only the auto domain
    // is widened to keep finite overlays + error bars on-plot.
    if (!validDomain) {
      [minRaw, maxRaw] = extendValueDomain(minRaw, maxRaw, referenceLines, bands, goal, errorExtents, valueAxis);
    }
    const ticks = validDomain ? fixedTicks(minRaw, maxRaw, 5) : niceTicks(minRaw, maxRaw, 5);
    const domainMin = ticks[0];
    const domainMax = ticks[ticks.length - 1];
    const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
    const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
    return { ticks, domainMin, domainMax, plotWidth, plotHeight };
  });

  // Maps a value to a fraction in [0,1] along the value axis (0 = domainMin end,
  // 1 = domainMax end), honouring log scale and axis inversion. Linear + no
  // invert reproduces the previous behaviour exactly.
  const valueFraction = $derived((v: number) => {
    const { domainMin, domainMax } = scales;
    let f: number;
    if (isLog) {
      const lo = Math.log10(domainMin);
      const hi = Math.log10(domainMax);
      const clamped = v > 0 ? v : domainMin; // log undefined for v<=0 → clamp to floor
      f = hi === lo ? 0 : (Math.log10(clamped) - lo) / (hi - lo);
    } else {
      f = domainMax === domainMin ? 0 : (v - domainMin) / (domainMax - domainMin);
    }
    return clampFraction(invertAxis ? 1 - f : f);
  });

  // The value used as the bar baseline. Linear: 0 (or the nearest in-domain
  // bound). Log: the lowest tick (domainMin), since 0 is off a log axis.
  const baselineValue = $derived(isLog ? scales.domainMin : Math.min(scales.domainMax, Math.max(scales.domainMin, 0)));

  const bars = $derived.by(() => {
    const { plotWidth, plotHeight } = scales;
    if (data.length === 0) return [];
    if (orientation === "vertical") {
      const band = plotWidth / data.length;
      const barWidth = band * 0.62;
      // Pixel y for a value (fraction 0 → bottom, 1 → top of the plot).
      const yOf = (v: number) => plotHeight * (1 - valueFraction(v));
      const zeroY = yOf(baselineValue);
      return data.map((d, i) => {
        const valueY = yOf(d.value);
        const y = Math.min(valueY, zeroY);
        const h = Math.abs(zeroY - valueY);
        const x = MARGIN.left + band * i + (band - barWidth) / 2;
        return {
          x,
          y: MARGIN.top + y,
          width: barWidth,
          height: Math.max(h, 0.5),
          cx: MARGIN.left + band * (i + 0.5),
          cy: MARGIN.top + valueY,
          datum: d,
          tone: d.tone ?? "category1"
        };
      });
    }
    // horizontal
    const band = plotHeight / data.length;
    const barHeight = band * 0.62;
    // Pixel x for a value (fraction 0 → left, 1 → right of the plot).
    const xOf = (v: number) => plotWidth * valueFraction(v);
    const zeroX = xOf(baselineValue);
    return data.map((d, i) => {
      const valueX = xOf(d.value);
      const x = Math.min(valueX, zeroX);
      const w = Math.abs(valueX - zeroX);
      const y = MARGIN.top + band * i + (band - barHeight) / 2;
      return {
        x: MARGIN.left + x,
        y,
        width: Math.max(w, 0.5),
        height: barHeight,
        cx: MARGIN.left + valueX,
        cy: MARGIN.top + band * (i + 0.5),
        datum: d,
        tone: d.tone ?? "category1"
      };
    });
  });

  // --- Analytical overlays + error bars ------------------------------------
  const isVertical = $derived(orientation === "vertical");
  // Map a value to its pixel on the value axis (y for vertical, x for horizontal),
  // honouring scale + invert via the shared `valueFraction`.
  const valuePos = $derived((v: number) => {
    const { plotWidth, plotHeight } = scales;
    return isVertical
      ? MARGIN.top + plotHeight * (1 - valueFraction(v))
      : MARGIN.left + plotWidth * valueFraction(v);
  });

  const bandRects = $derived(
    (bands ?? [])
      .filter((b) => Number.isFinite(b.from) && Number.isFinite(b.to))
      .map((b, i) => {
        const p1 = valuePos(b.from);
        const p2 = valuePos(b.to);
        return isVertical
          ? { key: i, x: MARGIN.left, y: Math.min(p1, p2), width: scales.plotWidth, height: Math.max(Math.abs(p2 - p1), 0.5), label: b.label, tone: b.tone }
          : { key: i, x: Math.min(p1, p2), y: MARGIN.top, width: Math.max(Math.abs(p2 - p1), 0.5), height: scales.plotHeight, label: b.label, tone: b.tone };
      })
  );

  const refLines = $derived(
    (referenceLines ?? [])
      .filter((r) => Number.isFinite(r.value))
      .map((r, i) => {
        const p = valuePos(r.value);
        return isVertical
          ? { key: i, x1: MARGIN.left, x2: MARGIN.left + scales.plotWidth, y1: p, y2: p, label: r.label, tone: r.tone }
          : { key: i, x1: p, x2: p, y1: MARGIN.top, y2: MARGIN.top + scales.plotHeight, label: r.label, tone: r.tone };
      })
  );

  const goalGeom = $derived(goal ? { p: valuePos(goal.value), label: goal.label, value: goal.value } : null);

  const errorBarGeom = $derived.by(() => {
    const out: {
      key: string;
      stem: { x1: number; y1: number; x2: number; y2: number };
      capLow: { x1: number; y1: number; x2: number; y2: number };
      capHigh: { x1: number; y1: number; x2: number; y2: number };
    }[] = [];
    for (const bar of bars) {
      const { errorLow, errorHigh } = bar.datum;
      const hasLow = errorLow !== undefined && Number.isFinite(errorLow);
      const hasHigh = errorHigh !== undefined && Number.isFinite(errorHigh);
      if (!hasLow && !hasHigh) continue;
      const lowV = hasLow ? (errorLow as number) : bar.datum.value;
      const highV = hasHigh ? (errorHigh as number) : bar.datum.value;
      const lowP = valuePos(lowV);
      const highP = valuePos(highV);
      const cap = 4;
      if (isVertical) {
        const cx = bar.x + bar.width / 2;
        out.push({
          key: bar.datum.label,
          stem: { x1: cx, y1: lowP, x2: cx, y2: highP },
          capLow: { x1: cx - cap, y1: lowP, x2: cx + cap, y2: lowP },
          capHigh: { x1: cx - cap, y1: highP, x2: cx + cap, y2: highP }
        });
      } else {
        const cy = bar.y + bar.height / 2;
        out.push({
          key: bar.datum.label,
          stem: { x1: lowP, y1: cy, x2: highP, y2: cy },
          capLow: { x1: lowP, y1: cy - cap, x2: lowP, y2: cy + cap },
          capHigh: { x1: highP, y1: cy - cap, x2: highP, y2: cy + cap }
        });
      }
    }
    return out;
  });

  const dataValueItems = $derived([
    ...data.map((d) => `${d.label}: ${d.value}`),
    ...overlayDataListItems(referenceLines, bands, goal)
  ]);

  const valueAxisTicks = $derived.by(() => {
    const { ticks, plotWidth, plotHeight } = scales;
    if (orientation === "vertical") {
      return ticks.map((tick) => ({
        value: tick,
        x1: MARGIN.left,
        x2: MARGIN.left + plotWidth,
        y: MARGIN.top + plotHeight * (1 - valueFraction(tick)),
        x: undefined,
        y1: undefined,
        y2: undefined
      }));
    }
    return ticks.map((tick) => ({
      value: tick,
      x: MARGIN.left + plotWidth * valueFraction(tick),
      y1: MARGIN.top,
      y2: MARGIN.top + plotHeight,
      x1: undefined,
      x2: undefined,
      y: undefined
    }));
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

  const classes = () => ["st-barChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-barChart__visual"
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
    <!-- gridlines + value axis ticks -->
    {#if orientation === "vertical"}
      {#each valueAxisTicks as tick (tick.value)}
        <line
          class="st-barChart__grid"
          x1={tick.x1}
          x2={tick.x2}
          y1={tick.y}
          y2={tick.y}
        />
        <text
          class="st-barChart__tickLabel"
          x={MARGIN.left - 6}
          y={tick.y}
          text-anchor="end"
          dominant-baseline="middle"
        >
          {formatTick(tick.value)}
        </text>
      {/each}
    {:else}
      {#each valueAxisTicks as tick (tick.value)}
        <line
          class="st-barChart__grid"
          x1={tick.x}
          x2={tick.x}
          y1={tick.y1}
          y2={tick.y2}
        />
        <text
          class="st-barChart__tickLabel"
          x={tick.x}
          y={height - MARGIN.bottom + 16}
          text-anchor="middle"
        >
          {formatTick(tick.value)}
        </text>
      {/each}
    {/if}

    <!-- axes -->
    <line
      class="st-barChart__axis"
      x1={MARGIN.left}
      x2={MARGIN.left}
      y1={MARGIN.top}
      y2={height - MARGIN.bottom}
    />
    <line
      class="st-barChart__axis"
      x1={MARGIN.left}
      x2={width - MARGIN.right}
      y1={height - MARGIN.bottom}
      y2={height - MARGIN.bottom}
    />

    <!-- category labels -->
    {#each bars as bar, i (bar.datum.label)}
      {#if orientation === "vertical"}
        <text
          class="st-barChart__categoryLabel"
          x={bar.x + bar.width / 2}
          y={height - MARGIN.bottom + 16}
          text-anchor="middle"
        >
          {bar.datum.label}
        </text>
      {:else}
        <text
          class="st-barChart__categoryLabel"
          x={MARGIN.left - 6}
          y={bar.y + bar.height / 2}
          text-anchor="end"
          dominant-baseline="middle"
        >
          {bar.datum.label}
        </text>
      {/if}
    {/each}

    <!-- Analytical overlays — bands + reference lines BELOW the bars. -->
    {#each bandRects as b (b.key)}
      <rect class={`st-barChart__band ${overlayToneClass("st-barChart__band", b.tone)}`} x={b.x} y={b.y} width={b.width} height={b.height} />
      {#if b.label}
        <text class="st-barChart__overlayLabel" x={b.x + 4} y={b.y + 11}>{b.label}</text>
      {/if}
    {/each}

    {#each refLines as r (r.key)}
      <line class={`st-barChart__refLine ${overlayToneClass("st-barChart__refLine", r.tone)}`} x1={r.x1} x2={r.x2} y1={r.y1} y2={r.y2} />
      {#if r.label}
        <text
          class="st-barChart__overlayLabel"
          x={isVertical ? MARGIN.left + scales.plotWidth - 4 : r.x1 + 4}
          y={isVertical ? r.y1 - 4 : MARGIN.top + 11}
          text-anchor={isVertical ? "end" : "start"}
        >{r.label}</text>
      {/if}
    {/each}

    <!-- bars -->
    <!-- The bars live inside an aria-hidden SVG, so they are NEVER an accessible
         surface. When `onSelect` is provided they only carry a mouse click
         shortcut (cursor:pointer) for sighted pointer users — keyboard + screen
         readers use the filter-chip buttons rendered below, outside this SVG. -->
    {#each bars as bar, i (bar.datum.label)}
      {@const isSelected = selectedSet.has(bar.datum.label)}
      <!-- The mouse click is a deliberate sighted-pointer-only shortcut on a
           decorative element inside an aria-hidden SVG; the real keyboard + AT
           path is the filter-chip <button>s below. No ARIA role/keyboard here
           on purpose (it would be a lie under aria-hidden). -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <rect
        class="st-barChart__bar st-barChart__bar--{bar.tone}"
        class:st-barChart__bar--selected={isSelected}
        class:st-barChart__bar--dim={hasSelection && !isSelected}
        class:st-barChart__bar--interactive={interactive}
        x={bar.x}
        y={bar.y}
        width={bar.width}
        height={bar.height}
        rx="2"
        data-chart-index={i}
        onclick={interactive ? () => onSelect?.(bar.datum.label) : undefined}
      />
    {/each}

    <!-- Error bars ride on top of their bar (still below the goal line). -->
    {#each errorBarGeom as e (e.key)}
      <g class="st-barChart__errorBar">
        <line class="st-barChart__errorStem" x1={e.stem.x1} y1={e.stem.y1} x2={e.stem.x2} y2={e.stem.y2} />
        <line class="st-barChart__errorCap" x1={e.capLow.x1} y1={e.capLow.y1} x2={e.capLow.x2} y2={e.capLow.y2} />
        <line class="st-barChart__errorCap" x1={e.capHigh.x1} y1={e.capHigh.y1} x2={e.capHigh.x2} y2={e.capHigh.y2} />
      </g>
    {/each}

    <!-- Goal line — emphasised, ABOVE the bars. -->
    {#if goalGeom}
      {#if isVertical}
        <line class="st-barChart__goalLine" x1={MARGIN.left} x2={MARGIN.left + scales.plotWidth} y1={goalGeom.p} y2={goalGeom.p} />
      {:else}
        <line class="st-barChart__goalLine" x1={goalGeom.p} x2={goalGeom.p} y1={MARGIN.top} y2={MARGIN.top + scales.plotHeight} />
      {/if}
      <text
        class="st-barChart__goalLabel"
        x={isVertical ? MARGIN.left + scales.plotWidth - 4 : goalGeom.p + 4}
        y={isVertical ? goalGeom.p - 4 : MARGIN.top + 11}
        text-anchor={isVertical ? "end" : "start"}
      >{goalGeom.label ?? `Objectif ${goalGeom.value}`}</text>
    {/if}
    </svg>
  </div>

  {#if interactive}
    <!-- Accessible selection surface — real <button>s OUTSIDE the aria-hidden
         SVG. This is the keyboard + screen-reader path for filtering. -->
    <div class="st-barChart__filters" role="group" aria-label={`Filtrer par ${label}`}>
      {#each bars as bar (bar.datum.label)}
        {@const isSelected = selectedSet.has(bar.datum.label)}
        <button
          type="button"
          class="st-barChart__filterChip st-barChart__filterChip--{bar.tone}"
          class:st-barChart__filterChip--selected={isSelected}
          aria-pressed={isSelected}
          onclick={() => onSelect?.(bar.datum.label)}
        >
          <span class="st-barChart__filterSwatch" aria-hidden="true"></span>
          {bar.datum.label}: {bar.datum.value}
        </button>
      {/each}
    </div>
  {/if}

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && bars[hoveredIndex]}
    {@const bar = bars[hoveredIndex]}
    <div
      class="st-barChart__tooltip"
      role="presentation"
      style="left: {(bar.cx / width) * 100}%; top: {(bar.cy / height) * 100}%"
    >
      <span class="st-barChart__tooltipLabel">{bar.datum.label}</span>
      <span class="st-barChart__tooltipValue">{bar.datum.value}</span>
    </div>
  {/if}
</div>

<style>
  .st-barChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-barChart svg {
    display: block;
    overflow: visible;
  }

  .st-barChart__visual {
    display: block;
  }

  .st-barChart__grid {
    stroke: var(--st-component-barChart-gridStroke, var(--st-semantic-border-subtle));
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-barChart__axis {
    stroke: var(--st-component-barChart-axisStroke, var(--st-semantic-border-subtle));
    stroke-width: 1;
  }

  .st-barChart__tickLabel,
  .st-barChart__categoryLabel {
    fill: var(--st-component-barChart-labelColor, var(--st-semantic-text-secondary));
    font-size: 0.6875rem;
  }

  .st-barChart__bar {
    cursor: pointer;
    transition: opacity var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-barChart__bar:hover {
    opacity: 0.82;
  }

  /* Non-selected bars are dimmed while a selection is active. Floor kept high
     (0.6) so the colour stays distinguishable — opacity is never the sole cue;
     selection also adds a stroke (shape), and the values stay in the chips +
     ChartDataList. */
  .st-barChart__bar--dim {
    opacity: 0.6;
  }
  /* Hover still lifts a dimmed bar so it stays explorable. */
  .st-barChart__bar--dim:hover {
    opacity: 0.8;
  }

  /* Selected bar: full opacity + a contrast-safe accent stroke (two signals,
     never a font/size reflow). Outranks the dim rule. */
  .st-barChart__bar--selected,
  .st-barChart__bar--selected:hover {
    opacity: 1;
    stroke: var(--st-semantic-border-interactive, var(--st-semantic-action-primary));
    stroke-width: 2;
    paint-order: stroke;
  }

  .st-barChart__bar--category1 { fill: var(--st-semantic-data-category1); }
  .st-barChart__bar--category2 { fill: var(--st-semantic-data-category2); }
  .st-barChart__bar--category3 { fill: var(--st-semantic-data-category3); }
  .st-barChart__bar--category4 { fill: var(--st-semantic-data-category4); }
  .st-barChart__bar--category5 { fill: var(--st-semantic-data-category5); }
  .st-barChart__bar--category6 { fill: var(--st-semantic-data-category6); }
  .st-barChart__bar--category7 { fill: var(--st-semantic-data-category7); }
  .st-barChart__bar--category8 { fill: var(--st-semantic-data-category8); }

  /* Accessible filter chips — keyboard + screen-reader selection surface,
     rendered outside the aria-hidden SVG. */
  .st-barChart__filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem);
    margin-top: var(--st-spacing-2, 0.5rem);
  }

  .st-barChart__filterChip {
    align-items: center;
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border: 1px solid var(--st-semantic-border-interactive, #cbd5e1);
    border-radius: var(--st-radius-pill, 999px);
    color: var(--st-semantic-text-secondary, #475569);
    cursor: var(--st-cursor-interactive, pointer);
    display: inline-flex;
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: var(--st-spacing-1, 0.25rem);
    line-height: 1;
    padding: 0.3125rem var(--st-spacing-2, 0.5rem);
    transition:
      background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-barChart__filterChip:hover {
    background: var(--st-semantic-surface-hover, #eef2f7);
  }

  .st-barChart__filterChip:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive, var(--st-semantic-action-primary));
    outline-offset: 2px;
  }

  /* Selected chip: solid accent fill + matching text — signalled by colour AND
     by aria-pressed, never by opacity alone. */
  .st-barChart__filterChip--selected {
    background: var(--st-semantic-action-primary, #2563eb);
    border-color: var(--st-semantic-action-primary, #2563eb);
    color: var(--st-semantic-text-inverse, #fff);
  }

  /* Colour swatch echoing the bar tone, for quick visual mapping chip↔bar. */
  .st-barChart__filterSwatch {
    border-radius: var(--st-radius-sm, 0.25rem);
    display: inline-block;
    height: 0.625rem;
    width: 0.625rem;
  }
  .st-barChart__filterChip--category1 .st-barChart__filterSwatch { background: var(--st-semantic-data-category1); }
  .st-barChart__filterChip--category2 .st-barChart__filterSwatch { background: var(--st-semantic-data-category2); }
  .st-barChart__filterChip--category3 .st-barChart__filterSwatch { background: var(--st-semantic-data-category3); }
  .st-barChart__filterChip--category4 .st-barChart__filterSwatch { background: var(--st-semantic-data-category4); }
  .st-barChart__filterChip--category5 .st-barChart__filterSwatch { background: var(--st-semantic-data-category5); }
  .st-barChart__filterChip--category6 .st-barChart__filterSwatch { background: var(--st-semantic-data-category6); }
  .st-barChart__filterChip--category7 .st-barChart__filterSwatch { background: var(--st-semantic-data-category7); }
  .st-barChart__filterChip--category8 .st-barChart__filterSwatch { background: var(--st-semantic-data-category8); }

  .st-barChart__tooltip {
    background: var(--st-component-barChart-tooltipBackground, var(--st-semantic-surface-inverse));
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-component-barChart-tooltipText, var(--st-semantic-text-inverse));
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

  .st-barChart__tooltipLabel {
    font-weight: 600;
  }

  .st-barChart__tooltipValue {
    opacity: 0.85;
  }

  /* --- Analytical overlay layer --------------------------------------------
     Bands sit BELOW the bars via render order; fill uses color-mix (a
     semi-transparent tint of the tone token) instead of raw opacity, so the
     bars drawn on top keep full contrast. */
  .st-barChart__band {
    fill: color-mix(in srgb, var(--st-overlay-tone, var(--st-semantic-border-strong)) 12%, transparent);
    stroke: none;
  }
  .st-barChart__band--neutral { --st-overlay-tone: var(--st-semantic-border-strong); }
  .st-barChart__band--success { --st-overlay-tone: var(--st-semantic-feedback-success); }
  .st-barChart__band--warning { --st-overlay-tone: var(--st-semantic-feedback-warning); }
  .st-barChart__band--error { --st-overlay-tone: var(--st-semantic-feedback-error); }
  .st-barChart__band--info { --st-overlay-tone: var(--st-semantic-feedback-info); }

  .st-barChart__refLine {
    stroke: var(--st-overlay-tone, var(--st-semantic-border-strong));
    stroke-width: 1;
    stroke-dasharray: 4 3;
  }
  .st-barChart__refLine--neutral { --st-overlay-tone: var(--st-semantic-border-strong); }
  .st-barChart__refLine--success { --st-overlay-tone: var(--st-semantic-feedback-success); }
  .st-barChart__refLine--warning { --st-overlay-tone: var(--st-semantic-feedback-warning); }
  .st-barChart__refLine--error { --st-overlay-tone: var(--st-semantic-feedback-error); }
  .st-barChart__refLine--info { --st-overlay-tone: var(--st-semantic-feedback-info); }

  .st-barChart__overlayLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.625rem;
  }

  /* Error bars — a value-axis whisker centred on each bar. */
  .st-barChart__errorStem,
  .st-barChart__errorCap {
    stroke: var(--st-semantic-text-primary);
    stroke-width: 1.25;
  }

  /* Goal line — drawn ABOVE the bars, emphasised (thicker, solid accent). */
  .st-barChart__goalLine {
    stroke: var(--st-semantic-feedback-success);
    stroke-width: 2.5;
  }
  .st-barChart__goalLabel {
    fill: var(--st-semantic-feedback-success);
    font-size: 0.6875rem;
    font-weight: 600;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-barChart__bar,
    .st-barChart__filterChip { transition: none; }
  }
</style>
