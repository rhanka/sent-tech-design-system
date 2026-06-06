<script lang="ts" module>
  /**
   * SunburstChart - API canonique (référence Svelte, React/Vue doivent s'aligner)
   *
   * Props obligatoires :
   *   data   SunburstChartDatum  - nœud racine (label + children récursifs)
   *   label  string              - aria-label du graphique
   *
   * Props optionnelles :
   *   legend  boolean  (défaut false) - affiche la légende des top-level children
   *   width   number   (défaut 320)   - largeur du viewBox en px
   *   height  number   (défaut 320)   - hauteur du viewBox en px
   *   class   string                  - classe CSS supplémentaire
   *
   * Labels d'arcs :
   *   Affichés sur les arcs de span > 0.28 rad. Couleur de texte calculée par
   *   luminance (via chartContrast.ts) pour garantir le contraste WCAG AA sur
   *   chaque fond catégoriel - pas de texte blanc fixe.
   *
   * Infobulle : format "parent, enfant" (séparateur ", ") - cohérent avec lot 1.
   */
  export type SunburstChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type SunburstChartDatum = {
    label: string;
    value?: number;
    tone?: SunburstChartTone;
    children?: SunburstChartDatum[];
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";
  import { contrastTextForTone } from "./chartContrast.js";

  type SunburstChartProps = {
    data: SunburstChartDatum;
    label: string;
    legend?: boolean;
    width?: number;
    height?: number;
    class?: string;
  };

  type ArcDatum = {
    datum: SunburstChartDatum;
    pathLabel: string[];
    value: number;
    tone: SunburstChartTone;
    depth: number;
    start: number;
    end: number;
    path: string;
    labelX: number;
    labelY: number;
  };

  let {
    data,
    label,
    legend = false,
    width = 320,
    height = 320,
    class: className
  }: SunburstChartProps = $props();

  const TONES = [
    "category1",
    "category2",
    "category3",
    "category4",
    "category5",
    "category6",
    "category7",
    "category8"
  ] as const;

  function leafValue(value: number | undefined): number {
    return Number.isFinite(value) && (value ?? 0) > 0 ? (value as number) : 0;
  }

  function sumValue(node: SunburstChartDatum): number {
    if (node.children && node.children.length > 0) {
      return node.children.reduce((sum, child) => sum + sumValue(child), 0);
    }
    return leafValue(node.value);
  }

  function maxDepth(node: SunburstChartDatum, depth = 0): number {
    if (!node.children || node.children.length === 0) return depth;
    return Math.max(depth, ...node.children.map((child) => maxDepth(child, depth + 1)));
  }

  function point(cx: number, cy: number, radius: number, angle: number) {
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  }

  function arcPath(cx: number, cy: number, innerRadius: number, outerRadius: number, start: number, end: number): string {
    const safeEnd = Math.min(end, start + Math.PI * 2 - 0.0001);
    const large = safeEnd - start > Math.PI ? 1 : 0;
    const outerStart = point(cx, cy, outerRadius, start);
    const outerEnd = point(cx, cy, outerRadius, safeEnd);

    if (innerRadius <= 0) {
      return `M ${cx} ${cy} L ${outerStart.x} ${outerStart.y} A ${outerRadius} ${outerRadius} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y} Z`;
    }

    const innerEnd = point(cx, cy, innerRadius, safeEnd);
    const innerStart = point(cx, cy, innerRadius, start);
    return `M ${outerStart.x} ${outerStart.y} A ${outerRadius} ${outerRadius} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A ${innerRadius} ${innerRadius} 0 ${large} 0 ${innerStart.x} ${innerStart.y} Z`;
  }

  let hoveredIndex: number | null = $state(null);

  const arcs = $derived.by<ArcDatum[]>(() => {
    const total = sumValue(data);
    if (total <= 0 || !data.children || data.children.length === 0) return [];

    const cx = width / 2;
    const cy = height / 2;
    const ringCount = Math.max(1, maxDepth(data));
    const outerLimit = Math.max(Math.min(width, height) / 2 - 6, 1);
    const ring = outerLimit / ringCount;
    const out: ArcDatum[] = [];

    function visit(
      node: SunburstChartDatum,
      depth: number,
      start: number,
      end: number,
      pathLabel: string[],
      inheritedTone: SunburstChartTone,
      siblingIndex: number
    ) {
      if (depth > 0) {
        const tone = node.tone ?? inheritedTone ?? TONES[siblingIndex % TONES.length];
        const innerRadius = (depth - 1) * ring;
        const outerRadius = depth * ring;
        const midAngle = (start + end) / 2;
        const midRadius = (innerRadius + outerRadius) / 2;
        const labelPoint = point(cx, cy, midRadius, midAngle);
        out.push({
          datum: node,
          pathLabel,
          value: sumValue(node),
          tone,
          depth,
          start,
          end,
          path: arcPath(cx, cy, innerRadius, outerRadius, start, end),
          labelX: labelPoint.x,
          labelY: labelPoint.y
        });
      }

      const children = node.children ?? [];
      const nodeTotal = children.reduce((sum, child) => sum + sumValue(child), 0);
      if (children.length === 0 || nodeTotal <= 0) return;

      let cursor = start;
      children.forEach((child, childIndex) => {
        const value = sumValue(child);
        if (value <= 0) return;
        const span = ((end - start) * value) / nodeTotal;
        const tone = child.tone ?? (depth === 0 ? TONES[childIndex % TONES.length] : inheritedTone);
        visit(child, depth + 1, cursor, cursor + span, [...pathLabel, child.label], tone, childIndex);
        cursor += span;
      });
    }

    visit(data, 0, -Math.PI / 2, Math.PI * 1.5, [data.label], "category1", 0);
    return out;
  });

  const leafItems = $derived.by(() => {
    const items: string[] = [];
    function collect(node: SunburstChartDatum, path: string[]) {
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => collect(child, [...path, child.label]));
        return;
      }
      items.push(`${path.join(", ")}: ${leafValue(node.value)}`);
    }
    collect(data, [data.label]);
    return items.filter((item) => !item.endsWith(": 0"));
  });

  const legendItems = $derived(
    (data.children ?? []).map((child, index) => ({
      label: child.label,
      tone: child.tone ?? TONES[index % TONES.length]
    }))
  );

  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredIndex = null;
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(index) ? index : null;
  }

  const classes = () => ["st-sunburstChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-sunburstChart__visual"
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
      {#each arcs as arc, i (arc.pathLabel.join("/"))}
        <path
          class="st-sunburstChart__arc st-sunburstChart__arc--{arc.tone}"
          class:st-sunburstChart__arc--dim={hoveredIndex !== null && hoveredIndex !== i}
          d={arc.path}
          data-chart-index={i}
        />
      {/each}

      {#each arcs as arc (arc.pathLabel.join("/"))}
        {#if arc.end - arc.start > 0.28}
          <text
            class="st-sunburstChart__label"
            x={arc.labelX}
            y={arc.labelY}
            text-anchor="middle"
            dominant-baseline="middle"
            fill={contrastTextForTone(arc.tone)}
          >
            {arc.datum.label}
          </text>
        {/if}
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={leafItems} />

  {#if hoveredIndex !== null && arcs[hoveredIndex]}
    {@const arc = arcs[hoveredIndex]}
    <div
      class="st-sunburstChart__tooltip"
      role="presentation"
      style="left: {(arc.labelX / width) * 100}%; top: {(arc.labelY / height) * 100}%"
    >
      <span class="st-sunburstChart__tooltipLabel">{arc.pathLabel.join(", ")}</span>
      <span class="st-sunburstChart__tooltipValue">{arc.value}</span>
    </div>
  {/if}

  {#if legend && legendItems.length > 0}
    <ul class="st-sunburstChart__legend" aria-hidden="true">
      {#each legendItems as item (item.label)}
        <li class="st-sunburstChart__legendItem">
          <span class="st-sunburstChart__legendSwatch st-sunburstChart__legendSwatch--{item.tone}"></span>
          {item.label}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .st-sunburstChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    max-width: 100%;
    position: relative;
    width: 100%;
  }

  .st-sunburstChart svg,
  .st-sunburstChart__visual {
    display: block;
    overflow: visible;
  }

  .st-sunburstChart__arc {
    cursor: pointer;
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1;
    transition: opacity 120ms ease;
  }

  .st-sunburstChart__arc--dim {
    opacity: 0.4;
  }

  .st-sunburstChart__arc--category1,
  .st-sunburstChart__legendSwatch--category1 { fill: var(--st-semantic-data-category1); background: var(--st-semantic-data-category1); }
  .st-sunburstChart__arc--category2,
  .st-sunburstChart__legendSwatch--category2 { fill: var(--st-semantic-data-category2); background: var(--st-semantic-data-category2); }
  .st-sunburstChart__arc--category3,
  .st-sunburstChart__legendSwatch--category3 { fill: var(--st-semantic-data-category3); background: var(--st-semantic-data-category3); }
  .st-sunburstChart__arc--category4,
  .st-sunburstChart__legendSwatch--category4 { fill: var(--st-semantic-data-category4); background: var(--st-semantic-data-category4); }
  .st-sunburstChart__arc--category5,
  .st-sunburstChart__legendSwatch--category5 { fill: var(--st-semantic-data-category5); background: var(--st-semantic-data-category5); }
  .st-sunburstChart__arc--category6,
  .st-sunburstChart__legendSwatch--category6 { fill: var(--st-semantic-data-category6); background: var(--st-semantic-data-category6); }
  .st-sunburstChart__arc--category7,
  .st-sunburstChart__legendSwatch--category7 { fill: var(--st-semantic-data-category7); background: var(--st-semantic-data-category7); }
  .st-sunburstChart__arc--category8,
  .st-sunburstChart__legendSwatch--category8 { fill: var(--st-semantic-data-category8); background: var(--st-semantic-data-category8); }

  .st-sunburstChart__label {
    /* fill calculé par contrastTextForTone() en inline - pas de blanc fixe */
    font-size: 0.68rem;
    font-weight: 650;
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-sunburstChart__arc {
      transition: none;
    }
  }

  .st-sunburstChart__legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem) var(--st-spacing-4, 1rem);
    list-style: none;
    margin: var(--st-spacing-2, 0.5rem) 0 0;
    padding: 0;
  }

  .st-sunburstChart__legendItem {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    font-size: 0.75rem;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-sunburstChart__legendSwatch {
    display: inline-block;
    height: 0.625rem;
    width: 0.625rem;
  }

  .st-sunburstChart__tooltip {
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

  .st-sunburstChart__tooltipLabel {
    font-weight: 600;
  }

  .st-sunburstChart__tooltipValue {
    opacity: 0.85;
  }
</style>
