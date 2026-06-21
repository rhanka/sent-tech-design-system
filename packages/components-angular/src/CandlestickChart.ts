import { Component, ElementRef, Input as NgInput, QueryList, ViewChildren } from "@angular/core";

import { classNames } from "./classNames.js";

import {
  annotationDataListItems,
  polygonPoints,
  resolveAnnotations,
  type ChartAnnotation,
  type ResolvedAnnotation,
} from "./chartAnnotations.js";

import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";

import { resolveActiveIndex } from "./chartCrosshair.js";

import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from "./chartKeyboardNav.js";

export type CandlestickChartDatum = {
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type CandlestickChartProps = {
  data: CandlestickChartDatum[];
  label: string;
  width?: number;
  height?: number;
  annotations?: ChartAnnotation[];
  dataLabels?: DataLabelsProp;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  keyboardNav?: boolean;
  onSelectKey?: (key: string | null) => void;
  class?: string;
};

type CandleGeom = {
  datum: CandlestickChartDatum;
  index: number;
  bullish: boolean;
  centerX: number;
  band: number;
  bodyX: number;
  bodyY: number;
  bodyW: number;
  bodyH: number;
  wickHighY: number;
  wickLowY: number;
  tooltipY: number;
};

type CandleDataLabelItem = {
  key: string;
  x: number;
  y: number;
  text: string;
};

type CandleAnnotationRegion = Extract<ResolvedAnnotation, { kind: "region" }>;
type CandleAnnotationAbove = Extract<ResolvedAnnotation, { kind: "line" | "shape" | "point" | "label" }>;

const CANDLE_MARGIN = { top: 12, right: 16, bottom: 32, left: 52 };

function candleScaleLinear(v: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return r0;
  return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
}

function candleNiceTicks(min: number, max: number, target = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    const base = Number.isFinite(max) ? max : 0;
    return [base];
  }
  const range = max - min;
  const rough = range / Math.max(target - 1, 1);
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  let step: number;
  if (norm < 1.5) step = 1 * pow;
  else if (norm < 3) step = 2 * pow;
  else if (norm < 7) step = 5 * pow;
  else step = 10 * pow;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) {
    ticks.push(Number(v.toFixed(10)));
  }
  return ticks;
}

