<script lang="ts" module>
  export type OrganizationChartTone =
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  export type OrganizationChartNode = {
    id: string;
    parentId?: string | null;
    label: string;
    tone?: OrganizationChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type OrganizationChartProps = {
    /** Nœuds plats : `parentId` null/absent = racine. Plusieurs racines acceptées. */
    data: OrganizationChartNode[];
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };

  let {
    data,
    width = 640,
    height = 320,
    label,
    class: className
  }: OrganizationChartProps = $props();

  const TONES = [
    "category1", "category2", "category3", "category4",
    "category5", "category6", "category7", "category8"
  ] as const;

  type Box = {
    id: string;
    label: string;
    tone: OrganizationChartTone;
    depth: number;
    x: number; // centre X
    y: number; // haut de la boîte
    parentId: string | null;
  };

  type Link = { id: string; x1: number; y1: number; x2: number; y2: number };

  const BOX_H = 36;
  const GAP_X = 16; // espace horizontal entre frères (feuilles)
  const PAD_X = 8; // marge latérale

  type Layout = { boxes: Box[]; links: Link[]; boxW: number };

  const layout = $derived.by<Layout>(() => {
    if (!data || data.length === 0) return { boxes: [], links: [], boxW: 0 };

    // Index + détection des racines (parentId invalide/cyclique → traité comme racine).
    const byId = new Map<string, OrganizationChartNode>();
    for (const n of data) if (n.id != null && !byId.has(n.id)) byId.set(n.id, n);

    const validParent = (n: OrganizationChartNode): string | null => {
      const p = n.parentId;
      if (p == null) return null;
      if (!byId.has(p) || p === n.id) return null;
      // Évite les cycles : remonte la chaîne, si on revient sur n.id → racine.
      let cursor: string | null = p;
      const seen = new Set<string>([n.id]);
      while (cursor != null) {
        if (seen.has(cursor)) return null;
        seen.add(cursor);
        const parent: OrganizationChartNode | undefined = byId.get(cursor);
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

    // Largeur de boîte : on répartit `leafCount` colonnes sur la largeur utile.
    const usable = Math.max(width - PAD_X * 2, 1);
    const colW = usable / leafCount;
    const boxW = Math.max(colW - GAP_X, 24);

    // X (centre) : feuille = sa colonne ; parent = moyenne des enfants.
    const centerX = new Map<string, number>();
    const computeX = (id: string): number => {
      const cached = centerX.get(id);
      if (cached != null) return cached;
      const kids = childrenOf.get(id) ?? [];
      let cx: number;
      if (kids.length === 0) {
        const col = leafOrder.get(id) ?? 0;
        cx = PAD_X + col * colW + colW / 2;
      } else {
        const xs = kids.map((k) => computeX(k));
        cx = xs.reduce((s, v) => s + v, 0) / xs.length;
      }
      centerX.set(id, cx);
      return cx;
    };
    for (const r of roots) computeX(r);

    // Y : une rangée par niveau, répartie verticalement.
    const levels = maxDepth + 1;
    const usableY = Math.max(height - BOX_H, 1);
    const rowGap = levels > 1 ? usableY / (levels - 1) : 0;
    const yForDepth = (d: number) => (levels > 1 ? d * rowGap : (height - BOX_H) / 2);

    const boxes: Box[] = [];
    let toneIdx = 0;
    // Ordre : profondeur croissante puis ordre d'insertion → rendu stable.
    const ordered = [...byId.values()].filter((n) => depthOf.has(n.id));
    for (const n of ordered) {
      const depth = depthOf.get(n.id) ?? 0;
      const tone = n.tone ?? TONES[toneIdx % TONES.length];
      if (!n.tone) toneIdx += 1;
      boxes.push({
        id: n.id,
        label: n.label,
        tone,
        depth,
        x: centerX.get(n.id) ?? width / 2,
        y: yForDepth(depth),
        parentId: validParent(n)
      });
    }

    const boxById = new Map(boxes.map((b) => [b.id, b]));
    const links: Link[] = [];
    for (const b of boxes) {
      if (b.parentId == null) continue;
      const parent = boxById.get(b.parentId);
      if (!parent) continue;
      links.push({
        id: b.id,
        x1: parent.x,
        y1: parent.y + BOX_H,
        x2: b.x,
        y2: b.y
      });
    }

    return { boxes, links, boxW };
  });

  // Police adaptée à la largeur de boîte (plus petite si étroite).
  const fontSize = $derived(layout.boxW < 56 ? 9 : layout.boxW < 88 ? 10 : 12);
  // Nombre de caractères affichables avant ellipsis (approx. largeur de glyphe).
  const maxChars = $derived(Math.max(2, Math.floor((layout.boxW - 10) / (fontSize * 0.58))));

  const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, Math.max(1, n - 1))}…` : s);

  const dataValueItems = $derived(
    layout.boxes.map((b) => {
      const parent = b.parentId != null ? layout.boxes.find((p) => p.id === b.parentId) : undefined;
      return parent ? `${b.label} (${b.id}) → ${parent.label}` : `${b.label} (${b.id})`;
    })
  );

  const classes = () => ["st-organizationChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div class="st-organizationChart__visual" role="img" aria-label={label}>
    <svg
      viewBox="0 0 {width} {height}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
      {#each layout.links as link (link.id)}
        {@const midY = (link.y1 + link.y2) / 2}
        <path
          class="st-organizationChart__link"
          d="M {link.x1} {link.y1} V {midY} H {link.x2} V {link.y2}"
          fill="none"
        />
      {/each}

      {#each layout.boxes as box (box.id)}
        <g class="st-organizationChart__node">
          <rect
            class="st-organizationChart__box st-organizationChart__box--{box.tone}"
            x={box.x - layout.boxW / 2}
            y={box.y}
            width={layout.boxW}
            height={BOX_H}
            rx="6"
          />
          <text
            class="st-organizationChart__label"
            x={box.x}
            y={box.y + BOX_H / 2}
            text-anchor="middle"
            dominant-baseline="central"
            style="font-size: {fontSize}px"
          >
            {clip(box.label, maxChars)}
          </text>
        </g>
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />
</div>

<style>
  .st-organizationChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-organizationChart svg,
  .st-organizationChart__visual {
    display: block;
    overflow: visible;
  }

  .st-organizationChart__link {
    stroke: var(--st-semantic-border-default, #cbd5e1);
    stroke-width: 1.5;
  }

  .st-organizationChart__box {
    stroke: var(--st-semantic-surface-default, #fff);
    stroke-width: 1.5;
  }

  .st-organizationChart__box--category1 { fill: var(--st-semantic-data-category1); }
  .st-organizationChart__box--category2 { fill: var(--st-semantic-data-category2); }
  .st-organizationChart__box--category3 { fill: var(--st-semantic-data-category3); }
  .st-organizationChart__box--category4 { fill: var(--st-semantic-data-category4); }
  .st-organizationChart__box--category5 { fill: var(--st-semantic-data-category5); }
  .st-organizationChart__box--category6 { fill: var(--st-semantic-data-category6); }
  .st-organizationChart__box--category7 { fill: var(--st-semantic-data-category7); }
  .st-organizationChart__box--category8 { fill: var(--st-semantic-data-category8); }

  .st-organizationChart__label {
    fill: var(--st-semantic-text-inverse, #fff);
    font-weight: 600;
    pointer-events: none;
  }
</style>
