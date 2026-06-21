import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type DivergentBarChartTone = "positive" | "negative" | "neutral";

export type DivergentBarChartDatum = {
  label: string;
  value: number;
  tone?: DivergentBarChartTone;
};

export type DivergentBarChartProps = {
  data: DivergentBarChartDatum[];
  width?: number;
  height?: number;
  domain?: [number, number];
  format?: (value: number) => string;
  showLegend?: boolean;
  label: string;
  class?: string;
};

const MARGIN = { top: 14, right: 16, bottom: 34, left: 88 };

type BarItem = {
  datum: DivergentBarChartDatum;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  sign: "positive" | "negative" | "zero";
  tone: DivergentBarChartTone;
};

type GridTick = {
  value: number;
  x: number;
};

@Component({
  selector: "st-divergent-bar-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-divergentBarChart__visual"
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
          @for (tick of gridTicks; track tick.value) {
            <line
              class="st-divergentBarChart__grid"
              [attr.x1]="tick.x"
              [attr.x2]="tick.x"
              [attr.y1]="MARGIN.top"
              [attr.y2]="heightValue - MARGIN.bottom"
            ></line>
            <text
              class="st-divergentBarChart__tickLabel"
              [attr.x]="tick.x"
              [attr.y]="heightValue - MARGIN.bottom + 16"
              text-anchor="middle"
            >{{ fmtTick(tick.value) }}</text>
          }

          <line
            class="st-divergentBarChart__axis"
            [attr.x1]="MARGIN.left"
            [attr.x2]="widthValue - MARGIN.right"
            [attr.y1]="heightValue - MARGIN.bottom"
            [attr.y2]="heightValue - MARGIN.bottom"
          ></line>
          <line
            class="st-divergentBarChart__zeroAxis"
            [attr.x1]="zeroAxisX"
            [attr.x2]="zeroAxisX"
            [attr.y1]="MARGIN.top"
            [attr.y2]="heightValue - MARGIN.bottom"
          ></line>

          @for (bar of bars; track bar.datum.label) {
            <text
              class="st-divergentBarChart__categoryLabel"
              [attr.x]="MARGIN.left - 8"
              [attr.y]="bar.cy"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ bar.datum.label }}</text>
            <rect
              [class]="barClass(bar)"
              [attr.x]="bar.x"
              [attr.y]="bar.y"
              [attr.width]="bar.width"
              [attr.height]="bar.height"
              rx="2"
              [attr.data-chart-index]="bar.index"
              [attr.data-chart-key]="bar.datum.label"
            ></rect>
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
          class="st-divergentBarChart__tooltip"
          role="presentation"
          [style.left.%]="tooltipLeft(bars[hoveredIndex])"
          [style.top.%]="tooltipTop(bars[hoveredIndex])"
        >
          <span class="st-divergentBarChart__tooltipLabel">{{ bars[hoveredIndex].datum.label }}</span>
          <span class="st-divergentBarChart__tooltipValue">{{ fmtValue(bars[hoveredIndex].datum.value) }}</span>
        </div>
      }

      @if (showLegend !== false) {
        <ul class="st-divergentBarChart__legend">
          <li class="st-divergentBarChart__legendItem">
            <span class="st-divergentBarChart__legendSwatch st-divergentBarChart__legendSwatch--positive" aria-hidden="true"></span>
            Positive
          </li>
          <li class="st-divergentBarChart__legendItem">
            <span class="st-divergentBarChart__legendSwatch st-divergentBarChart__legendSwatch--negative" aria-hidden="true"></span>
            Negative
          </li>
          <li class="st-divergentBarChart__legendItem">
            <span class="st-divergentBarChart__legendSwatch st-divergentBarChart__legendSwatch--neutral" aria-hidden="true"></span>
            Zero
          </li>
        </ul>
      }
    </div>
  `,
})
export class DivergentBarChart {
  static readonly stComponentName = "DivergentBarChart";
  readonly componentName = "DivergentBarChart";
  readonly MARGIN = MARGIN;

  hoveredIndex: number | null = null;

  @NgInput() data: DivergentBarChartDatum[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() domain?: [number, number];
  @NgInput() format?: (value: number) => string;
  @NgInput() showLegend?: boolean;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-divergentBarChart", this.classInput);
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
    return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1);
  }

  get plotHeight(): number {
    return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1);
  }

  get validData(): DivergentBarChartDatum[] {
    return (this.data ?? []).filter((d) => Number.isFinite(d.value));
  }

  get validDomain(): [number, number] | null {
    if (!this.domain) return null;
    const [d0, d1] = this.domain;
    if (!Number.isFinite(d0) || !Number.isFinite(d1) || d0 >= d1 || d0 > 0 || d1 < 0) return null;
    return [d0, d1];
  }

  get scales(): { plotWidth: number; plotHeight: number; domainMin: number; domainMax: number; ticks: number[] } {
    const plotWidth = this.plotWidth;
    const plotHeight = this.plotHeight;
    if (this.validDomain) {
      const [d0, d1] = this.validDomain;
      const ticks = niceTicks(d0, d1).filter((tick) => tick >= d0 && tick <= d1);
      return { plotWidth, plotHeight, domainMin: d0, domainMax: d1, ticks: ticks.length ? ticks : [0] };
    }
    const maxAbs = Math.max(1, ...this.validData.map((d) => Math.abs(d.value)));
    const ticks = niceTicks(-maxAbs, maxAbs);
    return { plotWidth, plotHeight, domainMin: ticks[0] ?? -maxAbs, domainMax: ticks[ticks.length - 1] ?? maxAbs, ticks };
  }

  get bars(): BarItem[] {
    if (this.validData.length === 0) return [];
    const { domainMin, domainMax, plotWidth, plotHeight } = this.scales;
    const band = plotHeight / this.validData.length;
    const barHeight = Math.max(band * 0.56, 1);
    const zeroX = MARGIN.left + scaleLinear(0, domainMin, domainMax, 0, plotWidth);
    return this.validData.map((datum, index) => {
      const valueX = MARGIN.left + scaleLinear(datum.value, domainMin, domainMax, 0, plotWidth);
      const x = Math.min(zeroX, valueX);
      const barWidth = Math.max(Math.abs(valueX - zeroX), 0.5);
      const y = MARGIN.top + band * index + (band - barHeight) / 2;
      return {
        datum,
        index,
        x,
        y,
        width: barWidth,
        height: barHeight,
        cx: datum.value === 0 ? zeroX : x + barWidth / 2,
        cy: y + barHeight / 2,
        sign: this.signFor(datum.value),
        tone: this.toneFor(datum),
      };
    });
  }

  get gridTicks(): GridTick[] {
    const { ticks, domainMin, domainMax, plotWidth } = this.scales;
    return ticks.map((tick) => ({
      value: tick,
      x: MARGIN.left + scaleLinear(tick, domainMin, domainMax, 0, plotWidth),
    }));
  }

  get zeroAxisX(): number {
    const { domainMin, domainMax, plotWidth } = this.scales;
    return MARGIN.left + scaleLinear(0, domainMin, domainMax, 0, plotWidth);
  }

  get dataValueItems(): string[] {
    return this.validData.map((d) => `${d.label}: ${this.fmtValue(d.value)}`);
  }

  private signFor(value: number): "positive" | "negative" | "zero" {
    if (value > 0) return "positive";
    if (value < 0) return "negative";
    return "zero";
  }

  private toneFor(datum: DivergentBarChartDatum): DivergentBarChartTone {
    if (datum.tone) return datum.tone;
    if (datum.value > 0) return "positive";
    if (datum.value < 0) return "negative";
    return "neutral";
  }

  fmtTick(value: number): string {
    return formatTick(value);
  }

  fmtValue(value: number): string {
    return this.format ? this.format(value) : formatTick(value);
  }

  barClass(bar: BarItem): string {
    return classNames(
      "st-divergentBarChart__bar",
      `st-divergentBarChart__bar--${bar.sign}`,
      `st-divergentBarChart__bar--${bar.tone}`,
    );
  }

  tooltipLeft(bar: BarItem): number {
    return (bar.cx / this.widthValue) * 100;
  }

  tooltipTop(bar: BarItem): number {
    return (bar.cy / this.heightValue) * 100;
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
