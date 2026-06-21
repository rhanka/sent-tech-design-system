import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import {
  buildSmoothPath,
  formatTick,
  isNumeric,
  niceTicks,
  scaleLinear,
} from "./chartScale.js";

export type AreaSplineRangeChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type AreaSplineRangeChartDatum = {
  x: number | string;
  low: number;
  high: number;
};

export type AreaSplineRangeChartProps = {
  data: AreaSplineRangeChartDatum[];
  width?: number;
  height?: number;
  tone?: AreaSplineRangeChartTone;
  label: string;
  class?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 44 } as const;

type AreaSplineRangePoint = {
  x: number;
  yLow: number;
  yHigh: number;
  datum: AreaSplineRangeChartDatum;
  range: { lo: number; hi: number };
  index: number;
};

type GridLine = { value: number; y: number };
type XTick = { x: number; label: string };

@Component({
  selector: "st-area-spline-range-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-areaSplineRangeChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handleVisualPointerMove($event)"
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
          <defs>
            <linearGradient [attr.id]="gradientId" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="currentColor" stop-opacity="0.32"></stop>
              <stop offset="100%" stop-color="currentColor" stop-opacity="0.12"></stop>
            </linearGradient>
          </defs>

          @for (g of gridLines; track g.value) {
            <line
              class="st-areaSplineRangeChart__grid"
              [attr.x1]="margin.left"
              [attr.x2]="widthValue - margin.right"
              [attr.y1]="g.y"
              [attr.y2]="g.y"
            ></line>
            <text
              class="st-areaSplineRangeChart__tickLabel"
              [attr.x]="margin.left - 6"
              [attr.y]="g.y"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ formatTickLabel(g.value) }}</text>
          }

          <line
            class="st-areaSplineRangeChart__axis"
            [attr.x1]="margin.left"
            [attr.x2]="margin.left"
            [attr.y1]="margin.top"
            [attr.y2]="heightValue - margin.bottom"
          ></line>
          <line
            class="st-areaSplineRangeChart__axis"
            [attr.x1]="margin.left"
            [attr.x2]="widthValue - margin.right"
            [attr.y1]="heightValue - margin.bottom"
            [attr.y2]="heightValue - margin.bottom"
          ></line>

          @for (tick of xTickEntries; track $index) {
            <text
              class="st-areaSplineRangeChart__tickLabel"
              [attr.x]="tick.x"
              [attr.y]="heightValue - margin.bottom + 16"
              text-anchor="middle"
            >{{ tick.label }}</text>
          }

          @if (areaPath) {
            <path class="st-areaSplineRangeChart__area" [attr.d]="areaPath" [attr.fill]="'url(#' + gradientId + ')'"></path>
          }
          @if (highPath) {
            <path
              class="st-areaSplineRangeChart__line st-areaSplineRangeChart__line--high"
              [attr.d]="highPath"
              fill="none"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          }
          @if (lowPath) {
            <path
              class="st-areaSplineRangeChart__line st-areaSplineRangeChart__line--low"
              [attr.d]="lowPath"
              fill="none"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          }

          @for (p of points; track p.index) {
            <circle class="st-areaSplineRangeChart__dot" [attr.cx]="p.x" [attr.cy]="p.yHigh" r="3.5" [attr.data-chart-index]="p.index"></circle>
            <circle class="st-areaSplineRangeChart__dot" [attr.cx]="p.x" [attr.cy]="p.yLow" r="3.5" [attr.data-chart-index]="p.index"></circle>
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
          class="st-areaSplineRangeChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft() + '%'"
          [style.top]="tooltipTop() + '%'"
        >
          <span class="st-areaSplineRangeChart__tooltipLabel">{{ points[hoveredIndex].datum.x }}</span>
          <span class="st-areaSplineRangeChart__tooltipValue">{{ points[hoveredIndex].range.lo }} – {{ points[hoveredIndex].range.hi }}</span>
        </div>
      }
    </div>
  `,
})
export class AreaSplineRangeChart {
  static readonly stComponentName = "AreaSplineRangeChart";
  readonly componentName = "AreaSplineRangeChart";
  readonly margin = MARGIN;

  hoveredIndex: number | null = null;

  @NgInput() data: AreaSplineRangeChartDatum[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() tone?: AreaSplineRangeChartTone;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-areaSplineRangeChart", `st-areaSplineRangeChart--${this.tone ?? "category1"}`, this.classInput);
  }

  get widthValue(): number {
    return this.width ?? 480;
  }

  get heightValue(): number {
    return this.height ?? 240;
  }

  get viewBox(): string {
    return `0 0 ${this.widthValue} ${this.heightValue}`;
  }

  get plotWidth(): number {
    return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1);
  }

  get plotHeight(): number {
    return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1);
  }

  readonly gradientId = `st-areasplinerangechart-gradient-${Math.random().toString(36).substring(2, 9)}`;

  private normalize(d: AreaSplineRangeChartDatum): { lo: number; hi: number } | null {
    if (!Number.isFinite(d.low) || !Number.isFinite(d.high)) return null;
    return { lo: Math.min(d.low, d.high), hi: Math.max(d.low, d.high) };
  }

  get validData(): AreaSplineRangeChartDatum[] {
    return this.data.filter((d) => this.normalize(d) !== null);
  }

  get xDomain(): { kind: "numeric"; min: number; max: number } | { kind: "ordinal"; values: (number | string)[] } {
    if (this.validData.length === 0) return { kind: "ordinal", values: [] };
    const allNumeric = this.validData.every((d) => isNumeric(d.x));
    if (allNumeric) {
      const xs = this.validData.map((d) => d.x as number);
      return { kind: "numeric", min: Math.min(...xs), max: Math.max(...xs) };
    }
    return { kind: "ordinal", values: this.validData.map((d) => d.x) };
  }

  get yTicks(): number[] {
    if (this.validData.length === 0) return [0];
    const lows = this.validData.map((d) => this.normalize(d)!.lo);
    const highs = this.validData.map((d) => this.normalize(d)!.hi);
    const minRaw = Math.min(...lows);
    const maxRaw = Math.max(...highs);
    const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
    return niceTicks(minRaw - padded, maxRaw + padded, 5);
  }

  get yDomain(): { min: number; max: number } {
    if (this.yTicks.length === 0) return { min: 0, max: 1 };
    return { min: this.yTicks[0]!, max: this.yTicks[this.yTicks.length - 1]! };
  }

  get points(): AreaSplineRangePoint[] {
    if (this.validData.length === 0) return [];
    const xd = this.xDomain;
    return this.validData.map((d, i) => {
      let x: number;
      if (xd.kind === "numeric") {
        x = scaleLinear(d.x as number, xd.min, xd.max, 0, this.plotWidth);
      } else {
        const denom = Math.max(this.validData.length - 1, 1);
        x = this.validData.length === 1 ? this.plotWidth / 2 : (i / denom) * this.plotWidth;
      }
      const r = this.normalize(d)!;
      const yLow = scaleLinear(r.lo, this.yDomain.min, this.yDomain.max, this.plotHeight, 0);
      const yHigh = scaleLinear(r.hi, this.yDomain.min, this.yDomain.max, this.plotHeight, 0);
      return {
        x: MARGIN.left + x,
        yLow: MARGIN.top + yLow,
        yHigh: MARGIN.top + yHigh,
        datum: d,
        range: r,
        index: i,
      };
    });
  }

  // AreaSplineRangeChart = TOUJOURS lisse (pas de prop smooth).
  private continuePath(prefix: string, pts: { x: number; y: number }[]): string {
    if (pts.length === 0) return prefix;
    const full = buildSmoothPath(pts);
    return `${prefix} L${full.slice(1)}`;
  }

  get highPath(): string {
    if (this.points.length === 0) return "";
    return buildSmoothPath(this.points.map((p) => ({ x: p.x, y: p.yHigh })));
  }

  get lowPath(): string {
    if (this.points.length === 0) return "";
    return buildSmoothPath(this.points.map((p) => ({ x: p.x, y: p.yLow })));
  }

  get areaPath(): string {
    if (this.points.length === 0) return "";
    const lowReversed = [...this.points].reverse().map((p) => ({ x: p.x, y: p.yLow }));
    return `${this.continuePath(this.highPath, lowReversed)} Z`;
  }

  get gridLines(): GridLine[] {
    return this.yTicks.map((tick) => ({
      value: tick,
      y: MARGIN.top + scaleLinear(tick, this.yDomain.min, this.yDomain.max, this.plotHeight, 0),
    }));
  }

  get xTickEntries(): XTick[] {
    if (this.validData.length === 0) return [];
    const xd = this.xDomain;
    if (xd.kind === "ordinal") {
      return this.points.map((p, i) => ({ x: p.x, label: String(this.validData[i]!.x) }));
    }
    const target = Math.min(5, this.validData.length);
    const stride = Math.max(1, Math.round((this.validData.length - 1) / (target - 1 || 1)));
    const entries: XTick[] = [];
    for (let i = 0; i < this.validData.length; i += stride) {
      entries.push({ x: this.points[i]!.x, label: String(this.validData[i]!.x) });
    }
    const lastIdx = this.validData.length - 1;
    if (entries[entries.length - 1]?.label !== String(this.validData[lastIdx]!.x)) {
      entries.push({ x: this.points[lastIdx]!.x, label: String(this.validData[lastIdx]!.x) });
    }
    return entries;
  }

  get dataValueItems(): string[] {
    return this.validData.map((d) => {
      const r = this.normalize(d)!;
      return `${d.x}: ${r.lo} – ${r.hi}`;
    });
  }

  formatTickLabel(value: number): string {
    return formatTick(value);
  }

  tooltipLeft(): number {
    const p = this.hoveredIndex !== null ? this.points[this.hoveredIndex] : null;
    return p ? (p.x / this.widthValue) * 100 : 0;
  }

  tooltipTop(): number {
    const p = this.hoveredIndex !== null ? this.points[this.hoveredIndex] : null;
    return p ? (p.yHigh / this.heightValue) * 100 : 0;
  }

  handleLeave(): void {
    this.hoveredIndex = null;
  }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target as Element | null;
    if (!target) {
      this.hoveredIndex = null;
      return;
    }
    const raw = Number(target.getAttribute("data-chart-index"));
    this.hoveredIndex = Number.isInteger(raw) && target.hasAttribute("data-chart-index") ? raw : null;
  }
}
