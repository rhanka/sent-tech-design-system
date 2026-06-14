<script lang="ts" module>
  /**
   * FlamegraphChart - pile d'appels (call stacks) « icicle » empilée (façon
   * Grafana flamegraph / Brendan Gregg). La LARGEUR d'un nœud est ∝ `value` ; la
   * racine occupe toute la largeur, chaque enfant occupe `value/sum(siblings)` de
   * la largeur de son parent. La PROFONDEUR (niveau) est l'axe vertical : les
   * enfants sont posés sous leur parent, rangée par rangée.
   * API canonique (référence Svelte, React/Vue doivent s'aligner).
   *
   * Modèle : UN nœud racine récursif. La couleur suit la profondeur (cycle sur
   * category1..8). Étiquette tronquée par nœud (ellipsis). Survol d'un nœud →
   * infobulle nom + valeur.
   *
   * Props obligatoires :
   *   data   FlamegraphNode  - { name, value, children? }
   *
   * Props optionnelles :
   *   label   string
   *   width   number  (défaut 640)
   *   height  number  (défaut 320)
   *   size    number  (alias de width)
   *   class   string
   */
  export type FlamegraphNode = {
    name: string;
    value: number;
    children?: FlamegraphNode[];
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type FlamegraphChartProps = {
    data: FlamegraphNode;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
  };

  let {
    data,
    label,
    width,
    height = 320,
    size,
    class: className
  }: FlamegraphChartProps = $props();

  const resolvedWidth = $derived(width ?? size ?? 640);

  const MARGIN = { top: 16, right: 16, bottom: 16, left: 16 };
  const ROW_H = 26;
  const ROW_GAP = 2;

  let hoveredKey: string | null = $state(null);

  const plotWidth = $derived(Math.max(resolvedWidth - MARGIN.left - MARGIN.right, 1));

  // Couleur par profondeur (1..8, cyclé).
  const toneForDepth = (depth: number): string => `category${(depth % 8) + 1}`;

  // Tronque une étiquette à la largeur du rectangle (approx. par char).
  function ellipsize(text: string, maxChars: number): string {
    if (text.length <= maxChars) return text;
    if (maxChars <= 1) return "…";
    return `${text.slice(0, maxChars - 1)}…`;
  }

  type Cell = {
    key: string;
    name: string;
    value: number;
    depth: number;
    x: number;
    y: number;
    width: number;
    tone: string;
    cx: number;
    cy: number;
  };

  // Layout récursif « icicle » : la racine occupe `plotWidth` ; chaque enfant
  // occupe une fraction `value/sum(siblings)` de la largeur de son parent. y =
  // profondeur × (hauteur de rangée + gap).
  const cells = $derived.by(() => {
    const out: Cell[] = [];
    if (!data || typeof data.name !== "string" || !Number.isFinite(data.value)) return out;
    let maxDepth = 0;

    const walk = (node: FlamegraphNode, depth: number, x0: number, w: number, path: string) => {
      if (w <= 0) return;
      if (depth > maxDepth) maxDepth = depth;
      const y = MARGIN.top + depth * (ROW_H + ROW_GAP);
      out.push({
        key: path,
        name: node.name,
        value: node.value,
        depth,
        x: x0,
        y,
        width: w,
        tone: toneForDepth(depth),
        cx: x0 + w / 2,
        cy: y + ROW_H / 2
      });
      const kids = (node.children ?? []).filter(
        (c) => c && typeof c.name === "string" && Number.isFinite(c.value) && c.value > 0
      );
      if (kids.length === 0) return;
      const total = kids.reduce((s, c) => s + Math.max(c.value, 0), 0);
      if (total <= 0) return;
      let cursor = x0;
      kids.forEach((child, ci) => {
        const cw = (Math.max(child.value, 0) / total) * w;
        walk(child, depth + 1, cursor, cw, `${path}.${ci}`);
        cursor += cw;
      });
    };

    walk(data, 0, MARGIN.left, plotWidth, "0");
    return out;
  });

  const computedHeight = $derived.by(() => {
    if (cells.length === 0) return height;
    const maxDepth = cells.reduce((m, c) => Math.max(m, c.depth), 0);
    const needed = MARGIN.top + (maxDepth + 1) * (ROW_H + ROW_GAP) - ROW_GAP + MARGIN.bottom;
    return Math.max(height, needed);
  });

  // Nombre de caractères affichables avant ellipsis (approx. largeur de glyphe).
  const charsFor = (w: number) => Math.max(0, Math.floor((w - 8) / 6.6));

  const dataValueItems = $derived(cells.map((c) => `${"·".repeat(c.depth)}${c.name}: ${c.value}`));

  function handlePointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredKey = null;
      return;
    }
    const key = target.getAttribute("data-chart-key");
    hoveredKey = key ?? null;
  }

  const hoveredCell = $derived.by(() => {
    if (hoveredKey === null) return null;
    return cells.find((c) => c.key === hoveredKey) ?? null;
  });

  const classes = () => ["st-flamegraphChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-flamegraphChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handlePointerMove}
    onpointerleave={() => (hoveredKey = null)}
  >
    <svg
      viewBox="0 0 {resolvedWidth} {computedHeight}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
      <!-- une rangée par profondeur : rectangle dont la largeur ∝ value -->
      {#each cells as cell (cell.key)}
        {@const chars = charsFor(cell.width)}
        <g class="st-flamegraphChart__node">
          <rect
            class="st-flamegraphChart__frame st-flamegraphChart__frame--{cell.tone}"
            class:st-flamegraphChart__frame--dim={hoveredKey !== null && hoveredKey !== cell.key}
            x={cell.x}
            y={cell.y}
            width={Math.max(cell.width, 1)}
            height={ROW_H}
            rx="2"
            data-chart-key={cell.key}
          />
          {#if chars >= 2}
            <text
              class="st-flamegraphChart__label"
              x={cell.x + 4}
              y={cell.y + ROW_H / 2}
              dominant-baseline="central"
            >
              {ellipsize(cell.name, chars)}
            </text>
          {/if}
        </g>
      {/each}
    </svg>
  </div>

  <ChartDataList label={label ?? "flamegraph"} items={dataValueItems} />

  {#if hoveredCell}
    {@const cell = hoveredCell}
    <div
      class="st-flamegraphChart__tooltip"
      role="presentation"
      style="left: {(cell.cx / resolvedWidth) * 100}%; top: {(cell.cy / computedHeight) * 100}%"
    >
      <span class="st-flamegraphChart__tooltipLabel">{cell.name}</span>
      <span class="st-flamegraphChart__tooltipValue">{cell.value}</span>
    </div>
  {/if}
</div>

<style>
  .st-flamegraphChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-flamegraphChart svg {
    display: block;
    overflow: visible;
  }

  .st-flamegraphChart__visual {
    display: block;
  }

  .st-flamegraphChart__frame {
    cursor: pointer;
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1;
    transition: opacity 120ms ease;
  }

  .st-flamegraphChart__frame--dim {
    opacity: 0.4;
  }

  .st-flamegraphChart__frame--category1 { fill: var(--st-semantic-data-category1); }
  .st-flamegraphChart__frame--category2 { fill: var(--st-semantic-data-category2); }
  .st-flamegraphChart__frame--category3 { fill: var(--st-semantic-data-category3); }
  .st-flamegraphChart__frame--category4 { fill: var(--st-semantic-data-category4); }
  .st-flamegraphChart__frame--category5 { fill: var(--st-semantic-data-category5); }
  .st-flamegraphChart__frame--category6 { fill: var(--st-semantic-data-category6); }
  .st-flamegraphChart__frame--category7 { fill: var(--st-semantic-data-category7); }
  .st-flamegraphChart__frame--category8 { fill: var(--st-semantic-data-category8); }

  .st-flamegraphChart__label {
    fill: var(--st-semantic-text-inverse, #fff);
    font-size: 0.6875rem;
    pointer-events: none;
  }

  .st-flamegraphChart__tooltip {
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

  .st-flamegraphChart__tooltipLabel {
    font-weight: 600;
  }

  .st-flamegraphChart__tooltipValue {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-flamegraphChart__frame {
      transition: none;
    }
  }
</style>
