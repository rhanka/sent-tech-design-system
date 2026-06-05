<script lang="ts" module>
  export type FunnelChartTone =
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  export type FunnelChartDatum = {
    label: string;
    value: number;
    tone?: FunnelChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";
  import { contrastTextForTone } from "./chartContrast";

  type FunnelChartProps = {
    data: FunnelChartDatum[];
    orientation?: "vertical" | "horizontal";
    showPercentages?: boolean;
    percentMode?: "ofFirst" | "ofPrevious";
    legend?: boolean;
    label: string;
    width?: number;
    height?: number;
    class?: string;
  };

  let {
    data,
    orientation = "vertical",
    showPercentages = true,
    percentMode = "ofFirst",
    legend = false,
    label,
    width = 480,
    height = 280,
    class: className
  }: FunnelChartProps = $props();

  const MARGIN = { top: 16, right: 16, bottom: 16, left: 16 };
  const GAP = 6;
  const TONES = [
    "category1", "category2", "category3", "category4",
    "category5", "category6", "category7", "category8"
  ] as const;

  function formatPercent(p: number): string {
    if (!Number.isFinite(p)) return "0%";
    return `${p % 1 === 0 ? p.toFixed(0) : p.toFixed(1)}%`;
  }

  let hoveredIndex: number | null = $state(null);

  /**
   * Magnitude normalisée d'une étape : un entonnoir ne représente que des
   * grandeurs positives. Les valeurs non finies ou négatives sont ramenées à 0
   * (jamais de NaN/Infinity dans la géométrie ou les pourcentages).
   */
  function magnitude(v: number): number {
    return Number.isFinite(v) && v > 0 ? v : 0;
  }

  // Pourcentages calculés par rapport à la première étape ou à la précédente.
  // Référence nulle → 0% (pas de NaN), première étape ofPrevious → 100%.
  const percents = $derived.by(() => {
    const first = magnitude(data[0]?.value ?? 0);
    return data.map((d, i) => {
      const value = magnitude(d.value);
      const ref = percentMode === "ofPrevious" ? magnitude(data[i - 1]?.value ?? value) : first;
      return ref === 0 ? 0 : (value / ref) * 100;
    });
  });

  // Trapèzes décroissants centrés : la demi-largeur de chaque étape est
  // proportionnelle à sa valeur (relative au max). Les segments se rejoignent.
  const segments = $derived.by(() => {
    if (data.length === 0) return [];
    const maxValue = Math.max(0, ...data.map((d) => magnitude(d.value)));
    const safeMax = maxValue === 0 ? 1 : maxValue;
    const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
    const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

    if (orientation === "vertical") {
      const band = plotH / data.length;
      const segH = Math.max(band - GAP, 1);
      const cx = MARGIN.left + plotW / 2;
      return data.map((d, i) => {
        const tone = d.tone ?? TONES[i % TONES.length];
        const topHalf = (magnitude(d.value) / safeMax) * (plotW / 2);
        const nextVal = data[i + 1] ? magnitude(data[i + 1].value) : magnitude(d.value);
        // Forme strictement décroissante : le bas ne dépasse jamais le haut.
        const botHalf = Math.min((nextVal / safeMax) * (plotW / 2), topHalf);
        const y0 = MARGIN.top + band * i;
        const y1 = y0 + segH;
        const points = [
          `${cx - topHalf},${y0}`,
          `${cx + topHalf},${y0}`,
          `${cx + botHalf},${y1}`,
          `${cx - botHalf},${y1}`
        ].join(" ");
        return {
          points,
          datum: d,
          tone,
          textColor: contrastTextForTone(tone),
          cx,
          cy: (y0 + y1) / 2,
          labelX: cx,
          labelY: (y0 + y1) / 2,
          percent: percents[i]
        };
      });
    }

    // horizontal : entonnoir qui se rétrécit de gauche à droite.
    const band = plotW / data.length;
    const segW = Math.max(band - GAP, 1);
    const cy = MARGIN.top + plotH / 2;
    return data.map((d, i) => {
      const tone = d.tone ?? TONES[i % TONES.length];
      const leftHalf = (magnitude(d.value) / safeMax) * (plotH / 2);
      const nextVal = data[i + 1] ? magnitude(data[i + 1].value) : magnitude(d.value);
      const rightHalf = Math.min((nextVal / safeMax) * (plotH / 2), leftHalf);
      const x0 = MARGIN.left + band * i;
      const x1 = x0 + segW;
      const points = [
        `${x0},${cy - leftHalf}`,
        `${x1},${cy - rightHalf}`,
        `${x1},${cy + rightHalf}`,
        `${x0},${cy + leftHalf}`
      ].join(" ");
      return {
        points,
        datum: d,
        tone,
        textColor: contrastTextForTone(tone),
        cx: (x0 + x1) / 2,
        cy,
        labelX: (x0 + x1) / 2,
        labelY: cy,
        percent: percents[i]
      };
    });
  });

  const dataValueItems = $derived(
    data.map((d, i) =>
      showPercentages
        ? `${d.label}: ${d.value} (${formatPercent(percents[i])})`
        : `${d.label}: ${d.value}`
    )
  );

  const legendItems = $derived(
    data.map((d, i) => ({ label: d.label, tone: d.tone ?? TONES[i % TONES.length] }))
  );

  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredIndex = null;
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(index) ? index : null;
  }

  const classes = () => ["st-funnelChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-funnelChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handleVisualPointerMove}
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
      {#each segments as seg, i (seg.datum.label)}
        <polygon
          class="st-funnelChart__segment st-funnelChart__segment--{seg.tone}"
          class:st-funnelChart__segment--dim={hoveredIndex !== null && hoveredIndex !== i}
          points={seg.points}
          data-chart-index={i}
        />
      {/each}

      {#each segments as seg, i (seg.datum.label)}
        <text
          class="st-funnelChart__label"
          x={seg.labelX}
          y={seg.labelY - 6}
          text-anchor="middle"
          dominant-baseline="middle"
          style="fill: {seg.textColor}"
        >
          {seg.datum.label}
        </text>
        <text
          class="st-funnelChart__value"
          x={seg.labelX}
          y={seg.labelY + 8}
          text-anchor="middle"
          dominant-baseline="middle"
          style="fill: {seg.textColor}"
        >
          {seg.datum.value}{#if showPercentages}&nbsp;·&nbsp;{formatPercent(seg.percent)}{/if}
        </text>
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && segments[hoveredIndex]}
    {@const seg = segments[hoveredIndex]}
    <div
      class="st-funnelChart__tooltip"
      role="presentation"
      style="left: {(seg.cx / width) * 100}%; top: {(seg.cy / height) * 100}%"
    >
      <span class="st-funnelChart__tooltipLabel">{seg.datum.label}</span>
      <span class="st-funnelChart__tooltipValue">
        {seg.datum.value}{#if showPercentages}&nbsp;·&nbsp;{formatPercent(seg.percent)}{/if}
      </span>
    </div>
  {/if}

  {#if legend && legendItems.length > 0}
    <ul class="st-funnelChart__legend" aria-hidden="true">
      {#each legendItems as item (item.label)}
        <li class="st-funnelChart__legendItem">
          <span
            class="st-funnelChart__legendSwatch st-funnelChart__legendSwatch--{item.tone}"
            aria-hidden="true"
          ></span>
          {item.label}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .st-funnelChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-funnelChart svg,
  .st-funnelChart__visual {
    display: block;
    overflow: visible;
  }

  .st-funnelChart__segment {
    cursor: pointer;
    stroke: var(--st-semantic-surface-default, #fff);
    stroke-width: 1;
    transition: opacity 120ms ease;
  }

  .st-funnelChart__segment--dim {
    opacity: 0.45;
  }

  .st-funnelChart__segment--category1 { fill: var(--st-semantic-data-category1); }
  .st-funnelChart__segment--category2 { fill: var(--st-semantic-data-category2); }
  .st-funnelChart__segment--category3 { fill: var(--st-semantic-data-category3); }
  .st-funnelChart__segment--category4 { fill: var(--st-semantic-data-category4); }
  .st-funnelChart__segment--category5 { fill: var(--st-semantic-data-category5); }
  .st-funnelChart__segment--category6 { fill: var(--st-semantic-data-category6); }
  .st-funnelChart__segment--category7 { fill: var(--st-semantic-data-category7); }
  .st-funnelChart__segment--category8 { fill: var(--st-semantic-data-category8); }

  .st-funnelChart__label {
    fill: var(--st-component-funnelChart-labelColor, var(--st-semantic-text-inverse, #fff));
    font-size: 0.75rem;
    font-weight: 600;
    pointer-events: none;
  }

  .st-funnelChart__value {
    fill: var(--st-component-funnelChart-valueColor, var(--st-semantic-text-inverse, #fff));
    font-size: 0.6875rem;
    pointer-events: none;
  }

  .st-funnelChart__tooltip {
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

  .st-funnelChart__tooltipLabel { font-weight: 600; }
  .st-funnelChart__tooltipValue { opacity: 0.85; }

  .st-funnelChart__legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-3, 0.75rem);
    list-style: none;
    margin: var(--st-spacing-2, 0.5rem) 0 0;
    padding: 0;
  }

  .st-funnelChart__legendItem {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    font-size: 0.75rem;
    gap: var(--st-spacing-1, 0.25rem);
  }

  .st-funnelChart__legendSwatch {
    border-radius: 2px;
    height: 0.7rem;
    width: 0.7rem;
  }

  .st-funnelChart__legendSwatch--category1 { background: var(--st-semantic-data-category1); }
  .st-funnelChart__legendSwatch--category2 { background: var(--st-semantic-data-category2); }
  .st-funnelChart__legendSwatch--category3 { background: var(--st-semantic-data-category3); }
  .st-funnelChart__legendSwatch--category4 { background: var(--st-semantic-data-category4); }
  .st-funnelChart__legendSwatch--category5 { background: var(--st-semantic-data-category5); }
  .st-funnelChart__legendSwatch--category6 { background: var(--st-semantic-data-category6); }
  .st-funnelChart__legendSwatch--category7 { background: var(--st-semantic-data-category7); }
  .st-funnelChart__legendSwatch--category8 { background: var(--st-semantic-data-category8); }

  @media (prefers-reduced-motion: reduce) {
    .st-funnelChart__segment {
      transition: none;
    }
  }
</style>
