<script lang="ts" module>
  export type TreegraphChartTone =
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  export type TreegraphChartNode = {
    id: string;
    parentId?: string | null;
    label: string;
    tone?: TreegraphChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type TreegraphChartProps = {
    /** Nœuds plats : `parentId` null/absent = racine. Plusieurs racines acceptées. */
    data: TreegraphChartNode[];
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };

  let {
    data,
    width = 640,
    height = 360,
    label,
    class: className
  }: TreegraphChartProps = $props();

  const TONES = [
    "category1", "category2", "category3", "category4",
    "category5", "category6", "category7", "category8"
  ] as const;

  type Node = {
    id: string;
    label: string;
    tone: TreegraphChartTone;
    depth: number;
    x: number; // centre X (profondeur → horizontal)
    y: number; // centre Y
    parentId: string | null;
  };

  type Link = { id: string; x1: number; y1: number; x2: number; y2: number };

  const R = 7; // rayon du cercle
  const PAD_X = 80; // marge latérale (place pour les labels)
  const PAD_Y = 12; // marge verticale

  type Layout = { nodes: Node[]; links: Link[]; rowH: number };

  const layout = $derived.by<Layout>(() => {
    if (!data || data.length === 0) return { nodes: [], links: [], rowH: 0 };

    // Index + détection des racines (parentId invalide/cyclique → traité comme racine).
    const byId = new Map<string, TreegraphChartNode>();
    for (const n of data) if (n.id != null && !byId.has(n.id)) byId.set(n.id, n);

    const validParent = (n: TreegraphChartNode): string | null => {
      const p = n.parentId;
      if (p == null) return null;
      if (!byId.has(p) || p === n.id) return null;
      // Évite les cycles : remonte la chaîne, si on revient sur n.id → racine.
      let cursor: string | null = p;
      const seen = new Set<string>([n.id]);
      while (cursor != null) {
        if (seen.has(cursor)) return null;
        seen.add(cursor);
        const parent: TreegraphChartNode | undefined = byId.get(cursor);
        cursor = parent ? (parent.parentId ?? null) : null;
      }
      return p;
    };

    const childrenOf = new Map<string, string[]>();
    const roots: string[] = [];
    for (const n of byId.values()) {
      const p = validParent(n);
      if (p == null) {
        roots.push(n.id);
      } else {
        const list = childrenOf.get(p) ?? [];
        list.push(n.id);
        childrenOf.set(p, list);
      }
    }

    // Profondeur par nœud + position des feuilles (parcours en profondeur, ordre stable).
    const depthOf = new Map<string, number>();
    const leafOrder = new Map<string, number>();
    let leafCounter = 0;
    let maxDepth = 0;

    const visit = (id: string, depth: number) => {
      depthOf.set(id, depth);
      if (depth > maxDepth) maxDepth = depth;
      const kids = childrenOf.get(id) ?? [];
      if (kids.length === 0) {
        leafOrder.set(id, leafCounter);
        leafCounter += 1;
        return;
      }
      for (const k of kids) visit(k, depth + 1);
    };
    for (const r of roots) visit(r, 0);

    const leafCount = Math.max(leafCounter, 1);

    // Y (centre) : feuille = sa rangée ; parent = moyenne des enfants.
    const usableY = Math.max(height - PAD_Y * 2, 1);
    const rowH = usableY / leafCount;

    const centerY = new Map<string, number>();
    const computeY = (id: string): number => {
      const cached = centerY.get(id);
      if (cached != null) return cached;
      const kids = childrenOf.get(id) ?? [];
      let cy: number;
      if (kids.length === 0) {
        const row = leafOrder.get(id) ?? 0;
        cy = PAD_Y + row * rowH + rowH / 2;
      } else {
        const ys = kids.map((k) => computeY(k));
        cy = ys.reduce((s, v) => s + v, 0) / ys.length;
      }
      centerY.set(id, cy);
      return cy;
    };
    for (const r of roots) computeY(r);

    // X : une colonne par niveau, répartie horizontalement.
    const levels = maxDepth + 1;
    const usableX = Math.max(width - PAD_X * 2, 1);
    const colGap = levels > 1 ? usableX / (levels - 1) : 0;
    const xForDepth = (d: number) => (levels > 1 ? PAD_X + d * colGap : width / 2);

    const nodes: Node[] = [];
    let toneIdx = 0;
    // Ordre : profondeur croissante puis ordre d'insertion → rendu stable.
    const ordered = [...byId.values()].filter((n) => depthOf.has(n.id));
    for (const n of ordered) {
      const depth = depthOf.get(n.id) ?? 0;
      const tone = n.tone ?? TONES[toneIdx % TONES.length];
      if (!n.tone) toneIdx += 1;
      nodes.push({
        id: n.id,
        label: n.label,
        tone,
        depth,
        x: xForDepth(depth),
        y: centerY.get(n.id) ?? height / 2,
        parentId: validParent(n)
      });
    }

    const nodeById = new Map(nodes.map((b) => [b.id, b]));
    const links: Link[] = [];
    for (const b of nodes) {
      if (b.parentId == null) continue;
      const parent = nodeById.get(b.parentId);
      if (!parent) continue;
      links.push({
        id: b.id,
        x1: parent.x + R,
        y1: parent.y,
        x2: b.x - R,
        y2: b.y
      });
    }

    return { nodes, links, rowH };
  });

  // Police adaptée à la hauteur de rangée (plus petite si serré).
  const fontSize = $derived(layout.rowH < 18 ? 9 : layout.rowH < 26 ? 10 : 11);
  // Nombre de caractères affichables avant ellipsis (approx. largeur de glyphe).
  const maxChars = $derived(Math.max(2, Math.floor((PAD_X - R - 6) / (fontSize * 0.58))));

  const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, Math.max(1, n - 1))}…` : s);

  const dataValueItems = $derived(
    layout.nodes.map((b) => {
      const parent = b.parentId != null ? layout.nodes.find((p) => p.id === b.parentId) : undefined;
      return parent ? `${b.label} (${b.id}) → ${parent.label}` : `${b.label} (${b.id})`;
    })
  );

  const classes = () => ["st-treegraphChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div class="st-treegraphChart__visual" role="img" aria-label={label}>
    <svg
      viewBox="0 0 {width} {height}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
      {#each layout.links as link (link.id)}
        {@const cx = (link.x1 + link.x2) / 2}
        <path
          class="st-treegraphChart__link"
          d="M {link.x1} {link.y1} C {cx} {link.y1} {cx} {link.y2} {link.x2} {link.y2}"
          fill="none"
        />
      {/each}

      {#each layout.nodes as node (node.id)}
        {@const isLeaf = !layout.nodes.some((c) => c.parentId === node.id)}
        <g class="st-treegraphChart__node">
          <circle
            class="st-treegraphChart__dot st-treegraphChart__dot--{node.tone}"
            cx={node.x}
            cy={node.y}
            r={R}
          />
          <text
            class="st-treegraphChart__label"
            x={isLeaf ? node.x + R + 4 : node.x - R - 4}
            y={node.y}
            text-anchor={isLeaf ? "start" : "end"}
            dominant-baseline="central"
            style="font-size: {fontSize}px"
          >
            {clip(node.label, maxChars)}
          </text>
        </g>
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />
</div>

<style>
  .st-treegraphChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-treegraphChart svg,
  .st-treegraphChart__visual {
    display: block;
    overflow: visible;
  }

  .st-treegraphChart__link {
    stroke: var(--st-semantic-border-default, #cbd5e1);
    stroke-width: 1.5;
  }

  .st-treegraphChart__dot {
    stroke: var(--st-semantic-surface-default, #fff);
    stroke-width: 1.5;
  }

  .st-treegraphChart__dot--category1 { fill: var(--st-semantic-data-category1); }
  .st-treegraphChart__dot--category2 { fill: var(--st-semantic-data-category2); }
  .st-treegraphChart__dot--category3 { fill: var(--st-semantic-data-category3); }
  .st-treegraphChart__dot--category4 { fill: var(--st-semantic-data-category4); }
  .st-treegraphChart__dot--category5 { fill: var(--st-semantic-data-category5); }
  .st-treegraphChart__dot--category6 { fill: var(--st-semantic-data-category6); }
  .st-treegraphChart__dot--category7 { fill: var(--st-semantic-data-category7); }
  .st-treegraphChart__dot--category8 { fill: var(--st-semantic-data-category8); }

  .st-treegraphChart__label {
    fill: var(--st-semantic-text-primary, #1e293b);
    font-weight: 600;
    pointer-events: none;
  }
</style>
