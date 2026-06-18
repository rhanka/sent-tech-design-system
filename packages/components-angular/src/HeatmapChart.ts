import { NgFor } from "@angular/common";
import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type HeatmapChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type HeatmapChartScale = "categorical" | "sequential";

export type HeatmapChartDatum = {
  x: string;
  y: string;
  value: number;
  tone?: HeatmapChartTone;
};

export type HeatmapChartProps = {
  data: HeatmapChartDatum[];
  width?: number;
  height?: number;
  scale?: HeatmapChartScale;
  legend?: boolean;
  label: string;
  class?: string;
};

type HeatmapCell = {
  datum: HeatmapChartDatum;
  tone: HeatmapChartTone;
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
};

const MARGIN = { top: 28, right: 18, bottom: 44, left: 64 } as const;
const TONES: HeatmapChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

function uniqueInOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      out.push(value);
    }
  }
  return out;
}

function normalizedScale(value: HeatmapChartScale | undefined): HeatmapChartScale {
  return value === "sequential" ? "sequential" : "categorical";
}

function toneForValue(value: number, min: number, max: number): HeatmapChartTone {
  if (!Number.isFinite(value) || max <= min) return "category1";
  const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(((value - min) / (max - min)) * TONES.length)));
  return TONES[index];
}

