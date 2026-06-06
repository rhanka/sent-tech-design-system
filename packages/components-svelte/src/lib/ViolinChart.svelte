<script lang="ts" module>
  /**
   * ViolinChart - API canonique (référence Svelte, React/Vue doivent s'aligner)
   *
   * Trace la DENSITÉ de distribution de chaque catégorie sous forme de violon :
   * une forme symétrique (miroir gauche/droite) dont la largeur, à une hauteur Y
   * donnée, est proportionnelle au nombre de points autour de cette valeur.
   *
   * Densité : histogramme à BINS fixes (défaut 20) sur l'axe Y commun à toutes
   *   les catégories. Chaque bin compte les points qui y tombent ; la largeur du
   *   violon en ce bin = compte / maxCount * demi-largeur de bande. L'échelle de
   *   densité est NORMALISÉE par violon (chaque violon atteint sa pleine largeur
   *   à son propre mode) - comparaison de FORME, pas de volume.
   *
   * Échelle Y : commune à toutes les catégories (min/max global sur toutes les
   *   valeurs finies) → les violons sont alignés et comparables verticalement.
   *
   * Médiane / quartiles : trait central (médiane) + boîte fine q1–q3 superposés,
   *   activables via `quartiles` (défaut true).
   *
   * Props obligatoires :
   *   data   ViolinChartDatum[]  - {label, values: number[], tone?}
   *   label  string              - aria-label du graphique
   *
   * Props optionnelles :
   *   bins        number   (défaut 20)   - nombre de bins de densité
   *   quartiles   boolean  (défaut true) - médiane + boîte q1–q3
   *   width       number   (défaut 480)  - largeur du viewBox en px
   *   height      number   (défaut 280)  - hauteur du viewBox en px
   *   class       string                 - classe CSS supplémentaire
   *
   * NaN/vide : les valeurs non-finies sont exclues (filter Number.isFinite).
   *   Une catégorie sans valeur finie est ignorée (skip). Tableau vide → rendu
   *   vide sans crash.
   */
  export type ViolinChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type ViolinChartDatum = {
    label: string;
    values: number[];
    tone?: ViolinChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type ViolinChartProps = {
    data: ViolinChartDatum[];
    label: string;
    bins?: number;
    quartiles?: boolean;
    width?: number;
    height?: number;
    class?: string;
  };

  let {
    data,
    label,
    bins = 20,
    quartiles = true,
    width = 480,
    height = 280,
    class: className
  }: ViolinChartProps = $props();

  const MARGIN = { top: 16, right: 20, bottom: 38, left: 48 };
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

  function formatNumber(value: number): string {
    if (!Number.isFinite(value)) return "0";
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(2).replace(/\.?0+$/, "");
  }

  function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number) {
    if (d1 === d0) return r0;
    return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
  }

  function quantile(sorted: number[], q: number): number {
    if (sorted.length === 0) return 0;
    if (sorted.length === 1) return sorted[0];
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    const next = sorted[base + 1];
    return next !== undefined ? sorted[base] + rest * (next - sorted[base]) : sorted[base];
  }

  let hoveredIndex: number | null = $state(null);

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));
  const binCount = $derived(Math.max(1, Math.floor(bins)));

  // Catégories avec au moins une valeur finie (les autres sont ignorées).
  const cleaned = $derived(
    data
      .map((datum, index) => ({
        datum,
        index,
        finite: datum.values.filter(Number.isFinite)
      }))
      .filter((entry) => entry.finite.length > 0)
  );

  const domain = $derived.by(() => {
    const all = cleaned.flatMap((entry) => entry.finite);
    if (all.length === 0) return { min: 0, max: 1 };
    const min = Math.min(...all);
    const max = Math.max(...all);
    if (min === max) {
      const pad = Math.max(Math.abs(max), 1) * 0.1;
      return { min: min - pad, max: max + pad };
    }
    const pad = (max - min) * 0.06;
    return { min: min - pad, max: max + pad };
  });

  const violins = $derived.by(() => {
    if (cleaned.length === 0) return [];
    const band = plotWidth / cleaned.length;
    const halfWidth = Math.min(54, Math.max(14, band * 0.36));
    const step = (domain.max - domain.min) / binCount;
    const yOf = (value: number) => MARGIN.top + scaleLinear(value, domain.min, domain.max, plotHeight, 0);

    return cleaned.map((entry, position) => {
      const cx = MARGIN.left + band * (position + 0.5);
      const tone = entry.datum.tone ?? TONES[entry.index % TONES.length];

      // Histogramme de densité sur l'axe Y commun.
      const counts = new Array<number>(binCount).fill(0);
      for (const value of entry.finite) {
        const raw = step > 0 ? Math.floor((value - domain.min) / step) : 0;
        const bin = Math.max(0, Math.min(binCount - 1, raw));
        counts[bin] += 1;
      }
      const maxCount = Math.max(1, ...counts);

      // Largeur du violon par bin (normalisée par catégorie).
      const profile = counts.map((count, bin) => {
        const center = domain.min + step * (bin + 0.5);
        return {
          y: yOf(center),
          w: (count / maxCount) * halfWidth
        };
      });

      // Chemin fermé : côté droit (haut → bas) puis côté gauche (bas → haut).
      const right = profile.map((p) => `${cx + p.w},${p.y}`);
      const left = [...profile].reverse().map((p) => `${cx - p.w},${p.y}`);
      const path = `M ${right.join(" L ")} L ${left.join(" L ")} Z`;

      const sorted = [...entry.finite].sort((a, b) => a - b);
      const median = quantile(sorted, 0.5);
      const q1 = quantile(sorted, 0.25);
      const q3 = quantile(sorted, 0.75);

      return {
        datum: entry.datum,
        tone,
        cx,
        path,
        halfWidth,
        n: entry.finite.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        median,
        medianY: yOf(median),
        q1Y: yOf(q1),
        q3Y: yOf(q3),
        boxWidth: Math.max(halfWidth * 0.4, 4)
      };
    });
  });

  const dataValueItems = $derived(
    violins.map(
      (v) =>
        `${v.datum.label}: ${v.n} points, min ${formatNumber(v.min)}, median ${formatNumber(v.median)}, max ${formatNumber(v.max)}`
    )
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

  const classes = () => ["st-violinChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-violinChart__visual"
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
      <line class="st-violinChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
      <line class="st-violinChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

      {#each violins as violin, i (violin.datum.label)}
        <path
          class="st-violinChart__shape st-violinChart__shape--{violin.tone}"
          class:st-violinChart__shape--dim={hoveredIndex !== null && hoveredIndex !== i}
          d={violin.path}
          data-chart-index={i}
        />
        {#if quartiles}
          <rect
            class="st-violinChart__box"
            x={violin.cx - violin.boxWidth / 2}
            y={Math.min(violin.q1Y, violin.q3Y)}
            width={violin.boxWidth}
            height={Math.max(Math.abs(violin.q1Y - violin.q3Y), 1)}
            data-chart-index={i}
          />
          <line
            class="st-violinChart__median"
            x1={violin.cx - violin.boxWidth / 2}
            x2={violin.cx + violin.boxWidth / 2}
            y1={violin.medianY}
            y2={violin.medianY}
            data-chart-index={i}
          />
        {/if}
        <text class="st-violinChart__label" x={violin.cx} y={height - MARGIN.bottom + 16} text-anchor="middle">
          {violin.datum.label}
        </text>
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && violins[hoveredIndex]}
    {@const violin = violins[hoveredIndex]}
    <div
      class="st-violinChart__tooltip"
      role="presentation"
      style="left: {(violin.cx / width) * 100}%; top: {(violin.medianY / height) * 100}%"
    >
      <span class="st-violinChart__tooltipLabel">{violin.datum.label}</span>
      <span class="st-violinChart__tooltipValue">Median {formatNumber(violin.median)}</span>
    </div>
  {/if}
</div>

<style>
  .st-violinChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    max-width: 100%;
    position: relative;
    width: 100%;
  }

  .st-violinChart svg,
  .st-violinChart__visual {
    display: block;
    overflow: visible;
  }

  .st-violinChart__axis {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-violinChart__shape {
    cursor: pointer;
    fill-opacity: 0.72;
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1;
    transition: opacity 120ms ease;
  }

  .st-violinChart__shape--dim {
    opacity: 0.4;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-violinChart__shape {
      transition: none;
    }
  }

  .st-violinChart__shape--category1 { fill: var(--st-semantic-data-category1); }
  .st-violinChart__shape--category2 { fill: var(--st-semantic-data-category2); }
  .st-violinChart__shape--category3 { fill: var(--st-semantic-data-category3); }
  .st-violinChart__shape--category4 { fill: var(--st-semantic-data-category4); }
  .st-violinChart__shape--category5 { fill: var(--st-semantic-data-category5); }
  .st-violinChart__shape--category6 { fill: var(--st-semantic-data-category6); }
  .st-violinChart__shape--category7 { fill: var(--st-semantic-data-category7); }
  .st-violinChart__shape--category8 { fill: var(--st-semantic-data-category8); }

  .st-violinChart__box {
    fill: var(--st-semantic-surface-default, Canvas);
    fill-opacity: 0.85;
    stroke: var(--st-semantic-text-secondary);
    stroke-width: 1;
  }

  .st-violinChart__median {
    stroke: var(--st-semantic-text-primary);
    stroke-width: 2;
  }

  .st-violinChart__label {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
  }

  .st-violinChart__tooltip {
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

  .st-violinChart__tooltipLabel {
    font-weight: 600;
  }

  .st-violinChart__tooltipValue {
    opacity: 0.85;
  }
</style>
