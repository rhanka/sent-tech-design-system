<script lang="ts" module>
  export type WordCloudChartTone =
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  export type WordCloudChartWord = {
    text: string;
    weight: number;
    tone?: WordCloudChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type WordCloudChartProps = {
    /** Mots à placer : la taille de police est proportionnelle au poids. */
    data: WordCloudChartWord[];
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };

  let {
    data,
    width = 480,
    height = 320,
    label,
    class: className
  }: WordCloudChartProps = $props();

  const TONES = [
    "category1", "category2", "category3", "category4",
    "category5", "category6", "category7", "category8"
  ] as const;

  // Constantes de layout — IDENTIQUES entre svelte/react/vue (aucun aléatoire).
  const FONT_MIN = 14;
  const FONT_MAX = 52;
  // Largeur estimée d'un glyphe relative à la taille de police.
  const CHAR_W = 0.6;
  // Spirale d'Archimède : r = SPIRAL_A * theta ; pas angulaire constant.
  const SPIRAL_STEP = 0.25;
  const MAX_TURNS = 60;
  // Marge entre boîtes englobantes (en unités SVG).
  const GAP = 4;

  type Box = { x: number; y: number; w: number; h: number };
  type Placed = {
    word: WordCloudChartWord;
    tone: WordCloudChartTone;
    fontSize: number;
    cx: number;
    cy: number;
    box: Box;
  };

  const validWord = (w: WordCloudChartWord): boolean =>
    !!w && typeof w.text === "string" && w.text.length > 0 &&
    Number.isFinite(w.weight) && w.weight > 0;

  function overlaps(a: Box, b: Box): boolean {
    return !(
      a.x + a.w + GAP <= b.x ||
      b.x + b.w + GAP <= a.x ||
      a.y + a.h + GAP <= b.y ||
      b.y + b.h + GAP <= a.y
    );
  }

  type Layout = { placed: Placed[]; omitted: WordCloudChartWord[] };

  const layout = $derived.by<Layout>(() => {
    const words = (data ?? []).filter(validWord);
    if (words.length === 0) return { placed: [], omitted: [] };

    // Trie par poids décroissant (placement déterministe).
    const sorted = words
      .map((w, i) => ({ w, i }))
      .sort((a, b) => (b.w.weight - a.w.weight) || (a.i - b.i))
      .map((e) => e.w);

    const minW = sorted[sorted.length - 1].weight;
    const maxW = sorted[0].weight;
    const span = maxW - minW;

    const fontFor = (weight: number): number => {
      if (span <= 0) return (FONT_MIN + FONT_MAX) / 2;
      const t = (weight - minW) / span;
      return FONT_MIN + t * (FONT_MAX - FONT_MIN);
    };

    const cx0 = width / 2;
    const cy0 = height / 2;
    const a = Math.min(width, height) / (2 * Math.PI * MAX_TURNS);

    const placed: Placed[] = [];
    const omitted: WordCloudChartWord[] = [];

    sorted.forEach((word, idx) => {
      const fontSize = fontFor(word.weight);
      const w = word.text.length * fontSize * CHAR_W;
      const h = fontSize;
      const tone = word.tone ?? TONES[idx % TONES.length];

      let foundCx = cx0;
      let foundCy = cy0;
      let placedOk = false;

      // Parcourt la spirale d'Archimède depuis le centre.
      for (let theta = 0; theta <= MAX_TURNS * 2 * Math.PI; theta += SPIRAL_STEP) {
        const r = a * theta;
        const cx = cx0 + r * Math.cos(theta);
        const cy = cy0 + r * Math.sin(theta);
        const box: Box = { x: cx - w / 2, y: cy - h / 2, w, h };

        // Hors cadre → on continue.
        if (box.x < 0 || box.y < 0 || box.x + box.w > width || box.y + box.h > height) {
          continue;
        }
        let collides = false;
        for (const p of placed) {
          if (overlaps(box, p.box)) {
            collides = true;
            break;
          }
        }
        if (!collides) {
          foundCx = cx;
          foundCy = cy;
          placedOk = true;
          placed.push({ word, tone, fontSize, cx, cy, box });
          break;
        }
      }

      if (!placedOk) {
        // Centre (theta=0) déjà testé : si rien ne rentre, on omet le mot.
        omitted.push(word);
      }
      void foundCx;
      void foundCy;
    });

    return { placed, omitted };
  });

  const placed = $derived(layout.placed);
  const omitted = $derived(layout.omitted);

  const dataValueItems = $derived([
    ...placed.map((p) => `${p.word.text}: ${p.word.weight}`),
    ...omitted.map((o) => `${o.text}: ${o.weight} (omis)`)
  ]);

  let hoveredIndex: number | null = $state(null);

  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredIndex = null;
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(index) ? index : null;
  }

  const classes = () => ["st-wordCloudChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-wordCloudChart__visual"
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
      {#each placed as p, i (p.word.text)}
        <text
          class="st-wordCloudChart__word st-wordCloudChart__word--{p.tone}"
          class:st-wordCloudChart__word--dim={hoveredIndex !== null && hoveredIndex !== i}
          x={p.cx}
          y={p.cy}
          text-anchor="middle"
          dominant-baseline="central"
          font-size={p.fontSize}
          data-chart-index={i}
        >
          {p.word.text}
        </text>
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && placed[hoveredIndex]}
    {@const p = placed[hoveredIndex]}
    <div
      class="st-wordCloudChart__tooltip"
      role="presentation"
      style="left: {(p.cx / width) * 100}%; top: {((p.cy - p.fontSize / 2) / height) * 100}%"
    >
      <span class="st-wordCloudChart__tooltipLabel">{p.word.text}</span>
      <span class="st-wordCloudChart__tooltipValue">{p.word.weight}</span>
    </div>
  {/if}
</div>

<style>
  .st-wordCloudChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-wordCloudChart svg,
  .st-wordCloudChart__visual {
    display: block;
    overflow: visible;
  }

  .st-wordCloudChart__word {
    cursor: pointer;
    font-weight: 600;
    transition: opacity 120ms ease;
  }

  .st-wordCloudChart__word--dim {
    opacity: 0.3;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-wordCloudChart__word {
      transition: none;
    }
  }

  .st-wordCloudChart__word--category1 { fill: var(--st-semantic-data-category1); }
  .st-wordCloudChart__word--category2 { fill: var(--st-semantic-data-category2); }
  .st-wordCloudChart__word--category3 { fill: var(--st-semantic-data-category3); }
  .st-wordCloudChart__word--category4 { fill: var(--st-semantic-data-category4); }
  .st-wordCloudChart__word--category5 { fill: var(--st-semantic-data-category5); }
  .st-wordCloudChart__word--category6 { fill: var(--st-semantic-data-category6); }
  .st-wordCloudChart__word--category7 { fill: var(--st-semantic-data-category7); }
  .st-wordCloudChart__word--category8 { fill: var(--st-semantic-data-category8); }

  .st-wordCloudChart__tooltip {
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

  .st-wordCloudChart__tooltipLabel { font-weight: 600; }
  .st-wordCloudChart__tooltipValue { opacity: 0.85; }
</style>
