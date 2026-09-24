import { Component, Input as NgInput } from "@angular/core";
import { placePriorityLabels, type PriorityMatrixPlacement } from "@sentropic/dataviz-core";

import { classNames } from "./classNames.js";

export type PriorityMatrixTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type PriorityMatrixDatum = {
  /** Complexité, 0–100 (bornée à l'affichage). */
  x: number;
  /** Valeur, 0–100 (bornée à l'affichage). */
  y: number;
  /** Étiquette affichée (une ou deux lignes). */
  label: string;
  tone?: PriorityMatrixTone;
};

export type PriorityMatrixProps = {
  data: PriorityMatrixDatum[];
  /** Titre visible au-dessus du cadre. */
  title?: string;
  xLabel?: string;
  yLabel?: string;
  /** Seuils de quadrants (0–100). */
  xThreshold?: number;
  yThreshold?: number;
  width?: number;
  height?: number;
  radius?: number;
  label: string;
  class?: string;
};

const MARGIN = { top: 26, right: 18, bottom: 36, left: 48 } as const;
const TICKS = [0, 20, 40, 60, 80, 100];

const TONES: PriorityMatrixTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

const QUADRANT_NAMES: Record<string, string> = {
  "quick-wins": "Gains rapides",
  "major-projects": "Projets majeurs",
  wait: "Attendre",
  drop: "Ne pas faire",
};

function splitLabel(value: string): string[] {
  const chars = [...value];
  if (chars.length <= 12) return [value];
  const mid = Math.ceil(chars.length / 2);
  const space = value.lastIndexOf(" ", mid + 4);
  if (space > 2 && space < value.length - 2) return [value.slice(0, space), value.slice(space + 1)];
  return [value.slice(0, mid), value.slice(mid)];
}

type QuadRect = { id: string; x: number; y: number; w: number; h: number };
type QuadName = { id: string; x: number; y: number; anchor: string };
type MatrixPoint = { cx: number; cy: number; datum: PriorityMatrixDatum; index: number; tone: PriorityMatrixTone };
type PlacedLabel = PriorityMatrixPlacement & { lines: string[] };