@Component({
  selector: "st-heatmap-chart",
  standalone: true,
  imports: [NgFor],
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-heatmapChart__visual"
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
          <text
            *ngFor="let yLabel of yLabels; let row = index"
            class="st-heatmapChart__axisLabel st-heatmapChart__axisLabel--y"
            [attr.x]="margin.left - 8"
            [attr.y]="margin.top + (row + 0.5) * (plotHeight / maxCount(yLabels.length))"
            text-anchor="end"
            dominant-baseline="middle"
          >{{ yLabel }}</text>

          <text
            *ngFor="let xLabel of xLabels; let column = index"
            class="st-heatmapChart__axisLabel st-heatmapChart__axisLabel--x"
            [attr.x]="margin.left + (column + 0.5) * (plotWidth / maxCount(xLabels.length))"
            [attr.y]="resolvedHeight - margin.bottom + 20"
            text-anchor="middle"
          >{{ xLabel }}</text>

          <rect
            class="st-heatmapChart__plot"
            [attr.x]="margin.left"
            [attr.y]="margin.top"
            [attr.width]="plotWidth"
            [attr.height]="plotHeight"
          ></rect>

          <rect
            *ngFor="let cell of cells; let i = index"
            [attr.class]="cellClass(i, cell.tone)"
            [attr.x]="cell.x"
            [attr.y]="cell.y"
            [attr.width]="cell.width"
            [attr.height]="cell.height"
            rx="2"
            [attr.data-chart-index]="i"
          ></rect>
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="label + ' data'">
        <li *ngFor="let item of dataValueItems">{{ item }}</li>
      </ul>

      <div
        class="st-heatmapChart__tooltip"
        role="presentation"
        [style.display]="hoveredCell ? 'inline-flex' : 'none'"
        [style.left]="tooltipLeft"
        [style.top]="tooltipTop"
      >
        <span class="st-heatmapChart__tooltipLabel">{{ tooltipLabel }}</span>
        <span class="st-heatmapChart__tooltipValue">{{ tooltipValue }}</span>
      </div>

      <div class="st-heatmapChart__legend" aria-hidden="true" [style.display]="legend ? 'flex' : 'none'">
        <span class="st-heatmapChart__legendText">Low</span>
        <span class="st-heatmapChart__legendRamp">
          <span
            *ngFor="let tone of tones"
            [attr.class]="'st-heatmapChart__legendSwatch st-heatmapChart__legendSwatch--' + tone"
          ></span>
        </span>
        <span class="st-heatmapChart__legendText">High</span>
      </div>
    </div>
  `,
})
export class HeatmapChart {
  static readonly stComponentName = "HeatmapChart";
  readonly componentName = "HeatmapChart";
  readonly margin = MARGIN;
  readonly tones = TONES;
  @NgInput() data: HeatmapChartDatum[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() scale?: HeatmapChartScale;
  @NgInput() legend?: boolean;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  hoveredIndex: number | null = null;

  get resolvedScale(): HeatmapChartScale {
    return normalizedScale(this.scale);
  }

  get resolvedWidth(): number {
    return this.width ?? 480;
  }

  get resolvedHeight(): number {
    return this.height ?? 300;
  }

  get viewBox(): string {
    return `0 0 ${this.resolvedWidth} ${this.resolvedHeight}`;
  }

  get hostClass(): string {
    return classNames("st-heatmapChart", `st-heatmapChart--${this.resolvedScale}`, this.classInput);
  }

  get xLabels(): string[] {
    return uniqueInOrder((this.data ?? []).map((d) => d.x));
  }

  get yLabels(): string[] {
    return uniqueInOrder((this.data ?? []).map((d) => d.y));
  }

  get plotWidth(): number {
    return Math.max(this.resolvedWidth - MARGIN.left - MARGIN.right, 1);
  }

  get plotHeight(): number {
    return Math.max(this.resolvedHeight - MARGIN.top - MARGIN.bottom, 1);
  }

  get cells(): HeatmapCell[] {
    const data = this.data ?? [];
    const xLabels = this.xLabels;
    const yLabels = this.yLabels;
    const cellWidth = xLabels.length > 0 ? this.plotWidth / xLabels.length : this.plotWidth;
    const cellHeight = yLabels.length > 0 ? this.plotHeight / yLabels.length : this.plotHeight;
    const values = data.map((d) => d.value).filter(Number.isFinite);
    const min = values.length > 0 ? Math.min(...values) : 0;
    const max = values.length > 0 ? Math.max(...values) : 1;

    return data.map((datum) => {
      const xIndex = Math.max(0, xLabels.indexOf(datum.x));
      const yIndex = Math.max(0, yLabels.indexOf(datum.y));
      const x = MARGIN.left + xIndex * cellWidth;
      const y = MARGIN.top + yIndex * cellHeight;
      return {
        datum,
        tone: this.resolvedScale === "sequential" ? toneForValue(datum.value, min, max) : datum.tone ?? toneForValue(datum.value, min, max),
        x,
        y,
        width: Math.max(cellWidth - 2, 1),
        height: Math.max(cellHeight - 2, 1),
        cx: x + cellWidth / 2,
        cy: y + cellHeight / 2,
      };
    });
  }

  get dataValueItems(): string[] {
    return (this.data ?? []).map((d) => `${d.y}, ${d.x}: ${d.value}`);
  }

  get hoveredCell(): HeatmapCell | undefined {
    return this.hoveredIndex !== null ? this.cells[this.hoveredIndex] : undefined;
  }

  get tooltipLeft(): string {
    const cell = this.hoveredCell;
    return cell ? `${(cell.cx / this.resolvedWidth) * 100}%` : "0%";
  }

  get tooltipTop(): string {
    const cell = this.hoveredCell;
    return cell ? `${(cell.cy / this.resolvedHeight) * 100}%` : "0%";
  }

  get tooltipLabel(): string {
    const cell = this.hoveredCell;
    return cell ? `${cell.datum.y}, ${cell.datum.x}` : "";
  }

  get tooltipValue(): string {
    const cell = this.hoveredCell;
    return cell ? String(cell.datum.value) : "";
  }

  maxCount(value: number): number {
    return Math.max(value, 1);
  }

  cellClass(index: number, tone: HeatmapChartTone): string {
    return classNames(
      "st-heatmapChart__cell",
      `st-heatmapChart__cell--${tone}`,
      this.hoveredIndex !== null && this.hoveredIndex !== index ? "st-heatmapChart__cell--dim" : undefined,
    );
  }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) {
      this.hoveredIndex = null;
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    this.hoveredIndex = Number.isInteger(index) ? index : null;
  }

  handleLeave(): void {
    this.hoveredIndex = null;
  }
}
