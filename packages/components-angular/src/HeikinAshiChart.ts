import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type HeikinAshiChartDatum = {
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type HeikinAshiChartProps = {
  data: HeikinAshiChartDatum[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 52 } as const;

type HACandle = {
  label: string;
  haOpen: number;
  haHigh: number;
  haLow: number;
  haClose: number;
};

type Candle = {
  datum: HACandle;
  index: number;
  bullish: boolean;
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

function computeHeikinAshi(rows: HeikinAshiChartDatum[]): HACandle[] {
  const out: HACandle[] = [];
  for (let i = 0; i < rows.length; i++) {
    const d = rows[i];
    const haClose = (d.open + d.high + d.low + d.close) / 4;
    const haOpen =
      i === 0
        ? (d.open + d.close) / 2
        : (out[i - 1].haOpen + out[i - 1].haClose) / 2;
    const haHigh = Math.max(d.high, haOpen, haClose);
    const haLow = Math.min(d.low, haOpen, haClose);
    out.push({ label: d.label, haOpen, haHigh, haLow, haClose });
  }
  return out;
}

function fmtVal(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
}

@Component({
  selector: "st-heikin-ashi-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-heikinAshiChart__visual"
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
            <line class="st-heikinAshiChart__grid" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="item.y" [attr.y2]="item.y"></line>
            <text
              class="st-heikinAshiChart__tickLabel"
              [attr.x]="margin.left - 6"
              [attr.y]="item.y"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ formatTickLabel(item.tick) }}</text>
          }

          <line class="st-heikinAshiChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-heikinAshiChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>

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
              [class]="bodyClass(c)"
              [attr.x]="c.bodyX"
              [attr.y]="c.bodyY"
              [attr.width]="c.bodyW"
              [attr.height]="c.bodyH"
              rx="1"
              [attr.data-chart-index]="c.index"
            ></rect>
            <text
              class="st-heikinAshiChart__categoryLabel"
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
          class="st-heikinAshiChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeftPct(hoveredCandle)"
          [style.top]="tooltipTopPct(hoveredCandle)"
        >
          <span class="st-heikinAshiChart__tooltipLabel">{{ hoveredCandle.datum.label }}</span>
          <span class="st-heikinAshiChart__tooltipValue">O {{ fmtTooltip(hoveredCandle.datum.haOpen) }} H {{ fmtTooltip(hoveredCandle.datum.haHigh) }} L {{ fmtTooltip(hoveredCandle.datum.haLow) }} C {{ fmtTooltip(hoveredCandle.datum.haClose) }}</span>
        </div>
      }
    </div>
  `,
})
export class HeikinAshiChart {
  static readonly stComponentName = "HeikinAshiChart";
  readonly componentName = "HeikinAshiChart";
  readonly margin = MARGIN;

  private hoveredIndex: number | null = null;

  @NgInput() data: HeikinAshiChartDatum[] = [];
  @NgInput() label = "";
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-heikinAshiChart", this.classInput);
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

  get validData(): HeikinAshiChartDatum[] {
    return this.data.filter(
      (d) =>
        Number.isFinite(d.open) &&
        Number.isFinite(d.high) &&
        Number.isFinite(d.low) &&
        Number.isFinite(d.close),
    );
  }

  get haData(): HACandle[] {
    return computeHeikinAshi(this.validData);
  }

  get ticks(): number[] {
    const allVals: number[] = [];
    for (const d of this.haData) {
      allVals.push(d.haOpen, d.haHigh, d.haLow, d.haClose);
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
    if (this.haData.length === 0) return [];
    const band = this.plotWidth / this.haData.length;
    const bodyW = band * 0.55;
    return this.haData.map((d, i) => {
      const bullish = d.haClose >= d.haOpen;
      const centerX = MARGIN.left + band * i + band / 2;
      const bodyTop = MARGIN.top + scaleLinear(Math.max(d.haOpen, d.haClose), this.domainMin, this.domainMax, this.plotHeight, 0);
      const bodyBot = MARGIN.top + scaleLinear(Math.min(d.haOpen, d.haClose), this.domainMin, this.domainMax, this.plotHeight, 0);
      const highY = MARGIN.top + scaleLinear(d.haHigh, this.domainMin, this.domainMax, this.plotHeight, 0);
      const lowY = MARGIN.top + scaleLinear(d.haLow, this.domainMin, this.domainMax, this.plotHeight, 0);
      return {
        datum: d,
        index: i,
        bullish,
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
    return this.haData.map(
      (d) => `${d.label}: O ${fmtVal(d.haOpen)} H ${fmtVal(d.haHigh)} L ${fmtVal(d.haLow)} C ${fmtVal(d.haClose)}`,
    );
  }

  get hoveredCandle(): Candle | null {
    return this.hoveredIndex !== null ? (this.candles[this.hoveredIndex] ?? null) : null;
  }

  wickClass(c: Candle): string {
    return classNames("st-heikinAshiChart__wick", `st-heikinAshiChart__wick--${c.bullish ? "up" : "down"}`);
  }

  bodyClass(c: Candle): string {
    const dim = this.hoveredIndex !== null && this.hoveredIndex !== c.index;
    return classNames(
      "st-heikinAshiChart__body",
      `st-heikinAshiChart__body--${c.bullish ? "up" : "down"}`,
      dim && "st-heikinAshiChart__body--dim",
    );
  }

  formatTickLabel(tick: number): string {
    return formatTick(tick);
  }

  fmtTooltip(v: number): string {
    return fmtVal(v);
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