@Component({
  selector: "st-priority-matrix",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-priorityMatrix__visual" role="img" [attr.aria-label]="label">
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @if (titleValue) {
            <text class="st-priorityMatrix__title" [attr.x]="MARGIN.left" y="15" text-anchor="start">{{ titleValue }}</text>
          }

          @for (q of quads; track q.id) {
            <rect
              [attr.class]="'st-priorityMatrix__quad st-priorityMatrix__quad--' + q.id"
              [attr.x]="q.x"
              [attr.y]="q.y"
              [attr.width]="q.w"
              [attr.height]="q.h"
            ></rect>
          }

          @for (t of ticks; track t) {
            <line
              class="st-priorityMatrix__grid"
              [attr.x1]="MARGIN.left"
              [attr.x2]="widthValue - MARGIN.right"
              [attr.y1]="tickY(t)"
              [attr.y2]="tickY(t)"
            ></line>
            <text
              class="st-priorityMatrix__tick"
              [attr.x]="MARGIN.left - 6"
              [attr.y]="tickY(t)"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ t }}</text>
          }

          @for (t of ticks; track t) {
            <text
              class="st-priorityMatrix__tick"
              [attr.x]="tickX(t)"
              [attr.y]="heightValue - MARGIN.bottom + 16"
              text-anchor="middle"
            >{{ t }}</text>
          }

          <line
            class="st-priorityMatrix__axis"
            [attr.x1]="MARGIN.left"
            [attr.x2]="MARGIN.left"
            [attr.y1]="MARGIN.top"
            [attr.y2]="heightValue - MARGIN.bottom"
          ></line>
          <line
            class="st-priorityMatrix__axis"
            [attr.x1]="MARGIN.left"
            [attr.x2]="widthValue - MARGIN.right"
            [attr.y1]="heightValue - MARGIN.bottom"
            [attr.y2]="heightValue - MARGIN.bottom"
          ></line>

          <line class="st-priorityMatrix__threshold" [attr.x1]="tx" [attr.x2]="tx" [attr.y1]="MARGIN.top" [attr.y2]="MARGIN.top + plotH"></line>
          <line class="st-priorityMatrix__threshold" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left + plotW" [attr.y1]="ty" [attr.y2]="ty"></line>

          @for (q of quadNames; track q.id) {
            <text class="st-priorityMatrix__quadName" [attr.x]="q.x" [attr.y]="q.y" [attr.text-anchor]="q.anchor">{{ quadName(q.id) }}</text>
          }

          @if (xLabel) {
            <text
              class="st-priorityMatrix__axisLabel"
              [attr.x]="MARGIN.left + plotW / 2"
              [attr.y]="heightValue - 4"
              text-anchor="middle"
            >{{ xLabel }}</text>
          }
          @if (yLabel) {
            <text
              class="st-priorityMatrix__axisLabel"
              [attr.x]="12"
              [attr.y]="yAxisLabelY"
              text-anchor="middle"
              [attr.transform]="yAxisLabelTransform"
            >{{ yLabel }}</text>
          }

          @for (p of points; track p.index) {
            <circle
              [attr.class]="'st-priorityMatrix__point st-priorityMatrix__point--' + p.tone"
              [attr.cx]="p.cx"
              [attr.cy]="p.cy"
              [attr.r]="radiusValue"
            ></circle>
          }

          @for (p of placed; track p.index) {
            <line
              class="st-priorityMatrix__leader"
              [attr.x1]="p.leaderX1"
              [attr.y1]="p.leaderY1"
              [attr.x2]="p.leaderX2"
              [attr.y2]="p.leaderY2"
            ></line>
            <rect
              class="st-priorityMatrix__labelBox"
              [attr.x]="p.x"
              [attr.y]="p.y"
              [attr.width]="p.w"
              [attr.height]="p.h"
              rx="3"
            ></rect>
            @for (line of p.lines; track $index) {
              <text
                class="st-priorityMatrix__labelText"
                [attr.x]="p.x + p.w / 2"
                [attr.y]="p.y + 13 + $index * 13"
                text-anchor="middle"
              >{{ line }}</text>
            }
          }
        </svg>
      </div>

      @if (dataValueItems.length > 0) {
        <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
          @for (item of dataValueItems; track $index) {
            <li>{{ item }}</li>
          }
        </ul>
      }
    </div>
  `,
})
export class PriorityMatrix {
  static readonly stComponentName = "PriorityMatrix";
  readonly componentName = "PriorityMatrix";
  readonly MARGIN = MARGIN;
  readonly ticks = TICKS;

  @NgInput() data!: PriorityMatrixDatum[];
  @NgInput() title?: string;
  @NgInput() xLabel?: string;
  @NgInput() yLabel?: string;
  @NgInput() xThreshold?: number;
  @NgInput() yThreshold?: number;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() radius?: number;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-priorityMatrix", this.classInput);
  }

  get safeData(): PriorityMatrixDatum[] {
    return this.data ?? [];
  }

  get widthValue(): number {
    return this.width ?? 640;
  }

  get heightValue(): number {
    return this.height ?? 400;
  }

  get radiusValue(): number {
    return this.radius ?? 5;
  }

  get titleValue(): string {
    return this.title ?? "Matrice de priorisation";
  }

  get xThresholdValue(): number {
    return this.xThreshold ?? 50;
  }

  get yThresholdValue(): number {
    return this.yThreshold ?? 50;
  }

  get viewBox(): string {
    return `0 0 ${this.widthValue} ${this.heightValue}`;
  }

  get plotW(): number {
    return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1);
  }

  get plotH(): number {
    return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1);
  }

  tickX(v: number): number {
    return MARGIN.left + (Math.min(Math.max(v, 0), 100) / 100) * this.plotW;
  }

  tickY(v: number): number {
    return MARGIN.top + (1 - Math.min(Math.max(v, 0), 100) / 100) * this.plotH;
  }

  get tx(): number {
    return this.tickX(this.xThresholdValue);
  }

  get ty(): number {
    return this.tickY(this.yThresholdValue);
  }

  get quads(): QuadRect[] {
    const { tx, ty, plotW, plotH } = this;
    return [
      { id: "quick-wins", x: MARGIN.left, y: MARGIN.top, w: tx - MARGIN.left, h: ty - MARGIN.top },
      { id: "major-projects", x: tx, y: MARGIN.top, w: MARGIN.left + plotW - tx, h: ty - MARGIN.top },
      { id: "wait", x: MARGIN.left, y: ty, w: tx - MARGIN.left, h: MARGIN.top + plotH - ty },
      { id: "drop", x: tx, y: ty, w: MARGIN.left + plotW - tx, h: MARGIN.top + plotH - ty },
    ];
  }

  get quadNames(): QuadName[] {
    const { plotW, plotH } = this;
    return [
      { id: "quick-wins", x: MARGIN.left + 6, y: MARGIN.top + 14, anchor: "start" },
      { id: "major-projects", x: MARGIN.left + plotW - 6, y: MARGIN.top + 14, anchor: "end" },
      { id: "wait", x: MARGIN.left + 6, y: MARGIN.top + plotH - 8, anchor: "start" },
      { id: "drop", x: MARGIN.left + plotW - 6, y: MARGIN.top + plotH - 8, anchor: "end" },
    ];
  }

  quadName(id: string): string {
    return QUADRANT_NAMES[id] ?? id;
  }

  get yAxisLabelY(): number {
    return MARGIN.top + this.plotH / 2;
  }

  get yAxisLabelTransform(): string {
    return `rotate(-90 12 ${this.yAxisLabelY})`;
  }

  get points(): MatrixPoint[] {
    return this.safeData.map((d, i) => ({
      cx: this.tickX(d.x),
      cy: this.tickY(d.y),
      datum: d,
      index: i,
      tone: d.tone ?? TONES[i % TONES.length]!,
    }));
  }

  get placed(): PlacedLabel[] {
    const boxes = this.safeData.map((d) => {
      const lines = splitLabel(d.label);
      const longest = Math.max(...lines.map((l) => [...l].length));
      return { w: Math.min(120, 12 + 7 * longest), h: lines.length > 1 ? 34 : 20, lines };
    });
    return placePriorityLabels(
      this.safeData.map((d) => ({ x: d.x, y: d.y, label: d.label })),
      boxes,
      {
        width: this.widthValue,
        height: this.heightValue,
        marginLeft: MARGIN.left,
        marginTop: MARGIN.top,
        plotWidth: this.plotW,
        plotHeight: this.plotH,
      },
      { xThreshold: this.xThresholdValue, yThreshold: this.yThresholdValue },
    ).map((p) => ({ ...p, lines: boxes[p.index]!.lines as string[] }));
  }

  get dataValueItems(): string[] {
    return this.safeData.map((d) => `${d.label} : complexité ${d.x}, valeur ${d.y}`);
  }
}
