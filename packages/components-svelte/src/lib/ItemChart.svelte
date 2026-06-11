<script lang="ts" module>
  /**
   * ItemChart (« parlement » / hémicycle) — API canonique (référence Svelte,
   * React/Vue doivent s'aligner).
   *
   * Chaque groupe apporte `value` POINTS (sièges). La somme des points est
   * disposée en plusieurs RANGÉES CONCENTRIQUES formant un demi-anneau du haut
   * (hémicycle). Les points d'un même groupe sont CONTIGUS et colorés par un ton
   * catégoriel (`categoryN`). On lit donc la taille relative des groupes à la
   * longueur de l'arc qu'ils occupent — façon répartition des sièges.
   *
   * Géométrie :
   *   - nombre de rangées = clamp(round(sqrt(total / 12)), 3, 5) tant qu'il reste
   *     des points (au moins 1 rangée).
   *   - les rangées ont des rayons régulièrement espacés ; le nombre de points
   *     par rangée est ∝ au rayon (les rangées extérieures portent plus de
   *     sièges), de sorte que l'espacement angulaire reste homogène.
   *   - chaque siège est posé sur un demi-cercle (de gauche π à droite 0, via le
   *     haut), tous les sièges étant ordonnés rangée par rangée puis attribués
   *     aux groupes dans l'ordre fourni → blocs contigus.
   *
   * Props obligatoires :
   *   data   ItemChartDatum[]  - {label, value, tone?}
   *   label  string            - aria-label du graphique (role=img)
   *
   * Props optionnelles :
   *   width   number  (défaut 480)
   *   height  number  (défaut 280)
   *   class   string
   *
   * NaN/négatif : `value` non-finie ou < 0 → 0 siège pour ce groupe. Total 0 →
   *   rendu vide sans crash. `value` est arrondie à l'entier le plus proche pour
   *   compter des sièges.
   */
  export type ItemChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type ItemChartDatum = {
    label: string;
    value: number;
    tone?: ItemChartTone;
  };

  export type ItemChartSeat = {
    x: number;
    y: number;
    r: number;
    tone: ItemChartTone;
    groupIndex: number;
  };

  const TONES: ItemChartTone[] = [
    "category1",
    "category2",
    "category3",
    "category4",
    "category5",
    "category6",
    "category7",
    "category8"
  ];

  export function seatCount(value: number): number {
    if (!Number.isFinite(value) || value < 0) return 0;
    return Math.round(value);
  }

  /**
   * Construit la liste ordonnée des sièges de l'hémicycle, puis affecte chaque
   * siège à un groupe dans l'ordre fourni (blocs contigus). Pur, sans état.
   */
  export function buildSeats(
    counts: number[],
    width: number,
    height: number
  ): { seats: ItemChartSeat[]; cx: number; cy: number } {
    const total = counts.reduce((sum, c) => sum + c, 0);
    const cx = width / 2;
    const cy = height - 8;
    if (total <= 0) return { seats: [], cx, cy };

    const rows = Math.max(1, Math.min(5, Math.round(Math.sqrt(total / 12)) || 1));
    const outerR = Math.max(Math.min(cx, cy) - 14, 1);
    const innerR = outerR * 0.42;
    const rowGap = rows > 1 ? (outerR - innerR) / (rows - 1) : 0;

    // Poids de chaque rangée ∝ son rayon (rangées extérieures = plus de sièges).
    const radii: number[] = [];
    let weightSum = 0;
    for (let r = 0; r < rows; r++) {
      const radius = rows > 1 ? innerR + rowGap * r : (innerR + outerR) / 2;
      radii.push(radius);
      weightSum += radius;
    }

    // Répartit `total` sièges sur les rangées au prorata du rayon (reste au plus
    // grand résidu) pour conserver exactement `total` sièges.
    const perRowFloat = radii.map((radius) => (total * radius) / weightSum);
    const perRow = perRowFloat.map((v) => Math.floor(v));
    let assigned = perRow.reduce((sum, c) => sum + c, 0);
    const residuals = perRowFloat
      .map((v, i) => ({ i, frac: v - Math.floor(v) }))
      .sort((a, b) => b.frac - a.frac);
    let ri = 0;
    while (assigned < total) {
      perRow[residuals[ri % residuals.length].i] += 1;
      assigned += 1;
      ri += 1;
    }

    // Rayon du point ≈ moitié de l'espacement de rangée, borné par l'arc.
    const seatR = Math.max(2, Math.min(rowGap > 0 ? rowGap * 0.34 : outerR * 0.12, outerR * 0.12));

    const ordered: { x: number; y: number; r: number }[] = [];
    for (let r = 0; r < rows; r++) {
      const radius = radii[r];
      const n = perRow[r];
      if (n <= 0) continue;
      // Demi-cercle de la GAUCHE (π) vers la DROITE (0) en passant par le HAUT.
      for (let s = 0; s < n; s++) {
        const t = n === 1 ? 0.5 : s / (n - 1);
        const angle = Math.PI - t * Math.PI;
        ordered.push({
          x: cx + radius * Math.cos(angle),
          y: cy - radius * Math.sin(angle),
          r: seatR
        });
      }
    }

    // Attribution des sièges ordonnés aux groupes (blocs contigus).
    const seats: ItemChartSeat[] = [];
    let cursor = 0;
    for (let g = 0; g < counts.length; g++) {
      const tone = TONES[g % TONES.length];
      for (let k = 0; k < counts[g] && cursor < ordered.length; k++) {
        const seat = ordered[cursor++];
        seats.push({ x: seat.x, y: seat.y, r: seat.r, tone, groupIndex: g });
      }
    }
    return { seats, cx, cy };
  }
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type ItemChartProps = {
    data: ItemChartDatum[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
  };

  let {
    data,
    label,
    width = 480,
    height = 280,
    class: className
  }: ItemChartProps = $props();

  let hoveredIndex: number | null = $state(null);

  const groups = $derived(
    data.map((datum, index) => ({
      datum,
      count: seatCount(datum.value),
      tone: datum.tone ?? TONES[index % TONES.length]
    }))
  );

  const layout = $derived(buildSeats(groups.map((g) => g.count), width, height));

  // Sièges avec le ton EFFECTIF du groupe (respecte un `tone` explicite).
  const seats = $derived(
    layout.seats.map((seat) => ({
      ...seat,
      tone: groups[seat.groupIndex]?.tone ?? seat.tone
    }))
  );

  const dataValueItems = $derived(
    groups.map((g) => `${g.datum.label}: ${g.count}`)
  );

  const total = $derived(groups.reduce((sum, g) => sum + g.count, 0));

  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredIndex = null;
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(index) ? index : null;
  }

  const classes = () => ["st-itemChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-itemChart__visual"
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
      {#each seats as seat, i (i)}
        <circle
          class="st-itemChart__seat st-itemChart__seat--{seat.tone}"
          class:st-itemChart__seat--dim={hoveredIndex !== null && hoveredIndex !== seat.groupIndex}
          cx={seat.x}
          cy={seat.y}
          r={seat.r}
          data-chart-index={seat.groupIndex}
        />
      {/each}
      {#if total > 0}
        <text
          class="st-itemChart__total"
          x={layout.cx}
          y={layout.cy - 6}
          text-anchor="middle"
        >
          {total}
        </text>
      {/if}
    </svg>
  </div>

  <ul class="st-itemChart__legend" aria-hidden="true">
    {#each groups as group, i (group.datum.label)}
      <li
        class="st-itemChart__legendItem"
        class:st-itemChart__legendItem--dim={hoveredIndex !== null && hoveredIndex !== i}
      >
        <span class="st-itemChart__swatch st-itemChart__swatch--{group.tone}"></span>
        <span class="st-itemChart__legendLabel">{group.datum.label}</span>
        <span class="st-itemChart__legendValue">{group.count}</span>
      </li>
    {/each}
  </ul>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && groups[hoveredIndex]}
    {@const group = groups[hoveredIndex]}
    <div class="st-itemChart__tooltip" role="presentation">
      <span class="st-itemChart__tooltipLabel">{group.datum.label}</span>
      <span class="st-itemChart__tooltipValue">{group.count}</span>
    </div>
  {/if}
</div>

<style>
  .st-itemChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    max-width: 100%;
    position: relative;
    width: 100%;
  }

  .st-itemChart svg,
  .st-itemChart__visual {
    display: block;
    overflow: visible;
  }

  .st-itemChart__seat {
    cursor: pointer;
    stroke: var(--st-semantic-surface-default);
    stroke-width: 1;
    transition: opacity 120ms ease;
  }

  .st-itemChart__seat--dim {
    opacity: 0.32;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-itemChart__seat {
      transition: none;
    }
  }

  .st-itemChart__seat--category1 { fill: var(--st-semantic-data-category1); }
  .st-itemChart__seat--category2 { fill: var(--st-semantic-data-category2); }
  .st-itemChart__seat--category3 { fill: var(--st-semantic-data-category3); }
  .st-itemChart__seat--category4 { fill: var(--st-semantic-data-category4); }
  .st-itemChart__seat--category5 { fill: var(--st-semantic-data-category5); }
  .st-itemChart__seat--category6 { fill: var(--st-semantic-data-category6); }
  .st-itemChart__seat--category7 { fill: var(--st-semantic-data-category7); }
  .st-itemChart__seat--category8 { fill: var(--st-semantic-data-category8); }

  .st-itemChart__total {
    fill: var(--st-semantic-text-primary);
    font-size: 1.5rem;
    font-weight: 700;
  }

  .st-itemChart__legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.875rem;
    list-style: none;
    margin: 0.5rem 0 0;
    padding: 0;
  }

  .st-itemChart__legendItem {
    align-items: center;
    display: inline-flex;
    font-size: 0.8125rem;
    gap: 0.375rem;
    transition: opacity 120ms ease;
  }

  .st-itemChart__legendItem--dim {
    opacity: 0.4;
  }

  .st-itemChart__swatch {
    border-radius: 999px;
    display: inline-block;
    height: 0.625rem;
    width: 0.625rem;
  }

  .st-itemChart__swatch--category1 { background: var(--st-semantic-data-category1); }
  .st-itemChart__swatch--category2 { background: var(--st-semantic-data-category2); }
  .st-itemChart__swatch--category3 { background: var(--st-semantic-data-category3); }
  .st-itemChart__swatch--category4 { background: var(--st-semantic-data-category4); }
  .st-itemChart__swatch--category5 { background: var(--st-semantic-data-category5); }
  .st-itemChart__swatch--category6 { background: var(--st-semantic-data-category6); }
  .st-itemChart__swatch--category7 { background: var(--st-semantic-data-category7); }
  .st-itemChart__swatch--category8 { background: var(--st-semantic-data-category8); }

  .st-itemChart__legendLabel {
    color: var(--st-semantic-text-primary);
    font-weight: 500;
  }

  .st-itemChart__legendValue {
    color: var(--st-semantic-text-secondary);
    font-variant-numeric: tabular-nums;
  }

  .st-itemChart__tooltip {
    background: var(--st-semantic-surface-inverse);
    border-radius: var(--st-radius-sm);
    color: var(--st-semantic-text-inverse);
    display: inline-flex;
    flex-direction: column;
    font-size: 0.75rem;
    gap: 0.125rem;
    left: 50%;
    line-height: 1.2;
    padding: 0.375rem 0.5rem;
    pointer-events: none;
    position: absolute;
    top: 0.5rem;
    transform: translateX(-50%);
    white-space: nowrap;
    z-index: 1;
  }

  .st-itemChart__tooltipLabel { font-weight: 600; }
  .st-itemChart__tooltipValue { opacity: 0.85; }
</style>