function candleFormatTick(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

@Component({
  selector: "st-candlestick-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-candlestickChart__visual"
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
          @for (tick of ticks; track tick) {
            <line
              class="st-candlestickChart__grid"
              [attr.x1]="margin.left"
              [attr.x2]="widthValue - margin.right"
              [attr.y1]="tickY(tick)"
              [attr.y2]="tickY(tick)"
            ></line>
            <text
              class="st-candlestickChart__tickLabel"
              [attr.x]="margin.left - 6"
              [attr.y]="tickY(tick)"
              text-anchor="end"
              dominant-baseline="middle"
            >
              {{ formatTickLabel(tick) }}
            </text>
          }

          <line class="st-candlestickChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-candlestickChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>

          @if (annotationRegions.length > 0) {
            <g class="st-candlestickChart__annotations st-candlestickChart__annotations--behind">
              @for (a of annotationRegions; track a.key) {
                <rect class="st-candlestickChart__annotationRegion" [attr.x]="a.x" [attr.y]="a.y" [attr.width]="a.width" [attr.height]="a.height"></rect>
                @if (a.label) {
                  <text class="st-candlestickChart__annotationLabel" [attr.x]="a.x + 4" [attr.y]="a.y + 11">{{ a.label }}</text>
                }
              }
            </g>
          }

          @for (c of candles; track c.datum.label) {
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
              class="st-candlestickChart__categoryLabel"
              [attr.x]="c.centerX"
              [attr.y]="heightValue - margin.bottom + 16"
              text-anchor="middle"
            >
              {{ c.datum.label }}
            </text>
          }

          @if (annotationAbove.length > 0) {
            <g class="st-candlestickChart__annotations st-candlestickChart__annotations--above">
              @for (a of annotationAbove; track a.key) {
                @switch (a.kind) {
                  @case ("line") {
                    <line class="st-candlestickChart__annotationLine" [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2"></line>
                    @if (a.label) {
                      <text
                        class="st-candlestickChart__annotationLabel"
                        [attr.x]="a.axis === 'x' ? a.x1 + 4 : margin.left + plotWidth - 4"
                        [attr.y]="a.axis === 'x' ? margin.top + 11 : a.y1 - 4"
                        [attr.text-anchor]="a.axis === 'x' ? 'start' : 'end'"
                      >{{ a.label }}</text>
                    }
                  }
                  @case ("shape") {
                    <polygon class="st-candlestickChart__annotationShape" [attr.points]="polygonPointsFor(a)"></polygon>
                    @if (a.label) {
                      <text class="st-candlestickChart__annotationLabel" [attr.x]="a.labelX" [attr.y]="a.labelY" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("point") {
                    <circle class="st-candlestickChart__annotationPoint" [attr.cx]="a.x" [attr.cy]="a.y" r="4.5"></circle>
                    @if (a.label) {
                      <text class="st-candlestickChart__annotationLabel" [attr.x]="a.x" [attr.y]="a.y - 8" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("label") {
                    <text class="st-candlestickChart__annotationText" [attr.x]="a.x" [attr.y]="a.y" [attr.text-anchor]="a.anchor">{{ a.text }}</text>
                  }
                }
              }
            </g>
          }

          @if (dataLabelItems.length > 0) {
            <g class="st-candlestickChart__dataLabels" aria-hidden="true">
              @for (d of dataLabelItems; track d.key) {
                <text class="st-candlestickChart__dataLabel" [attr.x]="d.x" [attr.y]="d.y" text-anchor="middle" dominant-baseline="auto">{{ d.text }}</text>
              }
            </g>
          }

          @if (activeCandle) {
            <g class="st-candlestickChart__crosshair" aria-hidden="true">
              <line class="st-candlestickChart__crosshairLine" [attr.x1]="activeCandle.centerX" [attr.x2]="activeCandle.centerX" [attr.y1]="margin.top" [attr.y2]="margin.top + plotHeight"></line>
            </g>
          }
        </svg>

        @if (navEnabled) {
          <svg
            class="st-candlestickChart__navLayer"
            [attr.viewBox]="viewBox"
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            height="100%"
            role="group"
            [attr.aria-label]="label + ' — points de données'"
          >
            @for (candle of candles; track candle.datum.label) {
              <rect
                #navDatum
                class="st-candlestickChart__navDatum"
                [attr.x]="candle.centerX - candle.band / 2"
                [attr.y]="margin.top"
                [attr.width]="candle.band"
                [attr.height]="plotHeight"
                role="img"
                [attr.tabindex]="rovingTabIndexFor(candle.index)"
                [attr.aria-label]="ohlcAriaLabel(candle.datum)"
                (keydown)="handleDatapointKeyDown($event, candle.index)"
                (focus)="handleDatapointFocus(candle.index)"
              ></rect>
            }
          </svg>
        }
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (activeCandle) {
        <div
          class="st-candlestickChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft(activeCandle) + '%'"
          [style.top]="tooltipTop(activeCandle) + '%'"
        >
          <span class="st-candlestickChart__tooltipLabel">{{ activeCandle.datum.label }}</span>
          <span class="st-candlestickChart__tooltipValue">O {{ activeCandle.datum.open }} H {{ activeCandle.datum.high }} L {{ activeCandle.datum.low }} C {{ activeCandle.datum.close }}</span>
        </div>
      }
    </div>
  `,
})
export class CandlestickChart {
  static readonly stComponentName = "CandlestickChart";
  readonly componentName = "CandlestickChart";
  readonly margin = CANDLE_MARGIN;

  @ViewChildren("navDatum") private navDatumElements?: QueryList<ElementRef<SVGElement>>;

  private hoveredIndex: number | null = null;
  private focusedIndex = -1;

  @NgInput() data: CandlestickChartDatum[] = [];
  @NgInput() label = "";
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() annotations?: ChartAnnotation[];
  @NgInput() dataLabels?: DataLabelsProp;
  @NgInput() hoverKey?: string | null;
  @NgInput() onHoverKeyChange?: (key: string | null) => void;
  @NgInput() keyboardNav?: boolean;
  @NgInput() onSelectKey?: (key: string | null) => void;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-candlestickChart", this.classInput);
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
    return Math.max(this.widthValue - CANDLE_MARGIN.left - CANDLE_MARGIN.right, 1);
  }

  get plotHeight(): number {
    return Math.max(this.heightValue - CANDLE_MARGIN.top - CANDLE_MARGIN.bottom, 1);
  }

  get validData(): CandlestickChartDatum[] {
    return (this.data ?? []).filter(
      (d) => Number.isFinite(d.open) && Number.isFinite(d.high) && Number.isFinite(d.low) && Number.isFinite(d.close),
    );
  }

  get domainBounds(): { rawMin: number; rawMax: number } {
    const allVals: number[] = [];
    for (const d of this.validData) {
      allVals.push(d.open, d.high, d.low, d.close);
    }
    if (allVals.length === 0) return { rawMin: 0, rawMax: 1 };
    const rawMin = Math.min(...allVals);
    const rawMax = Math.max(...allVals);
    return { rawMin, rawMax: rawMax === rawMin ? rawMin + 1 : rawMax };
  }

  get ticks(): number[] {
    return candleNiceTicks(this.domainBounds.rawMin, this.domainBounds.rawMax, 5);
  }

  get domainMin(): number {
    return this.ticks[0] ?? 0;
  }

  get domainMax(): number {
    return this.ticks[this.ticks.length - 1] ?? this.domainMin;
  }

  get candles(): CandleGeom[] {
    if (this.validData.length === 0) return [];
    const band = this.plotWidth / this.validData.length;
    const bodyW = band * 0.55;

    return this.validData.map((d, i) => {
      const clampedHigh = Math.max(d.high, d.open, d.close);
      const clampedLow = Math.min(d.low, d.open, d.close);
      const bullish = d.close >= d.open;
      const centerX = CANDLE_MARGIN.left + band * i + band / 2;

      const bodyTop = CANDLE_MARGIN.top + candleScaleLinear(Math.max(d.open, d.close), this.domainMin, this.domainMax, this.plotHeight, 0);
      const bodyBot = CANDLE_MARGIN.top + candleScaleLinear(Math.min(d.open, d.close), this.domainMin, this.domainMax, this.plotHeight, 0);
      const highY = CANDLE_MARGIN.top + candleScaleLinear(clampedHigh, this.domainMin, this.domainMax, this.plotHeight, 0);
      const lowY = CANDLE_MARGIN.top + candleScaleLinear(clampedLow, this.domainMin, this.domainMax, this.plotHeight, 0);

      return {
        datum: d,
        index: i,
        bullish,
        centerX,
        band,
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

  get hoverKeys(): string[] {
    return this.candles.map((c) => c.datum.label);
  }

  get activeIndex(): number {
    return resolveActiveIndex(this.hoverKey, this.hoveredIndex, this.hoverKeys);
  }

  get activeCandle(): CandleGeom | null {
    return this.activeIndex >= 0 ? (this.candles[this.activeIndex] ?? null) : null;
  }

  get navEnabled(): boolean {
    return (this.keyboardNav === true || this.onSelectKey !== undefined) && this.candles.length > 0;
  }

  get resolvedAnnotations(): ResolvedAnnotation[] {
    const categoryPixel = (v: number | string): number | null => {
      const candle = this.candles.find((c) => c.datum.label === String(v));
      if (!candle) return null;
      return candle.centerX - CANDLE_MARGIN.left;
    };
    const priceY = (v: number): number | null => {
      if (!Number.isFinite(v)) return null;
      return candleScaleLinear(v, this.domainMin, this.domainMax, this.plotHeight, 0);
    };
    return resolveAnnotations(this.annotations, {
      xScale: categoryPixel,
      yScale: priceY,
      plotLeft: CANDLE_MARGIN.left,
      plotTop: CANDLE_MARGIN.top,
      plotWidth: this.plotWidth,
      plotHeight: this.plotHeight,
    });
  }

  get annotationRegions(): CandleAnnotationRegion[] {
    return this.resolvedAnnotations.filter((a): a is CandleAnnotationRegion => a.kind === "region");
  }

  get annotationAbove(): CandleAnnotationAbove[] {
    return this.resolvedAnnotations.filter((a): a is CandleAnnotationAbove => a.kind !== "region");
  }

  get dataLabelItems(): CandleDataLabelItem[] {
    const opts = normalizeDataLabels(this.dataLabels);
    if (!opts.enabled) return [];
    return this.candles.map((c) => ({
      key: c.datum.label,
      x: c.centerX,
      y: c.wickHighY - 6,
      text: formatDataLabel(c.datum.close, opts, candleFormatTick) ?? "",
    }));
  }

  get dataValueItems(): string[] {
    return [
      ...this.validData.map((d) => `${d.label}: O ${d.open} H ${d.high} L ${d.low} C ${d.close}`),
      ...annotationDataListItems(this.annotations),
    ];
  }

  tickY(tick: number): number {
    return CANDLE_MARGIN.top + candleScaleLinear(tick, this.domainMin, this.domainMax, this.plotHeight, 0);
  }

  formatTickLabel(tick: number): string {
    return candleFormatTick(tick);
  }

  wickClass(c: CandleGeom): string {
    return classNames("st-candlestickChart__wick", `st-candlestickChart__wick--${c.bullish ? "up" : "down"}`);
  }

  bodyClass(c: CandleGeom): string {
    const dim = this.hoveredIndex !== null && this.hoveredIndex !== c.index;
    return classNames(
      "st-candlestickChart__body",
      `st-candlestickChart__body--${c.bullish ? "up" : "down"}`,
      dim && "st-candlestickChart__body--dim",
    );
  }

  polygonPointsFor(a: CandleAnnotationAbove & { kind: "shape" }): string {
    return polygonPoints(a.points);
  }

  tooltipLeft(c: CandleGeom): number {
    return (c.centerX / this.widthValue) * 100;
  }

  tooltipTop(c: CandleGeom): number {
    return (c.tooltipY / this.heightValue) * 100;
  }

  rovingTabIndexFor(index: number): number {
    return rovingTabIndex(index, this.focusedIndex, this.candles.length);
  }

  ohlcAriaLabel(d: CandlestickChartDatum): string {
    return datapointAriaLabel(d.label, `O ${d.open} H ${d.high} L ${d.low} C ${d.close}`);
  }

  private emitHoverKey(index: number | null): void {
    this.onHoverKeyChange?.(index == null ? null : (this.hoverKeys[index] ?? null));
  }

  handleLeave(): void {
    this.hoveredIndex = null;
    this.emitHoverKey(null);
  }

  handlePointerMove(event: PointerEvent): void {
    const target = event.target as { getAttribute?: (name: string) => string | null } | null;
    const raw = Number(target?.getAttribute?.("data-chart-index"));
    const index = Number.isInteger(raw) ? raw : null;
    this.hoveredIndex = index;
    this.emitHoverKey(index);
  }

  handleDatapointFocus(index: number): void {
    this.focusedIndex = index;
    this.emitHoverKey(index);
  }

  focusDatum(index: number): void {
    this.focusedIndex = index;
    this.navDatumElements?.get(index)?.nativeElement.focus();
    this.emitHoverKey(index);
  }

  handleDatapointKeyDown(event: KeyboardEvent, index: number): void {
    const action = datapointNavAction(event.key, index, this.candles.length);
    if (!action) return;
    event.preventDefault();
    if (action.kind === "move") {
      this.focusDatum(action.index);
    } else if (action.kind === "select") {
      this.onSelectKey?.(this.candles[index]?.datum.label ?? null);
    } else {
      this.focusedIndex = -1;
      this.emitHoverKey(null);
      this.onSelectKey?.(null);
      (event.currentTarget as { blur?: () => void } | null)?.blur?.();
    }
  }
}
