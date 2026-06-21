import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type HLCChartDatum = {
  label: string;
  high: number;
  low: number;
  close: number;
};

export type HLCChartProps = {
  data: HLCChartDatum[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 52 } as const;

type HLCBar = {
  datum: HLCChartDatum;
  index: number;
  bullish: boolean;
  centerX: number;
  barHighY: number;
  barLowY: number;
  closeY: number;
  closeX: number;
  tooltipY: number;
};

type GridItem = {
  tick: number;
  y: number;
};

@Component({
  selector: "st-hlc-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-hlcChart__visual"
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
            <line class="st-hlcChart__grid" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="item.y" [attr.y2]="item.y"></line>
            <text
              class="st-hlcChart__tickLabel"
              [attr.x]="margin.left - 6"
              [attr.y]="item.y"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ formatTickLabel(item.tick) }}</text>
          }

          <line class="st-hlcChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-hlcChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>

          @for (b of bars; track b.index) {
            <g [class]="barGroupClass(b)">
              <line
                class="st-hlcChart__range"
                [attr.x1]="b.centerX"
                [attr.x2]="b.centerX"
                [attr.y1]="b.barHighY"
                [attr.y2]="b.barLowY"
                [attr.data-chart-index]="b.index"
              ></line>
              <line
                class="st-hlcChart__close"
                [attr.x1]="b.centerX"
                [attr.x2]="b.closeX"
                [attr.y1]="b.closeY"
                [attr.y2]="b.closeY"
                [attr.data-chart-index]="b.index"
              ></line>
            </g>
            <text
              class="st-hlcChart__categoryLabel"
              [attr.x]="b.centerX"
              [attr.y]="heightValue - margin.bottom + 16"
              text-anchor="middle"
            >{{ b.datum.label }}</text>
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
          class="st-hlcChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeftPct(hoveredBar)"
          [style.top]="tooltipTopPct(hoveredBar)"
        >
          <span class="st-hlcChart__tooltipLabel">{{ hoveredBar.datum.label }}</span>
          <span class="st-hlcChart__tooltipValue">H {{ hoveredBar.datum.high }} L {{ hoveredBar.datum.low }} C {{ hoveredBar.datum.close }}</span>
        </div>
      }
    </div>
  `,
})
export class HLCChart {
  static readonly stComponentName = "HLCChart";
  readonly componentName = "HLCChart";
  readonly margin = MARGIN;

  private hoveredIndex: number | null = null;

  @NgInput() data: HLCChartDatum[] = [];
  @NgInput() label = "";
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-hlcChart", this.classInput);
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

  get validData(): HLCChartDatum[] {
    return this.data.filter(
      (d) => Number.isFinite(d.high) && Number.isFinite(d.low) && Number.isFinite(d.close),
    );
  }

  get ticks(): number[] {
    const allVals: number[] = [];
    for (const d of this.validData) {
      allVals.push(d.high, d.low, d.close);
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

  get bars(): HLCBar[] {
    if (this.validData.length === 0) return [];
    const band = this.plotWidth / this.validData.length;
    const tickW = Math.min(band * 0.3, 12);
    return this.validData.map((d, i) => {
      const clampedHigh = Math.max(d.high, d.close);
      const clampedLow = Math.min(d.low, d.close);
      const prevClose = i > 0 ? this.validData[i - 1].close : d.close;
      const bullish = d.close >= prevClose;
      const centerX = MARGIN.left + band * i + band / 2;
      const highY = MARGIN.top + scaleLinear(clampedHigh, this.domainMin, this.domainMax, this.plotHeight, 0);
      const lowY = MARGIN.top + scaleLinear(clampedLow, this.domainMin, this.domainMax, this.plotHeight, 0);
      const closeY = MARGIN.top + scaleLinear(d.close, this.domainMin, this.domainMax, this.plotHeight, 0);
      return {
        datum: d,
        index: i,
        bullish,
        centerX,
        barHighY: highY,
        barLowY: lowY,
        closeY,
        closeX: centerX + tickW,
        tooltipY: Math.min(highY, closeY),
      };
    });
  }

  get dataValueItems(): string[] {
    return this.validData.map((d) => `${d.label}: H ${d.high} L ${d.low} C ${d.close}`);
  }

  get hoveredBar(): HLCBar | null {
    return this.hoveredIndex !== null ? (this.bars[this.hoveredIndex] ?? null) : null;
  }

  barGroupClass(b: HLCBar): string {
    const dim = this.hoveredIndex !== null && this.hoveredIndex !== b.index;
    return classNames(
      "st-hlcChart__bar",
      `st-hlcChart__bar--${b.bullish ? "up" : "down"}`,
      dim && "st-hlcChart__bar--dim",
    );
  }

  formatTickLabel(tick: number): string {
    return formatTick(tick);
  }

  tooltipLeftPct(b: HLCBar): string {
    return `${(b.centerX / this.widthValue) * 100}%`;
  }

  tooltipTopPct(b: HLCBar): string {
    return `${(b.tooltipY / this.heightValue) * 100}%`;
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
