import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type Density2DTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type Density2DChartScale = "categorical" | "sequential";

export type Density2DPoint = {
  x: number;
  y: number;
  weight?: number;
};

export type Density2DChartProps = {
  data: Density2DPoint[];
  bins?: number;
  scale?: Density2DChartScale;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

type DensityBin = {
  key: string;
  density: number;
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  tone: Density2DTone;
};

const MARGIN = { top: 16, right: 18, bottom: 36, left: 48 } as const;
const TONES: Density2DTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

function normalizedScale(value: Density2DChartScale | undefined): Density2DChartScale {
  return value === "categorical" ? "categorical" : "sequential";
}

function toneForDensity(density: number, densityMax: number): Density2DTone {
  if (!Number.isFinite(density) || densityMax <= 0) return "category1";
  const ratio = Math.max(0, Math.min(1, density / densityMax));
  const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(ratio * TONES.length)));
  return TONES[index];
}

function niceTicks(min: number, max: number, target = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return [Number.isFinite(max) ? max : 0];
  }
  const range = max - min;
  const rough = range / Math.max(target - 1, 1);
  const power = Math.pow(10, Math.floor(Math.log10(rough)));
  const normalized = rough / power;
  let step: number;
  if (normalized < 1.5) step = power;
  else if (normalized < 3) step = 2 * power;
  else if (normalized < 7) step = 5 * power;
  else step = 10 * power;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = start; value <= end + step / 2; value += step) ticks.push(Number(value.toFixed(10)));
  return ticks;
}

function scaleLinear(value: number, domainStart: number, domainEnd: number, rangeStart: number, rangeEnd: number): number {
  if (domainEnd === domainStart) return rangeStart;
  return rangeStart + ((value - domainStart) * (rangeEnd - rangeStart)) / (domainEnd - domainStart);
}

