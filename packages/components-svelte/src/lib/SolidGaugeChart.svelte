<script lang="ts" module>
  /**
   * SolidGaugeChart - arc PLEIN / anneau de progression (distinct du GaugeChart
   * à aiguille). Une piste de fond + un arc rempli proportionnel à `value`, avec
   * la valeur affichée au centre. Les seuils colorent l'arc rempli selon la zone
   * atteinte par la valeur. API canonique (référence Svelte, React/Vue alignés).
   *
   * Réutilise les mêmes tons/seuils que GaugeChart : tone ∈ neutral | info |
   * success | warning | error | category1..8.
   */
  export type SolidGaugeTone =
    | "neutral" | "info" | "success" | "warning" | "error"
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  /**
   * Seuil de coloration. La zone s'étend depuis le seuil précédent (ou le
   * minimum) jusqu'à `value`. `tone` choisit la couleur de l'arc rempli quand la
   * valeur tombe dans cette zone.
   */
  export type SolidGaugeThreshold = {
    value: number;
    tone: SolidGaugeTone;
  };

  export type SolidGaugeFormat = "number" | "percent";
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type SolidGaugeChartProps = {
    value: number;
    min?: number;
    max?: number;
    /** Bandes colorées. Triées par `value` croissante : la zone contenant la valeur teinte l'arc rempli. */
    thresholds?: SolidGaugeThreshold[];
    /** Rayon intérieur de l'anneau, en fraction du rayon (0..1). */
    innerRadius?: number;
    /** Libellé décrivant la jauge (a11y + texte sous la valeur). */
    label?: string;
    /** Format de la valeur centrale. */
    format?: SolidGaugeFormat;
    /** Suffixe d'unité (ignoré pour `percent`). */
    unit?: string;
    /** Diamètre du SVG. */
    size?: number;
    /** Angle de départ en degrés (0 = est, sens horaire). */
    startAngle?: number;
    /** Angle de fin en degrés. */
    endAngle?: number;
    class?: string;
  };

  let {
    value,
    min = 0,
    max = 100,
    thresholds,
    innerRadius = 0.72,
    label,
    format = "number",
    unit,
    size = 220,
    startAngle = 180,
    endAngle = 360,
    class: className
  }: SolidGaugeChartProps = $props();

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const span = $derived(Math.max(max - min, 0));
  const clamped = $derived(Math.min(Math.max(value, min), max));
  const frac = $derived(span > 0 ? (clamped - min) / span : 0);

  // Épaisseur dérivée du rayon intérieur (anneau).
  const cx = $derived(size / 2);
  const r = $derived(size / 2 - 2);
  const innerR = $derived(Math.min(Math.max(innerRadius, 0), 0.95) * r);
  const thickness = $derived(Math.max(r - innerR, 1));
  const trackR = $derived((r + innerR) / 2);
  const a0 = $derived(toRad(startAngle));
  const a1 = $derived(toRad(endAngle));
  const totalAngle = $derived(a1 - a0);

  const polar = (radius: number, angle: number, centerX: number, centerY: number): [number, number] => [
    centerX + radius * Math.cos(angle),
    centerY + radius * Math.sin(angle)
  ];

  // Hauteur réelle de l'arc pour cadrer le viewBox (demi-cercle → moitié).
  const geometry = $derived.by(() => {
    const cyRaw = size / 2;
    const samples = 64;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i <= samples; i++) {
      const a = a0 + (totalAngle * i) / samples;
      const yOuter = cyRaw + r * Math.sin(a);
      minY = Math.min(minY, yOuter);
      maxY = Math.max(maxY, yOuter);
    }
    minY = Math.min(minY, cyRaw - r);
    const vbHeight = Math.min(maxY, size) - Math.max(minY, 0);
    return { cy: cyRaw, vbTop: Math.max(minY, 0), vbHeight: Math.max(vbHeight, thickness) };
  });

  const cy = $derived(geometry.cy);

  function arcPath(fromFrac: number, toFrac: number): string {
    const from = a0 + totalAngle * fromFrac;
    const to = a0 + totalAngle * toFrac;
    const [x0, y0] = polar(trackR, from, cx, cy);
    const [x1, y1] = polar(trackR, to, cx, cy);
    const large = Math.abs(to - from) > Math.PI ? 1 : 0;
    const sweep = totalAngle >= 0 ? 1 : 0;
    return `M ${x0} ${y0} A ${trackR} ${trackR} 0 ${large} ${sweep} ${x1} ${y1}`;
  }

  // Tons triés par seuil croissant : la zone contenant la valeur teinte l'arc.
  const sortedThresholds = $derived.by(() => {
    if (!thresholds || thresholds.length === 0 || span <= 0) return [];
    return [...thresholds].sort((a, b) => a.value - b.value);
  });

  const activeTone = $derived.by((): SolidGaugeTone | null => {
    if (sortedThresholds.length === 0) return null;
    let tone: SolidGaugeTone = sortedThresholds[0].tone;
    for (const t of sortedThresholds) {
      if (clamped >= t.value) tone = t.tone;
    }
    return tone;
  });

  const formatted = $derived.by(() => {
    if (format === "percent") {
      const pct = span > 0 ? Math.round(frac * 100) : 0;
      return `${pct}%`;
    }
    const num = Number.isInteger(clamped) ? String(clamped) : clamped.toFixed(1);
    return unit ? `${num} ${unit}` : num;
  });

  const ariaValueText = $derived(label ? `${label}: ${formatted}` : formatted);

  const classes = $derived(["st-solidGaugeChart", className].filter(Boolean).join(" "));
  const dataValueItems = $derived([
    `${label ? `${label}: ` : ""}${formatted} (min ${min}, max ${max})`
  ]);

  const progressClass = $derived(
    activeTone
      ? `st-solidGaugeChart__progress st-solidGaugeChart__progress--${activeTone}`
      : "st-solidGaugeChart__progress"
  );
