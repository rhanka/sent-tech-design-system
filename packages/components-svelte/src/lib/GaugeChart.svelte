<script lang="ts" module>
  export type GaugeChartTone =
    | "neutral" | "info" | "success" | "warning" | "error"
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  /**
   * Seuil de coloration. La bande s'étend depuis `value` (ou le minimum)
   * jusqu'au seuil suivant (ou le maximum). `tone` choisit la couleur.
   */
  export type GaugeChartThreshold = {
    value: number;
    tone: GaugeChartTone;
  };

  export type GaugeChartFormat = "number" | "percent";
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type GaugeChartProps = {
    value: number;
    min?: number;
    max?: number;
    /** Bandes colorées sur la piste. Triées par `value` croissante. */
    thresholds?: GaugeChartThreshold[];
    /** Libellé décrivant la jauge (a11y + texte sous la valeur). */
    label?: string;
    /** Format de la valeur centrale. */
    format?: GaugeChartFormat;
    /** Suffixe d'unité (ignoré pour `percent`). */
    unit?: string;
    /** Diamètre du SVG. */
    size?: number;
    /** Épaisseur de l'arc. */
    thickness?: number;
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
    label,
    format = "number",
    unit,
    size = 220,
    thickness = 22,
    startAngle = 180,
    endAngle = 360,
    class: className
  }: GaugeChartProps = $props();

  const TAU = Math.PI * 2;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const span = $derived(Math.max(max - min, 0));
  const clamped = $derived(Math.min(Math.max(value, min), max));
  const frac = $derived(span > 0 ? (clamped - min) / span : 0);

  // Géométrie commune.
  const cx = $derived(size / 2);
  const r = $derived(size / 2 - thickness / 2 - 2);
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
    // Échantillonnage des extrema y/x pour un cadrage stable quel que soit l'angle.
    const samples = 64;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i <= samples; i++) {
      const a = a0 + (totalAngle * i) / samples;
      const yOuter = cyRaw + (r + thickness / 2) * Math.sin(a);
      minY = Math.min(minY, yOuter);
      maxY = Math.max(maxY, yOuter);
    }
    minY = Math.min(minY, cyRaw - (r + thickness / 2));
    const vbHeight = Math.min(maxY, size) - Math.max(minY, 0);
    return { cy: cyRaw, vbTop: Math.max(minY, 0), vbHeight: Math.max(vbHeight, thickness) };
  });

  const cy = $derived(geometry.cy);

  function arcPath(fromFrac: number, toFrac: number): string {
    const from = a0 + totalAngle * fromFrac;
    const to = a0 + totalAngle * toFrac;
    const [x0, y0] = polar(r, from, cx, cy);
    const [x1, y1] = polar(r, to, cx, cy);
    const large = Math.abs(to - from) > Math.PI ? 1 : 0;
    const sweep = totalAngle >= 0 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`;
  }

  // Bandes colorées issues des seuils.
  const bands = $derived.by(() => {
    if (!thresholds || thresholds.length === 0 || span <= 0) return [];
    const sorted = [...thresholds].sort((a, b) => a.value - b.value);
    const segments: Array<{ from: number; to: number; tone: GaugeChartTone }> = [];
    let start = min;
    for (const t of sorted) {
      const end = Math.min(Math.max(t.value, min), max);
      if (end <= start) continue;
      segments.push({ from: (start - min) / span, to: (end - min) / span, tone: t.tone });
      start = end;
    }
    if (start < max) {
      const lastTone = sorted[sorted.length - 1]?.tone ?? "neutral";
      segments.push({ from: (start - min) / span, to: 1, tone: lastTone });
    }
    return segments;
  });

  // Position de l'aiguille.
  const needle = $derived.by(() => {
    const a = a0 + totalAngle * frac;
    const tip = polar(r + thickness / 2, a, cx, cy);
    const left = polar(thickness * 0.18, a + Math.PI / 2, cx, cy);
    const right = polar(thickness * 0.18, a - Math.PI / 2, cx, cy);
    return `M ${left[0]} ${left[1]} L ${tip[0]} ${tip[1]} L ${right[0]} ${right[1]} Z`;
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

  const classes = $derived(["st-gaugeChart", className].filter(Boolean).join(" "));
  const dataValueItems = $derived([
    `${label ? `${label}: ` : ""}${formatted} (min ${min}, max ${max})`
  ]);
</script>

<div class={classes}>
  <div
    class="st-gaugeChart__visual"
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
      <path class="st-gaugeChart__track" d={arcPath(0, 1)} fill="none" stroke-width={thickness} />

      <!-- Bandes de seuils (sous le remplissage) -->
      {#each bands as band, i (i)}
        <path
          class="st-gaugeChart__band st-gaugeChart__band--{band.tone}"
          d={arcPath(band.from, band.to)}
          fill="none"
          stroke-width={thickness}
        />
      {/each}

      <!-- Arc de progression (uniquement sans seuils) -->
      {#if bands.length === 0}
        <path
          class="st-gaugeChart__progress"
          d={arcPath(0, frac)}
          fill="none"
          stroke-width={thickness}
        />
      {/if}

      <!-- Aiguille -->
      <path class="st-gaugeChart__needle" d={needle} />
      <circle class="st-gaugeChart__hub" cx={cx} cy={cy} r={Math.max(thickness * 0.22, 4)} />

      <!-- Valeur centrale -->
      <text
        class="st-gaugeChart__value"
        x={cx}
        y={cy - thickness * 0.55}
        text-anchor="middle"
        dominant-baseline="auto"
      >
        {formatted}
      </text>
      {#if label}
        <text
          class="st-gaugeChart__label"
          x={cx}
          y={cy - thickness * 0.05}
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
  .st-gaugeChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    max-width: 100%;
    position: relative;
  }

  .st-gaugeChart__visual,
  .st-gaugeChart svg {
    display: block;
    overflow: visible;
  }

  .st-gaugeChart__track {
    stroke: var(--st-semantic-surface-subtle);
    stroke-linecap: round;
  }

  .st-gaugeChart__band {
    stroke-linecap: butt;
  }

  .st-gaugeChart__progress {
    stroke: var(--st-semantic-action-primary);
    stroke-linecap: round;
    transition: d var(--st-motion-fast, 200ms) var(--st-motion-easing, ease);
  }

  .st-gaugeChart__needle {
    fill: var(--st-semantic-text-primary);
    transition: d var(--st-motion-fast, 200ms) var(--st-motion-easing, ease);
  }

  .st-gaugeChart__hub {
    fill: var(--st-semantic-text-primary);
  }

  .st-gaugeChart__value {
    fill: var(--st-semantic-text-primary);
    font-size: 1.5rem;
    font-variant-numeric: tabular-nums;
    font-weight: 700;
  }

  .st-gaugeChart__label {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.8125rem;
    font-weight: 500;
  }

  /* Tons sémantiques de feedback */
  .st-gaugeChart__band--neutral { stroke: var(--st-semantic-surface-muted, var(--st-semantic-text-secondary)); }
  .st-gaugeChart__band--info { stroke: var(--st-semantic-feedback-info, var(--st-semantic-action-primary)); }
  .st-gaugeChart__band--success { stroke: var(--st-semantic-feedback-success); }
  .st-gaugeChart__band--warning { stroke: var(--st-semantic-feedback-warning); }
  .st-gaugeChart__band--error { stroke: var(--st-semantic-feedback-error); }

  /* Tons catégoriels data */
  .st-gaugeChart__band--category1 { stroke: var(--st-semantic-data-category1); }
  .st-gaugeChart__band--category2 { stroke: var(--st-semantic-data-category2); }
  .st-gaugeChart__band--category3 { stroke: var(--st-semantic-data-category3); }
  .st-gaugeChart__band--category4 { stroke: var(--st-semantic-data-category4); }
  .st-gaugeChart__band--category5 { stroke: var(--st-semantic-data-category5); }
  .st-gaugeChart__band--category6 { stroke: var(--st-semantic-data-category6); }
  .st-gaugeChart__band--category7 { stroke: var(--st-semantic-data-category7); }
  .st-gaugeChart__band--category8 { stroke: var(--st-semantic-data-category8); }

  @media (prefers-reduced-motion: reduce) {
    .st-gaugeChart__progress,
    .st-gaugeChart__needle {
      transition: none;
    }
  }
</style>
