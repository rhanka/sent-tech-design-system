import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import {
  formatTick,
  isNumeric,
  niceTicks,
  scaleLinear,
} from "./chartScale.js";

export type StepLineChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type StepLineChartDatum = {
  x: number | string;
  y: number;
};

export type StepLineChartProps = {
  data: StepLineChartDatum[];
  width?: number;
  height?: number;
  tone?: StepLineChartTone;
  label: string;
  class?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 44 };

@Component({
  selector: "st-step-line-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-stepLineChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handleVisualPointerMove($event)"
        (pointerleave)="hoveredIndex = null"
      >
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">

          @for (grid of gridLines; track grid.value) {
            <line class="st-stepLineChart__grid" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="grid.y" [attr.y2]="grid.y"></line>
            <text class="st-stepLineChart__tickLabel" [attr.x]="MARGIN.left - 6" [attr.y]="grid.y" text-anchor="end" dominant-baseline="middle">{{ formatTick(grid.value) }}</text>
          }

          <line class="st-stepLineChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
          <line class="st-stepLineChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"></line>

          @for (tick of xTickEntries; track tick.key) {
            <text class="st-stepLineChart__tickLabel" [attr.x]="tick.x" [attr.y]="heightValue - MARGIN.bottom + 16" text-anchor="middle">{{ tick.label }}</text>
          }

          @if (stepPath) {
            <path class="st-stepLineChart__line" [attr.d]="stepPath" fill="none"></path>
          }

          @for (pt of points; track pt.index) {
            <circle class="st-stepLineChart__dot" [attr.cx]="pt.x" [attr.cy]="pt.y" r="4" [attr.data-chart-index]="pt.index"></circle>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && points[hoveredIndex]) {
        <div
          class="st-stepLineChart__tooltip"
          role="presentation"
          [style.left]="(points[hoveredIndex].x / widthValue * 100) + '%'"
          [style.top]="(points[hoveredIndex].y / heightValue * 100) + '%'"
        >
          <span class="st-stepLineChart__tooltipLabel">{{ points[hoveredIndex].datum.x }}</span>
          <span class="st-stepLineChart__tooltipValue">{{ points[hoveredIndex].datum.y }}</span>
        </div>
      }
    </div>
  `,
})
export class StepLineChart {
  static readonly stComponentName = "StepLineChart";
  readonly componentName = "StepLineChart";
  readonly MARGIN = MARGIN;

  hoveredIndex: number | null = null;

  @NgInput() data: StepLineChartDatum[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() tone?: StepLineChartTone;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-stepLineChart", `st-stepLineChart--${this.tone ?? "category1"}`, this.classInput);
  }

  get widthValue(): number { return this.width ?? 480; }
  get heightValue(): number { return this.height ?? 240; }
  get viewBox(): string { return `0 0 ${this.widthValue} ${this.heightValue}`; }
  get plotWidth(): number { return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1); }
  get plotHeight(): number { return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1); }

  get safeData(): StepLineChartDatum[] {
    return (this.data ?? []).filter((d) => Number.isFinite(d.y) && (typeof d.x === "string" || isNumeric(d.x as number)));
  }

  get xIsNumeric(): boolean {
    return this.safeData.every((d) => isNumeric(d.x as number));
  }

  get xDomain(): { min: number; max: number } {
    if (this.xIsNumeric) {
      const xs = this.safeData.map((d) => d.x as number);
      return { min: Math.min(...xs), max: Math.max(...xs) };
    }
    return { min: 0, max: Math.max(this.safeData.length - 1, 1) };
  }

  get yValues(): number[] { return this.safeData.map((d) => d.y).filter(Number.isFinite); }

  get yTicks(): number[] {
    if (this.yValues.length === 0) return [0];
    const minRaw = Math.min(...this.yValues);
    const maxRaw = Math.max(...this.yValues);
    const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
    return niceTicks(minRaw - padded, maxRaw + padded, 5);
  }

  get yDomain(): { min: number; max: number } {
    const t = this.yTicks;
    return { min: t[0] ?? 0, max: t[t.length - 1] ?? 0 };
  }

  xPixel(datum: StepLineChartDatum, index: number): number {
    if (this.xIsNumeric) {
      return MARGIN.left + scaleLinear(datum.x as number, this.xDomain.min, this.xDomain.max, 0, this.plotWidth);
    }
    return MARGIN.left + (this.safeData.length <= 1 ? 0 : scaleLinear(index, 0, this.safeData.length - 1, 0, this.plotWidth));
  }

  yPixel(y: number): number {
    return MARGIN.top + scaleLinear(y, this.yDomain.min, this.yDomain.max, this.plotHeight, 0);
  }

  get points(): Array<{ x: number; y: number; datum: StepLineChartDatum; index: number }> {
    return this.safeData.map((datum, index) => ({
      x: this.xPixel(datum, index),
      y: this.yPixel(datum.y),
      datum,
      index,
    }));
  }

  get stepPath(): string {
    const pts = this.points;
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
    let d = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
    for (let i = 1; i < pts.length; i++) {
      const cur = pts[i];
      const prev = pts[i - 1];
      d += ` L${cur.x.toFixed(2)},${prev.y.toFixed(2)} L${cur.x.toFixed(2)},${cur.y.toFixed(2)}`;
    }
    return d;
  }

  get gridLines(): Array<{ value: number; y: number }> {
    return this.yTicks.map((value) => ({ value, y: this.yPixel(value) }));
  }

  get xTickEntries(): Array<{ key: string; x: number; label: string }> {
    return this.points.map((pt) => ({
      key: String(pt.datum.x),
      x: pt.x,
      label: String(pt.datum.x),
    }));
  }

  get dataValueItems(): string[] {
    return this.safeData.map((d) => `${d.x}: ${d.y}`);
  }

  formatTick(v: number): string { return formatTick(v); }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target as { getAttribute?: (name: string) => string | null } | null;
    const raw = Number(target?.getAttribute?.("data-chart-index"));
    this.hoveredIndex = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
  }
}
