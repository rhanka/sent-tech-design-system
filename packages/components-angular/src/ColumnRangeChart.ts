import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type ColumnRangeChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ColumnRangeChartDatum = {
  category: string;
  low: number;
  high: number;
  tone?: ColumnRangeChartTone;
};

export type ColumnRangeChartProps = {
  data: ColumnRangeChartDatum[];
  width?: number;
  height?: number;
  orientation?: "vertical" | "horizontal";
  label: string;
  /**
   * Fixed value-axis domain `[min, max]`. When provided (and finite), the value
   * scale uses it instead of the data-derived min/max — letting several
   * ColumnRangeCharts in a grid share one scale. When absent or invalid, the
   * scale falls back to the auto data range (unchanged).
   */
  domain?: [number, number];
  class?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 44 } as const;

type NormalizedRange = { lo: number; hi: number };

type Bar = {
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  datum: ColumnRangeChartDatum;
  range: NormalizedRange;
  tone: ColumnRangeChartTone;
  index: number;
};

type TickItemVertical = {
  value: number;
  x1: number;
  x2: number;
  y: number;
  horizontal: false;
};

type TickItemHorizontal = {
  value: number;
  x: number;
  y1: number;
  y2: number;
  horizontal: true;
};

type TickItem = TickItemVertical | TickItemHorizontal;

