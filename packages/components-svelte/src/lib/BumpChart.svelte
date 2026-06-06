<script lang="ts" module>
  /**
   * BumpChart - classements dans le temps (lignes qui montent/descendent).
   * API canonique (référence Svelte, React/Vue doivent s'aligner)
   *
   * Props obligatoires :
   *   data        BumpChartSeries[]  - tableau {label, ranks: number[], tone?}
   *   categories  string[]           - libellés des périodes (axe X)
   *   label       string             - aria-label
   *
   * Props optionnelles :
   *   width   number  (défaut 480)
   *   height  number  (défaut 300)
   *   class   string
   *
   * Convention : rank 1 = meilleur (affiché en haut).
   * Rang invalide (non-entier, <1, null, undefined, NaN) → GAP (ni point ni segment).
   */
  export type BumpChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type BumpChartSeries = {
    label: string;
    ranks: (number | null | undefined)[];
    tone?: BumpChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  const TONES: BumpChartTone[] = [
    "category1","category2","category3","category4",
    "category5","category6","category7","category8"
  ];

  type BumpChartProps = {
    data: BumpChartSeries[];
    categories: string[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
  };

  let {
    data = [],
    categories = [],
    label,
    width = 480,
    height = 300,
    class: className
  }: BumpChartProps = $props();

  const MARGIN = { top: 16, right: 80, bottom: 32, left: 80 };

  let hoveredIndex: number | null = $state(null);

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  // FIX #6 : valide un rang (entier ≥1 uniquement)
  function isValidRank(r: unknown): r is number {
    return typeof r === "number" && Number.isFinite(r) && Number.isInteger(r) && r >= 1;
  }

  const maxRank = $derived.by(() => {
    let m = 1;
    for (const s of data) {
      for (const r of s.ranks) {
        if (isValidRank(r) && r > m) m = r;
      }
    }
    return m;
  });

  // FIX #6 : aligner ranks et categories : utiliser Math.min(ranks.length, categories.length)
  const catCount = $derived(Math.max(categories.length, 2));

  function rankToY(rank: number): number {
    // rank 1 = top ; rank valide garanti par l'appelant
    return MARGIN.top + ((rank - 1) / Math.max(maxRank - 1, 1)) * plotHeight;
  }

  function catToX(ci: number): number {
    return MARGIN.left + (ci / Math.max(catCount - 1, 1)) * plotWidth;
  }

  /**
   * Construit un path SVG avec GAP pour les rangs invalides.
   * Un segment contenant un rang invalide n'est pas tracé.
   */
  function buildBumpPath(points: ({ x: number; y: number } | null)[]): string {
    const parts: string[] = [];
    let segment: { x: number; y: number }[] = [];

    for (const pt of points) {
      if (pt === null) {
        if (segment.length >= 2) {
          let d = `M${segment[0].x.toFixed(2)},${segment[0].y.toFixed(2)}`;
          for (let i = 0; i < segment.length - 1; i++) {
            const p1 = segment[i];
            const p2 = segment[i + 1];
            const mx = (p1.x + p2.x) / 2;
            d += ` C${mx.toFixed(2)},${p1.y.toFixed(2)} ${mx.toFixed(2)},${p2.y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
          }
          parts.push(d);
        } else if (segment.length === 1) {
          parts.push(`M${segment[0].x.toFixed(2)},${segment[0].y.toFixed(2)}`);
        }
        segment = [];
      } else {
        segment.push(pt);
      }
    }
    // flush dernier segment
    if (segment.length >= 2) {
      let d = `M${segment[0].x.toFixed(2)},${segment[0].y.toFixed(2)}`;
      for (let i = 0; i < segment.length - 1; i++) {
        const p1 = segment[i];
        const p2 = segment[i + 1];
        const mx = (p1.x + p2.x) / 2;
        d += ` C${mx.toFixed(2)},${p1.y.toFixed(2)} ${mx.toFixed(2)},${p2.y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
      }
      parts.push(d);
    } else if (segment.length === 1) {
      parts.push(`M${segment[0].x.toFixed(2)},${segment[0].y.toFixed(2)}`);
    }
    return parts.join(" ");
  }

  const series = $derived(
    data.map((s, si) => {
      const tone = s.tone ?? TONES[si % TONES.length];
      // FIX #6 : aligner ranks/categories ; rang invalide → null (GAP)
      const alignedLength = Math.min(s.ranks.length, categories.length);
      const points: ({ x: number; y: number } | null)[] = [];
      for (let ci = 0; ci < alignedLength; ci++) {
        const r = s.ranks[ci];
        if (isValidRank(r)) {
          points.push({ x: catToX(ci), y: rankToY(r) });
        } else {
          points.push(null); // GAP
        }
      }
      return {
        label: s.label,
        ranks: s.ranks,
        tone,
        points,
        index: si,
        path: buildBumpPath(points),
        alignedLength
      };
    })
  );

  const rankTicks = $derived.by(() => {
    const ticks: number[] = [];
    for (let r = 1; r <= maxRank; r++) ticks.push(r);
    return ticks;
  });

  // FIX #6 : SR n'annonce pas #1 pour un rang absent (utilise "?" à la place)
  const dataValueItems = $derived(
    data.map((s) => {
      const alignedLength = Math.min(s.ranks.length, categories.length);
      return `${s.label}: ` + categories.slice(0, alignedLength).map((cat, ci) => {
        const r = s.ranks[ci];
        return `${cat} ${isValidRank(r) ? `#${r}` : "?"}`;
      }).join(", ");
    })
  );

  function handlePointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) { hoveredIndex = null; return; }
    const idx = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(idx) ? idx : null;
  }

  const classes = () => ["st-bumpChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-bumpChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handlePointerMove}
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
      <!-- horizontal rank grid lines -->
      {#each rankTicks as rank (rank)}
        {@const ty = rankToY(rank)}
        <line
          class="st-bumpChart__grid"
          x1={MARGIN.left}
          x2={width - MARGIN.right}
          y1={ty}
          y2={ty}
        />
        <text
          class="st-bumpChart__rankLabel"
          x={MARGIN.left - 8}
          y={ty}
          text-anchor="end"
          dominant-baseline="middle"
        >
          #{rank}
        </text>
      {/each}

      <!-- category labels -->
      {#each categories as cat, ci (cat)}
        <text
          class="st-bumpChart__catLabel"
          x={catToX(ci)}
          y={height - MARGIN.bottom + 16}
          text-anchor="middle"
        >
          {cat}
        </text>
      {/each}

      <!-- FIX #7 : clé composite pour éviter les doublons sur s.label -->
      {#each series as s, si (`${si}-${s.label}`)}
        <path
          class="st-bumpChart__line st-bumpChart__line--{s.tone}"
          class:st-bumpChart__line--dim={hoveredIndex !== null && hoveredIndex !== s.index}
          class:st-bumpChart__line--active={hoveredIndex === s.index}
          d={s.path}
          fill="none"
          data-chart-index={s.index}
        />
        <!-- FIX #6 : dots uniquement pour les rangs valides (non-null) -->
        {#each s.points as pt, ci (`${si}-${s.label}-${ci}`)}
          {#if pt !== null}
            <circle
              class="st-bumpChart__dot st-bumpChart__dot--{s.tone}"
              class:st-bumpChart__dot--dim={hoveredIndex !== null && hoveredIndex !== s.index}
              cx={pt.x}
              cy={pt.y}
              r="4"
              data-chart-index={s.index}
            />
          {/if}
        {/each}
        <!-- end label : dernier point valide -->
        {#if s.points.some(p => p !== null)}
          {@const lastValidPt = [...s.points].reverse().find(p => p !== null)}
          {#if lastValidPt}
            <text
              class="st-bumpChart__seriesLabel"
              x={lastValidPt.x + 8}
              y={lastValidPt.y}
              dominant-baseline="middle"
            >
              {s.label}
            </text>
          {/if}
          <!-- start label : premier point valide (si >1 point valide) -->
          {@const firstValidPt = s.points.find(p => p !== null)}
          {@const validCount = s.points.filter(p => p !== null).length}
          {#if firstValidPt && validCount > 1}
            <text
              class="st-bumpChart__seriesLabel"
              x={firstValidPt.x - 8}
              y={firstValidPt.y}
              text-anchor="end"
              dominant-baseline="middle"
            >
              {s.label}
            </text>
          {/if}
        {/if}
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />
</div>

<style>
  .st-bumpChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-bumpChart svg {
    display: block;
    overflow: visible;
  }

  .st-bumpChart__visual {
    display: block;
  }

  .st-bumpChart__grid {
    stroke: var(--st-semantic-border-subtle);
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.5;
  }

  .st-bumpChart__rankLabel,
  .st-bumpChart__catLabel,
  .st-bumpChart__seriesLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
  }

  .st-bumpChart__line {
    cursor: pointer;
    stroke-width: 2;
    stroke-opacity: 0.7;
    transition: stroke-opacity 120ms ease, stroke-width 120ms ease;
  }

  .st-bumpChart__line--dim {
    stroke-opacity: 0.12;
  }

  .st-bumpChart__line--active {
    stroke-opacity: 1;
    stroke-width: 3;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-bumpChart__line {
      transition: none;
    }
  }

  .st-bumpChart__dot {
    cursor: pointer;
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1.5;
    transition: r 120ms ease;
  }

  .st-bumpChart__dot--dim {
    opacity: 0.15;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-bumpChart__dot {
      transition: none;
    }
  }

  .st-bumpChart__line--category1 { stroke: var(--st-semantic-data-category1); }
  .st-bumpChart__line--category2 { stroke: var(--st-semantic-data-category2); }
  .st-bumpChart__line--category3 { stroke: var(--st-semantic-data-category3); }
  .st-bumpChart__line--category4 { stroke: var(--st-semantic-data-category4); }
  .st-bumpChart__line--category5 { stroke: var(--st-semantic-data-category5); }
  .st-bumpChart__line--category6 { stroke: var(--st-semantic-data-category6); }
  .st-bumpChart__line--category7 { stroke: var(--st-semantic-data-category7); }
  .st-bumpChart__line--category8 { stroke: var(--st-semantic-data-category8); }

  .st-bumpChart__dot--category1 { fill: var(--st-semantic-data-category1); }
  .st-bumpChart__dot--category2 { fill: var(--st-semantic-data-category2); }
  .st-bumpChart__dot--category3 { fill: var(--st-semantic-data-category3); }
  .st-bumpChart__dot--category4 { fill: var(--st-semantic-data-category4); }
  .st-bumpChart__dot--category5 { fill: var(--st-semantic-data-category5); }
  .st-bumpChart__dot--category6 { fill: var(--st-semantic-data-category6); }
  .st-bumpChart__dot--category7 { fill: var(--st-semantic-data-category7); }
  .st-bumpChart__dot--category8 { fill: var(--st-semantic-data-category8); }
</style>
