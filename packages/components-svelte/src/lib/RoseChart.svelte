<script lang="ts" module>
  /**
   * RoseChart (nightingale / polar area) - API canonique (référence Svelte,
   * React/Vue doivent s'aligner)
   *
   * Diagramme polaire de Florence Nightingale : N secteurs d'angle ÉGAL
   * (360° / N), le RAYON de chaque secteur ∝ value (c'est le rayon qui porte
   * l'information, PAS l'angle - voilà ce qui le distingue d'un camembert où
   * l'angle porte l'information et le rayon est constant).
   *
   * Échelle du rayon : rayon = sqrt(value / maxValue) * R.
   *   La racine carrée rend l'AIRE du secteur proportionnelle à la valeur
   *   (aire ∝ rayon²), donc honnête perceptuellement - un secteur deux fois
   *   plus « gros » à l'œil vaut bien deux fois plus. Un mapping linéaire
   *   (value/maxValue * R) exagérerait les grandes valeurs (aire ∝ value²).
   *
   * Props obligatoires :
   *   data   RoseChartDatum[]  - {label, value, tone?}
   *   label  string            - aria-label du graphique
   *
   * Props optionnelles :
   *   width   number  (défaut 320) - largeur du viewBox en px
   *   height  number  (défaut 320) - hauteur du viewBox en px
   *   class   string              - classe CSS supplémentaire
   *
   * Labels : le libellé est posé sur le secteur si son rayon est assez grand
   *   (> 40% de R). Couleur de texte calculée par contrastTextForTone() pour
   *   garantir le contraste WCAG sur chaque fond catégoriel - pas de blanc fixe.
   *
   * NaN/négatif : les valeurs non-finies ou ≤ 0 sont ignorées (rayon 0, pas de
   *   secteur dessiné) et exclues du calcul de maxValue. Tableau vide → rendu
   *   vide sans crash.
   */
  export type RoseChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type RoseChartDatum = {
    label: string;
    value: number;
    tone?: RoseChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";
  import { contrastTextForTone } from "./chartContrast.js";

  type RoseChartProps = {
    data: RoseChartDatum[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
  };

  let {
    data,
    label,
    width = 320,
    height = 320,
    class: className
  }: RoseChartProps = $props();

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

  function safeValue(value: number): number {
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  function formatNumber(value: number): string {
    if (!Number.isFinite(value)) return "0";
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(2).replace(/\.?0+$/, "");
  }

  function point(cx: number, cy: number, radius: number, angle: number) {
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  }

  function sectorPath(cx: number, cy: number, radius: number, start: number, end: number): string {
    const safeEnd = Math.min(end, start + Math.PI * 2 - 0.0001);
    const large = safeEnd - start > Math.PI ? 1 : 0;
    const outerStart = point(cx, cy, radius, start);
    const outerEnd = point(cx, cy, radius, safeEnd);
    return `M ${cx} ${cy} L ${outerStart.x} ${outerStart.y} A ${radius} ${radius} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y} Z`;
  }

  let hoveredIndex: number | null = $state(null);

  const sectors = $derived.by(() => {
    const cx = width / 2;
    const cy = height / 2;
    const outerLimit = Math.max(Math.min(width, height) / 2 - 6, 1);
    const count = data.length;
    if (count === 0) return [];

    const maxValue = Math.max(0, ...data.map((datum) => safeValue(datum.value)));
    const safeMax = maxValue > 0 ? maxValue : 1;
    const sweep = (Math.PI * 2) / count;

    return data.map((datum, index) => {
      const value = safeValue(datum.value);
      // sqrt → aire du secteur ∝ value (honnête perceptuellement)
      const radius = Math.sqrt(value / safeMax) * outerLimit;
      const start = -Math.PI / 2 + sweep * index;
      const end = start + sweep;
      const midAngle = (start + end) / 2;
      const labelPoint = point(cx, cy, radius * 0.62, midAngle);
      return {
        datum,
        value,
        tone: datum.tone ?? TONES[index % TONES.length],
        radius,
        start,
        end,
        path: value > 0 ? sectorPath(cx, cy, radius, start, end) : "",
        labelX: labelPoint.x,
        labelY: labelPoint.y,
        // label posé si le secteur est assez grand (rayon > 40% de R)
        showLabel: value > 0 && radius > outerLimit * 0.4
      };
    });
  });

  const dataValueItems = $derived(
    data.map((datum) => `${datum.label}: ${formatNumber(safeValue(datum.value))}`)
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

  const classes = () => ["st-roseChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-roseChart__visual"
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
      {#each sectors as sector, i (sector.datum.label)}
        {#if sector.path}
          <path
            class="st-roseChart__sector st-roseChart__sector--{sector.tone}"
            class:st-roseChart__sector--dim={hoveredIndex !== null && hoveredIndex !== i}
            d={sector.path}
            data-chart-index={i}
          />
        {/if}
      {/each}

      {#each sectors as sector (sector.datum.label)}
        {#if sector.showLabel}
          <text
            class="st-roseChart__label"
            x={sector.labelX}
            y={sector.labelY}
            text-anchor="middle"
            dominant-baseline="middle"
            fill={contrastTextForTone(sector.tone)}
          >
            {sector.datum.label}
          </text>
        {/if}
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && sectors[hoveredIndex] && sectors[hoveredIndex].value > 0}
    {@const sector = sectors[hoveredIndex]}
    <div
      class="st-roseChart__tooltip"
      role="presentation"
      style="left: {(sector.labelX / width) * 100}%; top: {(sector.labelY / height) * 100}%"
    >
      <span class="st-roseChart__tooltipLabel">{sector.datum.label}</span>
      <span class="st-roseChart__tooltipValue">{formatNumber(sector.value)}</span>
    </div>
  {/if}
</div>

<style>
  .st-roseChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    max-width: 100%;
    position: relative;
    width: 100%;
  }

  .st-roseChart svg,
  .st-roseChart__visual {
    display: block;
    overflow: visible;
  }

  .st-roseChart__sector {
    cursor: pointer;
    fill-opacity: 0.82;
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1;
    transition: opacity 120ms ease;
  }

  .st-roseChart__sector--dim {
    opacity: 0.4;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-roseChart__sector {
      transition: none;
    }
  }

  .st-roseChart__sector--category1 { fill: var(--st-semantic-data-category1); }
  .st-roseChart__sector--category2 { fill: var(--st-semantic-data-category2); }
  .st-roseChart__sector--category3 { fill: var(--st-semantic-data-category3); }
  .st-roseChart__sector--category4 { fill: var(--st-semantic-data-category4); }
  .st-roseChart__sector--category5 { fill: var(--st-semantic-data-category5); }
  .st-roseChart__sector--category6 { fill: var(--st-semantic-data-category6); }
  .st-roseChart__sector--category7 { fill: var(--st-semantic-data-category7); }
  .st-roseChart__sector--category8 { fill: var(--st-semantic-data-category8); }

  .st-roseChart__label {
    /* fill calculé par contrastTextForTone() en inline - pas de blanc fixe */
    font-size: 0.68rem;
    font-weight: 650;
    pointer-events: none;
  }

  .st-roseChart__tooltip {
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
    transform: translate(-50%, -115%);
    white-space: nowrap;
    z-index: 1;
  }

  .st-roseChart__tooltipLabel {
    font-weight: 600;
  }

  .st-roseChart__tooltipValue {
    opacity: 0.85;
  }
</style>
