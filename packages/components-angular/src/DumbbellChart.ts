import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";

import { GraphLegend } from "./GraphLegend.js";

import type { ForceGraphLegendEntry } from "./ForceGraph.js";

export type DumbbellChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type DumbbellChartDatum = {
  category: string;
  low: number;
  high: number;
};

export type DumbbellChartProps = {
  data: DumbbellChartDatum[];
  width?: number;
  height?: number;
  lowTone?: DumbbellChartTone;
  highTone?: DumbbellChartTone;
  lowLabel?: string;
  highLabel?: string;
  label: string;
  class?: string;
};

const DB_MARGIN = { top: 16, right: 20, bottom: 32, left: 96 } as const;
const DOT_RADIUS = 5;

type DumbbellRow = {
  datum: DumbbellChartDatum;
  range: { lo: number; hi: number };
  cy: number;
  xLow: number;
  xHigh: number;
  index: number;
};

type GridLine = { value: number; x: number };

@Component({
  selector: "st-dumbbell-chart",
  standalone: true,
  imports: [GraphLegend],
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-dumbbellChart__visual"
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
          @for (g of gridLines; track g.value) {
            <line class="st-dumbbellChart__grid" [attr.x1]="g.x" [attr.x2]="g.x" [attr.y1]="MARGIN_TOP" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>
            <text class="st-dumbbellChart__tickLabel" [attr.x]="g.x" [attr.y]="heightValue - MARGIN_BOTTOM + 16" text-anchor="middle">{{ formatTickLabel(g.value) }}</text>
          }

          <line class="st-dumbbellChart__axis" [attr.x1]="MARGIN_LEFT" [attr.x2]="MARGIN_LEFT" [attr.y1]="MARGIN_TOP" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>
          <line class="st-dumbbellChart__axis" [attr.x1]="MARGIN_LEFT" [attr.x2]="widthValue - MARGIN_RIGHT" [attr.y1]="heightValue - MARGIN_BOTTOM" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>

          @for (row of rows; track row.index) {
            <text class="st-dumbbellChart__categoryLabel" [attr.x]="MARGIN_LEFT - 8" [attr.y]="row.cy" text-anchor="end" dominant-baseline="middle">{{ row.datum.category }}</text>
            <line class="st-dumbbellChart__connector" [attr.x1]="row.xLow" [attr.x2]="row.xHigh" [attr.y1]="row.cy" [attr.y2]="row.cy"></line>
            <circle [class]="dotLowClass" [attr.cx]="row.xLow" [attr.cy]="row.cy" [attr.r]="DOT_RADIUS" [attr.data-chart-index]="row.index"></circle>
            <circle [class]="dotHighClass" [attr.cx]="row.xHigh" [attr.cy]="row.cy" [attr.r]="DOT_RADIUS" [attr.data-chart-index]="row.index"></circle>
          }
        </svg>
        <st-graph-legend class="st-dumbbellChart__legend" [entries]="legendEntries"></st-graph-legend>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="label">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredRow; as row) {
        <div
          class="st-dumbbellChart__tooltip"
          role="presentation"
          [style.left]="((row.xLow + row.xHigh) / 2 / widthValue * 100) + '%'"
          [style.top]="(row.cy / heightValue * 100) + '%'"
        >
          <span class="st-dumbbellChart__tooltipLabel">{{ row.datum.category }}</span>
          <span class="st-dumbbellChart__tooltipValue">{{ row.range.lo }} – {{ row.range.hi }}</span>
        </div>
      }
    </div>
  `,
})
export class DumbbellChart {
  static readonly stComponentName = "DumbbellChart";
  readonly componentName = "DumbbellChart";

  readonly MARGIN_LEFT = DB_MARGIN.left;
  readonly MARGIN_RIGHT = DB_MARGIN.right;
  readonly MARGIN_TOP = DB_MARGIN.top;
  readonly MARGIN_BOTTOM = DB_MARGIN.bottom;
  readonly DOT_RADIUS = DOT_RADIUS;

  hoveredIndex: number | null = null;

  @NgInput() data: DumbbellChartDatum[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() lowTone?: DumbbellChartTone;
  @NgInput() highTone?: DumbbellChartTone;
  @NgInput() lowLabel?: string;
  @NgInput() highLabel?: string;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-dumbbellChart", this.classInput);
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
    return Math.max(this.widthValue - DB_MARGIN.left - DB_MARGIN.right, 1);
  }

  get plotHeight(): number {
    return Math.max(this.heightValue - DB_MARGIN.top - DB_MARGIN.bottom, 1);
  }

  get lowToneValue(): DumbbellChartTone {
    return this.lowTone ?? "category1";
  }

  get highToneValue(): DumbbellChartTone {
    return this.highTone ?? "category2";
  }

  get lowLabelValue(): string {
    return this.lowLabel ?? "Bas";
  }

  get highLabelValue(): string {
    return this.highLabel ?? "Haut";
  }

  normalize(d: DumbbellChartDatum): { lo: number; hi: number } | null {
    if (!Number.isFinite(d.low) || !Number.isFinite(d.high)) return null;
    return { lo: Math.min(d.low, d.high), hi: Math.max(d.low, d.high) };
  }

  get validData(): DumbbellChartDatum[] {
    return this.data.filter((d) => this.normalize(d) !== null);
  }

  get dataValueItems(): string[] {
    return this.validData.map((d) => {
      const r = this.normalize(d)!;
      return `${d.category}: ${r.lo} – ${r.hi}`;
    });
  }

  get xTicks(): number[] {
    if (this.validData.length === 0) return [0];
    const lows = this.validData.map((d) => this.normalize(d)!.lo);
    const highs = this.validData.map((d) => this.normalize(d)!.hi);
    const minRaw = Math.min(...lows);
    const maxRaw = Math.max(...highs);
    const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
    return niceTicks(minRaw - padded, maxRaw + padded, 5);
  }

  get xDomain(): { min: number; max: number } {
    if (this.xTicks.length === 0) return { min: 0, max: 1 };
    return { min: this.xTicks[0], max: this.xTicks[this.xTicks.length - 1] };
  }

  get rows(): DumbbellRow[] {
    if (this.validData.length === 0) return [];
    const band = this.plotHeight / this.validData.length;
    return this.validData.map((d, i) => {
      const r = this.normalize(d)!;
      const cy = DB_MARGIN.top + band * (i + 0.5);
      const xLow = DB_MARGIN.left + scaleLinear(r.lo, this.xDomain.min, this.xDomain.max, 0, this.plotWidth);
      const xHigh = DB_MARGIN.left + scaleLinear(r.hi, this.xDomain.min, this.xDomain.max, 0, this.plotWidth);
      return { datum: d, range: r, cy, xLow, xHigh, index: i };
    });
  }

  get gridLines(): GridLine[] {
    return this.xTicks.map((tick) => ({
      value: tick,
      x: DB_MARGIN.left + scaleLinear(tick, this.xDomain.min, this.xDomain.max, 0, this.plotWidth),
    }));
  }

  get legendEntries(): ForceGraphLegendEntry[] {
    return [
      { label: this.lowLabelValue, shape: "circle", tone: this.lowToneValue },
      { label: this.highLabelValue, shape: "circle", tone: this.highToneValue },
    ];
  }

  get dotLowClass(): string {
    return `st-dumbbellChart__dot st-dumbbellChart__dot--low st-dumbbellChart__dot--${this.lowToneValue}`;
  }

  get dotHighClass(): string {
    return `st-dumbbellChart__dot st-dumbbellChart__dot--high st-dumbbellChart__dot--${this.highToneValue}`;
  }

  get hoveredRow(): DumbbellRow | null {
    return this.hoveredIndex !== null ? (this.rows[this.hoveredIndex] ?? null) : null;
  }

  formatTickLabel(v: number): string {
    return formatTick(v);
  }

  handleLeave(): void {
    this.hoveredIndex = null;
  }

  handlePointerMove(event: PointerEvent): void {
    const target = event.target as { getAttribute?: (name: string) => string | null } | null;
    const raw = Number(target?.getAttribute?.("data-chart-index"));
    this.hoveredIndex = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
  }
}