</script>

<div class={classes}>
  <div
    class="st-solidGaugeChart__visual"
    role="meter"
    aria-valuenow={clamped}
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuetext={ariaValueText}
    aria-label={label}
  >
    <svg
      viewBox="0 {geometry.vbTop} {size} {geometry.vbHeight}"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
      <!-- Piste de fond -->
      <path class="st-solidGaugeChart__track" d={arcPath(0, 1)} fill="none" stroke-width={thickness} />

      <!-- Arc de progression rempli -->
      {#if frac > 0}
        <path
          class={progressClass}
          d={arcPath(0, frac)}
          fill="none"
          stroke-width={thickness}
        />
      {/if}

      <!-- Valeur centrale -->
      <text
        class="st-solidGaugeChart__value"
        x={cx}
        y={cy - thickness * 0.1}
        text-anchor="middle"
        dominant-baseline="auto"
      >
        {formatted}
      </text>
      {#if label}
        <text
          class="st-solidGaugeChart__label"
          x={cx}
          y={cy + thickness * 0.35}
          text-anchor="middle"
          dominant-baseline="hanging"
        >
          {label}
        </text>
      {/if}
    </svg>
  </div>

  <ChartDataList label={label ?? "gauge"} items={dataValueItems} />
</div>

<style>
  .st-solidGaugeChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    max-width: 100%;
    position: relative;
  }

  .st-solidGaugeChart__visual,
  .st-solidGaugeChart svg {
    display: block;
    overflow: visible;
  }

  .st-solidGaugeChart__track {
    stroke: var(--st-semantic-surface-subtle);
    stroke-linecap: round;
  }

  .st-solidGaugeChart__progress {
    stroke: var(--st-semantic-action-primary);
    stroke-linecap: round;
    transition: d var(--st-motion-fast, 200ms) var(--st-motion-easing, ease);
  }

  .st-solidGaugeChart__value {
    fill: var(--st-semantic-text-primary);
    font-size: 1.5rem;
    font-variant-numeric: tabular-nums;
    font-weight: 700;
  }

  .st-solidGaugeChart__label {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.8125rem;
    font-weight: 500;
  }

  /* Tons sémantiques de feedback */
  .st-solidGaugeChart__progress--neutral { stroke: var(--st-semantic-border-strong, var(--st-semantic-surface-subtle)); }
  .st-solidGaugeChart__progress--info { stroke: var(--st-semantic-feedback-info, var(--st-semantic-action-primary)); }
  .st-solidGaugeChart__progress--success { stroke: var(--st-semantic-feedback-success); }
  .st-solidGaugeChart__progress--warning { stroke: var(--st-semantic-feedback-warning); }
  .st-solidGaugeChart__progress--error { stroke: var(--st-semantic-feedback-error); }

  /* Tons catégoriels data */
  .st-solidGaugeChart__progress--category1 { stroke: var(--st-semantic-data-category1); }
  .st-solidGaugeChart__progress--category2 { stroke: var(--st-semantic-data-category2); }
  .st-solidGaugeChart__progress--category3 { stroke: var(--st-semantic-data-category3); }
  .st-solidGaugeChart__progress--category4 { stroke: var(--st-semantic-data-category4); }
  .st-solidGaugeChart__progress--category5 { stroke: var(--st-semantic-data-category5); }
  .st-solidGaugeChart__progress--category6 { stroke: var(--st-semantic-data-category6); }
  .st-solidGaugeChart__progress--category7 { stroke: var(--st-semantic-data-category7); }
  .st-solidGaugeChart__progress--category8 { stroke: var(--st-semantic-data-category8); }

  @media (prefers-reduced-motion: reduce) {
    .st-solidGaugeChart__progress {
      transition: none;
    }
  }
</style>
