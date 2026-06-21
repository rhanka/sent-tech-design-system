import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type HollowCandlestickChartDatum = {
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type HollowCandlestickChartProps = {
  data: HollowCandlestickChartDatum[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 52 } as const;

type Candle = {
  datum: HollowCandlestickChartDatum;
  index: number;
  up: boolean;
  hollow: boolean;
  centerX: number;
  bodyX: number;
  bodyY: number;
  bodyW: number;
  bodyH: number;
  wickHighY: number;
  wickLowY: number;
  tooltipY: number;
};

type GridItem = {
  tick: number;
  y: number;
};

@Component({
  selector: "st-hollow-candlestick-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-hollowCandlestickChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handlePointerMove($event)"
        (pointerleave)="handlePointerLeave()"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @for (item of gridItems; track item.tick) {
            <line class="st-hollowCandlestickChart__grid" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="item.y" [attr.y2]="item.y"></line>
            <text
              class="st-hollowCandlestickChart__tickLabel"
              [attr.x]="margin.left - 6"
              [attr.y]="item.y"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ formatTickLabel(item.tick) }}</text>
          }

          <line class="st-hollowCandlestickChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-hollowCandlestickChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>

          @for (c of candles; track c.index) {
            <line
              [class]="wickClass(c)"
              [attr.x1]="c.centerX"
              [attr.x2]="c.centerX"
              [attr.y1]="c.wickHighY"
              [attr.y2]="c.wickLowY"
              [attr.data-chart-index]="c.index"
            ></line>
            <rect
              [class]="candleClass(c)"
              [attr.x]="c.bodyX"
              [attr.y]="c.bodyY"
              [attr.width]="c.bodyW"
              [attr.height]="c.bodyH"
              rx="1"
              [attr.data-chart-index]="c.index"
            ></rect>
            <text
              class="st-hollowCandlestickChart__categoryLabel"
              [attr.x]="c.centerX"
              [attr.y]="heightValue - margin.bottom + 16"
              text-anchor="middle"
            >{{ c.datum.label }}</text>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredCandle) {
        <div
          class="st-hollowCandlestickChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeftPct(hoveredCandle)"
          [style.top]="tooltipTopPct(hoveredCandle)"
        >
          <span class="st-hollowCandlestickChart__tooltipLabel">{{ hoveredCandle.datum.label }}</span>
          <span class="st-hollowCandlestickChart__tooltipValue">O {{ hoveredCandle.datum.open }} H {{ hoveredCandle.datum.high }} L {{ hoveredCandle.datum.low }} C {{ hoveredCandle.datum.close }}</span>
        </div>
      }
    </div>
  `,
})
export class HollowCandlestickChart {
  static readonly stComponentName = "HollowCandlestickChart";
  readonly componentName = "HollowCandlestickChart";
  readonly margin = MARGIN;

  private hoveredIndex: number | null = null;

  @NgInput() data: HollowCandlestickChartDatum[] = [];
  @NgInput() label = "";
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-hollowCandlestickChart", this.classInput);
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

  get validData(): HollowCandlestickChartDatum[] {
    return this.data.filter(
      (d) =>
        Number.isFinite(d.open) &&
        Number.isFinite(d.high) &&
        Number.isFinite(d.low) &&
        Number.isFinite(d.close),
    );
  }

  get ticks(): number[] {
    const allVals: number[] = [];
    for (const d of this.validData) {
      allVals.push(d.open, d.high, d.low, d.close);
    }
    if (allVals.length === 0) return [0, 1];
    const rawMin = Math.min(...allVals);
    const rawMax = Math.max(...allVals);
    const safeMax = rawMax === rawMin ? rawMin + 1 : rawMax;
    return niceTicks(rawMin, safeMax, 5);
  }

  get domainMin(): number {
    return this.ticks[0] ?? 0;
  }

  get domainMax(): number {
    return this.ticks[this.ticks.length - 1] ?? 1;
  }

  get gridItems(): GridItem[] {
    return this.ticks.map((tick) => ({
      tick,
      y: MARGIN.top + scaleLinear(tick, this.domainMin, this.domainMax, this.plotHeight, 0),
    }));
  }

  get candles(): Candle[] {
    if (this.validData.length === 0) return [];
    const band = this.plotWidth / this.validData.length;
    const bodyW = band * 0.55;
    return this.validData.map((d, i) => {
      const clampedHigh = Math.max(d.high, d.open, d.close);
      const clampedLow = Math.min(d.low, d.open, d.close);
      const prevClose = i > 0 ? this.validData[i - 1].close : d.open;
      const up = d.close >= prevClose;
      const hollow = d.close >= d.open;
      const centerX = MARGIN.left + band * i + band / 2;
      const bodyTop = MARGIN.top + scaleLinear(Math.max(d.open, d.close), this.domainMin, this.domainMax, this.plotHeight, 0);
      const bodyBot = MARGIN.top + scaleLinear(Math.min(d.open, d.close), this.domainMin, this.domainMax, this.plotHeight, 0);
      const highY = MARGIN.top + scaleLinear(clampedHigh, this.domainMin, this.domainMax, this.plotHeight, 0);
      const lowY = MARGIN.top + scaleLinear(clampedLow, this.domainMin, this.domainMax, this.plotHeight, 0);
      return {
        datum: d,
        index: i,
        up,
        hollow,
        centerX,
        bodyX: centerX - bodyW / 2,
        bodyY: bodyTop,
        bodyW,
        bodyH: Math.max(bodyBot - bodyTop, 0.5),
        wickHighY: highY,
        wickLowY: lowY,
        tooltipY: bodyTop,
      };
    });
  }

  get dataValueItems(): string[] {
    return this.validData.map(
      (d) => `${d.label}: O ${d.open} H ${d.high} L ${d.low} C ${d.close}`,
    );
  }

  get hoveredCandle(): Candle | null {
    return this.hoveredIndex !== null ? (this.candles[this.hoveredIndex] ?? null) : null;
  }

  wickClass(c: Candle): string {
    return classNames("st-hollowCandlestickChart__wick", `st-hollowCandlestickChart__wick--${c.up ? "up" : "down"}`);
  }

  candleClass(c: Candle): string {
    const dim = this.hoveredIndex !== null && this.hoveredIndex !== c.index;
    return classNames(
      "st-hollowCandlestickChart__candle",
      `st-hollowCandlestickChart__candle--${c.up ? "up" : "down"}`,
      `st-hollowCandlestickChart__candle--${c.hollow ? "hollow" : "filled"}`,
      dim && "st-hollowCandlestickChart__candle--dim",
    );
  }

  formatTickLabel(tick: number): string {
    return formatTick(tick);
  }

  tooltipLeftPct(c: Candle): string {
    return `${(c.centerX / this.widthValue) * 100}%`;
  }

  tooltipTopPct(c: Candle): string {
    return `${(c.tooltipY / this.heightValue) * 100}%`;
  }

  handlePointerMove(event: PointerEvent): void {
    const target = event.target as { getAttribute?: (name: string) => string | null } | null;
    const raw = Number(target?.getAttribute?.("data-chart-index"));
    this.hoveredIndex = Number.isInteger(raw) ? raw : null;
  }

  handlePointerLeave(): void {
    this.hoveredIndex = null;
  }
}
