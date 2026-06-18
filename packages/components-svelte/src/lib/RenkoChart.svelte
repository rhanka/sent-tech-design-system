<script lang="ts" module>
  /**
   * RenkoChart — briques Renko à partir d'une série de prix (façon Highcharts
   * Stock « renko »). On empile des briques d'une taille fixe (`boxSize`) en
   * ignorant le temps régulier : une nouvelle brique n'apparaît qu'au
   * franchissement de `boxSize`. Brique haussière = +boxSize au-dessus de la
   * dernière, brique baissière = -boxSize en-dessous ; une INVERSION exige un
   * franchissement de 2×boxSize en sens inverse. Vert (hausse) / rouge (baisse)
   * via les tons sémantiques success / error. Axe Y prix gradué (niceTicks), PAS
   * d'axe temps régulier (les colonnes sont équidistantes). a11y : `role="img"`
   * + `data-chart-key` + liste accessible des briques.
   * API canonique (référence Svelte, React/Vue/Angular doivent s'aligner).
   *
   * Props obligatoires :
   *   data   RenkoChartDatum[]  - série de prix {date, close}
   *
   * Props optionnelles :
   *   boxSize number  (taille d'une brique ; défaut auto ~ (max-min)/20)
   *   label   string
   *   width   number  (défaut 640)
   *   height  number  (défaut 320)
   *   size    number  (non utilisé pour le rendu ; réservé parité d'API)
   *   class   string
   */
  export type RenkoChartDirection = "up" | "down";

  export type RenkoChartDatum = {
    /** Position temporelle (timestamp ou index) — ignorée pour l'empilement. */
    date: number;
    /** Prix de clôture : pilote la formation des briques. */
    close: number;
  };

  export type RenkoChartProps = {
    data: RenkoChartDatum[];
    boxSize?: number;
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
    boxSize,
    label,
    width = 640,
    height = 320,
    size,
    class: className
  }: RenkoChartProps = $props();

  const MARGIN = { top: 16, right: 18, bottom: 36, left: 52 };

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

  // Points valides : date et close finis.
  const validData = $derived(
    data.filter((d) => d && Number.isFinite(d.date) && Number.isFinite(d.close))
  );

  // Taille de brique effective : `boxSize` fini > 0, sinon auto ~ (max-min)/20.
  const effectiveBox = $derived.by(() => {
    if (Number.isFinite(boxSize) && (boxSize as number) > 0) return boxSize as number;
    const closes = validData.map((d) => d.close);
    if (closes.length === 0) return 1;
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const span = max - min;
    return span > 0 ? span / 20 : 1;
  });

  // Construit les briques Renko. Chaque brique couvre [bottom, top] (hauteur
  // boxSize) ; on en émet une à chaque franchissement de `box`. L'inversion
  // exige 2×box : la première brique du nouveau sens repart un cran au-delà de
  // la dernière brique du sens précédent.
  const bricks = $derived.by(() => {
    const box = effectiveBox;
    const out: { bottom: number; top: number; direction: RenkoChartDirection }[] = [];
    if (validData.length === 0 || box <= 0) return out;

    // Niveau de référence : extrémité de la dernière brique posée.
    let base = validData[0].close;
    let direction: RenkoChartDirection | null = null;

    for (let i = 1; i < validData.length; i++) {
      const price = validData[i].close;

      if (direction !== "down") {
        // Briques haussières tant que le prix monte d'au moins un `box`.
        while (price >= base + box) {
          out.push({ bottom: base, top: base + box, direction: "up" });
          base += box;
          direction = "up";
        }
      }

      if (direction === "up") {
        // Inversion haussière -> baissière : il faut franchir 2×box.
        if (price <= base - 2 * box) {
          base -= box;
          do {
            out.push({ bottom: base - box, top: base, direction: "down" });
            base -= box;
            direction = "down";
          } while (price <= base - box);
        }
        continue;
      }

      // Briques baissières tant que le prix descend d'au moins un `box`.
      while (price <= base - box) {
        out.push({ bottom: base - box, top: base, direction: "down" });
        base -= box;
        direction = "down";
      }

      if (direction === "down" && price >= base + 2 * box) {
        // Inversion baissière -> haussière : il faut franchir 2×box.
        base += box;
        do {
          out.push({ bottom: base, top: base + box, direction: "up" });
          base += box;
          direction = "up";
        } while (price >= base + box);
      }
    }
    return out;
  });

  const priceRange = $derived.by(() => {
    if (bricks.length === 0) {
      const closes = validData.map((d) => d.close);
      const min = closes.length ? Math.min(...closes) : 0;
      const max = closes.length ? Math.max(...closes) : 0;
      return { min, max };
    }
    let min = Infinity;
    let max = -Infinity;
    for (const b of bricks) {
      if (b.bottom < min) min = b.bottom;
      if (b.top > max) max = b.top;
    }
    return { min, max };
  });

  const scales = $derived.by(() => {
    const { min, max } = priceRange;
    const yTicks = niceTicks(min, max);
    const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
    const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
    return {
      yTicks,
      yMin: yTicks[0],
      yMax: yTicks[yTicks.length - 1],
      plotW,
      plotH
    };
  });

  // Colonnes de briques côte à côte (équidistantes) : pas d'axe temps régulier.
  const columns = $derived.by(() => {
    const { yMin, yMax, plotW, plotH } = scales;
    const n = bricks.length;
    if (n === 0) return [];
    const colW = plotW / n;
    const brickW = colW * 0.86;
    return bricks.map((b, i) => {
      const cx = MARGIN.left + colW * i + colW / 2;
      const top = MARGIN.top + scaleLinear(b.top, yMin, yMax, plotH, 0);
      const bottom = MARGIN.top + scaleLinear(b.bottom, yMin, yMax, plotH, 0);
      return {
        key: `${i}`,
        brick: b,
        x: cx - brickW / 2,
        y: Math.min(top, bottom),
        width: brickW,
        height: Math.max(Math.abs(bottom - top), 0.5),
        cx,
        cy: (top + bottom) / 2,
        direction: b.direction
      };
    });
  });

  const dataValueItems = $derived(
    columns.map((c) => `${c.direction === "up" ? "▲" : "▼"} ${fmt(c.brick.bottom)} → ${fmt(c.brick.top)}`)
  );

  function handlePointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredKey = null;
      return;
    }
    hoveredKey = target.getAttribute("data-chart-key");
  }

  const hoveredColumn = $derived.by(() => {
    if (hoveredKey === null) return null;
    return columns.find((c) => c.key === hoveredKey) ?? null;
  });

  const classes = () => ["st-renkoChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-renkoChart__visual"
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
      <!-- gridlines + ticks Y (prix) -->
      {#each scales.yTicks as t (t)}
        {@const y = MARGIN.top + scaleLinear(t, scales.yMin, scales.yMax, scales.plotH, 0)}
        <line class="st-renkoChart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={y} y2={y} />
        <text class="st-renkoChart__tick" x={MARGIN.left - 6} y={y} text-anchor="end" dominant-baseline="middle">{fmt(t)}</text>
      {/each}

      <!-- axes -->
      <line class="st-renkoChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
      <line class="st-renkoChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

      <!-- colonnes de briques -->
      {#each columns as c (c.key)}
        <rect
          class="st-renkoChart__brick st-renkoChart__brick--{c.direction}"
          class:st-renkoChart__brick--dim={hoveredKey !== null && hoveredKey !== c.key}
          x={c.x}
          y={c.y}
          width={c.width}
          height={c.height}
          data-chart-key={c.key}
        />
      {/each}
    </svg>
  </div>

  <ChartDataList label={label ?? "renko"} items={dataValueItems} />

  {#if hoveredColumn}
    {@const c = hoveredColumn}
    <div
      class="st-renkoChart__tooltip"
      role="presentation"
      style="left: {(c.cx / width) * 100}%; top: {(c.cy / height) * 100}%"
    >
      <span class="st-renkoChart__tooltipLabel">{c.direction === "up" ? "▲" : "▼"}</span>
      <span class="st-renkoChart__tooltipValue">{fmt(c.brick.bottom)} → {fmt(c.brick.top)}</span>
    </div>
  {/if}
</div>

<style>
  .st-renkoChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-renkoChart svg {
    display: block;
    overflow: visible;
  }

  .st-renkoChart__visual {
    display: block;
  }

  .st-renkoChart__grid {
    opacity: 0.5;
    stroke: var(--st-semantic-border-subtle);
    stroke-dasharray: 2 3;
    stroke-width: 1;
  }

  .st-renkoChart__axis {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-renkoChart__tick {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
  }

  .st-renkoChart__brick {
    cursor: pointer;
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 0.5;
    transition: opacity 120ms ease;
  }

  .st-renkoChart__brick--dim {
    opacity: 0.35;
  }

  .st-renkoChart__brick--up {
    fill: var(--st-semantic-feedback-success);
  }

  .st-renkoChart__brick--down {
    fill: var(--st-semantic-feedback-error);
  }

  .st-renkoChart__tooltip {
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

  .st-renkoChart__tooltipLabel {
    font-weight: 600;
  }

  .st-renkoChart__tooltipValue {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-renkoChart__brick {
      transition: none;
    }
  }
</style>
