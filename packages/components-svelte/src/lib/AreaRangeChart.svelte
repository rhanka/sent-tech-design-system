<script lang="ts" module>
  /**
   * AreaRangeChart — bande remplie entre une série BASSE et une série HAUTE le
   * long d'un axe X continu (ex. fourchette de température jour par jour,
   * min/max boursier). API canonique (référence Svelte ; React/Vue s'alignent).
   *
   * Props obligatoires :
   *   data   AreaRangeChartDatum[]  - tableau {x, low, high}
   *   label  string                 - aria-label du graphique
   *
   * Props optionnelles :
   *   tone    "category1".."category8"  (défaut "category1")
   *   smooth  boolean                   - bords de bande lissés (défaut false)
   *   width   number  (défaut 480)
   *   height  number  (défaut 240)
   *   class   string
   *
   * Le tracé `.st-areaRangeChart__area` ferme la bande : ligne HAUTE (sens
   * direct) puis ligne BASSE (sens inverse) puis `Z`.
   */
  export type AreaRangeChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type AreaRangeChartDatum = {
    x: number | string;
    low: number;
    high: number;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type AreaRangeChartProps = {
    data: AreaRangeChartDatum[];
    width?: number;
    height?: number;
    tone?: AreaRangeChartTone;
    smooth?: boolean;
    label: string;
    class?: string;
  };

  let {
    data = [],
    width = 480,
    height = 240,
    tone = "category1",
    smooth = false,
    label,
    class: className
  }: AreaRangeChartProps = $props();

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

  // Normalise un point : low/high finis, ordonnés (lo <= hi).
  function normalize(d: AreaRangeChartDatum): { lo: number; hi: number } | null {
    if (!Number.isFinite(d.low) || !Number.isFinite(d.high)) return null;
    return { lo: Math.min(d.low, d.high), hi: Math.max(d.low, d.high) };
  }

  // Données valides : low + high finis.
  const validData = $derived(data.filter((d) => normalize(d) !== null));

  const dataValueItems = $derived(
    validData.map((d) => {
      const r = normalize(d)!;
      return `${d.x}: ${r.lo} – ${r.hi}`;
    })
  );

  let hoveredIndex: number | null = $state(null);

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  const xDomain = $derived.by(() => {
    if (validData.length === 0) return { kind: "ordinal" as const, values: [] as (number | string)[] };
    const allNumeric = validData.every((d) => isNumeric(d.x));
    if (allNumeric) {
      const xs = validData.map((d) => d.x as number);
      return { kind: "numeric" as const, min: Math.min(...xs), max: Math.max(...xs) };
    }
    return { kind: "ordinal" as const, values: validData.map((d) => d.x) };
  });

  const yTicks = $derived.by(() => {
    if (validData.length === 0) return [0];
    const lows = validData.map((d) => normalize(d)!.lo);
    const highs = validData.map((d) => normalize(d)!.hi);
    const minRaw = Math.min(...lows);
    const maxRaw = Math.max(...highs);
    const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
    return niceTicks(minRaw - padded, maxRaw + padded, 5);
  });

  const yDomain = $derived.by(() => {
    if (yTicks.length === 0) return { min: 0, max: 1 };
    return { min: yTicks[0], max: yTicks[yTicks.length - 1] };
  });

  const points = $derived.by(() => {
    if (validData.length === 0) return [];
    return validData.map((d, i) => {
      let x: number;
      if (xDomain.kind === "numeric") {
        x = scaleLinear(d.x as number, xDomain.min, xDomain.max, 0, plotWidth);
      } else {
        const denom = Math.max(validData.length - 1, 1);
        x = validData.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
      }
      const r = normalize(d)!;
      const yLow = scaleLinear(r.lo, yDomain.min, yDomain.max, plotHeight, 0);
      const yHigh = scaleLinear(r.hi, yDomain.min, yDomain.max, plotHeight, 0);
      return {
        x: MARGIN.left + x,
        yLow: MARGIN.top + yLow,
        yHigh: MARGIN.top + yHigh,
        datum: d,
        range: r,
        index: i
      };
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

  // Continue un tracé existant le long de `pts` SANS `M` initial (la bande
  // enchaîne ligne haute puis ligne basse inversée en un seul sous-tracé).
  function continuePath(prefix: string, pts: { x: number; y: number }[], curve: boolean): string {
    if (pts.length === 0) return prefix;
    const full = curve ? buildSmoothPath(pts) : buildLinearPath(pts);
    // Remplace le `M` de tête par `L` pour rester dans le même sous-tracé.
    return `${prefix} L${full.slice(1)}`;
  }

  const highPath = $derived(
    points.length === 0
      ? ""
      : smooth
        ? buildSmoothPath(points.map((p) => ({ x: p.x, y: p.yHigh })))
        : buildLinearPath(points.map((p) => ({ x: p.x, y: p.yHigh })))
  );

  const lowPath = $derived(
    points.length === 0
      ? ""
      : smooth
        ? buildSmoothPath(points.map((p) => ({ x: p.x, y: p.yLow })))
        : buildLinearPath(points.map((p) => ({ x: p.x, y: p.yLow })))
  );

  // Bande : ligne HAUTE (gauche→droite) puis ligne BASSE (droite→gauche) + Z.
  const areaPath = $derived.by(() => {
    if (points.length === 0) return "";
    const lowReversed = [...points].reverse().map((p) => ({ x: p.x, y: p.yLow }));
    return `${continuePath(highPath, lowReversed, smooth)} Z`;
  });

  const gridLines = $derived(
    yTicks.map((tick) => ({
      value: tick,
      y: MARGIN.top + scaleLinear(tick, yDomain.min, yDomain.max, plotHeight, 0)
    }))
  );

  const xTickEntries = $derived.by(() => {
    if (validData.length === 0) return [];
    if (xDomain.kind === "ordinal") {
      return points.map((p, i) => ({ x: p.x, label: String(validData[i].x) }));
    }
    const target = Math.min(5, validData.length);
    const stride = Math.max(1, Math.round((validData.length - 1) / (target - 1 || 1)));
    const entries: { x: number; label: string }[] = [];
    for (let i = 0; i < validData.length; i += stride) {
      entries.push({ x: points[i].x, label: String(validData[i].x) });
    }
    const lastIdx = validData.length - 1;
    if (entries[entries.length - 1]?.label !== String(validData[lastIdx].x)) {
      entries.push({ x: points[lastIdx].x, label: String(validData[lastIdx].x) });
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

  // Identifiant de dégradé unique pour éviter les conflits multi-charts.
  const gradientId = $derived.by(() => {
    return `st-arearangechart-gradient-${Math.random().toString(36).substring(2, 9)}`;
  });

  const classes = () =>
    ["st-areaRangeChart", `st-areaRangeChart--${tone}`, className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-areaRangeChart__visual"
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
          <stop offset="0%" stop-color="currentColor" stop-opacity="0.32" />
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.12" />
        </linearGradient>
      </defs>

      <!-- gridlines + Y axis ticks -->
      {#each gridLines as g (g.value)}
        <line
          class="st-areaRangeChart__grid"
          x1={MARGIN.left}
          x2={width - MARGIN.right}
          y1={g.y}
          y2={g.y}
        />
        <text
          class="st-areaRangeChart__tickLabel"
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
        class="st-areaRangeChart__axis"
        x1={MARGIN.left}
        x2={MARGIN.left}
        y1={MARGIN.top}
        y2={height - MARGIN.bottom}
      />
      <line
        class="st-areaRangeChart__axis"
        x1={MARGIN.left}
        x2={width - MARGIN.right}
        y1={height - MARGIN.bottom}
        y2={height - MARGIN.bottom}
      />

      <!-- X tick labels -->
      {#each xTickEntries as tick, i (i)}
        <text
          class="st-areaRangeChart__tickLabel"
          x={tick.x}
          y={height - MARGIN.bottom + 16}
          text-anchor="middle"
        >
          {tick.label}
        </text>
      {/each}

      {#if areaPath}
        <path class="st-areaRangeChart__area" d={areaPath} fill="url(#{gradientId})" />
      {/if}
      {#if highPath}
        <path
          class="st-areaRangeChart__line st-areaRangeChart__line--high"
          d={highPath}
          fill="none"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      {/if}
      {#if lowPath}
        <path
          class="st-areaRangeChart__line st-areaRangeChart__line--low"
          d={lowPath}
          fill="none"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      {/if}

      {#each points as p (p.index)}
        <circle class="st-areaRangeChart__dot" cx={p.x} cy={p.yHigh} r="3.5" data-chart-index={p.index} />
        <circle class="st-areaRangeChart__dot" cx={p.x} cy={p.yLow} r="3.5" data-chart-index={p.index} />
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && points[hoveredIndex]}
    {@const p = points[hoveredIndex]}
    <div
      class="st-areaRangeChart__tooltip"
      role="presentation"
      style="left: {(p.x / width) * 100}%; top: {(p.yHigh / height) * 100}%"
    >
      <span class="st-areaRangeChart__tooltipLabel">{p.datum.x}</span>
      <span class="st-areaRangeChart__tooltipValue">{p.range.lo} – {p.range.hi}</span>
    </div>
  {/if}
</div>

<style>
  .st-areaRangeChart {
    color: var(--st-semantic-data-category1);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-areaRangeChart--category1 { color: var(--st-semantic-data-category1); }
  .st-areaRangeChart--category2 { color: var(--st-semantic-data-category2); }
  .st-areaRangeChart--category3 { color: var(--st-semantic-data-category3); }
  .st-areaRangeChart--category4 { color: var(--st-semantic-data-category4); }
  .st-areaRangeChart--category5 { color: var(--st-semantic-data-category5); }
  .st-areaRangeChart--category6 { color: var(--st-semantic-data-category6); }
  .st-areaRangeChart--category7 { color: var(--st-semantic-data-category7); }
  .st-areaRangeChart--category8 { color: var(--st-semantic-data-category8); }

  .st-areaRangeChart svg {
    display: block;
    overflow: visible;
  }

  .st-areaRangeChart__visual {
    display: block;
  }

  .st-areaRangeChart__grid {
    stroke: var(--st-component-areaRangeChart-gridStroke, var(--st-semantic-border-subtle));
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-areaRangeChart__axis {
    stroke: var(--st-component-areaRangeChart-axisStroke, var(--st-semantic-border-subtle));
    stroke-width: 1;
  }

  .st-areaRangeChart__tickLabel {
    fill: var(--st-component-areaRangeChart-labelColor, var(--st-semantic-text-secondary));
    font-size: 0.6875rem;
  }

  .st-areaRangeChart__line {
    stroke: currentColor;
  }

  .st-areaRangeChart__line--low {
    opacity: 0.7;
  }

  .st-areaRangeChart__area {
    stroke: none;
  }

  .st-areaRangeChart__dot {
    fill: currentColor;
    stroke: var(--st-semantic-surface-default);
    stroke-width: 1.5;
    cursor: pointer;
    transition: r 120ms ease;
  }

  .st-areaRangeChart__dot:hover {
    r: 5;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-areaRangeChart__dot {
      transition: none;
    }
  }

  .st-areaRangeChart__tooltip {
    background: var(--st-component-areaRangeChart-tooltipBackground, var(--st-semantic-surface-inverse));
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-component-areaRangeChart-tooltipText, var(--st-semantic-text-inverse));
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

  .st-areaRangeChart__tooltipLabel {
    font-weight: 600;
  }

  .st-areaRangeChart__tooltipValue {
    opacity: 0.85;
  }
</style>
