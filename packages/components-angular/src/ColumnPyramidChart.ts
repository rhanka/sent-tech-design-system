import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type ColumnPyramidChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ColumnPyramidChartDatum = {
  category: string;
  value: number;
  tone?: ColumnPyramidChartTone;
};

export type ColumnPyramidChartProps = {
  data: ColumnPyramidChartDatum[];
  width?: number;
  height?: number;
  label: string;
  /** Default tone for columns whose datum has no `tone`. */
  tone?: ColumnPyramidChartTone;
  class?: string;
};

const MARGIN = { top: 24, right: 16, bottom: 32, left: 44 } as const;

type Column = {
  datum: ColumnPyramidChartDatum;
  tone: ColumnPyramidChartTone;
  points: string;
  cx: number;
  cy: number;
  labelX: number;
  labelY: number;
  index: number;
};

type TickItem = {
  value: number;
  x1: number;
  x2: number;
  y: number;
};

@Component({
  selector: "st-column-pyramid-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-columnPyramidChart__visual"
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
          @for (tick of valueAxisTicks; track tick.value) {
            <line class="st-columnPyramidChart__grid" [attr.x1]="tick.x1" [attr.x2]="tick.x2" [attr.y1]="tick.y" [attr.y2]="tick.y"></line>
            <text
              class="st-columnPyramidChart__tickLabel"
              [attr.x]="margin.left - 6"
              [attr.y]="tick.y"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ formatTickLabel(tick.value) }}</text>
          }

          <line class="st-columnPyramidChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-columnPyramidChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>

          @for (col of columns; track col.datum.category) {
            <text
              class="st-columnPyramidChart__categoryLabel"
              [attr.x]="col.labelX"
              [attr.y]="col.labelY"
              text-anchor="middle"
            >{{ col.datum.category }}</text>
          }

          @for (col of columns; track col.datum.category) {
            <polygon
              [class]="columnClass(col)"
              [attr.points]="col.points"
              [attr.data-chart-index]="col.index"
            ></polygon>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredColumn) {
        <div
          class="st-columnPyramidChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeftPct(hoveredColumn)"
          [style.top]="tooltipTopPct(hoveredColumn)"
        >
          <span class="st-columnPyramidChart__tooltipLabel">{{ hoveredColumn.datum.category }}</span>
          <span class="st-columnPyramidChart__tooltipValue">{{ hoveredColumn.datum.value }}</span>
        </div>
      }
    </div>
  `,
})
export class ColumnPyramidChart {
  static readonly stComponentName = "ColumnPyramidChart";
  readonly componentName = "ColumnPyramidChart";
  readonly margin = MARGIN;

  private hoveredIndex: number | null = null;

  @NgInput() data: ColumnPyramidChartDatum[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label = "";
  @NgInput() tone?: ColumnPyramidChartTone;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-columnPyramidChart", this.classInput);
  }

  get widthValue(): number {
    return this.width ?? 480;
  }

  get heightValue(): number {
    return this.height ?? 280;
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

  get defaultTone(): ColumnPyramidChartTone {
    return this.tone ?? "category1";
  }

  get validData(): ColumnPyramidChartDatum[] {
    return this.data.filter((d) => Number.isFinite(d.value) && d.value > 0);
  }

  get ticks(): number[] {
    const values = this.validData.map((d) => d.value);
    const maxRaw = Math.max(0, ...values);
    return niceTicks(0, maxRaw, 5);
  }

  get domainMin(): number {
    return this.ticks[0] ?? 0;
  }

  get domainMax(): number {
    return this.ticks[this.ticks.length - 1] ?? 1;
  }

  get valueAxisTicks(): TickItem[] {
    return this.ticks.map((tick) => ({
      value: tick,
      x1: MARGIN.left,
      x2: MARGIN.left + this.plotWidth,
      y: MARGIN.top + scaleLinear(tick, this.domainMin, this.domainMax, this.plotHeight, 0),
    }));
  }

  get columns(): Column[] {
    if (this.validData.length === 0) return [];
    const band = this.plotWidth / this.validData.length;
    const baseWidth = band * 0.7;
    const zeroY = MARGIN.top + scaleLinear(0, this.domainMin, this.domainMax, this.plotHeight, 0);
    return this.validData.map((d, i) => {
      const apexY = MARGIN.top + scaleLinear(d.value, this.domainMin, this.domainMax, this.plotHeight, 0);
      const cx = MARGIN.left + band * (i + 0.5);
      const leftX = cx - baseWidth / 2;
      const rightX = cx + baseWidth / 2;
      const points = `${leftX},${zeroY} ${rightX},${zeroY} ${cx},${apexY}`;
      return {
        datum: d,
        tone: (d.tone ?? this.defaultTone) as ColumnPyramidChartTone,
        points,
        cx,
        cy: apexY,
        labelX: cx,
        labelY: this.heightValue - MARGIN.bottom + 16,
        index: i,
      };
    });
  }

  get dataValueItems(): string[] {
    return this.validData.map((d) => `${d.category}: ${d.value}`);
  }

  get hoveredColumn(): Column | null {
    return this.hoveredIndex !== null ? (this.columns[this.hoveredIndex] ?? null) : null;
  }

  columnClass(col: Column): string {
    return classNames("st-columnPyramidChart__column", `st-columnPyramidChart__column--${col.tone}`);
  }

  formatTickLabel(value: number): string {
    return formatTick(value);
  }

  tooltipLeftPct(col: Column): string {
    return `${(col.cx / this.widthValue) * 100}%`;
  }

  tooltipTopPct(col: Column): string {
    return `${(col.cy / this.heightValue) * 100}%`;
  }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target as { getAttribute?: (name: string) => string | null } | null;
    const raw = Number(target?.getAttribute?.("data-chart-index"));
    this.hoveredIndex = Number.isInteger(raw) ? raw : null;
  }

  handleLeave(): void {
    this.hoveredIndex = null;
  }
}
