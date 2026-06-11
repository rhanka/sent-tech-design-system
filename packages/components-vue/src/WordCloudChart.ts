import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";

export type WordCloudChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

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
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
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
  typeof w.text === "string" &&
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

export const WordCloudChart = defineComponent({
  name: "WordCloudChart",
  props: {
    data: { type: Array as () => WordCloudChartWord[], required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 320 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
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
      const index = Number(target.getAttribute("data-chart-index"));
      hoveredIndex.value = Number.isInteger(index) ? index : null;
    }

    return () => {
      const width = props.width ?? 480;
      const height = props.height ?? 320;
      const label = props.label;

      const { placed, omitted } = computeLayout(props.data, width, height);

      const dataValueItems = [
        ...placed.map((p) => `${p.word.text}: ${p.word.weight}`),
        ...omitted.map((o) => `${o.text}: ${o.weight} (omis)`),
      ];

      const hoveredIdx = hoveredIndex.value;

      const wordNodes = placed.map((p, i) =>
        h(
          "text",
          {
            key: p.word.text,
            class: classNames(
              "st-wordCloudChart__word",
              `st-wordCloudChart__word--${p.tone}`,
              hoveredIdx !== null && hoveredIdx !== i && "st-wordCloudChart__word--dim",
            ),
            x: p.cx,
            y: p.cy,
            "text-anchor": "middle",
            "dominant-baseline": "central",
            "font-size": p.fontSize,
            "data-chart-index": i,
          },
          p.word.text,
        ),
      );

      const children: (ReturnType<typeof h> | null)[] = [
        h(
          "div",
          {
            class: "st-wordCloudChart__visual",
            role: "img",
            "aria-label": label,
            onPointermove: handleVisualPointerMove,
            onPointerleave: handleLeave,
          },
          [
            h(
              "svg",
              {
                viewBox: `0 0 ${width} ${height}`,
                preserveAspectRatio: "xMidYMid meet",
                width: "100%",
                height: "100%",
                focusable: "false",
                "aria-hidden": "true",
              },
              wordNodes,
            ),
          ],
        ),
        chartDataList(label, dataValueItems),
      ];

      if (hoveredIdx !== null && placed[hoveredIdx]) {
        const p = placed[hoveredIdx];
        children.push(
          h(
            "div",
            {
              class: "st-wordCloudChart__tooltip",
              role: "presentation",
              style: `left: ${(p.cx / width) * 100}%; top: ${((p.cy - p.fontSize / 2) / height) * 100}%`,
            },
            [
              h("span", { class: "st-wordCloudChart__tooltipLabel" }, p.word.text),
              h("span", { class: "st-wordCloudChart__tooltipValue" }, String(p.word.weight)),
            ],
          ),
        );
      }

      return h("div", { ...attrs, class: classNames("st-wordCloudChart", props.class) }, children);
    };
  },
});
