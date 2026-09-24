<script lang="ts" module>
  import { placePriorityLabels, type PriorityMatrixObstacle } from "./priorityLabels.js";

  export type PriorityMatrixTone =
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  export type PriorityMatrixDatum = {
    /** Complexité, 0–100 (bornée à l'affichage). */
    x: number;
    /** Valeur, 0–100 (bornée à l'affichage). */
    y: number;
    /** Étiquette affichée (une ou deux lignes). */
    label: string;
    tone?: PriorityMatrixTone;
  };

  type PriorityMatrixProps = {
    data: PriorityMatrixDatum[];
    /** Titre visible au-dessus du cadre. */
    title?: string;
    xLabel?: string;
    yLabel?: string;
    /** Seuils de quadrants (0–100). */
    xThreshold?: number;
    yThreshold?: number;
    width?: number;
    height?: number;
    radius?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  let {
    data,
    title = "Matrice de priorisation",
    xLabel = "Complexité (0-100 pts)",
    yLabel = "Valeur (0-100 pts)",
    xThreshold = 50,
    yThreshold = 50,
    width = 640,
    height = 400,
    radius = 5,
    label,
    class: className
  }: PriorityMatrixProps = $props();

  const MARGIN = { top: 26, right: 18, bottom: 36, left: 48 };
  const TICKS = [0, 20, 40, 60, 80, 100];
  const TONES: PriorityMatrixTone[] = ["category1","category2","category3","category4","category5","category6","category7","category8"];
  const QUADRANTS = [
    { id: "quick-wins", name: "Gains rapides" },
    { id: "major-projects", name: "Projets majeurs" },
    { id: "wait", name: "Attendre" },
    { id: "drop", name: "Ne pas faire" }
  ] as const;

  function splitLabel(value: string): string[] {
    const chars = [...value];
    if (chars.length <= 12) return [value];
    const mid = Math.ceil(chars.length / 2);
    const space = value.lastIndexOf(" ", mid + 4);
    if (space > 2 && space < value.length - 2) return [value.slice(0, space), value.slice(space + 1)];
    return [value.slice(0, mid), value.slice(mid)];
  }

  /**
   * Fixed obstacles for the placement: keep-out bands around the two threshold
   * lines plus one rectangle per quadrant name, in frame pixels. Estimated from
   * the rendered geometry (11px names); a soft cost, not a hard exclusion.
   */
  function buildMatrixObstacles(
    tx: number,
    ty: number,
    plotW: number,
    plotH: number
  ): PriorityMatrixObstacle[] {
    const names = [
      { x: MARGIN.left + 6, y: MARGIN.top + 14, anchor: "start" as const, text: QUADRANTS[0]!.name },
      { x: MARGIN.left + plotW - 6, y: MARGIN.top + 14, anchor: "end" as const, text: QUADRANTS[1]!.name },
      { x: MARGIN.left + 6, y: MARGIN.top + plotH - 8, anchor: "start" as const, text: QUADRANTS[2]!.name },
      { x: MARGIN.left + plotW - 6, y: MARGIN.top + plotH - 8, anchor: "end" as const, text: QUADRANTS[3]!.name }
    ];
    const out: PriorityMatrixObstacle[] = [
      { x: tx - 3, y: MARGIN.top, w: 6, h: plotH },
      { x: MARGIN.left, y: ty - 3, w: plotW, h: 6 }
    ];
    for (const q of names) {
      const w = [...q.text].length * 6.5 + 4;
      out.push({ x: q.anchor === "start" ? q.x : q.x - w, y: q.y - 9, w, h: 12 });
    }
    return out;
  }

  /** Accessible coordinate text; non-finite values read as N/A, never NaN. */
  function coordText(v: number): string {
    return Number.isFinite(v) ? String(v) : "N/A";
  }

  const plotW = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotH = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));
  const scaleX = $derived((v: number) =>
    Number.isFinite(v) ? MARGIN.left + (Math.min(Math.max(v, 0), 100) / 100) * plotW : MARGIN.left);
  const scaleY = $derived((v: number) =>
    Number.isFinite(v) ? MARGIN.top + (1 - Math.min(Math.max(v, 0), 100) / 100) * plotH : MARGIN.top);
  const tx = $derived(scaleX(xThreshold));
  const ty = $derived(scaleY(yThreshold));

  const quads = $derived([
    { id: "quick-wins", x: MARGIN.left, y: MARGIN.top, w: tx - MARGIN.left, h: ty - MARGIN.top },
    { id: "major-projects", x: tx, y: MARGIN.top, w: MARGIN.left + plotW - tx, h: ty - MARGIN.top },
    { id: "wait", x: MARGIN.left, y: ty, w: tx - MARGIN.left, h: MARGIN.top + plotH - ty },
    { id: "drop", x: tx, y: ty, w: MARGIN.left + plotW - tx, h: MARGIN.top + plotH - ty }
  ]);

  const quadNames = $derived([
    { id: "quick-wins", x: MARGIN.left + 6, y: MARGIN.top + 14, anchor: "start" },
    { id: "major-projects", x: MARGIN.left + plotW - 6, y: MARGIN.top + 14, anchor: "end" },
    { id: "wait", x: MARGIN.left + 6, y: MARGIN.top + plotH - 8, anchor: "start" },
    { id: "drop", x: MARGIN.left + plotW - 6, y: MARGIN.top + plotH - 8, anchor: "end" }
  ]);

  const points = $derived(
    data.map((d, i) => ({
      cx: scaleX(d.x),
      cy: scaleY(d.y),
      datum: d,
      index: i,
      tone: d.tone ?? TONES[i % TONES.length]
    }))
  );

  const placed = $derived.by(() => {
    const boxes = data.map((d) => {
      const lines = splitLabel(d.label);
      const longest = Math.max(...lines.map((l) => [...l].length));
      return { w: Math.min(120, 12 + 7 * longest), h: lines.length > 1 ? 34 : 20, lines };
    });
    const result = placePriorityLabels(
      data.map((d) => ({ x: d.x, y: d.y, label: d.label })),
      boxes,
      { width, height, marginLeft: MARGIN.left, marginTop: MARGIN.top, plotWidth: plotW, plotHeight: plotH },
      { xThreshold, yThreshold, obstacles: buildMatrixObstacles(tx, ty, plotW, plotH) }
    );
    return result.map((p) => ({ ...p, lines: boxes[p.index]!.lines as string[] }));
  });

  const dataValueItems = $derived(
    data.map((d) => `${d.label} : complexité ${coordText(d.x)}, valeur ${coordText(d.y)}`)
  );

  const quadName = (id: string) => QUADRANTS.find((q) => q.id === id)?.name ?? id;
  const classes = () => ["st-priorityMatrix", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div class="st-priorityMatrix__visual" role="img" aria-label={label}>
    <svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
      {#if title}
        <text class="st-priorityMatrix__title" x={MARGIN.left} y={15} text-anchor="start">{title}</text>
      {/if}

      {#each quads as q (q.id)}
        <rect class="st-priorityMatrix__quad st-priorityMatrix__quad--{q.id}" x={q.x} y={q.y} width={q.w} height={q.h} />
      {/each}

      {#each TICKS as t (t)}
        {@const y = scaleY(t)}
        <line class="st-priorityMatrix__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={y} y2={y} />
        <text class="st-priorityMatrix__tick" x={MARGIN.left - 6} y={y} text-anchor="end" dominant-baseline="middle">{t}</text>
      {/each}
      {#each TICKS as t (t)}
        {@const x = scaleX(t)}
        <text class="st-priorityMatrix__tick" x={x} y={height - MARGIN.bottom + 16} text-anchor="middle">{t}</text>
      {/each}

      <line class="st-priorityMatrix__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
      <line class="st-priorityMatrix__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

      <line class="st-priorityMatrix__threshold" x1={tx} x2={tx} y1={MARGIN.top} y2={MARGIN.top + plotH} />
      <line class="st-priorityMatrix__threshold" x1={MARGIN.left} x2={MARGIN.left + plotW} y1={ty} y2={ty} />

      {#each quadNames as q (q.id)}
        <text class="st-priorityMatrix__quadName" x={q.x} y={q.y} text-anchor={q.anchor}>{quadName(q.id)}</text>
      {/each}

      {#if xLabel}
        <text class="st-priorityMatrix__axisLabel" x={MARGIN.left + plotW / 2} y={height - 4} text-anchor="middle">{xLabel}</text>
      {/if}
      {#if yLabel}
        <text class="st-priorityMatrix__axisLabel" x={12} y={MARGIN.top + plotH / 2} text-anchor="middle" transform="rotate(-90 12 {MARGIN.top + plotH / 2})">{yLabel}</text>
      {/if}

      {#each points as p (p.index)}
        <circle class="st-priorityMatrix__point st-priorityMatrix__point--{p.tone}" cx={p.cx} cy={p.cy} r={radius} />
      {/each}

      {#each placed as p (p.index)}
        <line class="st-priorityMatrix__leader" x1={p.leaderX1} y1={p.leaderY1} x2={p.leaderX2} y2={p.leaderY2} />
        <rect class="st-priorityMatrix__labelBox" x={p.x} y={p.y} width={p.w} height={p.h} rx={3} />
        {#each p.lines as line, li (li)}
          <text class="st-priorityMatrix__labelText" x={p.x + p.w / 2} y={p.y + 13 + li * 13} text-anchor="middle">{line}</text>
        {/each}
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />
</div>

<style>
  .st-priorityMatrix { color: var(--st-semantic-text-secondary); display: block; font-family: inherit; position: relative; width: 100%; }
  .st-priorityMatrix__visual { display: block; }
  .st-priorityMatrix svg { display: block; overflow: visible; }
  .st-priorityMatrix__title { fill: var(--st-semantic-text-primary); font-size: 0.875rem; font-weight: 700; }
  .st-priorityMatrix__quad--quick-wins { fill: color-mix(in srgb, var(--st-semantic-feedback-success) 12%, transparent); }
  .st-priorityMatrix__quad--major-projects { fill: color-mix(in srgb, var(--st-semantic-feedback-info) 12%, transparent); }
  .st-priorityMatrix__quad--wait { fill: color-mix(in srgb, var(--st-semantic-feedback-warning) 12%, transparent); }
  .st-priorityMatrix__quad--drop { fill: color-mix(in srgb, var(--st-semantic-border-subtle) 22%, transparent); }
  .st-priorityMatrix__threshold { stroke: var(--st-semantic-text-secondary); stroke-width: 1.5; stroke-dasharray: 5 4; }
  .st-priorityMatrix__quadName { fill: var(--st-semantic-text-secondary); font-size: 0.6875rem; font-weight: 600; }
  .st-priorityMatrix__grid { stroke: var(--st-semantic-border-subtle); stroke-dasharray: 2 3; stroke-width: 1; opacity: 0.7; }
  .st-priorityMatrix__axis { stroke: var(--st-semantic-border-subtle); stroke-width: 1; }
  .st-priorityMatrix__tick { fill: var(--st-semantic-text-secondary); font-size: 0.6875rem; }
  .st-priorityMatrix__axisLabel { fill: var(--st-semantic-text-secondary); font-size: 0.75rem; font-weight: 600; }
  .st-priorityMatrix__point--category1 { fill: var(--st-semantic-data-category1); }
  .st-priorityMatrix__point--category2 { fill: var(--st-semantic-data-category2); }
  .st-priorityMatrix__point--category3 { fill: var(--st-semantic-data-category3); }
  .st-priorityMatrix__point--category4 { fill: var(--st-semantic-data-category4); }
  .st-priorityMatrix__point--category5 { fill: var(--st-semantic-data-category5); }
  .st-priorityMatrix__point--category6 { fill: var(--st-semantic-data-category6); }
  .st-priorityMatrix__point--category7 { fill: var(--st-semantic-data-category7); }
  .st-priorityMatrix__point--category8 { fill: var(--st-semantic-data-category8); }
  .st-priorityMatrix__leader { stroke: var(--st-semantic-text-secondary); stroke-width: 1; opacity: 0.8; }
  .st-priorityMatrix__labelBox { fill: var(--st-semantic-surface-default); stroke: var(--st-semantic-border-subtle); stroke-width: 1; }
  .st-priorityMatrix__labelText { fill: var(--st-semantic-text-primary); font-size: 0.6875rem; }
</style>
