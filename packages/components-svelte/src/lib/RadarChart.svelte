<script lang="ts" module>
  /**
   * RadarChart - API canonique (référence Svelte, React/Vue doivent s'aligner)
   *
   * Props obligatoires :
   *   axes    string[]           - libellés des axes (N axes = polygone à N côtés)
   *   series  RadarChartSeries[] - séries {label, values: number[], tone?}
   *   label   string             - aria-label du graphique
   *
   * Props optionnelles :
   *   maxValue  number   (défaut : max des valeurs, min 1) - valeur plafond du
   *                       domaine. PAS de plancher arbitraire à 100 - l'échelle
   *                       s'adapte aux données. React/Vue doivent supprimer leur
   *                       `Math.max(100, …)` pour s'aligner sur ce comportement.
   *   levels    number   (défaut 4)   - nombre de cercles / anneaux de grille
   *   legend    boolean  (défaut false) - affiche la légende des séries
   *   width     number   (défaut 360) - largeur du viewBox en px
   *   height    number   (défaut 320) - hauteur du viewBox en px
   *   class     string               - classe CSS supplémentaire
   *
   * NaN/vide : les valeurs non-finies sont exclues du calcul du domaine
   *   (filter Number.isFinite). Séries vides → polygone nul sans crash.
   */
  export type RadarChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type RadarChartSeries = {
    label: string;
    values: number[];
    tone?: RadarChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type RadarChartProps = {
    axes: string[];
    series: RadarChartSeries[];
    label: string;
    legend?: boolean;
    maxValue?: number;
    levels?: number;
    width?: number;
    height?: number;
    class?: string;
  };

  let {
    axes,
    series,
    label,
    legend = false,
    maxValue,
    levels = 4,
    width = 360,
    height = 320,
    class: className
  }: RadarChartProps = $props();

  const TONES = [
    "category1",
    "category2",
    "category3",
    "category4",
    "category5",
    "category6",
    "category7",
    "category8"
  ] as const;

  function pointAt(cx: number, cy: number, radius: number, angle: number) {
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    };
  }

  let hoveredIndex: number | null = $state(null);

  const center = $derived({ x: width / 2, y: height / 2 });
  const radius = $derived(Math.max(Math.min(width, height) / 2 - 42, 1));
  const safeLevelCount = $derived(Math.max(1, Math.floor(levels)));
  const domainMax = $derived.by(() => {
    if (Number.isFinite(maxValue) && (maxValue ?? 0) > 0) return maxValue as number;
    const values = series.flatMap((entry) => entry.values).filter(Number.isFinite);
    return Math.max(1, ...values);
  });

  const axisEntries = $derived(
    axes.map((axis, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(axes.length, 1);
      const end = pointAt(center.x, center.y, radius, angle);
      const labelPoint = pointAt(center.x, center.y, radius + 22, angle);
      return { axis, index, angle, end, labelPoint };
    })
  );

  const rings = $derived(
    Array.from({ length: safeLevelCount }, (_, index) => {
      const ringRadius = (radius * (index + 1)) / safeLevelCount;
      return axisEntries.map((axis) => pointAt(center.x, center.y, ringRadius, axis.angle)).map((point) => `${point.x},${point.y}`).join(" ");
    })
  );

  const polygons = $derived(
    series.map((entry, seriesIndex) => {
      const tone = entry.tone ?? TONES[seriesIndex % TONES.length];
      const points = axes.map((_, axisIndex) => {
        const value = Math.max(0, entry.values[axisIndex] ?? 0);
        const scaled = Math.min(value / domainMax, 1) * radius;
        const angle = -Math.PI / 2 + (Math.PI * 2 * axisIndex) / Math.max(axes.length, 1);
        return pointAt(center.x, center.y, scaled, angle);
      });
      return {
        entry,
        tone,
        points,
        pointString: points.map((point) => `${point.x},${point.y}`).join(" ")
      };
    })
  );

  const legendItems = $derived(series.map((entry, index) => ({ label: entry.label, tone: entry.tone ?? TONES[index % TONES.length] })));

  const dataValueItems = $derived(
    series.flatMap((entry) => axes.map((axis, axisIndex) => `${entry.label}, ${axis}: ${entry.values[axisIndex] ?? 0}`))
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

  const classes = () => ["st-radarChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-radarChart__visual"
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
      {#each rings as ring, i (i)}
        <polygon class="st-radarChart__ring" points={ring} />
      {/each}

      {#each axisEntries as axis (axis.axis)}
        <line class="st-radarChart__axis" x1={center.x} x2={axis.end.x} y1={center.y} y2={axis.end.y} />
        <text
          class="st-radarChart__axisLabel"
          x={axis.labelPoint.x}
          y={axis.labelPoint.y}
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {axis.axis}
        </text>
      {/each}

      {#each polygons as polygon, i (polygon.entry.label)}
        <polygon
          class="st-radarChart__polygon st-radarChart__polygon--{polygon.tone}"
          class:st-radarChart__polygon--dim={hoveredIndex !== null && hoveredIndex !== i}
          points={polygon.pointString}
          data-chart-index={i}
        />
        {#each polygon.points as point, pointIndex (`${polygon.entry.label}-${pointIndex}`)}
          <circle class="st-radarChart__point st-radarChart__point--{polygon.tone}" cx={point.x} cy={point.y} r="3" data-chart-index={i} />
        {/each}
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && polygons[hoveredIndex]}
    {@const polygon = polygons[hoveredIndex]}
    <div class="st-radarChart__tooltip" role="presentation">
      <span class="st-radarChart__tooltipLabel">{polygon.entry.label}</span>
    </div>
  {/if}

  {#if legend && legendItems.length > 0}
    <ul class="st-radarChart__legend" aria-hidden="true">
      {#each legendItems as item (item.label)}
        <li class="st-radarChart__legendItem">
          <span class="st-radarChart__legendSwatch st-radarChart__legendSwatch--{item.tone}"></span>
          {item.label}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .st-radarChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    max-width: 100%;
    position: relative;
    width: 100%;
  }

  .st-radarChart svg,
  .st-radarChart__visual {
    display: block;
    overflow: visible;
  }

  .st-radarChart__ring {
    fill: none;
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-radarChart__axis {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-radarChart__axisLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.72rem;
  }

  .st-radarChart__polygon {
    cursor: pointer;
    fill-opacity: 0.16;
    stroke-width: 2;
    transition: opacity 120ms ease;
  }

  .st-radarChart__polygon--dim {
    opacity: 0.35;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-radarChart__polygon {
      transition: none;
    }
  }

  .st-radarChart__point {
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1;
  }

  .st-radarChart__polygon--category1,
  .st-radarChart__point--category1,
  .st-radarChart__legendSwatch--category1 { fill: var(--st-semantic-data-category1); stroke: var(--st-semantic-data-category1); background: var(--st-semantic-data-category1); }
  .st-radarChart__polygon--category2,
  .st-radarChart__point--category2,
  .st-radarChart__legendSwatch--category2 { fill: var(--st-semantic-data-category2); stroke: var(--st-semantic-data-category2); background: var(--st-semantic-data-category2); }
  .st-radarChart__polygon--category3,
  .st-radarChart__point--category3,
  .st-radarChart__legendSwatch--category3 { fill: var(--st-semantic-data-category3); stroke: var(--st-semantic-data-category3); background: var(--st-semantic-data-category3); }
  .st-radarChart__polygon--category4,
  .st-radarChart__point--category4,
  .st-radarChart__legendSwatch--category4 { fill: var(--st-semantic-data-category4); stroke: var(--st-semantic-data-category4); background: var(--st-semantic-data-category4); }
  .st-radarChart__polygon--category5,
  .st-radarChart__point--category5,
  .st-radarChart__legendSwatch--category5 { fill: var(--st-semantic-data-category5); stroke: var(--st-semantic-data-category5); background: var(--st-semantic-data-category5); }
  .st-radarChart__polygon--category6,
  .st-radarChart__point--category6,
  .st-radarChart__legendSwatch--category6 { fill: var(--st-semantic-data-category6); stroke: var(--st-semantic-data-category6); background: var(--st-semantic-data-category6); }
  .st-radarChart__polygon--category7,
  .st-radarChart__point--category7,
  .st-radarChart__legendSwatch--category7 { fill: var(--st-semantic-data-category7); stroke: var(--st-semantic-data-category7); background: var(--st-semantic-data-category7); }
  .st-radarChart__polygon--category8,
  .st-radarChart__point--category8,
  .st-radarChart__legendSwatch--category8 { fill: var(--st-semantic-data-category8); stroke: var(--st-semantic-data-category8); background: var(--st-semantic-data-category8); }

  .st-radarChart__legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem) var(--st-spacing-4, 1rem);
    list-style: none;
    margin: var(--st-spacing-2, 0.5rem) 0 0;
    padding: 0;
  }

  .st-radarChart__legendItem {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    font-size: 0.75rem;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-radarChart__legendSwatch {
    display: inline-block;
    height: 0.625rem;
    width: 0.625rem;
  }

  .st-radarChart__tooltip {
    background: var(--st-semantic-surface-inverse);
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-semantic-text-inverse);
    display: inline-flex;
    font-size: 0.75rem;
    left: 50%;
    line-height: 1.2;
    padding: 0.375rem 0.5rem;
    pointer-events: none;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    white-space: nowrap;
    z-index: 1;
  }

  .st-radarChart__tooltipLabel {
    font-weight: 600;
  }
</style>
