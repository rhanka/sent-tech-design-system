<script lang="ts" module>
  /**
   * VectorFieldChart — champ de vecteurs (façon Highcharts « vector »). Grille
   * de flèches dont la LONGUEUR est proportionnelle à la magnitude (`length`) et
   * l'ORIENTATION suit la direction (`direction`, en degrés). Axes X/Y gradués
   * (mêmes « niceTicks » que les autres charts). La couleur encode la magnitude
   * (échelle category1..8). a11y : `role="img"` + liste accessible des points.
   * API canonique (référence Svelte, React/Vue/Angular doivent s'aligner).
   *
   * Convention de direction : 0° pointe vers la droite (axe +X), l'angle
   * augmente dans le sens trigonométrique (90° = vers le haut). Les longueurs
   * sont normalisées sur la plus grande magnitude pour rester dans la cellule.
   *
   * Props obligatoires :
   *   data   VectorFieldChartDatum[]  - {x, y, length, direction}
   *
   * Props optionnelles :
   *   label   string
   *   width   number  (défaut 640)
   *   height  number  (défaut 320)
   *   size    number  (longueur max d'une flèche en px ; défaut 26)
   *   class   string
   */
  export type VectorFieldChartTone =
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  export type VectorFieldChartDatum = {
    x: number;
    y: number;
    /** Magnitude (≥ 0) : pilote la longueur normalisée et la couleur. */
    length: number;
    /** Direction en DEGRÉS (0° = +X, sens trigonométrique). */
    direction: number;
  };

  export type VectorFieldChartProps = {
    data: VectorFieldChartDatum[];
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  let {
    data = [],
    label,
    width = 640,
    height = 320,
    size = 26,
    class: className
  }: VectorFieldChartProps = $props();

  const MARGIN = { top: 16, right: 18, bottom: 36, left: 48 };

  const TONES = [
    "category1","category2","category3","category4",
    "category5","category6","category7","category8"
  ] as const;

  function niceTicks(min: number, max: number, target = 5): number[] {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
      return [Number.isFinite(max) ? max : 0];
    }
    const range = max - min;
    const rough = range / Math.max(target - 1, 1);
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / pow;
    let step: number;
    if (norm < 1.5) step = pow;
    else if (norm < 3) step = 2 * pow;
    else if (norm < 7) step = 5 * pow;
    else step = 10 * pow;
    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;
    const ticks: number[] = [];
    for (let v = start; v <= end + step / 2; v += step) ticks.push(Number(v.toFixed(10)));
    return ticks;
  }

  function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number) {
    if (d1 === d0) return r0;
    return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
  }

  function fmt(v: number): string {
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    return Number.isInteger(v) ? String(v) : v.toFixed(1);
  }

  let hoveredKey: string | null = $state(null);

  // Points valides : coordonnées finies, magnitude finie ≥ 0.
  const validData = $derived(
    data.filter(
      (d) =>
        d &&
        Number.isFinite(d.x) &&
        Number.isFinite(d.y) &&
        Number.isFinite(d.length) &&
        d.length >= 0 &&
        Number.isFinite(d.direction)
    )
  );

  const scales = $derived.by(() => {
    const xs = validData.map((d) => d.x);
    const ys = validData.map((d) => d.y);
    const xTicks = niceTicks(Math.min(...xs), Math.max(...xs));
    const yTicks = niceTicks(Math.min(...ys), Math.max(...ys));
    const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
    const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
    return {
      xTicks, yTicks,
      xMin: xTicks[0], xMax: xTicks[xTicks.length - 1],
      yMin: yTicks[0], yMax: yTicks[yTicks.length - 1],
      plotW, plotH
    };
  });

  const maxLength = $derived(
    validData.reduce((max, d) => (d.length > max ? d.length : max), 0)
  );

  // Une flèche par point : segment (base → pointe) + 2 traits de pointe.
  const arrows = $derived.by(() => {
    const { xMin, xMax, yMin, yMax, plotW, plotH } = scales;
    const max = maxLength > 0 ? maxLength : 1;
    return validData.map((d, i) => {
      const cx = MARGIN.left + scaleLinear(d.x, xMin, xMax, 0, plotW);
      const cy = MARGIN.top + scaleLinear(d.y, yMin, yMax, plotH, 0);
      // Longueur normalisée (la plus grande magnitude = `size`).
      const len = (d.length / max) * size;
      // Direction trigonométrique : +X à droite, +Y vers le haut (donc -sin en
      // espace écran où l'axe Y descend).
      const rad = (d.direction * Math.PI) / 180;
      const dx = Math.cos(rad) * len;
      const dy = -Math.sin(rad) * len;
      // Flèche centrée sur le point : moitié de chaque côté.
      const x1 = cx - dx / 2;
      const y1 = cy - dy / 2;
      const x2 = cx + dx / 2;
      const y2 = cy + dy / 2;
      // Pointe : deux petits traits en arrière de la tête.
      const head = Math.min(Math.max(len * 0.28, 3), 8);
      const headAngle = (28 * Math.PI) / 180;
      const baseAngle = Math.atan2(y2 - y1, x2 - x1);
      const hx1 = x2 - head * Math.cos(baseAngle - headAngle);
      const hy1 = y2 - head * Math.sin(baseAngle - headAngle);
      const hx2 = x2 - head * Math.cos(baseAngle + headAngle);
      const hy2 = y2 - head * Math.sin(baseAngle + headAngle);
      // Ton catégoriel par bin de magnitude (max → category8).
      const bin = Math.min(Math.floor((d.length / max) * TONES.length), TONES.length - 1);
      return {
        key: `${i}`,
        datum: d,
        cx, cy, x1, y1, x2, y2, hx1, hy1, hx2, hy2,
        tone: TONES[Math.max(0, bin)]
      };
    });
  });

  const dataValueItems = $derived(
    validData.map(
      (d) => `x ${d.x}, y ${d.y} · |v| ${fmt(d.length)} @ ${fmt(d.direction)}°`
    )
  );

  function handlePointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredKey = null;
      return;
    }
    hoveredKey = target.getAttribute("data-chart-key");
  }

  const hoveredArrow = $derived.by(() => {
    if (hoveredKey === null) return null;
    return arrows.find((a) => a.key === hoveredKey) ?? null;
  });

  const classes = () => ["st-vectorFieldChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-vectorFieldChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handlePointerMove}
    onpointerleave={() => (hoveredKey = null)}
  >
    <svg
      viewBox="0 0 {width} {height}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
      <!-- gridlines + ticks Y -->
      {#each scales.yTicks as t (t)}
        {@const y = MARGIN.top + scaleLinear(t, scales.yMin, scales.yMax, scales.plotH, 0)}
        <line class="st-vectorFieldChart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={y} y2={y} />
        <text class="st-vectorFieldChart__tick" x={MARGIN.left - 6} y={y} text-anchor="end" dominant-baseline="middle">{fmt(t)}</text>
      {/each}
      <!-- ticks X -->
      {#each scales.xTicks as t (t)}
        {@const x = MARGIN.left + scaleLinear(t, scales.xMin, scales.xMax, 0, scales.plotW)}
        <text class="st-vectorFieldChart__tick" x={x} y={height - MARGIN.bottom + 16} text-anchor="middle">{fmt(t)}</text>
      {/each}

      <!-- axes -->
      <line class="st-vectorFieldChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
      <line class="st-vectorFieldChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

      <!-- une flèche par point : segment + pointe -->
      {#each arrows as a (a.key)}
        <g
          class="st-vectorFieldChart__arrow st-vectorFieldChart__arrow--{a.tone}"
          class:st-vectorFieldChart__arrow--dim={hoveredKey !== null && hoveredKey !== a.key}
        >
          <line class="st-vectorFieldChart__shaft" x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} data-chart-key={a.key} />
          <line class="st-vectorFieldChart__head" x1={a.x2} y1={a.y2} x2={a.hx1} y2={a.hy1} />
          <line class="st-vectorFieldChart__head" x1={a.x2} y1={a.y2} x2={a.hx2} y2={a.hy2} />
        </g>
      {/each}
    </svg>
  </div>

  <ChartDataList label={label ?? "vector field"} items={dataValueItems} />

  {#if hoveredArrow}
    {@const a = hoveredArrow}
    <div
      class="st-vectorFieldChart__tooltip"
      role="presentation"
      style="left: {(a.cx / width) * 100}%; top: {(a.cy / height) * 100}%"
    >
      <span class="st-vectorFieldChart__tooltipLabel">x {a.datum.x} · y {a.datum.y}</span>
      <span class="st-vectorFieldChart__tooltipValue">|v| {fmt(a.datum.length)} @ {fmt(a.datum.direction)}°</span>
    </div>
  {/if}
</div>

<style>
  .st-vectorFieldChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-vectorFieldChart svg {
    display: block;
    overflow: visible;
  }

  .st-vectorFieldChart__visual {
    display: block;
  }

  .st-vectorFieldChart__grid {
    opacity: 0.7;
    stroke: var(--st-semantic-border-subtle);
    stroke-dasharray: 2 3;
    stroke-width: 1;
  }

  .st-vectorFieldChart__axis {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-vectorFieldChart__tick {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
  }

  .st-vectorFieldChart__arrow {
    transition: opacity 120ms ease;
  }

  .st-vectorFieldChart__arrow--dim {
    opacity: 0.35;
  }

  .st-vectorFieldChart__shaft {
    cursor: pointer;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-width: 2;
  }

  .st-vectorFieldChart__head {
    stroke: currentColor;
    stroke-linecap: round;
    stroke-width: 2;
  }

  .st-vectorFieldChart__arrow--category1 { color: var(--st-semantic-data-category1); }
  .st-vectorFieldChart__arrow--category2 { color: var(--st-semantic-data-category2); }
  .st-vectorFieldChart__arrow--category3 { color: var(--st-semantic-data-category3); }
  .st-vectorFieldChart__arrow--category4 { color: var(--st-semantic-data-category4); }
  .st-vectorFieldChart__arrow--category5 { color: var(--st-semantic-data-category5); }
  .st-vectorFieldChart__arrow--category6 { color: var(--st-semantic-data-category6); }
  .st-vectorFieldChart__arrow--category7 { color: var(--st-semantic-data-category7); }
  .st-vectorFieldChart__arrow--category8 { color: var(--st-semantic-data-category8); }

  .st-vectorFieldChart__tooltip {
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

  .st-vectorFieldChart__tooltipLabel {
    font-weight: 600;
  }

  .st-vectorFieldChart__tooltipValue {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-vectorFieldChart__arrow {
      transition: none;
    }
  }
</style>
