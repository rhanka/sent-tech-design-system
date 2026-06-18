<script lang="ts" module>
  /**
   * WindBarbChart — barbes de vent (symboles météo : vitesse + direction) le
   * long d'un axe temporel (façon Highcharts « windbarb »). Une barbe par point :
   * la hampe est orientée selon `direction` (en degrés) et les barbules encodent
   * la `speed` (en nœuds) par paliers météo standard (demi-barbule = 5 kt,
   * barbule pleine = 10 kt, fanion = 50 kt). La couleur encode la vitesse sur
   * l'échelle catégorielle continue category1..8. a11y : `role="img"` +
   * `data-chart-key` + liste accessible des points.
   * API canonique (référence Svelte, React/Vue/Angular doivent s'aligner).
   *
   * Convention de direction (météo) : `direction` est la direction d'où vient le
   * vent, en degrés (0° = Nord). La hampe pointe vers la source et les barbules
   * sont placées du côté droit de la hampe (hémisphère nord).
   *
   * Props obligatoires :
   *   data   WindBarbChartDatum[]  - {at, speed, direction}
   *
   * Props optionnelles :
   *   label   string
   *   width   number  (défaut 640)
   *   height  number  (défaut 160)
   *   size    number  (longueur de la hampe en px ; défaut 32)
   *   class   string
   */
  export type WindBarbChartTone =
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  export type WindBarbChartDatum = {
    /** Position sur l'axe temporel (timestamp ou index). */
    at: number;
    /** Vitesse du vent en nœuds (≥ 0) : pilote les barbules et la couleur. */
    speed: number;
    /** Direction (d'où vient le vent) en DEGRÉS (0° = Nord). */
    direction: number;
  };

  export type WindBarbChartProps = {
    data: WindBarbChartDatum[];
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
    height = 160,
    size = 32,
    class: className
  }: WindBarbChartProps = $props();

  const MARGIN = { top: 16, right: 18, bottom: 36, left: 24 };

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

  // Décompose une vitesse (kt) en barbules météo : fanions (50), pleines (10),
  // demi (5). On arrondit au plus proche multiple de 5 (convention standard).
  function barbCounts(speed: number): { flags: number; full: number; half: number } {
    let rounded = Math.round(speed / 5) * 5;
    if (rounded < 0) rounded = 0;
    const flags = Math.floor(rounded / 50);
    rounded -= flags * 50;
    const full = Math.floor(rounded / 10);
    rounded -= full * 10;
    const half = Math.floor(rounded / 5);
    return { flags, full, half };
  }

  let hoveredKey: string | null = $state(null);

  // Points valides : position finie, vitesse finie ≥ 0, direction finie.
  const validData = $derived(
    data.filter(
      (d) =>
        d &&
        Number.isFinite(d.at) &&
        Number.isFinite(d.speed) &&
        d.speed >= 0 &&
        Number.isFinite(d.direction)
    )
  );

  const scales = $derived.by(() => {
    const ats = validData.map((d) => d.at);
    const xTicks = niceTicks(Math.min(...ats), Math.max(...ats));
    const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
    return {
      xTicks,
      xMin: xTicks[0], xMax: xTicks[xTicks.length - 1],
      plotW
    };
  });

  const maxSpeed = $derived(
    validData.reduce((max, d) => (d.speed > max ? d.speed : max), 0)
  );

  // Ligne de base des barbes : centrée verticalement dans la zone de tracé.
  const baseY = $derived(MARGIN.top + (height - MARGIN.top - MARGIN.bottom) / 2);

  // Une barbe par point : hampe orientée + barbules le long de la hampe.
  const barbs = $derived.by(() => {
    const { xMin, xMax, plotW } = scales;
    const max = maxSpeed > 0 ? maxSpeed : 1;
    return validData.map((d, i) => {
      const cx = MARGIN.left + scaleLinear(d.at, xMin, xMax, 0, plotW);
      const cy = baseY;
      // Direction météo : 0° = Nord (vers le haut). On oriente la hampe vers la
      // source du vent. Angle écran (Y descend) : haut = -90°.
      const rad = ((d.direction - 90) * Math.PI) / 180;
      const ux = Math.cos(rad);
      const uy = Math.sin(rad);
      // Pointe de la hampe (extrémité libre, côté source du vent).
      const tipX = cx + ux * size;
      const tipY = cy + uy * size;
      // Vecteur perpendiculaire (côté barbules, à droite de la hampe).
      const px = -uy;
      const py = ux;
      const { flags, full, half } = barbCounts(d.speed);
      const barbLen = size * 0.42;
      const halfLen = barbLen * 0.55;
      const spacing = size * 0.16;
      const ticks: { x1: number; y1: number; x2: number; y2: number; kind: "full" | "half" | "flag1" | "flag2" }[] = [];
      // On place les symboles depuis la pointe vers la base.
      let along = size - spacing;
      for (let f = 0; f < flags; f++) {
        const aX = cx + ux * along;
        const aY = cy + uy * along;
        const bAlong = along - spacing;
        const bX = cx + ux * bAlong;
        const bY = cy + uy * bAlong;
        const tipFX = aX + px * barbLen;
        const tipFY = aY + py * barbLen;
        ticks.push({ x1: aX, y1: aY, x2: tipFX, y2: tipFY, kind: "flag1" });
        ticks.push({ x1: bX, y1: bY, x2: tipFX, y2: tipFY, kind: "flag2" });
        along = bAlong - spacing;
      }
      for (let f = 0; f < full; f++) {
        const aX = cx + ux * along;
        const aY = cy + uy * along;
        ticks.push({ x1: aX, y1: aY, x2: aX + px * barbLen, y2: aY + py * barbLen, kind: "full" });
        along -= spacing;
      }
      for (let h = 0; h < half; h++) {
        const aX = cx + ux * along;
        const aY = cy + uy * along;
        ticks.push({ x1: aX, y1: aY, x2: aX + px * halfLen, y2: aY + py * halfLen, kind: "half" });
        along -= spacing;
      }
      // Ton catégoriel par bin de vitesse (max → category8).
      const bin = Math.min(Math.floor((d.speed / max) * TONES.length), TONES.length - 1);
      return {
        key: `${i}`,
        datum: d,
        cx, cy, tipX, tipY, ticks,
        tone: TONES[Math.max(0, bin)]
      };
    });
  });

  const dataValueItems = $derived(
    validData.map((d) => `${fmt(d.at)} · ${fmt(d.speed)} kt @ ${fmt(d.direction)}°`)
  );

  function handlePointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredKey = null;
      return;
    }
    hoveredKey = target.getAttribute("data-chart-key");
  }

  const hoveredBarb = $derived.by(() => {
    if (hoveredKey === null) return null;
    return barbs.find((b) => b.key === hoveredKey) ?? null;
  });

  const classes = () => ["st-windBarbChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-windBarbChart__visual"
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
      <!-- axe temporel X : ticks -->
      {#each scales.xTicks as t (t)}
        {@const x = MARGIN.left + scaleLinear(t, scales.xMin, scales.xMax, 0, scales.plotW)}
        <text class="st-windBarbChart__tick" x={x} y={height - MARGIN.bottom + 16} text-anchor="middle">{fmt(t)}</text>
      {/each}

      <!-- axe de base -->
      <line class="st-windBarbChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

      <!-- une barbe par point : hampe + barbules -->
      {#each barbs as b (b.key)}
        <g
          class="st-windBarbChart__barb st-windBarbChart__barb--{b.tone}"
          class:st-windBarbChart__barb--dim={hoveredKey !== null && hoveredKey !== b.key}
        >
          <line class="st-windBarbChart__shaft" x1={b.cx} y1={b.cy} x2={b.tipX} y2={b.tipY} data-chart-key={b.key} />
          {#each b.ticks as tk, ti (ti)}
            <line class="st-windBarbChart__feather st-windBarbChart__feather--{tk.kind}" x1={tk.x1} y1={tk.y1} x2={tk.x2} y2={tk.y2} />
          {/each}
        </g>
      {/each}
    </svg>
  </div>

  <ChartDataList label={label ?? "wind barb"} items={dataValueItems} />

  {#if hoveredBarb}
    {@const b = hoveredBarb}
    <div
      class="st-windBarbChart__tooltip"
      role="presentation"
      style="left: {(b.cx / width) * 100}%; top: {(b.cy / height) * 100}%"
    >
      <span class="st-windBarbChart__tooltipLabel">{fmt(b.datum.at)}</span>
      <span class="st-windBarbChart__tooltipValue">{fmt(b.datum.speed)} kt @ {fmt(b.datum.direction)}°</span>
    </div>
  {/if}
</div>

<style>
  .st-windBarbChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-windBarbChart svg {
    display: block;
    overflow: visible;
  }

  .st-windBarbChart__visual {
    display: block;
  }

  .st-windBarbChart__axis {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-windBarbChart__tick {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
  }

  .st-windBarbChart__barb {
    transition: opacity 120ms ease;
  }

  .st-windBarbChart__barb--dim {
    opacity: 0.35;
  }

  .st-windBarbChart__shaft {
    cursor: pointer;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-width: 2;
  }

  .st-windBarbChart__feather {
    stroke: currentColor;
    stroke-linecap: round;
    stroke-width: 2;
  }

  .st-windBarbChart__barb--category1 { color: var(--st-semantic-data-category1); }
  .st-windBarbChart__barb--category2 { color: var(--st-semantic-data-category2); }
  .st-windBarbChart__barb--category3 { color: var(--st-semantic-data-category3); }
  .st-windBarbChart__barb--category4 { color: var(--st-semantic-data-category4); }
  .st-windBarbChart__barb--category5 { color: var(--st-semantic-data-category5); }
  .st-windBarbChart__barb--category6 { color: var(--st-semantic-data-category6); }
  .st-windBarbChart__barb--category7 { color: var(--st-semantic-data-category7); }
  .st-windBarbChart__barb--category8 { color: var(--st-semantic-data-category8); }

  .st-windBarbChart__tooltip {
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

  .st-windBarbChart__tooltipLabel {
    font-weight: 600;
  }

  .st-windBarbChart__tooltipValue {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-windBarbChart__barb {
      transition: none;
    }
  }
</style>
