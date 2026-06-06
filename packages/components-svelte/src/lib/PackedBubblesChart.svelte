<script lang="ts" module>
  /**
   * PackedBubblesChart - API canonique (référence Svelte, React/Vue doivent s'aligner)
   *
   * Tasse des cercles dont l'aire est proportionnelle à `value`. Le rayon est
   * calculé par sqrt(value) puis normalisé pour tenir dans le viewBox. Le layout
   * est déterministe (spirale + détection de collision), sans dépendance externe.
   *
   * Props obligatoires :
   *   data   PackedBubblesChartDatum[]  - liste {label, value, tone?}
   *   label  string                     - aria-label du graphique
   *
   * Props optionnelles :
   *   width   number  (défaut 360)  - largeur du viewBox en px
   *   height  number  (défaut 360)  - hauteur du viewBox en px
   *   class   string                - classe CSS supplémentaire
   *
   * Garde : seuls les data dont `value` est finie et > 0 sont rendus. Les NaN /
   * Infinity / valeurs négatives ou nulles sont ignorés (pas de crash).
   * Le label est affiché dans la bulle si elle est assez grande, avec une couleur
   * de texte calculée par contraste (contrastTextForTone).
   */
  export type PackedBubblesChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type PackedBubblesChartDatum = {
    label: string;
    value: number;
    tone?: PackedBubblesChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";
  import { contrastTextForTone } from "./chartContrast.js";

  type PackedBubblesChartProps = {
    data: PackedBubblesChartDatum[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
  };

  let {
    data,
    label,
    width = 360,
    height = 360,
    class: className
  }: PackedBubblesChartProps = $props();

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

  const PADDING = 2; // espace entre bulles (px)
  const LABEL_MIN_RADIUS = 18; // rayon mini pour afficher le label

  function magnitude(value: number): number {
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  type Bubble = {
    label: string;
    value: number;
    tone: PackedBubblesChartTone;
    textColor: string;
    cx: number;
    cy: number;
    r: number;
    index: number;
  };

  let hoveredIndex: number | null = $state(null);

  const bubbles = $derived.by<Bubble[]>(() => {
    const cx = width / 2;
    const cy = height / 2;

    // Données valides triées par valeur décroissante (les grosses au centre).
    const valid = data
      .map((datum, index) => ({ datum, index, value: magnitude(datum.value) }))
      .filter((entry) => entry.value > 0)
      .sort((a, b) => b.value - a.value);

    if (valid.length === 0) return [];

    const maxValue = Math.max(...valid.map((entry) => entry.value));
    // Rayon brut ∝ sqrt(value) ; échelle pour que la plus grosse bulle tienne.
    const limit = Math.max(Math.min(width, height) / 2 - 4, 1);
    const baseMax = Math.sqrt(maxValue);
    const targetMax = Math.min(limit * 0.42, limit);
    const radiusOf = (value: number) => Math.max((Math.sqrt(value) / baseMax) * targetMax, 3);

    const placed: Array<{ cx: number; cy: number; r: number }> = [];

    function collides(x: number, y: number, r: number): boolean {
      for (const p of placed) {
        const dx = x - p.cx;
        const dy = y - p.cy;
        const minDist = r + p.r + PADDING;
        if (dx * dx + dy * dy < minDist * minDist) return true;
      }
      return false;
    }

    const result: Bubble[] = [];
    valid.forEach((entry, order) => {
      const r = radiusOf(entry.value);
      let x = cx;
      let y = cy;

      if (placed.length > 0) {
        // Spirale d'Archimède déterministe : on avance jusqu'au 1er creux libre.
        const step = Math.max(r * 0.5, 2);
        let angle = order * 2.399963; // angle d'or pour disperser
        let radius = step;
        let found = false;
        // Borne d'itérations généreuse mais finie (pas de boucle infinie).
        for (let i = 0; i < 4000; i += 1) {
          x = cx + radius * Math.cos(angle);
          y = cy + radius * Math.sin(angle);
          if (!collides(x, y, r)) {
            found = true;
            break;
          }
          angle += 0.5;
          radius += step * 0.06;
        }
        if (!found) {
          x = cx + radius * Math.cos(angle);
          y = cy + radius * Math.sin(angle);
        }
      }

      placed.push({ cx: x, cy: y, r });
      const tone = entry.datum.tone ?? TONES[entry.index % TONES.length];
      result.push({
        label: entry.datum.label,
        value: entry.value,
        tone,
        textColor: contrastTextForTone(tone),
        cx: x,
        cy: y,
        r,
        index: entry.index
      });
    });

    return result;
  });

  const dataValueItems = $derived(
    data
      .filter((datum) => magnitude(datum.value) > 0)
      .map((datum) => `${datum.label}: ${datum.value}`)
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

  const hovered = $derived(
    hoveredIndex !== null ? bubbles.find((b) => b.index === hoveredIndex) : undefined
  );

  const classes = () => ["st-packedBubblesChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-packedBubblesChart__visual"
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
      {#each bubbles as bubble (bubble.index)}
        <g class="st-packedBubblesChart__bubble" data-chart-index={bubble.index}>
          <circle
            class="st-packedBubblesChart__circle st-packedBubblesChart__circle--{bubble.tone}"
            class:st-packedBubblesChart__circle--dim={hoveredIndex !== null && hoveredIndex !== bubble.index}
            cx={bubble.cx}
            cy={bubble.cy}
            r={bubble.r}
            data-chart-index={bubble.index}
          />
          {#if bubble.r >= LABEL_MIN_RADIUS}
            <text
              class="st-packedBubblesChart__label"
              x={bubble.cx}
              y={bubble.cy}
              text-anchor="middle"
              dominant-baseline="middle"
              fill={bubble.textColor}
              data-chart-index={bubble.index}
            >
              {bubble.label}
            </text>
          {/if}
        </g>
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hovered}
    <div
      class="st-packedBubblesChart__tooltip"
      role="presentation"
      style="left: {(hovered.cx / width) * 100}%; top: {((hovered.cy - hovered.r) / height) * 100}%"
    >
      <span class="st-packedBubblesChart__tooltipLabel">{hovered.label}</span>
      <span class="st-packedBubblesChart__tooltipValue">{hovered.value}</span>
    </div>
  {/if}
</div>

<style>
  .st-packedBubblesChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    max-width: 100%;
    position: relative;
    width: 100%;
  }

  .st-packedBubblesChart svg,
  .st-packedBubblesChart__visual {
    display: block;
    overflow: visible;
  }

  .st-packedBubblesChart__circle {
    cursor: pointer;
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1.5;
    transition: opacity 120ms ease;
  }

  .st-packedBubblesChart__circle--dim {
    opacity: 0.4;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-packedBubblesChart__circle {
      transition: none;
    }
  }

  .st-packedBubblesChart__circle--category1 { fill: var(--st-semantic-data-category1); }
  .st-packedBubblesChart__circle--category2 { fill: var(--st-semantic-data-category2); }
  .st-packedBubblesChart__circle--category3 { fill: var(--st-semantic-data-category3); }
  .st-packedBubblesChart__circle--category4 { fill: var(--st-semantic-data-category4); }
  .st-packedBubblesChart__circle--category5 { fill: var(--st-semantic-data-category5); }
  .st-packedBubblesChart__circle--category6 { fill: var(--st-semantic-data-category6); }
  .st-packedBubblesChart__circle--category7 { fill: var(--st-semantic-data-category7); }
  .st-packedBubblesChart__circle--category8 { fill: var(--st-semantic-data-category8); }

  .st-packedBubblesChart__label {
    /* fill calculé par contrastTextForTone() en inline - pas de blanc fixe */
    font-size: 0.7rem;
    font-weight: 600;
    pointer-events: none;
  }

  .st-packedBubblesChart__tooltip {
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

  .st-packedBubblesChart__tooltipLabel {
    font-weight: 600;
  }

  .st-packedBubblesChart__tooltipValue {
    opacity: 0.85;
  }
</style>