function formatTickLabel(value: number): string {
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

@Component({
  selector: "st-density2-d-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-density2DChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handlePointerMove($event)"
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
          <!-- tick labels (Y axis) -->
          @for (tick of yAxisTicks; track tick.value) {
            <text
              class="st-density2DChart__tickLabel"
              [attr.x]="margin.left - 8"
              [attr.y]="tick.y"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ formatTick(tick.value) }}</text>
          }

          <!-- tick labels (X axis) -->
          @for (tick of xAxisTicks; track tick.value) {
            <text
              class="st-density2DChart__tickLabel"
              [attr.x]="tick.x"
              [attr.y]="resolvedHeight - margin.bottom + 16"
              text-anchor="middle"
            >{{ formatTick(tick.value) }}</text>
          }

          <!-- axes -->
          <line
            class="st-density2DChart__axis"
            [attr.x1]="margin.left"
            [attr.x2]="margin.left"
            [attr.y1]="margin.top"
            [attr.y2]="resolvedHeight - margin.bottom"
          ></line>
          <line
            class="st-density2DChart__axis"
            [attr.x1]="margin.left"
            [attr.x2]="resolvedWidth - margin.right"
            [attr.y1]="resolvedHeight - margin.bottom"
            [attr.y2]="resolvedHeight - margin.bottom"
          ></line>

          <!-- density cells (binCount×binCount grid, color ∝ density) -->
          @for (cell of binCells; track cell.key) {
            <rect
              [attr.class]="cellClass(cell.key, cell.tone)"
              [attr.x]="cell.x"
              [attr.y]="cell.y"
              [attr.width]="cell.width"
              [attr.height]="cell.height"
              rx="1"
              [attr.data-chart-key]="cell.key"
            ></rect>
          }
        </svg>
      </div>

      @if (hasLegend) {
        <div class="st-density2DChart__legend" aria-hidden="true">
          <span class="st-density2DChart__legendText">Low</span>
          <span class="st-density2DChart__legendRamp">
            @for (tone of tones; track tone) {
              <span [attr.class]="'st-density2DChart__legendSwatch st-density2DChart__legendSwatch--' + tone"></span>
            }
          </span>
          <span class="st-density2DChart__legendText">High</span>
        </div>
      }

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + (label ?? 'density 2d')">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredCell) {
        <div
          class="st-density2DChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft"
          [style.top]="tooltipTop"
        >
          <span class="st-density2DChart__tooltipLabel">{{ tooltipLabel }}</span>
          <span class="st-density2DChart__tooltipValue">{{ tooltipValue }}</span>
        </div>
      }
    </div>
  `,
})
export class Density2DChart {
  static readonly stComponentName = "Density2DChart";
  readonly componentName = "Density2DChart";
  readonly margin = MARGIN;
  readonly tones = TONES;

  @NgInput() data: Density2DPoint[] = [];
  @NgInput() bins?: number;
  @NgInput() scale?: Density2DChartScale;
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput("class") classInput?: string;

  hoveredKey: string | null = null;

  get resolvedScale(): Density2DChartScale {
    return normalizedScale(this.scale);
  }

  get resolvedWidth(): number {
    return this.width ?? this.size ?? 640;
  }

  get resolvedHeight(): number {
    return this.height ?? 320;
  }

  get viewBox(): string {
    return `0 0 ${this.resolvedWidth} ${this.resolvedHeight}`;
  }

  get hostClass(): string {
    return classNames("st-density2DChart", `st-density2DChart--${this.resolvedScale}`, this.classInput);
  }

  get plotWidth(): number {
    return Math.max(this.resolvedWidth - MARGIN.left - MARGIN.right, 1);
  }

  get plotHeight(): number {
    return Math.max(this.resolvedHeight - MARGIN.top - MARGIN.bottom, 1);
  }

  get binCount(): number {
    const value = typeof this.bins === "number" && Number.isFinite(this.bins) ? this.bins : 12;
    return Math.max(1, Math.min(40, Math.floor(value)));
  }

  get validData(): Density2DPoint[] {
    return (this.data ?? []).filter((datum) => datum && Number.isFinite(datum.x) && Number.isFinite(datum.y));
  }

  get xTicks(): number[] {
    const xs = this.validData.map((datum) => datum.x);
    return niceTicks(xs.length ? Math.min(...xs) : 0, xs.length ? Math.max(...xs) : 1);
  }

  get yTicks(): number[] {
    const ys = this.validData.map((datum) => datum.y);
    return niceTicks(ys.length ? Math.min(...ys) : 0, ys.length ? Math.max(...ys) : 1);
  }

  get xMin(): number {
    return this.xTicks[0];
  }

  get xMax(): number {
    return this.xTicks[this.xTicks.length - 1];
  }

  get yMin(): number {
    return this.yTicks[0];
  }

  get yMax(): number {
    return this.yTicks[this.yTicks.length - 1];
  }

  get layout(): { bins: DensityBin[]; densityMax: number } {
    const validData = this.validData;
    if (validData.length === 0 || this.xMax === this.xMin || this.yMax === this.yMin) {
      return { bins: [], densityMax: 0 };
    }

    const counts = new Float64Array(this.binCount * this.binCount);
    const indexOf = (ix: number, iy: number) => iy * this.binCount + ix;

    for (const datum of validData) {
      const fx = (datum.x - this.xMin) / (this.xMax - this.xMin);
      const fy = (datum.y - this.yMin) / (this.yMax - this.yMin);
      const ix = Math.max(0, Math.min(this.binCount - 1, Math.floor(fx * this.binCount)));
      const iy = Math.max(0, Math.min(this.binCount - 1, Math.floor(fy * this.binCount)));
      const weight = typeof datum.weight === "number" && Number.isFinite(datum.weight) ? datum.weight : 1;
      counts[indexOf(ix, iy)] += weight;
    }

    let densityMax = 0;
    for (let index = 0; index < counts.length; index++) densityMax = Math.max(densityMax, counts[index]);

    const cellWidth = this.plotWidth / this.binCount;
    const cellHeight = this.plotHeight / this.binCount;
    const bins: DensityBin[] = [];

    for (let iy = 0; iy < this.binCount; iy++) {
      for (let ix = 0; ix < this.binCount; ix++) {
        const density = counts[indexOf(ix, iy)];
        if (density <= 0) continue;
        const x = MARGIN.left + ix * cellWidth;
        const y = MARGIN.top + (this.binCount - 1 - iy) * cellHeight;
        bins.push({
          key: `${ix}-${iy}`,
          density,
          x,
          y,
          width: Math.max(cellWidth - 1, 1),
          height: Math.max(cellHeight - 1, 1),
          cx: x + cellWidth / 2,
          cy: y + cellHeight / 2,
          x0: this.xMin + (ix / this.binCount) * (this.xMax - this.xMin),
          x1: this.xMin + ((ix + 1) / this.binCount) * (this.xMax - this.xMin),
          y0: this.yMin + (iy / this.binCount) * (this.yMax - this.yMin),
          y1: this.yMin + ((iy + 1) / this.binCount) * (this.yMax - this.yMin),
          tone: toneForDensity(density, densityMax),
        });
      }
    }

    return { bins, densityMax };
  }

  get binCells(): DensityBin[] {
    return this.layout.bins;
  }

  get xAxisTicks(): Array<{ value: number; x: number }> {
    return this.xTicks.map((value) => ({
      value,
      x: MARGIN.left + scaleLinear(value, this.xMin, this.xMax, 0, this.plotWidth),
    }));
  }

  get yAxisTicks(): Array<{ value: number; y: number }> {
    return this.yTicks.map((value) => ({
      value,
      y: MARGIN.top + scaleLinear(value, this.yMin, this.yMax, this.plotHeight, 0),
    }));
  }

  get dataValueItems(): string[] {
    return this.binCells.map((bin) => `[${formatTickLabel(bin.x0)}–${formatTickLabel(bin.x1)}] × [${formatTickLabel(bin.y0)}–${formatTickLabel(bin.y1)}]: ${bin.density}`);
  }

  get hasLegend(): boolean {
    return this.binCells.length > 0;
  }

  get hoveredCell(): DensityBin | null {
    return this.hoveredKey !== null ? this.binCells.find((bin) => bin.key === this.hoveredKey) ?? null : null;
  }

  get tooltipLeft(): string {
    const cell = this.hoveredCell;
    return cell ? `${(cell.cx / this.resolvedWidth) * 100}%` : "0%";
  }

  get tooltipTop(): string {
    const cell = this.hoveredCell;
    return cell ? `${(cell.cy / this.resolvedHeight) * 100}%` : "0%";
  }

  get tooltipLabel(): string {
    const cell = this.hoveredCell;
    return cell ? `[${formatTickLabel(cell.x0)}–${formatTickLabel(cell.x1)}] × [${formatTickLabel(cell.y0)}–${formatTickLabel(cell.y1)}]` : "";
  }

  get tooltipValue(): string {
    const cell = this.hoveredCell;
    return cell ? String(cell.density) : "";
  }

  formatTick(value: number): string {
    return formatTickLabel(value);
  }

  cellClass(key: string, tone: Density2DTone): string {
    return classNames(
      "st-density2DChart__cell",
      `st-density2DChart__cell--${tone}`,
      this.hoveredKey !== null && this.hoveredKey !== key ? "st-density2DChart__cell--dim" : undefined,
    );
  }

  handlePointerMove(event: PointerEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) {
      this.hoveredKey = null;
      return;
    }
    this.hoveredKey = target.getAttribute("data-chart-key");
  }

  handleLeave(): void {
    this.hoveredKey = null;
  }
}
