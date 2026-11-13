<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';
import { classNames } from './classNames.js';

export type WordCloudChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type WordCloudChartWord = {
  text: string;
  weight: number;
  tone?: WordCloudChartTone;
};

export type WordCloudChartProps = {
  data: WordCloudChartWord[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const TONES = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
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
  !!w &&
  typeof w.text === 'string' &&
  w.text.length > 0 &&
  Number.isFinite(w.weight) &&
  w.weight > 0;

function overlaps(a: Box, b: Box): boolean {
  return !(
    a.x + a.w + GAP <= b.x ||
    b.x + b.w + GAP <= a.x ||
    a.y + a.h + GAP <= b.y ||
    b.y + b.h + GAP <= a.y
  );
}

type Layout = { placed: Placed[]; omitted: WordCloudChartWord[] };

function computeLayout(
  data: WordCloudChartWord[] | undefined,
  width: number,
  height: number,
): Layout {
  const words = (data ?? []).filter(validWord);
  if (words.length === 0) return { placed: [], omitted: [] };

  // Trie par poids décroissant (placement déterministe).
  const sorted = words
    .map((w, i) => ({ w, i }))
    .sort((a, b) => b.w.weight - a.w.weight || a.i - b.i)
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
    const hh = fontSize;
    const tone = word.tone ?? TONES[idx % TONES.length];

    let placedOk = false;

    // Parcourt la spirale d'Archimède depuis le centre.
    for (let theta = 0; theta <= MAX_TURNS * 2 * Math.PI; theta += SPIRAL_STEP) {
      const r = a * theta;
      const cx = cx0 + r * Math.cos(theta);
      const cy = cy0 + r * Math.sin(theta);
      const box: Box = { x: cx - w / 2, y: cy - hh / 2, w, h: hh };

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
        placedOk = true;
        placed.push({ word, tone, fontSize, cx, cy, box });
        break;
      }
    }

    if (!placedOk) {
      // Centre (theta=0) déjà testé : si rien ne rentre, on omet le mot.
      omitted.push(word);
    }
  });

  return { placed, omitted };
}

defineOptions({ name: 'WordCloudChart' });
const props = withDefaults(defineProps<WordCloudChartProps>(), {
  width: 480, height: 320, class: undefined,
});

const attrs = useAttrs();
const rootProps = computed(() => ({
  ...attrs,
  class: classNames('st-wordCloudChart', props.class),
}));

const hoveredIndex = ref<number | null>(null);

function handleLeave() {
  hoveredIndex.value = null;
}

function handleVisualPointerMove(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Element)) {
    hoveredIndex.value = null;
    return;
  }
  const index = Number(target.getAttribute('data-chart-index'));
  hoveredIndex.value = Number.isInteger(index) ? index : null;
}

const width = computed(() => props.width ?? 480);
const height = computed(() => props.height ?? 320);

const layout = computed(() => computeLayout(props.data, width.value, height.value));

const dataValueItems = computed(() => [
  ...layout.value.placed.map((p) => `${p.word.text}: ${p.word.weight}`),
  ...layout.value.omitted.map((o) => `${o.text}: ${o.weight} (omis)`),
]);

const hoveredIdx = computed(() => hoveredIndex.value);
const hovered = computed(() => hoveredIdx.value !== null ? layout.value.placed[hoveredIdx.value] : undefined);

function wordClass(p: Placed, index: number) {
  const isDim = hoveredIndex.value !== null && hoveredIndex.value !== index;
  return classNames(
    'st-wordCloudChart__word',
    `st-wordCloudChart__word--${p.tone}`,
    isDim ? 'st-wordCloudChart__word--dim' : undefined,
  );
}
</script>

<template>
  <div v-bind="rootProps">
    <div class="st-wordCloudChart__visual" role="img" :aria-label="props.label" @pointermove="handleVisualPointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <text v-for="(p, i) in layout.placed" :key="p.word.text" :class="wordClass(p, i)" :x="p.cx" :y="p.cy" text-anchor="middle" dominant-baseline="central" :font-size="p.fontSize" :data-chart-index="i">{{ p.word.text }}</text>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hovered" class="st-wordCloudChart__tooltip" role="presentation" :style="`left: ${(hovered.cx / width) * 100}%; top: ${((hovered.cy - hovered.fontSize / 2) / height) * 100}%`">
      <span class="st-wordCloudChart__tooltipLabel">{{ hovered.word.text }}</span>
      <span class="st-wordCloudChart__tooltipValue">{{ String(hovered.word.weight) }}</span>
    </div>
  </div>
</template>
