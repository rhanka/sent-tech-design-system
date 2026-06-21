import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { scaleLinear, niceTicks } from "./chartScale.js";

export type HistogramChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type HistogramChartBin = {
  label: string;
  value: number;
  tone?: HistogramChartTone;
};

export type HistogramChartDatum = number | HistogramChartBin;

export type HistogramChartProps = {
  data: HistogramChartDatum[];
  bins?: number;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const MARGIN = { top: 14, right: 16, bottom: 36, left: 44 };

const TONES: HistogramChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

type NormalizedBin = {
  label: string;
  value: number;
  tone: HistogramChartTone;
};

type BarItem = {
  bin: NormalizedBin;
  x: number;
  y: number;
  width: number;
  height: number;
  labelX: number;
};

@Component({
  selector: "st-histogram-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-histogramChart__visual"
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
          <line
            class="st-histogramChart__axis"
            [attr.x1]="MARGIN.left"
            [attr.x2]="MARGIN.left"
            [attr.y1]="MARGIN.top"
            [attr.y2]="heightValue - MARGIN.bottom"
          ></line>
          <line
            class="st-histogramChart__axis"
            [attr.x1]="MARGIN.left"
            [attr.x2]="widthValue - MARGIN.right"
            [attr.y1]="heightValue - MARGIN.bottom"
            [attr.y2]="heightValue - MARGIN.bottom"
          ></line>

          @for (bar of bars; track bar.bin.label; let i = $index) {
            <rect
              [class]="barClass(bar, i)"
              [attr.x]="bar.x"
              [attr.y]="bar.y"
              [attr.width]="bar.width"
              [attr.height]="bar.height"
              [attr.data-chart-index]="i"
            ></rect>
            <text
              class="st-histogramChart__label"
              [attr.x]="bar.labelX"
              [attr.y]="heightValue - MARGIN.bottom + 16"
              text-anchor="middle"
            >{{ bar.bin.label }}</text>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && bars[hoveredIndex]) {
        <div
          class="st-histogramChart__tooltip"
          role="presentation"
          [style.left.%]="tooltipLeft(bars[hoveredIndex])"
          [style.top.%]="tooltipTop(bars[hoveredIndex])"
        >
          <span class="st-histogramChart__tooltipLabel">{{ bars[hoveredIndex].bin.label }}</span>
          <span class="st-histogramChart__tooltipValue">{{ bars[hoveredIndex].bin.value }}</span>
        </div>
      }
    </div>
  `,
})
export class HistogramChart {
  static readonly stComponentName = "HistogramChart";
  readonly componentName = "HistogramChart";
  readonly MARGIN = MARGIN;

  hoveredIndex: number | null = null;

  @NgInput() data: HistogramChartDatum[] = [];
  @NgInput() bins?: number;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-histogramChart", this.classInput);
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

  private isNumberArray(values: HistogramChartDatum[]): values is number[] {
    return values.every((value) => typeof value === "number");
  }

  private formatNumber(value: number): string {
    if (!Number.isFinite(value)) return "0";
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(2).replace(/\.?0+$/, "");
  }

  private buildNumericBins(values: number[], count: number): NormalizedBin[] {
    const finite = values.filter(Number.isFinite);
    if (finite.length === 0) return [];
    const binCount = Math.max(1, Math.floor(count));
    const min = Math.min(...finite);
    const max = Math.max(...finite);
    const step = max === min ? 1 : (max - min) / binCount;
    const out: NormalizedBin[] = Array.from({ length: binCount }, (_, index) => {
      const start = min + step * index;
      const end = index === binCount - 1 ? max : min + step * (index + 1);
      return {
        label: `${this.formatNumber(start)}-${this.formatNumber(end)}`,
        value: 0,
        tone: TONES[index % TONES.length] ?? "category1",
      };
    });
    for (const value of finite) {
      const index =
        value === max ? binCount - 1 : Math.max(0, Math.min(binCount - 1, Math.floor((value - min) / step)));
      out[index].value += 1;
    }
    return out;
  }

  get normalizedBins(): NormalizedBin[] {
    const safeData = this.data ?? [];
    if (this.isNumberArray(safeData)) {
      return this.buildNumericBins(safeData, this.bins ?? 10);
    }
    return (safeData as HistogramChartBin[]).map((datum, index) => ({
      label: datum.label,
      value: Number.isFinite(datum.value) ? datum.value : 0,
      tone: datum.tone ?? TONES[index % TONES.length] ?? "category1",
    }));
  }

  get bars(): BarItem[] {
    const bins = this.normalizedBins;
    const maxValue = Math.max(0, ...bins.map((bin) => bin.value));
    const safeMax = maxValue > 0 ? maxValue : 1;
    const band = bins.length > 0 ? this.plotWidth / bins.length : this.plotWidth;
    const barWidth = Math.max(band * 0.68, 1);
    return bins.map((bin, index) => {
      const h = scaleLinear(bin.value, 0, safeMax, 0, this.plotHeight);
      return {
        bin,
        x: MARGIN.left + band * index + (band - barWidth) / 2,
        y: MARGIN.top + this.plotHeight - h,
        width: barWidth,
        height: Math.max(h, 0.5),
        labelX: MARGIN.left + band * (index + 0.5),
      };
    });
  }

  get dataValueItems(): string[] {
    return this.normalizedBins.map((bin) => `${bin.label}: ${bin.value}`);
  }

  barClass(bar: BarItem, i: number): string {
    return classNames(
      "st-histogramChart__bar",
      `st-histogramChart__bar--${bar.bin.tone}`,
      this.hoveredIndex !== null && this.hoveredIndex !== i && "st-histogramChart__bar--dim",
    );
  }

  tooltipLeft(bar: BarItem): number {
    return (bar.labelX / this.widthValue) * 100;
  }

  tooltipTop(bar: BarItem): number {
    return (bar.y / this.heightValue) * 100;
  }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target as { getAttribute?: (name: string) => string | null } | null;
    const raw = Number(target?.getAttribute?.("data-chart-index"));
    this.hoveredIndex = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
  }

  handleLeave(): void {
    this.hoveredIndex = null;
  }
}
