import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";

import { contrastTextForTone } from "./chartContrast.js";

export type LollipopChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type LollipopChartDatum = {
  label: string;
  value: number;
  tone?: LollipopChartTone;
};

export type LollipopChartProps = {
  data: LollipopChartDatum[];
  width?: number;
  height?: number;
  orientation?: "vertical" | "horizontal";
  label: string;
  /**
   * Fixed value-axis domain `[min, max]`. When provided (and finite), the value
   * scale uses it instead of the data-derived min/max — letting several
   * LollipopCharts in a grid share one scale. When absent or invalid, the scale
   * falls back to the auto data range (unchanged).
   */
  domain?: [number, number];
  class?: string;
};

const MARGIN = { top: 24, right: 16, bottom: 32, left: 44 };
const DOT_RADIUS = 5;

type Lollipop = {
  datum: LollipopChartDatum;
  tone: LollipopChartTone;
  stemX1: number;
  stemY1: number;
  stemX2: number;
  stemY2: number;
  cx: number;
  cy: number;
  labelX: number;
  labelY: number;
};

type TickItem = {
  value: number;
  x1?: number;
  x2?: number;
  y?: number;
  x?: number;
  y1?: number;
  y2?: number;
};

@Component({
  selector: "st-lollipop-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-lollipopChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handleVisualPointerMove($event)"
        (pointerleave)="hoveredIndex = null"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @if (isVertical) {
            @for (tick of valueAxisTicks; track tick.value) {
              <line class="st-lollipopChart__grid" [attr.x1]="tick.x1" [attr.x2]="tick.x2" [attr.y1]="tick.y" [attr.y2]="tick.y"></line>
              <text
                class="st-lollipopChart__tickLabel"
                [attr.x]="MARGIN.left - 6"
                [attr.y]="tick.y"
                text-anchor="end"
                dominant-baseline="middle"
              >{{ fmtTick(tick.value) }}</text>
            }
          } @else {
            @for (tick of valueAxisTicks; track tick.value) {
              <line class="st-lollipopChart__grid" [attr.x1]="tick.x" [attr.x2]="tick.x" [attr.y1]="tick.y1" [attr.y2]="tick.y2"></line>
              <text
                class="st-lollipopChart__tickLabel"
                [attr.x]="tick.x"
                [attr.y]="heightValue - MARGIN.bottom + 16"
                text-anchor="middle"
              >{{ fmtTick(tick.value) }}</text>
            }
          }

          <line class="st-lollipopChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
          <line class="st-lollipopChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"></line>

          @for (pop of lollipops; track pop.datum.label) {
            @if (isVertical) {
              <text class="st-lollipopChart__categoryLabel" [attr.x]="pop.labelX" [attr.y]="pop.labelY" text-anchor="middle">{{ pop.datum.label }}</text>
            } @else {
              <text class="st-lollipopChart__categoryLabel" [attr.x]="pop.labelX" [attr.y]="pop.labelY" text-anchor="end" dominant-baseline="middle">{{ pop.datum.label }}</text>
            }
          }

          @for (pop of lollipops; track pop.datum.label; let i = $index) {
            <line
              class="st-lollipopChart__stem"
              [attr.x1]="pop.stemX1"
              [attr.y1]="pop.stemY1"
              [attr.x2]="pop.stemX2"
              [attr.y2]="pop.stemY2"
            ></line>
            <circle
              [class]="'st-lollipopChart__dot st-lollipopChart__dot--' + pop.tone"
              [attr.cx]="pop.cx"
              [attr.cy]="pop.cy"
              [attr.r]="DOT_RADIUS"
              [attr.data-chart-index]="i"
            ></circle>
            <text
              class="st-lollipopChart__valueLabel"
              [attr.x]="pop.cx"
              [attr.y]="isVertical ? pop.cy - DOT_RADIUS - 4 : pop.cy"
              [attr.dx]="isVertical ? 0 : DOT_RADIUS + 4"
              [attr.text-anchor]="isVertical ? 'middle' : 'start'"
              [attr.dominant-baseline]="isVertical ? 'auto' : 'middle'"
              [style.fill]="contrastText(pop.tone)"
            >{{ fmtTick(pop.datum.value) }}</text>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredLollipop; as pop) {
        <div
          class="st-lollipopChart__tooltip"
          role="presentation"
          [style.left.%]="(pop.cx / widthValue) * 100"
          [style.top.%]="(pop.cy / heightValue) * 100"
        >
          <span class="st-lollipopChart__tooltipLabel">{{ pop.datum.label }}</span>
          <span class="st-lollipopChart__tooltipValue">{{ pop.datum.value }}</span>
        </div>
      }
    </div>
  `,
})
export class LollipopChart {
  static readonly stComponentName = "LollipopChart";
  readonly componentName = "LollipopChart";
  readonly MARGIN = MARGIN;
  readonly DOT_RADIUS = DOT_RADIUS;

  hoveredIndex: number | null = null;

  @NgInput() data: LollipopChartDatum[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() orientation?: "vertical" | "horizontal";
  @NgInput() label = "";
  @NgInput() domain?: [number, number];
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-lollipopChart", this.classInput);
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

  get validData(): LollipopChartDatum[] {
    return (this.data ?? []).filter((d) => Number.isFinite(d.value));
  }

  get validDomain(): [number, number] | null {
    if (!this.domain) return null;
    const [d0, d1] = this.domain;
    if (!Number.isFinite(d0) || !Number.isFinite(d1) || d0 >= d1) return null;
    return [d0, d1];
  }

  get scales(): { ticks: number[]; domainMin: number; domainMax: number } {
    const values = this.validData.map((d) => d.value);
    const minRaw = this.validDomain ? this.validDomain[0] : Math.min(0, ...values);
    const maxRaw = this.validDomain ? this.validDomain[1] : Math.max(0, ...values);
    const ticks = niceTicks(minRaw, maxRaw, 5);
    return {
      ticks,
      domainMin: ticks[0] ?? minRaw,
      domainMax: ticks[ticks.length - 1] ?? maxRaw,
    };
  }

  get lollipops(): Lollipop[] {
    const { domainMin, domainMax } = this.scales;
    if (this.validData.length === 0) return [];
    if (this.isVertical) {
      const band = this.plotWidth / this.validData.length;
      const zeroY = scaleLinear(0, domainMin, domainMax, this.plotHeight, 0);
      return this.validData.map((d, i) => {
        const valueY = scaleLinear(d.value, domainMin, domainMax, this.plotHeight, 0);
        const cx = MARGIN.left + band * (i + 0.5);
        return {
          datum: d,
          tone: (d.tone ?? "category1") as LollipopChartTone,
          stemX1: cx,
          stemY1: MARGIN.top + zeroY,
          stemX2: cx,
          stemY2: MARGIN.top + valueY,
          cx,
          cy: MARGIN.top + valueY,
          labelX: cx,
          labelY: this.heightValue - MARGIN.bottom + 16,
        };
      });
    }
    const band = this.plotHeight / this.validData.length;
    const zeroX = scaleLinear(0, domainMin, domainMax, 0, this.plotWidth);
    return this.validData.map((d, i) => {
      const valueX = scaleLinear(d.value, domainMin, domainMax, 0, this.plotWidth);
      const cy = MARGIN.top + band * (i + 0.5);
      return {
        datum: d,
        tone: (d.tone ?? "category1") as LollipopChartTone,
        stemX1: MARGIN.left + zeroX,
        stemY1: cy,
        stemX2: MARGIN.left + valueX,
        stemY2: cy,
        cx: MARGIN.left + valueX,
        cy,
        labelX: MARGIN.left - 6,
        labelY: cy,
      };
    });
  }

  get valueAxisTicks(): TickItem[] {
    const { ticks, domainMin, domainMax } = this.scales;
    if (this.isVertical) {
      return ticks.map((tick) => ({
        value: tick,
        x1: MARGIN.left,
        x2: MARGIN.left + this.plotWidth,
        y: MARGIN.top + scaleLinear(tick, domainMin, domainMax, this.plotHeight, 0),
      }));
    }
    return ticks.map((tick) => ({
      value: tick,
      x: MARGIN.left + scaleLinear(tick, domainMin, domainMax, 0, this.plotWidth),
      y1: MARGIN.top,
      y2: MARGIN.top + this.plotHeight,
    }));
  }

  get dataValueItems(): string[] {
    return this.validData.map((d) => `${d.label}: ${d.value}`);
  }

  get hoveredLollipop(): Lollipop | null {
    if (this.hoveredIndex === null) return null;
    return this.lollipops[this.hoveredIndex] ?? null;
  }

  fmtTick(v: number): string {
    return formatTick(v);
  }

  contrastText(tone: LollipopChartTone): string {
    return contrastTextForTone(tone);
  }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target as Element | null;
    const attr = target?.getAttribute("data-chart-index");
    if (attr != null) {
      const idx = Number(attr);
      if (Number.isInteger(idx)) {
        this.hoveredIndex = idx;
        return;
      }
    }
    this.hoveredIndex = null;
  }
}