@Component({
  selector: "st-column-range-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-columnRangeChart__visual"
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
            @if (!tick.horizontal) {
              <line class="st-columnRangeChart__grid" [attr.x1]="tick.x1" [attr.x2]="tick.x2" [attr.y1]="tick.y" [attr.y2]="tick.y"></line>
              <text
                class="st-columnRangeChart__tickLabel"
                [attr.x]="margin.left - 6"
                [attr.y]="tick.y"
                text-anchor="end"
                dominant-baseline="middle"
              >{{ formatTickLabel(tick.value) }}</text>
            } @else {
              <line class="st-columnRangeChart__grid" [attr.x1]="tick.x" [attr.x2]="tick.x" [attr.y1]="tick.y1" [attr.y2]="tick.y2"></line>
              <text
                class="st-columnRangeChart__tickLabel"
                [attr.x]="tick.x"
                [attr.y]="heightValue - margin.bottom + 16"
                text-anchor="middle"
              >{{ formatTickLabel(tick.value) }}</text>
            }
          }

          <line class="st-columnRangeChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-columnRangeChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>

          @for (bar of bars; track bar.datum.category) {
            @if (isVertical) {
              <text
                class="st-columnRangeChart__categoryLabel"
                [attr.x]="bar.x + bar.width / 2"
                [attr.y]="heightValue - margin.bottom + 16"
                text-anchor="middle"
              >{{ bar.datum.category }}</text>
            } @else {
              <text
                class="st-columnRangeChart__categoryLabel"
                [attr.x]="margin.left - 6"
                [attr.y]="bar.y + bar.height / 2"
                text-anchor="end"
                dominant-baseline="middle"
              >{{ bar.datum.category }}</text>
            }
          }

          @for (bar of bars; track bar.datum.category) {
            <rect
              [class]="barClass(bar)"
              [attr.x]="bar.x"
              [attr.y]="bar.y"
              [attr.width]="bar.width"
              [attr.height]="bar.height"
              rx="2"
              [attr.data-chart-index]="bar.index"
            ></rect>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredBar) {
        <div
          class="st-columnRangeChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeftPct(hoveredBar)"
          [style.top]="tooltipTopPct(hoveredBar)"
        >
          <span class="st-columnRangeChart__tooltipLabel">{{ hoveredBar.datum.category }}</span>
          <span class="st-columnRangeChart__tooltipValue">{{ hoveredBar.range.lo }} – {{ hoveredBar.range.hi }}</span>
        </div>
      }
    </div>
  `,
})
export class ColumnRangeChart {
  static readonly stComponentName = "ColumnRangeChart";
  readonly componentName = "ColumnRangeChart";
  readonly margin = MARGIN;

  private hoveredIndex: number | null = null;

  @NgInput() data: ColumnRangeChartDatum[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() orientation?: "vertical" | "horizontal";
  @NgInput() label = "";
  @NgInput() domain?: [number, number];
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-columnRangeChart", this.classInput);
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

  get isVertical(): boolean {
    return (this.orientation ?? "vertical") === "vertical";
  }

  get plotWidth(): number {
    return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1);
  }

  get plotHeight(): number {
    return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1);
  }

  private normalize(d: ColumnRangeChartDatum): NormalizedRange | null {
    if (!Number.isFinite(d.low) || !Number.isFinite(d.high)) return null;
    return { lo: Math.min(d.low, d.high), hi: Math.max(d.low, d.high) };
  }

  get validDomain(): [number, number] | null {
    if (!this.domain) return null;
    const [d0, d1] = this.domain;
    if (!Number.isFinite(d0) || !Number.isFinite(d1) || d0 >= d1) return null;
    return [d0, d1];
  }

  get validData(): ColumnRangeChartDatum[] {
    return this.data.filter((d) => this.normalize(d) !== null);
  }

  get ticks(): number[] {
    const lows = this.validData.map((d) => Math.min(d.low, d.high));
    const highs = this.validData.map((d) => Math.max(d.low, d.high));
    const minRaw = this.validDomain ? this.validDomain[0] : Math.min(...lows, ...highs);
    const maxRaw = this.validDomain ? this.validDomain[1] : Math.max(...lows, ...highs);
    return niceTicks(minRaw, maxRaw, 5);
  }

  get domainMin(): number {
    return this.ticks[0] ?? 0;
  }

  get domainMax(): number {
    return this.ticks[this.ticks.length - 1] ?? 1;
  }

  private valueFraction(v: number): number {
    if (this.domainMax === this.domainMin) return 0;
    const f = (v - this.domainMin) / (this.domainMax - this.domainMin);
    return Math.min(1, Math.max(0, f));
  }

  get bars(): Bar[] {
    if (this.validData.length === 0) return [];
    if (this.isVertical) {
      const band = this.plotWidth / this.validData.length;
      const barWidth = band * 0.62;
      return this.validData.map((d, i) => {
        const range = this.normalize(d)!;
        const yLow = this.plotHeight * (1 - this.valueFraction(range.lo));
        const yHigh = this.plotHeight * (1 - this.valueFraction(range.hi));
        const y = Math.min(yLow, yHigh);
        const h = Math.abs(yLow - yHigh);
        const x = MARGIN.left + band * i + (band - barWidth) / 2;
        return {
          x,
          y: MARGIN.top + y,
          width: barWidth,
          height: Math.max(h, 0.5),
          cx: MARGIN.left + band * (i + 0.5),
          cy: MARGIN.top + (yLow + yHigh) / 2,
          datum: d,
          range,
          tone: (d.tone ?? "category1") as ColumnRangeChartTone,
          index: i,
        };
      });
    }
    const band = this.plotHeight / this.validData.length;
    const barHeight = band * 0.62;
    return this.validData.map((d, i) => {
      const range = this.normalize(d)!;
      const xLow = this.plotWidth * this.valueFraction(range.lo);
      const xHigh = this.plotWidth * this.valueFraction(range.hi);
      const x = Math.min(xLow, xHigh);
      const w = Math.abs(xHigh - xLow);
      const y = MARGIN.top + band * i + (band - barHeight) / 2;
      return {
        x: MARGIN.left + x,
        y,
        width: Math.max(w, 0.5),
        height: barHeight,
        cx: MARGIN.left + (xLow + xHigh) / 2,
        cy: MARGIN.top + band * (i + 0.5),
        datum: d,
        range,
        tone: (d.tone ?? "category1") as ColumnRangeChartTone,
        index: i,
      };
    });
  }

  get valueAxisTicks(): TickItem[] {
    if (this.isVertical) {
      return this.ticks.map((tick) => ({
        value: tick,
        x1: MARGIN.left,
        x2: MARGIN.left + this.plotWidth,
        y: MARGIN.top + this.plotHeight * (1 - this.valueFraction(tick)),
        horizontal: false as const,
      }));
    }
    return this.ticks.map((tick) => ({
      value: tick,
      x: MARGIN.left + this.plotWidth * this.valueFraction(tick),
      y1: MARGIN.top,
      y2: MARGIN.top + this.plotHeight,
      horizontal: true as const,
    }));
  }

  get dataValueItems(): string[] {
    return this.bars.map((bar) => `${bar.datum.category}: ${bar.range.lo} – ${bar.range.hi}`);
  }

  get hoveredBar(): Bar | null {
    return this.hoveredIndex !== null ? (this.bars[this.hoveredIndex] ?? null) : null;
  }

  barClass(bar: Bar): string {
    return classNames("st-columnRangeChart__bar", `st-columnRangeChart__bar--${bar.tone}`);
  }

  formatTickLabel(value: number): string {
    return formatTick(value);
  }

  tooltipLeftPct(bar: Bar): string {
    return `${(bar.cx / this.widthValue) * 100}%`;
  }

  tooltipTopPct(bar: Bar): string {
    return `${(bar.cy / this.heightValue) * 100}%`;
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
