<script lang="ts" module>
  /**
   * BulletChart - Tableau bullet graph (mesure vs cible + bandes qualitatives).
   * API canonique (référence Svelte, React/Vue doivent s'aligner)
   *
   * Props obligatoires :
   *   data   BulletChartDatum[]  - tableau {label, value, target, ranges?}
   *   label  string              - aria-label du graphique
   *
   * Props optionnelles :
   *   orientation  "horizontal"|"vertical"  (défaut "horizontal")
   *   width        number  (défaut 480)
   *   height       number  (défaut 240)
   *   class        string
   */
  export type BulletChartDatum = {
    label: string;
    value: number;
    target: number;
    ranges?: number[];
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type BulletChartProps = {
    data: BulletChartDatum[];
    label: string;
    orientation?: "horizontal" | "vertical";
    width?: number;
    height?: number;
    class?: string;
  };

  let {
    data = [],
    label,
    orientation = "horizontal",
    width = 480,
    height = 240,
    class: className
  }: BulletChartProps = $props();

  const MARGIN = { top: 12, right: 24, bottom: 36, left: 80 };
  const RANGE_OPACITIES = [0.18, 0.30, 0.44];

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

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  // FIX #3 : filtre les données invalides (value/target non-finis → skip)
  const validData = $derived(
    data.filter((d) => Number.isFinite(d.value) && Number.isFinite(d.target))
  );

  // FIX #3 : domaine inclut 0, values, targets ET ranges ; domaine négatif supporté
  const domainBounds = $derived.by(() => {
    const allValues: number[] = [0]; // baseline à 0
    for (const d of validData) {
      allValues.push(d.value, d.target);
      for (const r of d.ranges ?? []) {
        if (Number.isFinite(r)) allValues.push(r);
      }
    }
    const rawMin = Math.min(...allValues);
    const rawMax = Math.max(...allValues);
    // Domaine plat → fallback +1
    return { rawMin, rawMax: rawMax === rawMin ? rawMin + 1 : rawMax };
  });

  const ticks = $derived(niceTicks(domainBounds.rawMin, domainBounds.rawMax, 5));
  const tickDomainMin = $derived(ticks[0] ?? domainBounds.rawMin);
  const tickDomainMax = $derived(ticks[ticks.length - 1] ?? domainBounds.rawMax);

  // Position de la baseline (valeur 0) en pixels
  const baselineX = $derived(MARGIN.left + scaleLinear(0, tickDomainMin, tickDomainMax, 0, plotWidth));
  const baselineY = $derived(MARGIN.top + scaleLinear(0, tickDomainMin, tickDomainMax, plotHeight, 0));

  const bullets = $derived.by(() => {
    const bandCount = validData.length;
    if (bandCount === 0) return [];

    if (orientation === "horizontal") {
      const bandH = plotHeight / bandCount;
      const barH = bandH * 0.35;
      const rangeH = bandH * 0.65;

      return validData.map((d, i) => {
        const ranges = (d.ranges ?? [tickDomainMax]).filter(Number.isFinite).slice(0, 3);
        const sortedRanges = [...ranges].sort((a, b) => a - b);

        const bandY = MARGIN.top + i * bandH;
        const cx = MARGIN.left + scaleLinear(d.value, tickDomainMin, tickDomainMax, 0, plotWidth);
        const targetX = MARGIN.left + scaleLinear(d.target, tickDomainMin, tickDomainMax, 0, plotWidth);

        const rangeBands = sortedRanges.map((r, ri) => {
          const prevR = ri === 0 ? tickDomainMin : sortedRanges[ri - 1];
          return {
            x: MARGIN.left + scaleLinear(prevR, tickDomainMin, tickDomainMax, 0, plotWidth),
            width: scaleLinear(r, tickDomainMin, tickDomainMax, 0, plotWidth) -
                   scaleLinear(prevR, tickDomainMin, tickDomainMax, 0, plotWidth),
            opacity: RANGE_OPACITIES[ri] ?? 0.44,
            y: bandY + (bandH - rangeH) / 2,
            height: rangeH
          };
        });

        // FIX #3 : la barre part de la baseline (0), pas du bord gauche
        const zeroX = baselineX;
        const barLeft = Math.min(zeroX, cx);
        const barRight = Math.max(zeroX, cx);

        return {
          datum: d,
          index: i,
          barX: barLeft,
          barY: bandY + (bandH - barH) / 2,
          barW: Math.max(barRight - barLeft, 0.5),
          barH,
          targetX,
          targetY: bandY + (bandH - rangeH) / 2,
          targetH: rangeH,
          labelY: bandY + bandH / 2,
          labelX: 0,
          rangeBands,
          tooltipX: cx,
          tooltipY: bandY + bandH / 2
        };
      });
    }

    // vertical
    const bandW = plotWidth / bandCount;
    const barW = bandW * 0.35;
    const rangeW = bandW * 0.65;

    return validData.map((d, i) => {
      const ranges = (d.ranges ?? [tickDomainMax]).filter(Number.isFinite).slice(0, 3);
      const sortedRanges = [...ranges].sort((a, b) => a - b);

      const bandX = MARGIN.left + i * bandW;
      const cy = MARGIN.top + scaleLinear(d.value, tickDomainMin, tickDomainMax, plotHeight, 0);
      const targetY = MARGIN.top + scaleLinear(d.target, tickDomainMin, tickDomainMax, plotHeight, 0);

      const rangeBands = sortedRanges.map((r, ri) => {
        const prevR = ri === 0 ? tickDomainMin : sortedRanges[ri - 1];
        return {
          y: MARGIN.top + scaleLinear(r, tickDomainMin, tickDomainMax, plotHeight, 0),
          height: Math.abs(
            scaleLinear(r, tickDomainMin, tickDomainMax, plotHeight, 0) -
            scaleLinear(prevR, tickDomainMin, tickDomainMax, plotHeight, 0)
          ),
          opacity: RANGE_OPACITIES[ri] ?? 0.44,
          x: bandX + (bandW - rangeW) / 2,
          width: rangeW
        };
      });

      // FIX #3 : barre part de la baseline (0)
      const zeroY = baselineY;
      const barTop = Math.min(zeroY, cy);
      const barBot = Math.max(zeroY, cy);

      return {
        datum: d,
        index: i,
        barX: bandX + (bandW - barW) / 2,
        barY: barTop,
        barW: barW,
        barH: Math.max(barBot - barTop, 0.5),
        targetY,
        targetX: bandX + (bandW - rangeW) / 2,
        targetH: rangeW,
        labelY: MARGIN.top + plotHeight + 18,
        labelX: bandX + bandW / 2,
        rangeBands,
        tooltipX: bandX + bandW / 2,
        tooltipY: cy
      };
    });
  });

  const dataValueItems = $derived(
    validData.map((d) => `${d.label}: value ${d.value}, target ${d.target}`)
  );

  function handlePointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) { hoveredIndex = null; return; }
    const idx = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(idx) ? idx : null;
  }

  const classes = () => ["st-bulletChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-bulletChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handlePointerMove}
    onpointerleave={() => (hoveredIndex = null)}
  >
    <svg
      viewBox="0 0 {width} {height}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
      <!-- FIX #3 : baseline à la position de 0 -->
      {#if orientation === "horizontal"}
        <line
          class="st-bulletChart__baseline"
          x1={baselineX}
          x2={baselineX}
          y1={MARGIN.top}
          y2={height - MARGIN.bottom}
        />
      {:else}
        <line
          class="st-bulletChart__baseline"
          x1={MARGIN.left}
          x2={width - MARGIN.right}
          y1={baselineY}
          y2={baselineY}
        />
      {/if}

      <!-- axis lines -->
      <line
        class="st-bulletChart__axis"
        x1={MARGIN.left}
        x2={orientation === "horizontal" ? width - MARGIN.right : MARGIN.left}
        y1={orientation === "horizontal" ? MARGIN.top : MARGIN.top}
        y2={orientation === "horizontal" ? height - MARGIN.bottom : height - MARGIN.bottom}
      />
      <line
        class="st-bulletChart__axis"
        x1={MARGIN.left}
        x2={orientation === "horizontal" ? MARGIN.left : width - MARGIN.right}
        y1={height - MARGIN.bottom}
        y2={height - MARGIN.bottom}
      />

      <!-- tick lines + labels -->
      {#each ticks as tick (tick)}
        {#if orientation === "horizontal"}
          {@const tx = MARGIN.left + scaleLinear(tick, tickDomainMin, tickDomainMax, 0, plotWidth)}
          <line class="st-bulletChart__grid" x1={tx} x2={tx} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <text class="st-bulletChart__tickLabel" x={tx} y={height - MARGIN.bottom + 14} text-anchor="middle">
            {formatTick(tick)}
          </text>
        {:else}
          {@const ty = MARGIN.top + scaleLinear(tick, tickDomainMin, tickDomainMax, plotHeight, 0)}
          <line class="st-bulletChart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={ty} y2={ty} />
          <text class="st-bulletChart__tickLabel" x={MARGIN.left - 6} y={ty} text-anchor="end" dominant-baseline="middle">
            {formatTick(tick)}
          </text>
        {/if}
      {/each}

      <!-- FIX #7 : clé composite pour éviter les doublons -->
      {#each bullets as b, i (`${i}-${b.datum.label}`)}
        <!-- qualitative range bands -->
        {#each b.rangeBands as rb, ri (ri)}
          <rect
            class="st-bulletChart__range"
            x={rb.x ?? b.barX}
            y={rb.y ?? b.barY}
            width={orientation === "horizontal" ? rb.width : rb.width}
            height={orientation === "horizontal" ? rb.height : Math.abs(rb.height ?? 0)}
            style="opacity: {rb.opacity}"
          />
        {/each}

        <!-- measure bar -->
        {#if orientation === "horizontal"}
          <rect
            class="st-bulletChart__bar"
            x={b.barX}
            y={b.barY}
            width={b.barW}
            height={b.barH}
            rx="1"
            data-chart-index={i}
          />
          <!-- target marker -->
          <line
            class="st-bulletChart__target"
            x1={b.targetX}
            x2={b.targetX}
            y1={b.targetY}
            y2={b.targetY + b.targetH}
          />
          <!-- category label -->
          <text
            class="st-bulletChart__categoryLabel"
            x={MARGIN.left - 8}
            y={b.labelY}
            text-anchor="end"
            dominant-baseline="middle"
          >
            {b.datum.label}
          </text>
        {:else}
          <rect
            class="st-bulletChart__bar"
            x={b.barX}
            y={b.barY}
            width={b.barW}
            height={b.barH}
            rx="1"
            data-chart-index={i}
          />
          <line
            class="st-bulletChart__target"
            x1={b.targetX}
            x2={b.targetX + b.targetH}
            y1={b.targetY}
            y2={b.targetY}
          />
          <text
            class="st-bulletChart__categoryLabel"
            x={b.labelX}
            y={b.labelY}
            text-anchor="middle"
          >
            {b.datum.label}
          </text>
        {/if}
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && bullets[hoveredIndex]}
    {@const b = bullets[hoveredIndex]}
    <div
      class="st-bulletChart__tooltip"
      role="presentation"
      style="left: {(b.tooltipX / width) * 100}%; top: {(b.tooltipY / height) * 100}%"
    >
      <span class="st-bulletChart__tooltipLabel">{b.datum.label}</span>
      <span class="st-bulletChart__tooltipValue">value: {b.datum.value} / target: {b.datum.target}</span>
    </div>
  {/if}
</div>

<style>
  .st-bulletChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-bulletChart svg {
    display: block;
    overflow: visible;
  }

  .st-bulletChart__visual {
    display: block;
  }

  .st-bulletChart__axis {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-bulletChart__baseline {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1.5;
  }

  .st-bulletChart__grid {
    stroke: var(--st-semantic-border-subtle);
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.6;
  }

  .st-bulletChart__range {
    fill: var(--st-semantic-data-category1);
  }

  .st-bulletChart__bar {
    cursor: pointer;
    fill: var(--st-semantic-text-secondary);
    transition: opacity 120ms ease;
  }

  .st-bulletChart__bar:hover {
    opacity: 0.75;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-bulletChart__bar {
      transition: none;
    }
  }

  .st-bulletChart__target {
    stroke: var(--st-semantic-text-primary, currentColor);
    stroke-width: 2.5;
  }

  .st-bulletChart__tickLabel,
  .st-bulletChart__categoryLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
  }

  .st-bulletChart__tooltip {
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

  .st-bulletChart__tooltipLabel {
    font-weight: 600;
  }

  .st-bulletChart__tooltipValue {
    opacity: 0.85;
  }
</style>
