<script lang="ts" module>
  export type StreamgraphChartTone =
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  // Une série pour un point d'abscisse : un libellé + sa valeur.
  export type StreamgraphChartSeriesValue = {
    label: string;
    value: number;
    tone?: StreamgraphChartTone;
  };

  // Un point sur l'axe X (catégorie / temps) avec ses séries empilées.
  export type StreamgraphChartDatum = {
    category: string;
    values: StreamgraphChartSeriesValue[];
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type StreamgraphChartProps = {
    data: StreamgraphChartDatum[];
    width?: number;
    height?: number;
    label: string;
    smooth?: boolean;
    showLegend?: boolean;
    class?: string;
  };

  let {
    data = [],
    width = 480,
    height = 240,
    label,
    smooth = true,
    showLegend = true,
    class: className
  }: StreamgraphChartProps = $props();

  const MARGIN = { top: 12, right: 16, bottom: 32, left: 16 };
  const TONES = ["category1","category2","category3","category4","category5","category6","category7","category8"] as const;

  const scaleLinear = (v: number, d0: number, d1: number, r0: number, r1: number) =>
    d1 === d0 ? r0 : r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);

  function buildLinearPath(pts: { x: number; y: number }[]): string {
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  }

  function buildSmoothPath(pts: { x: number; y: number }[]): string {
    if (pts.length < 2) return buildLinearPath(pts);
    const t = 0.18;
    let d = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? p2;
      const c1x = p1.x + (p2.x - p0.x) * t;
      const c1y = p1.y + (p2.y - p0.y) * t;
      const c2x = p2.x - (p3.x - p1.x) * t;
      const c2y = p2.y - (p3.y - p1.y) * t;
      d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
    }
    return d;
  }

  // Valeur non-finie ou négative → 0 (le streamgraph empile des grandeurs ≥ 0).
  const safeValue = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0);

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  // Ordre stable des séries (1re apparition) + ton associé.
  const series = $derived.by(() => {
    const seen = new Map<string, StreamgraphChartTone>();
    data.forEach((d) =>
      d.values.forEach((sv, i) => {
        if (!seen.has(sv.label)) seen.set(sv.label, sv.tone ?? TONES[seen.size % TONES.length]);
      })
    );
    return [...seen.entries()].map(([seriesLabel, tone]) => ({ seriesLabel, tone }));
  });

  // Échelle Y symétrique : demi-amplitude = max des sommes empilées / 2.
  const halfMax = $derived.by(() => {
    let max = 0;
    for (const d of data) {
      let sum = 0;
      for (const sv of d.values) sum += safeValue(sv.value);
      if (sum > max) max = sum;
    }
    return max / 2 || 1;
  });

  // Pour chaque x : abscisse en px + bornes basse/haute (px) par série,
  // baseline « wiggle » centrée (pile centrée autour de 0 ⇒ baseline = -somme/2).
  const layout = $derived.by(() => {
    const n = data.length;
    const xs = data.map((_, i) => {
      const denom = Math.max(n - 1, 1);
      const xRatio = n === 1 ? 0.5 : i / denom;
      return MARGIN.left + xRatio * plotWidth;
    });
    const midY = MARGIN.top + plotHeight / 2;
    // valToY : une grandeur signée (par rapport au centre) → coordonnée px.
    const valToY = (signed: number) => midY - scaleLinear(signed, 0, halfMax, 0, plotHeight / 2);

    // bands[seriesIndex][xIndex] = { x, top, bottom } en px.
    const bands = series.map(() => [] as { x: number; top: number; bottom: number }[]);
    data.forEach((d, xi) => {
      const total = d.values.reduce((s, sv) => s + safeValue(sv.value), 0);
      let acc = -total / 2; // baseline centrée
      series.forEach((s, si) => {
        const sv = d.values.find((v) => v.label === s.seriesLabel);
        const v = sv ? safeValue(sv.value) : 0;
        const lower = acc;
        const upper = acc + v;
        acc = upper;
        bands[si].push({ x: xs[xi], top: valToY(upper), bottom: valToY(lower) });
      });
    });
    return { xs, bands };
  });

  // Aire fermée par série (haut gauche→droite, puis bas droite→gauche).
  const areas = $derived.by(() =>
    series.map((s, si) => {
      const band = layout.bands[si];
      if (!band || band.length === 0) return { tone: s.tone, seriesLabel: s.seriesLabel, d: "" };
      const topPts = band.map((b) => ({ x: b.x, y: b.top }));
      const bottomPts = band.map((b) => ({ x: b.x, y: b.bottom })).reverse();
      const topPath = smooth ? buildSmoothPath(topPts) : buildLinearPath(topPts);
      const bottomPath = (smooth ? buildSmoothPath(bottomPts) : buildLinearPath(bottomPts)).replace(/^M/, "L");
      return { tone: s.tone, seriesLabel: s.seriesLabel, d: `${topPath} ${bottomPath} Z` };
    })
  );

  // Étiquettes d'axe X : jusqu'à 5 catégories réparties.
  const xTickEntries = $derived.by(() => {
    const n = data.length;
    if (n === 0) return [] as { x: number; label: string }[];
    const target = Math.min(5, n);
    const stride = Math.max(1, Math.round((n - 1) / (target - 1 || 1)));
    const entries: { x: number; label: string }[] = [];
    for (let i = 0; i < n; i += stride) entries.push({ x: layout.xs[i], label: data[i].category });
    const lastIdx = n - 1;
    if (entries[entries.length - 1]?.label !== data[lastIdx].category) {
      entries.push({ x: layout.xs[lastIdx], label: data[lastIdx].category });
    }
    return entries;
  });

  // Liste accessible : total par série + total global.
  const dataValueItems = $derived.by(() => {
    const items = series.map((s) => {
      const total = data.reduce((sum, d) => {
        const sv = d.values.find((v) => v.label === s.seriesLabel);
        return sum + (sv ? safeValue(sv.value) : 0);
      }, 0);
      return `${s.seriesLabel}: ${total}`;
    });
    const grand = data.reduce((sum, d) => sum + d.values.reduce((s, sv) => s + safeValue(sv.value), 0), 0);
    if (series.length > 0) items.push(`Total: ${grand}`);
    return items;
  });

  let hovered: number | null = $state(null);

  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hovered = null;
      return;
    }
    const si = Number(target.getAttribute("data-series-index"));
    hovered = Number.isInteger(si) ? si : null;
  }

  const tooltip = $derived.by(() => {
    if (hovered === null || !series[hovered]) return null;
    const s = series[hovered];
    const band = layout.bands[hovered];
    if (!band || band.length === 0) return null;
    const mid = band[Math.floor(band.length / 2)];
    const total = data.reduce((sum, d) => {
      const sv = d.values.find((v) => v.label === s.seriesLabel);
      return sum + (sv ? safeValue(sv.value) : 0);
    }, 0);
    return { label: s.seriesLabel, value: total, cx: mid.x, cy: (mid.top + mid.bottom) / 2 };
  });

  const classes = () => ["st-streamgraphChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-streamgraphChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handleVisualPointerMove}
    onpointerleave={() => (hovered = null)}
  >
    <svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
      <line class="st-streamgraphChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

      {#each xTickEntries as tick, i (i)}
        <text class="st-streamgraphChart__tickLabel" x={tick.x} y={height - MARGIN.bottom + 16} text-anchor="middle">{tick.label}</text>
      {/each}

      {#each areas as area, si (area.seriesLabel)}
        {#if area.d}
          <path
            class="st-streamgraphChart__area st-streamgraphChart__area--{area.tone}"
            class:st-streamgraphChart__area--dim={hovered !== null && hovered !== si}
            d={area.d}
            data-series-index={si}
          />
        {/if}
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if tooltip}
    <div class="st-streamgraphChart__tooltip" role="presentation" style="left: {(tooltip.cx / width) * 100}%; top: {(tooltip.cy / height) * 100}%">
      <span class="st-streamgraphChart__tooltipLabel">{tooltip.label}</span>
      <span class="st-streamgraphChart__tooltipValue">{tooltip.value}</span>
    </div>
  {/if}

  {#if showLegend && series.length > 0}
    <ul class="st-streamgraphChart__legend">
      {#each series as item (item.seriesLabel)}
        <li class="st-streamgraphChart__legendItem">
          <span class="st-streamgraphChart__legendSwatch st-streamgraphChart__legendSwatch--{item.tone}" aria-hidden="true"></span>
          {item.seriesLabel}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .st-streamgraphChart { color: var(--st-semantic-text-secondary); display: block; font-family: inherit; position: relative; width: 100%; }
  .st-streamgraphChart svg, .st-streamgraphChart__visual { display: block; overflow: visible; }
  .st-streamgraphChart__axis { stroke: var(--st-semantic-border-subtle); stroke-width: 1; }
  .st-streamgraphChart__tickLabel { fill: var(--st-semantic-text-secondary); font-size: 0.6875rem; }
  .st-streamgraphChart__area { cursor: pointer; stroke: var(--st-semantic-surface-default, #fff); stroke-width: 0.75; transition: opacity 120ms ease; }
  .st-streamgraphChart__area--dim { opacity: 0.4; }
  .st-streamgraphChart__area--category1 { fill: var(--st-semantic-data-category1); }
  .st-streamgraphChart__area--category2 { fill: var(--st-semantic-data-category2); }
  .st-streamgraphChart__area--category3 { fill: var(--st-semantic-data-category3); }
  .st-streamgraphChart__area--category4 { fill: var(--st-semantic-data-category4); }
  .st-streamgraphChart__area--category5 { fill: var(--st-semantic-data-category5); }
  .st-streamgraphChart__area--category6 { fill: var(--st-semantic-data-category6); }
  .st-streamgraphChart__area--category7 { fill: var(--st-semantic-data-category7); }
  .st-streamgraphChart__area--category8 { fill: var(--st-semantic-data-category8); }
  @media (prefers-reduced-motion: reduce) { .st-streamgraphChart__area { transition: none; } }
  .st-streamgraphChart__tooltip {
    background: var(--st-semantic-surface-inverse); border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-semantic-text-inverse); display: inline-flex; flex-direction: column; font-size: 0.75rem;
    gap: 0.125rem; line-height: 1.2; padding: 0.375rem 0.5rem; pointer-events: none; position: absolute;
    transform: translate(-50%, calc(-100% - 8px)); white-space: nowrap; z-index: 1;
  }
  .st-streamgraphChart__tooltipLabel { font-weight: 600; }
  .st-streamgraphChart__tooltipValue { opacity: 0.85; }
  .st-streamgraphChart__legend { display: flex; flex-wrap: wrap; gap: 0.75rem; list-style: none; margin: 0.5rem 0 0; padding: 0; }
  .st-streamgraphChart__legendItem { align-items: center; color: var(--st-semantic-text-secondary); display: inline-flex; font-size: 0.75rem; gap: 0.35rem; }
  .st-streamgraphChart__legendSwatch { border-radius: 2px; height: 0.7rem; width: 0.7rem; }
  .st-streamgraphChart__legendSwatch--category1 { background: var(--st-semantic-data-category1); }
  .st-streamgraphChart__legendSwatch--category2 { background: var(--st-semantic-data-category2); }
  .st-streamgraphChart__legendSwatch--category3 { background: var(--st-semantic-data-category3); }
  .st-streamgraphChart__legendSwatch--category4 { background: var(--st-semantic-data-category4); }
  .st-streamgraphChart__legendSwatch--category5 { background: var(--st-semantic-data-category5); }
  .st-streamgraphChart__legendSwatch--category6 { background: var(--st-semantic-data-category6); }
  .st-streamgraphChart__legendSwatch--category7 { background: var(--st-semantic-data-category7); }
  .st-streamgraphChart__legendSwatch--category8 { background: var(--st-semantic-data-category8); }
</style>
