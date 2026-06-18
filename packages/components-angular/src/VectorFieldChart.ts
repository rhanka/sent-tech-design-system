import { NgFor } from "@angular/common";
import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";
import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type VectorFieldChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type VectorFieldChartDatum = {
  x: number;
  y: number;
  length: number;
  direction: number;
};

export type VectorFieldChartProps = {
  data: VectorFieldChartDatum[];
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

type VectorArrow = {
  key: string;
  datum: VectorFieldChartDatum;
  cx: number;
  cy: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  hx1: number;
  hy1: number;
  hx2: number;
  hy2: number;
  tone: VectorFieldChartTone;
};

const MARGIN = { top: 16, right: 18, bottom: 36, left: 48 } as const;
const TONES: VectorFieldChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

@Component({
  selector: "st-vector-field-chart",
  standalone: true,
  imports: [NgFor],
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-vectorFieldChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handlePointerMove($event)"
        (pointerleave)="handleLeave()"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          <ng-container *ngFor="let tick of yAxisTicks">
            <line
              class="st-vectorFieldChart__grid"
              [attr.x1]="margin.left"
              [attr.x2]="resolvedWidth - margin.right"
              [attr.y1]="tick.y"
              [attr.y2]="tick.y"
            ></line>
            <text
              class="st-vectorFieldChart__tick"
              [attr.x]="margin.left - 6"
              [attr.y]="tick.y"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ format(tick.value) }}</text>
          </ng-container>

          <text
            *ngFor="let tick of xAxisTicks"
            class="st-vectorFieldChart__tick"
            [attr.x]="tick.x"
            [attr.y]="resolvedHeight - margin.bottom + 16"
            text-anchor="middle"
          >{{ format(tick.value) }}</text>

          <line class="st-vectorFieldChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="resolvedHeight - margin.bottom"></line>
          <line class="st-vectorFieldChart__axis" [attr.x1]="margin.left" [attr.x2]="resolvedWidth - margin.right" [attr.y1]="resolvedHeight - margin.bottom" [attr.y2]="resolvedHeight - margin.bottom"></line>

          <g *ngFor="let arrow of arrows" [attr.class]="arrowClass(arrow)" [attr.data-chart-key]="arrow.key">
            <line class="st-vectorFieldChart__shaft" [attr.x1]="arrow.x1" [attr.y1]="arrow.y1" [attr.x2]="arrow.x2" [attr.y2]="arrow.y2" [attr.data-chart-key]="arrow.key"></line>
            <line class="st-vectorFieldChart__head" [attr.x1]="arrow.x2" [attr.y1]="arrow.y2" [attr.x2]="arrow.hx1" [attr.y2]="arrow.hy1"></line>
            <line class="st-vectorFieldChart__head" [attr.x1]="arrow.x2" [attr.y1]="arrow.y2" [attr.x2]="arrow.hx2" [attr.y2]="arrow.hy2"></line>
          </g>
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="(label ?? 'vector field') + ' data'">
        <li *ngFor="let item of dataValueItems">{{ item }}</li>
      </ul>

      <div class="st-vectorFieldChart__tooltip" role="presentation" [style.display]="hoveredArrow ? 'inline-flex' : 'none'" [style.left]="tooltipLeft" [style.top]="tooltipTop">
        <span class="st-vectorFieldChart__tooltipLabel">{{ tooltipLabel }}</span>
        <span class="st-vectorFieldChart__tooltipValue">{{ tooltipValue }}</span>
      </div>
    </div>
  `,
})
export class VectorFieldChart {
  static readonly stComponentName = "VectorFieldChart";
  readonly componentName = "VectorFieldChart";
  readonly margin = MARGIN;

  @NgInput() data: VectorFieldChartDatum[] = [];
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput("class") classInput?: string;

  hoveredKey: string | null = null;

  get hostClass(): string {
    return ["st-vectorFieldChart", this.classInput].filter(Boolean).join(" ");
  }

  get resolvedWidth(): number {
    return this.finitePositive(this.width, 640);
  }

  get resolvedHeight(): number {
    return this.finitePositive(this.height, 320);
  }

  get resolvedSize(): number {
    return this.finitePositive(this.size, 26);
  }

  get viewBox(): string {
    return `0 0 ${this.resolvedWidth} ${this.resolvedHeight}`;
  }

  get validData(): VectorFieldChartDatum[] {
    return (this.data ?? []).filter(
      (datum) =>
        Boolean(datum) &&
        Number.isFinite(datum.x) &&
        Number.isFinite(datum.y) &&
        Number.isFinite(datum.length) &&
        datum.length >= 0 &&
        Number.isFinite(datum.direction),
    );
  }

  get xTicks(): number[] {
    const xs = this.validData.map((datum) => datum.x);
    return niceTicks(xs.length ? Math.min(...xs) : 0, xs.length ? Math.max(...xs) : 1);
  }

  get yTicks(): number[] {
    const ys = this.validData.map((datum) => datum.y);
    return niceTicks(ys.length ? Math.min(...ys) : 0, ys.length ? Math.max(...ys) : 1);
  }

  get plotWidth(): number {
    return Math.max(this.resolvedWidth - MARGIN.left - MARGIN.right, 1);
  }

  get plotHeight(): number {
    return Math.max(this.resolvedHeight - MARGIN.top - MARGIN.bottom, 1);
  }

  get xMin(): number {
    return this.xTicks[0] ?? 0;
  }

  get xMax(): number {
    return this.xTicks[this.xTicks.length - 1] ?? 1;
  }

  get yMin(): number {
    return this.yTicks[0] ?? 0;
  }

  get yMax(): number {
    return this.yTicks[this.yTicks.length - 1] ?? 1;
  }

  get xAxisTicks(): Array<{ value: number; x: number }> {
    return this.xTicks.map((value) => ({
      value,
      x: MARGIN.left + scaleLinear(value, this.xMin, this.xMax, 0, this.plotWidth),
    }));
  }

  get yAxisTicks(): Array<{ value: number; y: number }> {
    return this.yTicks.map((value) => ({
      value,
      y: MARGIN.top + scaleLinear(value, this.yMin, this.yMax, this.plotHeight, 0),
    }));
  }

  get arrows(): VectorArrow[] {
    const maxLength = this.validData.reduce((max, datum) => (datum.length > max ? datum.length : max), 0);
    const max = maxLength > 0 ? maxLength : 1;
    return this.validData.map((datum, index) => {
      const cx = MARGIN.left + scaleLinear(datum.x, this.xMin, this.xMax, 0, this.plotWidth);
      const cy = MARGIN.top + scaleLinear(datum.y, this.yMin, this.yMax, this.plotHeight, 0);
      const len = (datum.length / max) * this.resolvedSize;
      const rad = (datum.direction * Math.PI) / 180;
      const dx = Math.cos(rad) * len;
      const dy = -Math.sin(rad) * len;
      const x1 = cx - dx / 2;
      const y1 = cy - dy / 2;
      const x2 = cx + dx / 2;
      const y2 = cy + dy / 2;
      const head = Math.min(Math.max(len * 0.28, 3), 8);
      const headAngle = (28 * Math.PI) / 180;
      const baseAngle = Math.atan2(y2 - y1, x2 - x1);
      const bin = Math.min(Math.floor((datum.length / max) * TONES.length), TONES.length - 1);
      return {
        key: `${index}`,
        datum,
        cx,
        cy,
        x1,
        y1,
        x2,
        y2,
        hx1: x2 - head * Math.cos(baseAngle - headAngle),
        hy1: y2 - head * Math.sin(baseAngle - headAngle),
        hx2: x2 - head * Math.cos(baseAngle + headAngle),
        hy2: y2 - head * Math.sin(baseAngle + headAngle),
        tone: TONES[Math.max(0, bin)],
      };
    });
  }

  get dataValueItems(): string[] {
    return this.validData.map((datum) => `x ${datum.x}, y ${datum.y} - |v| ${formatTick(datum.length)} @ ${formatTick(datum.direction)}deg`);
  }

  get hoveredArrow(): VectorArrow | null {
    return this.hoveredKey === null ? null : this.arrows.find((arrow) => arrow.key === this.hoveredKey) ?? null;
  }

  get tooltipLeft(): string {
    const arrow = this.hoveredArrow;
    return arrow ? `${(arrow.cx / this.resolvedWidth) * 100}%` : "0";
  }

  get tooltipTop(): string {
    const arrow = this.hoveredArrow;
    return arrow ? `${(arrow.cy / this.resolvedHeight) * 100}%` : "0";
  }

  get tooltipLabel(): string {
    const arrow = this.hoveredArrow;
    return arrow ? `x ${arrow.datum.x} - y ${arrow.datum.y}` : "";
  }

  get tooltipValue(): string {
    const arrow = this.hoveredArrow;
    return arrow ? `|v| ${formatTick(arrow.datum.length)} @ ${formatTick(arrow.datum.direction)}deg` : "";
  }

  handlePointerMove(event: PointerEvent): void {
    const target = event.target;
    this.hoveredKey = target instanceof Element ? target.getAttribute("data-chart-key") : null;
  }

  handleLeave(): void {
    this.hoveredKey = null;
  }

  arrowClass(arrow: VectorArrow): string {
    return classNames(
      "st-vectorFieldChart__arrow",
      `st-vectorFieldChart__arrow--${arrow.tone}`,
      this.hoveredKey !== null && this.hoveredKey !== arrow.key ? "st-vectorFieldChart__arrow--dim" : undefined,
    );
  }

  format(value: number): string {
    return formatTick(value);
  }

  private finitePositive(value: number | undefined, fallback: number): number {
    return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
  }
}
