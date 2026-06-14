<script lang="ts" module>
  /**
   * RibbonChart - rang empilé à rubans dans le temps (façon Power BI « ribbon
   * chart »). Par période, les catégories sont empilées (hauteur = value) et
   * TRIÉES par valeur (la plus grande en bas) ; des RUBANS lissés relient le
   * segment d'une même `category` d'une période à la suivante, matérialisant le
   * flux de rang. Distinct d'un StackedBarChart classique : l'ordre d'empilement
   * est un classement par valeur et les rubans inter-périodes encodent la
   * continuité d'une catégorie.
   * API canonique (référence Svelte, React/Vue doivent s'aligner).
   *
   * Modèle : catégories et périodes dérivées des `data`. La couleur suit `tone`
   * si fourni, sinon une teinte stable par `category` (cycle sur category1..8).
   * Légende des catégories sous le graphe via ChartDataList.
   *
   * Props obligatoires :
   *   data   RibbonChartDatum[]  - tableau {category, period, value, tone?}
   *
   * Props optionnelles :
   *   label   string
   *   width   number  (défaut 520)
   *   height  number  (défaut 300)
   *   size    number  (alias de width)
   *   class   string
   */
  export type RibbonChartTone =
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  export type RibbonChartDatum = {
    category: string;
    period: string | number;
    value: number;
    tone?: RibbonChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type RibbonChartProps = {
    data: RibbonChartDatum[];
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
  };

  let {
    data = [],
    label,
    width,
    height = 300,
    size,
    class: className
  }: RibbonChartProps = $props();

  const resolvedWidth = $derived(width ?? size ?? 520);

  const MARGIN = { top: 16, right: 16, bottom: 32, left: 16 };
  const RIBBON_SMOOTH = 0.4;

  const TONES = [
    "category1","category2","category3","category4","category5","category6","category7","category8"
  ] as const;

  let hoveredKey: string | null = $state(null);

  const plotWidth = $derived(Math.max(resolvedWidth - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  // Normalise : filtre les data sans catégorie et de valeur non finie/< 0.
  const validData = $derived(
    data.filter(
      (d) =>
        typeof d.category === "string" &&
        d.category.length > 0 &&
        Number.isFinite(d.value) &&
        d.value >= 0
    )
  );

  // Périodes distinctes (ordre d'apparition), colonnes empilées de gauche à droite.
  const periodOrder = $derived.by(() => {
    const seen: (string | number)[] = [];
    for (const d of validData) {
      if (!seen.includes(d.period)) seen.push(d.period);
    }
    return seen;
  });

  // Catégories distinctes (ordre d'apparition) → index categoryN (1..8, cyclé)
  // si aucun `tone` explicite. Un `tone` sur une donnée l'emporte sur la dérivation.
  const categoryOrder = $derived.by(() => {
    const seen: string[] = [];
    for (const d of validData) {
      if (!seen.includes(d.category)) seen.push(d.category);
    }
    return seen;
  });
  const explicitToneByCategory = $derived.by(() => {
    const map = new Map<string, RibbonChartTone>();
    for (const d of validData) {
      if (d.tone) map.set(d.category, d.tone);
    }
    return map;
  });
  const toneOf = (category: string): RibbonChartTone => {
    const explicit = explicitToneByCategory.get(category);
    if (explicit) return explicit;
    const idx = categoryOrder.indexOf(category);
    return `category${((idx < 0 ? 0 : idx) % 8) + 1}` as RibbonChartTone;
  };

  // Empilement par période : segments TRIÉS par valeur décroissante (rang), la
  // plus grande catégorie au pied. Pour chaque segment on garde y haut/bas afin
  // de tracer les rubans inter-périodes par catégorie.
  type Segment = {
    key: string;
    category: string;
    value: number;
    tone: RibbonChartTone;
    x: number;
    width: number;
    yTop: number;
    yBottom: number;
    cx: number;
    cy: number;
  };

  const columns = $derived.by(() => {
    if (validData.length === 0 || periodOrder.length === 0) return [] as {
      period: string | number;
      index: number;
      cx: number;
      segments: Segment[];
    }[];
    const band = plotWidth / periodOrder.length;
    const barWidth = Math.min(band * 0.5, 72);
    // Domaine vertical = plus grande somme de période (toutes empilées).
    const totals = periodOrder.map((p) =>
      validData.filter((d) => d.period === p).reduce((s, d) => s + Math.max(d.value, 0), 0)
    );
    const domainMax = Math.max(1, ...totals);
    return periodOrder.map((period, pi) => {
      const x = MARGIN.left + band * pi + (band - barWidth) / 2;
      const rows = validData
        .filter((d) => d.period === period)
        .map((d) => ({ category: d.category, value: Math.max(d.value, 0) }))
        // Tri par rang : valeur décroissante (la plus grande au pied).
        .sort((a, b) => b.value - a.value);
      let acc = 0;
      const segments = rows.map((row, ri) => {
        const h = (row.value / domainMax) * plotHeight;
        const yBottom = MARGIN.top + plotHeight - acc;
        const yTop = yBottom - h;
        acc += h;
        return {
          key: `${pi}-${ri}-${row.category}`,
          category: row.category,
          value: row.value,
          tone: toneOf(row.category),
          x,
          width: barWidth,
          yTop,
          yBottom,
          cx: x + barWidth / 2,
          cy: yTop + (yBottom - yTop) / 2
        } satisfies Segment;
      });
      return { period, index: pi, cx: MARGIN.left + band * (pi + 0.5), segments };
    });
  });

  // Rubans : pour chaque catégorie présente dans deux périodes consécutives, une
  // bande lissée reliant le segment gauche (bord droit) au segment droit (bord
  // gauche). Quadrilatère à bords supérieur/inférieur en cubiques.
  type Ribbon = { key: string; category: string; tone: RibbonChartTone; d: string };

  const ribbons = $derived.by(() => {
    const out: Ribbon[] = [];
    for (let ci = 0; ci < columns.length - 1; ci++) {
      const left = columns[ci];
      const right = columns[ci + 1];
      for (const ls of left.segments) {
        const rs = right.segments.find((s) => s.category === ls.category);
        if (!rs) continue;
        const x0 = ls.x + ls.width;
        const x1 = rs.x;
        const mid = x0 + (x1 - x0) * RIBBON_SMOOTH;
        const mid2 = x1 - (x1 - x0) * RIBBON_SMOOTH;
        // Bord supérieur (gauche→droite) puis bord inférieur (droite→gauche).
        const d =
          `M${x0.toFixed(2)},${ls.yTop.toFixed(2)} ` +
          `C${mid.toFixed(2)},${ls.yTop.toFixed(2)} ${mid2.toFixed(2)},${rs.yTop.toFixed(2)} ${x1.toFixed(2)},${rs.yTop.toFixed(2)} ` +
          `L${x1.toFixed(2)},${rs.yBottom.toFixed(2)} ` +
          `C${mid2.toFixed(2)},${rs.yBottom.toFixed(2)} ${mid.toFixed(2)},${ls.yBottom.toFixed(2)} ${x0.toFixed(2)},${ls.yBottom.toFixed(2)} Z`;
        out.push({ key: `${ci}-${ls.category}`, category: ls.category, tone: ls.tone, d });
      }
    }
    return out;
  });

  const legendItems = $derived(categoryOrder.map((category) => ({ category, tone: toneOf(category) })));
  const hasLegend = $derived(categoryOrder.length > 0);

  const dataValueItems = $derived(
    categoryOrder.map(
      (category) =>
        `${category}: ${periodOrder
          .map((p) => {
            const found = validData.find((d) => d.category === category && d.period === p);
            return `${p} = ${found ? found.value : 0}`;
          })
          .join(", ")}`
    )
  );

  function handlePointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredKey = null;
      return;
    }
    const key = target.getAttribute("data-chart-key");
    hoveredKey = key ?? null;
  }

  const hoveredSegment = $derived.by(() => {
    if (hoveredKey === null) return null;
    for (const col of columns) {
      for (const seg of col.segments) {
        if (seg.key === hoveredKey) return seg;
      }
    }
    return null;
  });

  const classes = () => ["st-ribbonChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-ribbonChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handlePointerMove}
    onpointerleave={() => (hoveredKey = null)}
  >
    <svg
      viewBox="0 0 {resolvedWidth} {height}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
      <!-- rubans inter-périodes (sous les segments) -->
      {#each ribbons as ribbon (ribbon.key)}
        <path
          class="st-ribbonChart__ribbon st-ribbonChart__ribbon--{ribbon.tone}"
          class:st-ribbonChart__ribbon--dim={hoveredSegment !== null && hoveredSegment.category !== ribbon.category}
          d={ribbon.d}
        />
      {/each}

      <!-- segments empilés par période -->
      {#each columns as col (col.index)}
        <text class="st-ribbonChart__periodLabel" x={col.cx} y={height - MARGIN.bottom + 16} text-anchor="middle">
          {col.period}
        </text>
        {#each col.segments as seg (seg.key)}
          <rect
            class="st-ribbonChart__seg st-ribbonChart__seg--{seg.tone}"
            class:st-ribbonChart__seg--dim={hoveredSegment !== null && hoveredSegment.category !== seg.category}
            x={seg.x}
            y={seg.yTop}
            width={seg.width}
            height={Math.max(seg.yBottom - seg.yTop, 0)}
            rx="2"
            data-chart-key={seg.key}
          />
        {/each}
      {/each}
    </svg>
  </div>

  {#if hasLegend}
    <ul class="st-ribbonChart__legend" aria-label={`Catégories de ${label ?? "ribbon"}`}>
      {#each legendItems as item (item.category)}
        <li class="st-ribbonChart__legendItem">
          <span class="st-ribbonChart__legendSwatch st-ribbonChart__legendSwatch--{item.tone}" aria-hidden="true"></span>
          {item.category}
        </li>
      {/each}
    </ul>
  {/if}

  <ChartDataList label={label ?? "ribbon"} items={dataValueItems} />

  {#if hoveredSegment}
    {@const seg = hoveredSegment}
    <div
      class="st-ribbonChart__tooltip"
      role="presentation"
      style="left: {(seg.cx / resolvedWidth) * 100}%; top: {(seg.cy / height) * 100}%"
    >
      <span class="st-ribbonChart__tooltipLabel">{seg.category}</span>
      <span class="st-ribbonChart__tooltipValue">{seg.value}</span>
    </div>
  {/if}
</div>

<style>
  .st-ribbonChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-ribbonChart svg {
    display: block;
    overflow: visible;
  }

  .st-ribbonChart__visual {
    display: block;
  }

  .st-ribbonChart__periodLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
  }

  .st-ribbonChart__ribbon {
    opacity: 0.34;
    transition: opacity 120ms ease;
  }

  .st-ribbonChart__ribbon--dim {
    opacity: 0.1;
  }

  .st-ribbonChart__seg {
    cursor: pointer;
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1;
    transition: opacity 120ms ease;
  }

  .st-ribbonChart__seg--dim {
    opacity: 0.4;
  }

  .st-ribbonChart__seg--category1,
  .st-ribbonChart__ribbon--category1 { fill: var(--st-semantic-data-category1); }
  .st-ribbonChart__seg--category2,
  .st-ribbonChart__ribbon--category2 { fill: var(--st-semantic-data-category2); }
  .st-ribbonChart__seg--category3,
  .st-ribbonChart__ribbon--category3 { fill: var(--st-semantic-data-category3); }
  .st-ribbonChart__seg--category4,
  .st-ribbonChart__ribbon--category4 { fill: var(--st-semantic-data-category4); }
  .st-ribbonChart__seg--category5,
  .st-ribbonChart__ribbon--category5 { fill: var(--st-semantic-data-category5); }
  .st-ribbonChart__seg--category6,
  .st-ribbonChart__ribbon--category6 { fill: var(--st-semantic-data-category6); }
  .st-ribbonChart__seg--category7,
  .st-ribbonChart__ribbon--category7 { fill: var(--st-semantic-data-category7); }
  .st-ribbonChart__seg--category8,
  .st-ribbonChart__ribbon--category8 { fill: var(--st-semantic-data-category8); }

  .st-ribbonChart__legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-3, 0.75rem);
    list-style: none;
    margin: var(--st-spacing-2, 0.5rem) 0 0 0;
    padding: 0;
  }

  .st-ribbonChart__legendItem {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    font-size: 0.75rem;
    gap: var(--st-spacing-1, 0.25rem);
    line-height: 1;
  }

  .st-ribbonChart__legendSwatch {
    border-radius: var(--st-radius-sm, 0.25rem);
    display: inline-block;
    height: 0.625rem;
    width: 0.625rem;
  }
  .st-ribbonChart__legendSwatch--category1 { background: var(--st-semantic-data-category1); }
  .st-ribbonChart__legendSwatch--category2 { background: var(--st-semantic-data-category2); }
  .st-ribbonChart__legendSwatch--category3 { background: var(--st-semantic-data-category3); }
  .st-ribbonChart__legendSwatch--category4 { background: var(--st-semantic-data-category4); }
  .st-ribbonChart__legendSwatch--category5 { background: var(--st-semantic-data-category5); }
  .st-ribbonChart__legendSwatch--category6 { background: var(--st-semantic-data-category6); }
  .st-ribbonChart__legendSwatch--category7 { background: var(--st-semantic-data-category7); }
  .st-ribbonChart__legendSwatch--category8 { background: var(--st-semantic-data-category8); }

  .st-ribbonChart__tooltip {
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

  .st-ribbonChart__tooltipLabel {
    font-weight: 600;
  }

  .st-ribbonChart__tooltipValue {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-ribbonChart__seg,
    .st-ribbonChart__ribbon {
      transition: none;
    }
  }
</style>
