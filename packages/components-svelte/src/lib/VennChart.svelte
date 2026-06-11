<script lang="ts" module>
  /**
   * VennChart (diagramme de Venn / Euler) - API canonique (référence Svelte,
   * React/Vue doivent s'aligner byte-pour-byte sur la géométrie).
   *
   * Deux ou trois ensembles dessinés en cercles superposés semi-transparents.
   * Chaque zone (region) est décrite par les ensembles qu'elle couvre et une
   * valeur :
   *   - { sets: ["A"], value }        → membres de A seul ;
   *   - { sets: ["A","B"], value }    → intersection A∩B ;
   *   - { sets: ["A","B","C"], value} → intersection triple.
   *
   * Géométrie DÉTERMINISTE (aucun aléatoire, layout identique entre frameworks) :
   *   - Les cercles sont placés à des positions FIXES selon le nombre d'ensembles
   *     (2 : côte à côte avec recouvrement ; 3 : triangle équilatéral).
   *   - Le rayon de chaque cercle ∝ √(taille totale de l'ensemble), où la taille
   *     d'un ensemble est la somme des valeurs de toutes les zones qui le
   *     contiennent. Mapping linéaire du √ entre un rayon min et un rayon max.
   *
   * Étiquettes : le nom de chaque ensemble est posé près du cercle ; la valeur de
   * chaque zone d'intersection (sets.length ≥ 2) est posée au centroïde des
   * centres des cercles concernés. Légende des ensembles + tooltip au survol +
   * liste accessible (ChartDataList) hors SVG.
   *
   * Props :
   *   data    VennChartArea[]  - {sets, value}
   *   label   string           - aria-label (role=img)
   *   width   number (420)      - largeur du viewBox
   *   height  number (360)      - hauteur du viewBox
   *   class   string            - classe CSS additionnelle
   */
  export type VennChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type VennChartArea = {
    sets: string[];
    value: number;
  };

  export type VennChartProps = {
    data: VennChartArea[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
  };

  const TONES: VennChartTone[] = [
    "category1",
    "category2",
    "category3",
    "category4",
    "category5",
    "category6",
    "category7",
    "category8",
  ];

  type VennCircle = {
    name: string;
    tone: VennChartTone;
    cx: number;
    cy: number;
    r: number;
    total: number;
    labelX: number;
    labelY: number;
    anchor: "start" | "middle" | "end";
  };

  type VennRegion = {
    sets: string[];
    value: number;
    x: number;
    y: number;
  };

  export type VennLayout = {
    circles: VennCircle[];
    regions: VennRegion[];
    items: string[];
  };

  function safeValue(value: number): number {
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  /**
   * Calcule la géométrie déterministe du diagramme. Identique entre frameworks.
   */
  export function vennLayout(data: VennChartArea[], width: number, height: number): VennLayout {
    const areas = data
      .map((d) => ({ sets: Array.isArray(d.sets) ? d.sets.filter((s) => typeof s === "string") : [], value: safeValue(d.value) }))
      .filter((d) => d.sets.length > 0 && d.value > 0);

    // Ensembles dans l'ordre de première apparition (déterministe).
    const order: string[] = [];
    for (const a of areas) {
      for (const s of a.sets) if (!order.includes(s)) order.push(s);
    }
    const names = order.slice(0, 3);

    if (names.length === 0) {
      return { circles: [], regions: [], items: [] };
    }

    // Taille totale d'un ensemble = somme des valeurs des zones qui le contiennent.
    const totals = new Map<string, number>();
    for (const name of names) {
      let sum = 0;
      for (const a of areas) if (a.sets.includes(name)) sum += a.value;
      totals.set(name, sum);
    }

    const cx = width / 2;
    const cy = height / 2;
    const span = Math.min(width, height);
    const rMax = span * 0.3;
    const rMin = span * 0.2;
    const roots = names.map((n) => Math.sqrt(totals.get(n) ?? 0));
    const rootMin = Math.min(...roots);
    const rootMax = Math.max(...roots);
    const rootSpan = rootMax - rootMin;
    const radiusFor = (root: number) => (rootSpan > 0 ? rMin + ((root - rootMin) / rootSpan) * (rMax - rMin) : rMax);

    // Positions FIXES des centres selon le nombre d'ensembles.
    let centers: Array<{ cx: number; cy: number }>;
    if (names.length === 1) {
      centers = [{ cx, cy }];
    } else if (names.length === 2) {
      const off = span * 0.16;
      centers = [
        { cx: cx - off, cy },
        { cx: cx + off, cy },
      ];
    } else {
      // Triangle équilatéral (pointe en bas), centré.
      const off = span * 0.17;
      centers = [
        { cx: cx - off, cy: cy - off * 0.6 },
        { cx: cx + off, cy: cy - off * 0.6 },
        { cx, cy: cy + off * 0.85 },
      ];
    }

    const circles: VennCircle[] = names.map((name, i) => {
      const r = radiusFor(roots[i]);
      const c = centers[i];
      // Étiquette poussée vers l'extérieur depuis le centre du diagramme.
      const dx = c.cx - cx;
      const dy = c.cy - cy;
      const len = Math.hypot(dx, dy) || 1;
      const ux = names.length === 1 ? 0 : dx / len;
      const uy = names.length === 1 ? -1 : dy / len;
      const labelX = c.cx + ux * (r + 6);
      const labelY = c.cy + uy * (r + 6);
      const anchor: "start" | "middle" | "end" = ux > 0.3 ? "start" : ux < -0.3 ? "end" : "middle";
      return {
        name,
        tone: TONES[i % TONES.length],
        cx: c.cx,
        cy: c.cy,
        r,
        total: totals.get(name) ?? 0,
        labelX,
        labelY,
        anchor,
      };
    });

    const centerByName = new Map(circles.map((c) => [c.name, c]));
    const regions: VennRegion[] = areas
      .filter((a) => a.sets.length >= 2)
      .map((a) => {
        const pts = a.sets.map((s) => centerByName.get(s)).filter((c): c is VennCircle => c !== undefined);
        const px = pts.length > 0 ? pts.reduce((s, c) => s + c.cx, 0) / pts.length : cx;
        const py = pts.length > 0 ? pts.reduce((s, c) => s + c.cy, 0) / pts.length : cy;
        return { sets: a.sets, value: a.value, x: px, y: py };
      });

    const items = areas.map((a) => `${a.sets.join(" ∩ ")}: ${a.value}`);

    return { circles, regions, items };
  }
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  let { data, label, width = 420, height = 360, class: className }: VennChartProps = $props();

  let hoveredIndex: number | null = $state(null);

  const layout = $derived(vennLayout(data, width, height));
  const classes = () => ["st-vennChart", className].filter(Boolean).join(" ");

  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredIndex = null;
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(index) ? index : null;
  }

  const hovered = $derived(hoveredIndex !== null ? layout.circles[hoveredIndex] : undefined);
</script>

<div class={classes()}>
  <div
    class="st-vennChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handleVisualPointerMove}
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
      {#each layout.circles as circle, i (circle.name)}
        <circle
          class="st-vennChart__circle st-vennChart__circle--{circle.tone}"
          class:st-vennChart__circle--dim={hoveredIndex !== null && hoveredIndex !== i}
          cx={circle.cx}
          cy={circle.cy}
          r={circle.r}
          data-chart-index={i}
        />
      {/each}

      {#each layout.regions as region (region.sets.join("|"))}
        <text class="st-vennChart__value" x={region.x} y={region.y} text-anchor="middle" dominant-baseline="middle">
          {region.value}
        </text>
      {/each}

      {#each layout.circles as circle (circle.name)}
        <text
          class="st-vennChart__label"
          x={circle.labelX}
          y={circle.labelY}
          text-anchor={circle.anchor}
          dominant-baseline="middle"
        >
          {circle.name}
        </text>
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={layout.items} />

  {#if hovered}
    <div
      class="st-vennChart__tooltip"
      role="presentation"
      style="left: {(hovered.cx / width) * 100}%; top: {(hovered.cy / height) * 100}%;"
    >
      <span class="st-vennChart__tooltipLabel">{hovered.name}</span>
      <span class="st-vennChart__tooltipValue">{hovered.total}</span>
    </div>
  {/if}
</div>

<style>
  .st-vennChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    max-width: 100%;
    position: relative;
    width: 100%;
  }

  .st-vennChart svg,
  .st-vennChart__visual {
    display: block;
    overflow: visible;
  }

  .st-vennChart__circle {
    cursor: pointer;
    fill-opacity: 0.42;
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1.5;
    transition: opacity 120ms ease;
  }

  .st-vennChart__circle--dim {
    opacity: 0.45;
  }

  .st-vennChart__circle--category1 { fill: var(--st-semantic-data-category1); }
  .st-vennChart__circle--category2 { fill: var(--st-semantic-data-category2); }
  .st-vennChart__circle--category3 { fill: var(--st-semantic-data-category3); }
  .st-vennChart__circle--category4 { fill: var(--st-semantic-data-category4); }
  .st-vennChart__circle--category5 { fill: var(--st-semantic-data-category5); }
  .st-vennChart__circle--category6 { fill: var(--st-semantic-data-category6); }
  .st-vennChart__circle--category7 { fill: var(--st-semantic-data-category7); }
  .st-vennChart__circle--category8 { fill: var(--st-semantic-data-category8); }

  .st-vennChart__label {
    fill: var(--st-semantic-text-primary);
    font-size: 0.78rem;
    font-weight: 650;
    pointer-events: none;
  }

  .st-vennChart__value {
    fill: var(--st-semantic-text-primary);
    font-size: 0.72rem;
    font-weight: 600;
    pointer-events: none;
  }

  .st-vennChart__tooltip {
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
    transform: translate(-50%, -115%);
    white-space: nowrap;
    z-index: 1;
  }

  .st-vennChart__tooltipLabel { font-weight: 600; }
  .st-vennChart__tooltipValue { opacity: 0.85; }
</style>
