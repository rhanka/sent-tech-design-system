<script lang="ts" module>
  /**
   * VariablePieChart (camembert à rayon variable) - API canonique (référence
   * Svelte, React/Vue doivent s'aligner)
   *
   * Camembert où chaque part porte DEUX informations :
   *   - l'ANGLE de la part ∝ value (les angles somment à 360°, comme un
   *     camembert classique) ;
   *   - le RAYON de la part ∝ z (une 2e métrique), mappé linéairement entre un
   *     rayon minimum et un rayon maximum. C'est ce rayon variable qui distingue
   *     ce graphique d'un camembert ordinaire (rayon constant) et d'une rose de
   *     Nightingale (angles égaux, rayon ∝ value).
   *
   * Échelle du rayon : radius = rMin + (z - zMin) / (zMax - zMin) * (rMax - rMin).
   *   Mapping linéaire entre la plus petite et la plus grande valeur de z. Si
   *   toutes les valeurs de z sont égales, toutes les parts prennent rMax.
   *
   * Props obligatoires :
   *   data   VariablePieChartDatum[]  - {label, value, z, tone?}
   *   label  string                   - aria-label du graphique
   *
   * Props optionnelles :
   *   width   number  (défaut 360) - largeur du viewBox en px
   *   height  number  (défaut 360) - hauteur du viewBox en px
   *   class   string              - classe CSS supplémentaire
   *
   * Labels : le libellé est posé sur la part si elle est assez grande (angle
   *   suffisant et rayon > 40% de R). Couleur de texte calculée par
   *   contrastTextForTone() pour garantir le contraste WCAG sur chaque fond
   *   catégoriel - pas de blanc fixe.
   *
   * NaN/négatif : les data dont value est non-finie ou ≤ 0 sont ignorées
   *   (filtrées). z non-fini est ramené à 0. Tableau vide → rendu vide sans
   *   crash.
   */
  export type VariablePieChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type VariablePieChartDatum = {
    label: string;
    value: number;
    z: number;
    tone?: VariablePieChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";
  import { contrastTextForTone } from "./chartContrast.js";

  type VariablePieChartProps = {
    data: VariablePieChartDatum[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
  };

  let {
    data,
    label,
    width = 360,
    height = 360,
    class: className
  }: VariablePieChartProps = $props();

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

  function safeZ(z: number): number {
    return Number.isFinite(z) ? z : 0;
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
    const rMin = outerLimit * 0.35;
    const rMax = outerLimit;

    // Filtre les parts à value ≤ 0 ou non-finie (angle nul → invisibles).
    const visible = data.filter((datum) => safeValue(datum.value) > 0);
    if (visible.length === 0) return [];

    const total = visible.reduce((sum, datum) => sum + safeValue(datum.value), 0);
    if (total <= 0) return [];

    const zValues = visible.map((datum) => safeZ(datum.z));
    const zMin = Math.min(...zValues);
    const zMax = Math.max(...zValues);
    const zSpan = zMax - zMin;

    const TWO_PI = Math.PI * 2;
    let angle = -Math.PI / 2; // départ en haut

    return visible.map((datum, index) => {
      const value = safeValue(datum.value);
      const z = safeZ(datum.z);
      // rayon ∝ z, mappé linéairement entre rMin et rMax.
      const radius = zSpan > 0 ? rMin + ((z - zMin) / zSpan) * (rMax - rMin) : rMax;
      const span = Math.min((value / total) * TWO_PI, TWO_PI - 0.0001);
      const start = angle;
      const end = angle + span;
      angle = end;
      const midAngle = (start + end) / 2;
      const labelPoint = point(cx, cy, radius * 0.62, midAngle);
      return {
        datum,
        value,
        z,
        tone: datum.tone ?? TONES[index % TONES.length],
        radius,
        start,
        end,
        path: sectorPath(cx, cy, radius, start, end),
        labelX: labelPoint.x,
        labelY: labelPoint.y,
        // label posé si la part est assez ouverte et assez grande
        showLabel: span > 0.25 && radius > outerLimit * 0.4
      };
    });
  });

  const dataValueItems = $derived(
    data
      .filter((datum) => safeValue(datum.value) > 0)
      .map((datum) => `${datum.label}: ${formatNumber(safeValue(datum.value))}`)
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

  const classes = () => ["st-variablePieChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-variablePieChart__visual"
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
        <path
          class="st-variablePieChart__sector st-variablePieChart__sector--{sector.tone}"
          class:st-variablePieChart__sector--dim={hoveredIndex !== null && hoveredIndex !== i}
          d={sector.path}
          data-chart-index={i}
        />
      {/each}

      {#each sectors as sector (sector.datum.label)}
        {#if sector.showLabel}
          <text
            class="st-variablePieChart__label"
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

  {#if hoveredIndex !== null && sectors[hoveredIndex]}
    {@const sector = sectors[hoveredIndex]}
    <div
      class="st-variablePieChart__tooltip"
      role="presentation"
      style="left: {(sector.labelX / width) * 100}%; top: {(sector.labelY / height) * 100}%"
    >
      <span class="st-variablePieChart__tooltipLabel">{sector.datum.label}</span>
      <span class="st-variablePieChart__tooltipValue">{formatNumber(sector.value)} · {formatNumber(sector.z)}</span>
    </div>
  {/if}
</div>

<style>
  .st-variablePieChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    max-width: 100%;
    position: relative;
    width: 100%;
  }

  .st-variablePieChart svg,
  .st-variablePieChart__visual {
    display: block;
    overflow: visible;
  }

  .st-variablePieChart__sector {
    cursor: pointer;
    fill-opacity: 0.82;
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1;
    transition: opacity 120ms ease;
  }

  .st-variablePieChart__sector--dim {
    opacity: 0.4;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-variablePieChart__sector {
      transition: none;
    }
  }

  .st-variablePieChart__sector--category1 { fill: var(--st-semantic-data-category1); }
  .st-variablePieChart__sector--category2 { fill: var(--st-semantic-data-category2); }
  .st-variablePieChart__sector--category3 { fill: var(--st-semantic-data-category3); }
  .st-variablePieChart__sector--category4 { fill: var(--st-semantic-data-category4); }
  .st-variablePieChart__sector--category5 { fill: var(--st-semantic-data-category5); }
  .st-variablePieChart__sector--category6 { fill: var(--st-semantic-data-category6); }
  .st-variablePieChart__sector--category7 { fill: var(--st-semantic-data-category7); }
  .st-variablePieChart__sector--category8 { fill: var(--st-semantic-data-category8); }

  .st-variablePieChart__label {
    /* fill calculé par contrastTextForTone() en inline - pas de blanc fixe */
    font-size: 0.68rem;
    font-weight: 650;
    pointer-events: none;
  }

  .st-variablePieChart__tooltip {
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

  .st-variablePieChart__tooltipLabel {
    font-weight: 600;
  }

  .st-variablePieChart__tooltipValue {
    opacity: 0.85;
  }
</style>
