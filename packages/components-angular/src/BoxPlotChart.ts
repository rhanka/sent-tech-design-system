import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type BoxPlotChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type BoxPlotChartDatum = {
  label: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: number[];
  tone?: BoxPlotChartTone;
};

export type BoxPlotChartProps = {
  data: BoxPlotChartDatum[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const BOX_TONES: BoxPlotChartTone[] = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

const BOX_MARGIN = { top: 16, right: 20, bottom: 38, left: 48 } as const;

type BoxPlot = {
  datum: BoxPlotChartDatum;
  tone: BoxPlotChartTone;
  cx: number;
  boxX: number;
  boxY: number;
  boxWidth: number;
  boxHeight: number;
  medianY: number;
  minY: number;
  maxY: number;
  capWidth: number;
  outliers: Array<{ value: number; y: number }>;
};

@Component({
  selector: "st-box-plot-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-boxPlotChart__visual"
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
          <line class="st-boxPlotChart__axis" [attr.x1]="MARGIN_LEFT" [attr.x2]="MARGIN_LEFT" [attr.y1]="MARGIN_TOP" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>
          <line class="st-boxPlotChart__axis" [attr.x1]="MARGIN_LEFT" [attr.x2]="widthValue - MARGIN_RIGHT" [attr.y1]="heightValue - MARGIN_BOTTOM" [attr.y2]="heightValue - MARGIN_BOTTOM"></line>

          @for (plot of plots; track plot.datum.label; let i = $index) {
            <line class="st-boxPlotChart__whisker" [attr.x1]="plot.cx" [attr.x2]="plot.cx" [attr.y1]="plot.minY" [attr.y2]="plot.maxY" [attr.data-chart-index]="i"></line>
            <line class="st-boxPlotChart__whiskerCap" [attr.x1]="plot.cx - plot.capWidth / 2" [attr.x2]="plot.cx + plot.capWidth / 2" [attr.y1]="plot.minY" [attr.y2]="plot.minY" [attr.data-chart-index]="i"></line>
            <line class="st-boxPlotChart__whiskerCap" [attr.x1]="plot.cx - plot.capWidth / 2" [attr.x2]="plot.cx + plot.capWidth / 2" [attr.y1]="plot.maxY" [attr.y2]="plot.maxY" [attr.data-chart-index]="i"></line>
            <rect
              [class]="boxClass(plot, i)"
              [attr.x]="plot.boxX"
              [attr.y]="plot.boxY"
              [attr.width]="plot.boxWidth"
              [attr.height]="plot.boxHeight"
              [attr.data-chart-index]="i"
            ></rect>
            <line class="st-boxPlotChart__median" [attr.x1]="plot.boxX" [attr.x2]="plot.boxX + plot.boxWidth" [attr.y1]="plot.medianY" [attr.y2]="plot.medianY" [attr.data-chart-index]="i"></line>
            @for (outlier of plot.outliers; track outlier.value) {
              <circle class="st-boxPlotChart__outlier" [attr.cx]="plot.cx" [attr.cy]="outlier.y" r="3" [attr.data-chart-index]="i"></circle>
            }
            <text class="st-boxPlotChart__label" [attr.x]="plot.cx" [attr.y]="heightValue - MARGIN_BOTTOM + 16" text-anchor="middle">{{ plot.datum.label }}</text>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && plots[hoveredIndex]) {
        <div
          class="st-boxPlotChart__tooltip"
          role="presentation"
          [style.left]="(plots[hoveredIndex].cx / widthValue * 100) + '%'"
          [style.top]="(plots[hoveredIndex].medianY / heightValue * 100) + '%'"
        >
          <span class="st-boxPlotChart__tooltipLabel">{{ plots[hoveredIndex].datum.label }}</span>
          <span class="st-boxPlotChart__tooltipValue">Median {{ formatNumber(plots[hoveredIndex].datum.median) }}</span>
        </div>
      }
    </div>
  `,
})
export class BoxPlotChart {
  static readonly stComponentName = "BoxPlotChart";
  readonly componentName = "BoxPlotChart";

  readonly MARGIN_LEFT = BOX_MARGIN.left;
  readonly MARGIN_RIGHT = BOX_MARGIN.right;
  readonly MARGIN_TOP = BOX_MARGIN.top;
  readonly MARGIN_BOTTOM = BOX_MARGIN.bottom;

  hoveredIndex: number | null = null;

  @NgInput() data: BoxPlotChartDatum[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-boxPlotChart", this.classInput);
  }

  get widthValue(): number {
    return this.width ?? 480;
  }

  get heightValue(): number {
    return this.height ?? 260;
  }

  get viewBox(): string {
    return `0 0 ${this.widthValue} ${this.heightValue}`;
  }

  get plotWidth(): number {
    return Math.max(this.widthValue - BOX_MARGIN.left - BOX_MARGIN.right, 1);
  }

  get plotHeight(): number {
    return Math.max(this.heightValue - BOX_MARGIN.top - BOX_MARGIN.bottom, 1);
  }

  formatNumber(value: number): string {
    if (!Number.isFinite(value)) return "0";
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(2).replace(/\.?0+$/, "");
  }

  scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number): number {
    if (d1 === d0) return r0;
    return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
  }

  get domain(): { min: number; max: number } {
    const values = this.data
      .flatMap((d) => [d.min, d.q1, d.median, d.q3, d.max, ...(d.outliers ?? [])])
      .filter(Number.isFinite);
    if (values.length === 0) return { min: 0, max: 1 };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min) * 0.08 || Math.max(Math.abs(max), 1) * 0.1;
    return { min: min - pad, max: max + pad };
  }

  get plots(): BoxPlot[] {
    const band = this.data.length > 0 ? this.plotWidth / this.data.length : this.plotWidth;
    const boxWidth = Math.min(54, Math.max(18, band * 0.44));
    const { min: dMin, max: dMax } = this.domain;

    return this.data.map((datum, index) => {
      const cx = BOX_MARGIN.left + band * (index + 0.5);
      const y = (value: number) => BOX_MARGIN.top + this.scaleLinear(value, dMin, dMax, this.plotHeight, 0);
      const q1Y = y(datum.q1);
      const q3Y = y(datum.q3);
      return {
        datum,
        tone: datum.tone ?? BOX_TONES[index % BOX_TONES.length],
        cx,
        boxX: cx - boxWidth / 2,
        boxY: Math.min(q1Y, q3Y),
        boxWidth,
        boxHeight: Math.max(Math.abs(q1Y - q3Y), 1),
        medianY: y(datum.median),
        minY: y(datum.min),
        maxY: y(datum.max),
        capWidth: boxWidth * 0.72,
        outliers: (datum.outliers ?? []).filter(Number.isFinite).map((v) => ({ value: v, y: y(v) })),
      };
    });
  }

  get dataValueItems(): string[] {
    return this.data.map((d) => {
      const summary = `${d.label}: min ${this.formatNumber(d.min)}, q1 ${this.formatNumber(d.q1)}, median ${this.formatNumber(d.median)}, q3 ${this.formatNumber(d.q3)}, max ${this.formatNumber(d.max)}`;
      const outliers = d.outliers?.length ? `, outliers ${d.outliers.map((v) => this.formatNumber(v)).join(", ")}` : "";
      return `${summary}${outliers}`;
    });
  }

  boxClass(plot: BoxPlot, i: number): string {
    return classNames(
      "st-boxPlotChart__box",
      `st-boxPlotChart__box--${plot.tone}`,
      this.hoveredIndex !== null && this.hoveredIndex !== i && "st-boxPlotChart__box--dim",
    );
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
