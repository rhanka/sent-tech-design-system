import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";
import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type WaterfallType = "increase" | "decrease" | "total";

export type WaterfallChartDatum = {
  label: string;
  value: number;
  type?: WaterfallType;
};

export type WaterfallChartProps = {
  data: WaterfallChartDatum[];
  width?: number;
  height?: number;
  connectors?: boolean;
  format?: (value: number) => string;
  label: string;
  class?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 44 };

type ComputedBar = {
  datum: WaterfallChartDatum;
  type: WaterfallType;
  start: number;
  end: number;
  displayValue: number;
  cumulative: number;
};

type WaterfallBarGeom = {
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  type: WaterfallType;
  datum: WaterfallChartDatum;
  displayValue: number;
  cumulative: number;
  index: number;
};

type ConnectorLine = { x1: number; x2: number; y: number };

type ValueAxisTick = { value: number; x1: number; x2: number; y: number };

const LEGEND_ITEMS: { type: WaterfallType; label: string }[] = [
  { type: "increase", label: "Hausse" },
  { type: "decrease", label: "Baisse" },
  { type: "total", label: "Total" },
];

@Component({
  selector: "st-waterfall-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-waterfallChart__visual"
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
            <line
              class="st-waterfallChart__grid"
              [attr.x1]="tick.x1"
              [attr.x2]="tick.x2"
              [attr.y1]="tick.y"
              [attr.y2]="tick.y"
            ></line>
            <text
              class="st-waterfallChart__tickLabel"
              [attr.x]="margin.left - 6"
              [attr.y]="tick.y"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ formatTickLabel(tick.value) }}</text>
          }

          <line
            class="st-waterfallChart__axis"
            [attr.x1]="margin.left"
            [attr.x2]="margin.left"
            [attr.y1]="margin.top"
            [attr.y2]="heightValue - margin.bottom"
          ></line>
          <line
            class="st-waterfallChart__axis"
            [attr.x1]="margin.left"
            [attr.x2]="widthValue - margin.right"
            [attr.y1]="heightValue - margin.bottom"
            [attr.y2]="heightValue - margin.bottom"
          ></line>
          <line
            class="st-waterfallChart__zero"
            [attr.x1]="margin.left"
            [attr.x2]="widthValue - margin.right"
            [attr.y1]="zeroY"
            [attr.y2]="zeroY"
          ></line>

          @for (line of connectorLines; track \$index) {
            <line
              class="st-waterfallChart__connector"
              [attr.x1]="line.x1"
              [attr.x2]="line.x2"
              [attr.y1]="line.y"
              [attr.y2]="line.y"
            ></line>
          }

          @for (bar of bars; track bar.datum.label) {
            <text
              class="st-waterfallChart__categoryLabel"
              [attr.x]="bar.x + bar.width / 2"
              [attr.y]="heightValue - margin.bottom + 16"
              text-anchor="middle"
            >{{ bar.datum.label }}</text>
          }

          @for (bar of bars; track bar.datum.label; let i = \$index) {
            <rect
              [class]="'st-waterfallChart__bar st-waterfallChart__bar--' + bar.type"
              [attr.x]="bar.x"
              [attr.y]="bar.y"
              [attr.width]="bar.width"
              [attr.height]="bar.height"
              rx="2"
              [attr.data-chart-index]="i"
            ></rect>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      <ul class="st-waterfallChart__legend" aria-hidden="true">
        @for (item of legendItems; track item.type) {
          <li class="st-waterfallChart__legendItem">
            <span [class]="'st-waterfallChart__legendSwatch st-waterfallChart__legendSwatch--' + item.type"></span>
            {{ item.label }}
          </li>
        }
      </ul>

      @if (hoveredIndex !== null && bars[hoveredIndex]) {
        <div
          class="st-waterfallChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft()"
          [style.top]="tooltipTop()"
        >
          <span class="st-waterfallChart__tooltipLabel">{{ bars[hoveredIndex].datum.label }}</span>
          <span class="st-waterfallChart__tooltipValue">{{ formatValue(bars[hoveredIndex].displayValue) }}</span>
        </div>
      }
    </div>
  `,
})
export class WaterfallChart {
  static readonly stComponentName = "WaterfallChart";
  readonly componentName = "WaterfallChart";
  readonly margin = MARGIN;
  readonly legendItems = LEGEND_ITEMS;

  hoveredIndex: number | null = null;

  @NgInput() data: WaterfallChartDatum[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() connectors?: boolean;
  @NgInput() format?: (value: number) => string;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-waterfallChart", this.classInput);
  }

  get widthValue(): number {
    return this.width ?? 480;
  }
  get heightValue(): number {
    return this.height ?? 240;
  }
  get connectorsValue(): boolean {
    return this.connectors ?? true;
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

  get computed(): ComputedBar[] {
    let cumulative = 0;
    let seenStep = false;
    return this.data.map((d) => {
      const raw = Number.isFinite(d.value) ? d.value : 0;
      const type: WaterfallType = d.type ?? (raw >= 0 ? "increase" : "decrease");
      let start: number;
      let end: number;
      let displayValue: number;
      if (type === "total") {
        if (seenStep && raw !== cumulative) {
          // eslint-disable-next-line no-console
          console.warn(
            `[WaterfallChart] total "${d.label}" = ${raw} ` +
              `diverges from the running cumulative ${cumulative}.`,
          );
        }
        start = 0;
        end = raw;
        cumulative = raw;
        displayValue = raw;
      } else {
        const signed = type === "decrease" ? -Math.abs(raw) : Math.abs(raw);
        start = cumulative;
        end = cumulative + signed;
        cumulative = end;
        displayValue = signed;
        seenStep = true;
      }
      return { datum: d, type, start, end, displayValue, cumulative };
    });
  }

  get ticks(): number[] {
    const bounds = this.computed.flatMap((c) => [c.start, c.end]);
    const minRaw = Math.min(0, ...bounds);
    const maxRaw = Math.max(0, ...bounds);
    return niceTicks(minRaw, maxRaw, 5);
  }

  get domainMin(): number {
    return this.ticks[0] ?? 0;
  }
  get domainMax(): number {
    return this.ticks[this.ticks.length - 1] ?? this.domainMin;
  }

  get bars(): WaterfallBarGeom[] {
    if (this.computed.length === 0) return [];
    const { domainMin, domainMax, plotWidth, plotHeight } = this;
    const band = plotWidth / this.computed.length;
    const barWidth = band * 0.62;
    return this.computed.map((c, i) => {
      const startY = scaleLinear(c.start, domainMin, domainMax, plotHeight, 0);
      const endY = scaleLinear(c.end, domainMin, domainMax, plotHeight, 0);
      const y = Math.min(startY, endY);
      const h = Math.abs(endY - startY);
      const x = MARGIN.left + band * i + (band - barWidth) / 2;
      return {
        x,
        y: MARGIN.top + y,
        width: barWidth,
        height: Math.max(h, 0.5),
        cx: MARGIN.left + band * (i + 0.5),
        cy: MARGIN.top + Math.min(startY, endY),
        type: c.type,
        datum: c.datum,
        displayValue: c.displayValue,
        cumulative: c.cumulative,
        index: i,
      };
    });
  }

  get connectorLines(): ConnectorLine[] {
    if (!this.connectorsValue || this.bars.length < 2) return [];
    const { domainMin, domainMax, plotHeight } = this;
    const lines: ConnectorLine[] = [];
    for (let i = 0; i < this.computed.length - 1; i++) {
      const level = this.computed[i].end;
      const y = MARGIN.top + scaleLinear(level, domainMin, domainMax, plotHeight, 0);
      lines.push({ x1: this.bars[i].x + this.bars[i].width, x2: this.bars[i + 1].x, y });
    }
    return lines;
  }

  get valueAxisTicks(): ValueAxisTick[] {
    const { domainMin, domainMax, plotWidth, plotHeight } = this;
    return this.ticks.map((tick) => ({
      value: tick,
      x1: MARGIN.left,
      x2: MARGIN.left + plotWidth,
      y: MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0),
    }));
  }

  get zeroY(): number {
    return MARGIN.top + scaleLinear(0, this.domainMin, this.domainMax, this.plotHeight, 0);
  }

  get dataValueItems(): string[] {
    return this.computed.map((c) => `${c.datum.label}: ${this.formatValue(c.displayValue)}`);
  }

  formatTickLabel(value: number): string {
    return formatTick(value);
  }

  formatValue(v: number): string {
    return this.format ? this.format(v) : formatTick(v);
  }

  tooltipLeft(): string {
    if (this.hoveredIndex === null) return "0%";
    const bar = this.bars[this.hoveredIndex];
    return `${(bar.cx / this.widthValue) * 100}%`;
  }

  tooltipTop(): string {
    if (this.hoveredIndex === null) return "0%";
    const bar = this.bars[this.hoveredIndex];
    return `${(bar.cy / this.heightValue) * 100}%`;
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
