import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

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

const TONES: WordCloudChartTone[] = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

const FONT_MIN = 14;
const FONT_MAX = 52;
const CHAR_W = 0.6;
const SPIRAL_STEP = 0.25;
const MAX_TURNS = 60;
const GAP = 4;

type Box = { x: number; y: number; w: number; h: number };

type PlacedWord = {
  word: WordCloudChartWord;
  tone: WordCloudChartTone;
  fontSize: number;
  cx: number;
  cy: number;
  box: Box;
  index: number;
};

function validWord(w: WordCloudChartWord): boolean {
  return !!w && typeof w.text === "string" && w.text.length > 0 &&
    Number.isFinite(w.weight) && w.weight > 0;
}

function overlaps(a: Box, b: Box): boolean {
  return !(
    a.x + a.w + GAP <= b.x ||
    b.x + b.w + GAP <= a.x ||
    a.y + a.h + GAP <= b.y ||
    b.y + b.h + GAP <= a.y
  );
}

function computeLayout(
  data: WordCloudChartWord[],
  width: number,
  height: number,
): { placed: PlacedWord[]; omitted: WordCloudChartWord[] } {
  const words = (data ?? []).filter(validWord);
  if (words.length === 0) return { placed: [], omitted: [] };

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

  const placed: PlacedWord[] = [];
  const omitted: WordCloudChartWord[] = [];

  sorted.forEach((word, idx) => {
    const fontSize = fontFor(word.weight);
    const w = word.text.length * fontSize * CHAR_W;
    const h = fontSize;
    const tone = word.tone ?? TONES[idx % TONES.length];

    let placedOk = false;

    for (let theta = 0; theta <= MAX_TURNS * 2 * Math.PI; theta += SPIRAL_STEP) {
      const r = a * theta;
      const cx = cx0 + r * Math.cos(theta);
      const cy = cy0 + r * Math.sin(theta);
      const box: Box = { x: cx - w / 2, y: cy - h / 2, w, h };

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
        placed.push({ word, tone, fontSize, cx, cy, box, index: placed.length });
        break;
      }
    }

    if (!placedOk) {
      omitted.push(word);
    }
  });

  return { placed, omitted };
}

@Component({
  selector: "st-word-cloud-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-wordCloudChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handleVisualPointerMove($event)"
        (pointerleave)="hoveredIndex = null"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @for (p of placed; track p.word.text; let i = $index) {
            <text
              [class]="wordClass(i)"
              [attr.x]="p.cx"
              [attr.y]="p.cy"
              text-anchor="middle"
              dominant-baseline="central"
              [attr.font-size]="p.fontSize"
              [attr.data-chart-index]="i"
            >{{ p.word.text }}</text>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && placed[hoveredIndex]) {
        <div
          class="st-wordCloudChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft + '%'"
          [style.top]="tooltipTop + '%'"
        >
          <span class="st-wordCloudChart__tooltipLabel">{{ placed[hoveredIndex].word.text }}</span>
          <span class="st-wordCloudChart__tooltipValue">{{ placed[hoveredIndex].word.weight }}</span>
        </div>
      }
    </div>
  `,
})
export class WordCloudChart {
  static readonly stComponentName = "WordCloudChart";
  readonly componentName = "WordCloudChart";

  hoveredIndex: number | null = null;

  @NgInput() data: WordCloudChartWord[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-wordCloudChart", this.classInput);
  }

  get widthValue(): number { return this.width ?? 480; }
  get heightValue(): number { return this.height ?? 320; }
  get viewBox(): string { return `0 0 ${this.widthValue} ${this.heightValue}`; }

  get layout(): { placed: PlacedWord[]; omitted: WordCloudChartWord[] } {
    return computeLayout(this.data, this.widthValue, this.heightValue);
  }

  get placed(): PlacedWord[] { return this.layout.placed; }
  get omitted(): WordCloudChartWord[] { return this.layout.omitted; }

  get dataValueItems(): string[] {
    return [
      ...this.placed.map((p) => `${p.word.text}: ${p.word.weight}`),
      ...this.omitted.map((o) => `${o.text}: ${o.weight} (omis)`),
    ];
  }

  wordClass(i: number): string {
    return classNames(
      "st-wordCloudChart__word",
      `st-wordCloudChart__word--${this.placed[i]?.tone ?? "category1"}`,
      this.hoveredIndex !== null && this.hoveredIndex !== i && "st-wordCloudChart__word--dim",
    );
  }

  get tooltipLeft(): number {
    const p = this.hoveredIndex !== null ? this.placed[this.hoveredIndex] : undefined;
    return p ? (p.cx / this.widthValue) * 100 : 0;
  }

  get tooltipTop(): number {
    const p = this.hoveredIndex !== null ? this.placed[this.hoveredIndex] : undefined;
    return p ? ((p.cy - p.fontSize / 2) / this.heightValue) * 100 : 0;
  }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target as { getAttribute?: (name: string) => string | null } | null;
    const raw = Number(target?.getAttribute?.("data-chart-index"));
    this.hoveredIndex = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
  }
}
