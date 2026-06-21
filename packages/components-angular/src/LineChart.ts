import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import {
  buildLinearPath,
  buildSmoothPath,
  CHART_MARGIN,
  chartDataList,
  clampFraction,
  extendValueDomain,
  fixedLogTicks,
  fixedTicks,
  forecastRuns,
  formatTick,
  isNumeric,
  linearRegression,
  logTicks,
  niceTicks,
  overlayDataListItems,
  overlayToneClass,
  scaleLinear,
  smallestPositive,
  validLinearDomain,
  validLogDomain,
  type ChartBand,
  type ChartGoalLine,
  type ChartReferenceLine,
  type ChartScale,
  type ForecastRun,
} from "./chartScale.js";

import {
  annotationDataListItems,
  polygonPoints,
  resolveAnnotations,
  type ChartAnnotation,
  type ResolvedAnnotation,
} from "./chartAnnotations.js";

import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";

import { keyForX, resolveActiveIndex } from "./chartCrosshair.js";

import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from "./chartKeyboardNav.js";

export type LineChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type LineChartDatum = {
  x: number | string;
  y: number;
  /**
   * Marks the datum as a FORECAST point. Forecast points render with the
   * dedicated forecast tone and every segment touching a forecast point is
   * dashed — including the segment between the last actual point and the
   * first forecast point, so the line stays connected. Absent/false ⇒
   * rendering unchanged (additive).
   */
  forecast?: boolean;
};

export type LineChartProps = {
  data: LineChartDatum[];
  width?: number;
  height?: number;
  tone?: LineChartTone;
  smooth?: boolean;
  area?: boolean;
  label: string;
  /** Reference lines (default `axis: "y"` → horizontal at `value`). */
  referenceLines?: ChartReferenceLine[];
  /** Shaded value-axis bands between `from`..`to`. */
  bands?: ChartBand[];
  /** A single goal line, emphasised above the data. */
  goalLine?: ChartGoalLine;
  /** Least-squares trend line over the data points. */
  trend?: boolean;
  annotations?: ChartAnnotation[];
  dataLabels?: DataLabelsProp;
  domain?: [number, number];
  scale?: ChartScale;
  /** Inverts the value (y) axis. Default false. */
  invertAxis?: boolean;
  showLegend?: boolean;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  keyboardNav?: boolean;
  onSelectKey?: (key: string | null) => void;
  class?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 44 };

type AnnotationRegion = Extract<ResolvedAnnotation, { kind: "region" }>;
type AnnotationAbove = Extract<ResolvedAnnotation, { kind: "line" | "shape" | "point" | "label" }>;

@Component({
  selector: "st-line-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-lineChart__visual"
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
          @for (band of bandRects; track band.key) {
            <rect [class]="bandClass(band)" [attr.x]="band.x" [attr.y]="band.y" [attr.width]="band.width" [attr.height]="band.height"></rect>
          }

          @if (annotationRegions.length > 0) {
            <g class="st-lineChart__annotations st-lineChart__annotations--behind">
              @for (a of annotationRegions; track a.key) {
                <rect class="st-lineChart__annotationRegion" [attr.x]="a.x" [attr.y]="a.y" [attr.width]="a.width" [attr.height]="a.height"></rect>
              }
            </g>
          }

          @for (g of gridLines; track g.value) {
            <line class="st-lineChart__grid" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="g.y" [attr.y2]="g.y"></line>
            <text class="st-lineChart__tickLabel" [attr.x]="MARGIN.left - 6" [attr.y]="g.y" text-anchor="end" dominant-baseline="middle">{{ formatTickLabel(g.value) }}</text>
          }

          <line class="st-lineChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
          <line class="st-lineChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"></line>

          @for (tick of xTickEntries; track tick.key) {
            <text class="st-lineChart__tickLabel" [attr.x]="tick.x" [attr.y]="heightValue - MARGIN.bottom + 16" text-anchor="middle">{{ tick.label }}</text>
          }

          @for (ref of refLines; track ref.key) {
            <line [class]="refLineClass(ref)" [attr.x1]="ref.x1" [attr.y1]="ref.y1" [attr.x2]="ref.x2" [attr.y2]="ref.y2"></line>
            @if (ref.label) {
              <text class="st-lineChart__overlayLabel" [attr.x]="widthValue - MARGIN.right - 4" [attr.y]="ref.y1 - 4" text-anchor="end">{{ ref.label }}</text>
            }
          }

          @if (area && areaPath) {
            <path class="st-lineChart__area" [attr.d]="areaPath" fill-opacity="0.2" stroke="none"></path>
          }

          @for (run of forecastRunPaths; track $index) {
            <path
              [class]="run.forecast ? 'st-lineChart__lineForecast' : 'st-lineChart__line'"
              [attr.d]="run.path"
              fill="none"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          }

          @if (goalGeom) {
            <line class="st-lineChart__goalLine" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="goalGeom.p" [attr.y2]="goalGeom.p"></line>
            <text class="st-lineChart__goalLabel" [attr.x]="widthValue - MARGIN.right - 4" [attr.y]="goalGeom.p - 4" text-anchor="end">{{ goalGeom.label ?? 'Objectif ' + goalGeom.value }}</text>
          }

          @for (p of points; track p.index) {
            <circle class="st-lineChart__dot" [attr.cx]="p.x" [attr.cy]="p.y" r="4" [attr.data-chart-index]="p.index"></circle>
          }

          @if (annotationAbove.length > 0) {
            <g class="st-lineChart__annotations st-lineChart__annotations--above">
              @for (a of annotationAbove; track a.key) {
                @switch (a.kind) {
                  @case ("line") {
                    <line class="st-lineChart__annotationLine" [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2"></line>
                    @if (a.label) {
                      <text class="st-lineChart__annotationLabel" [attr.x]="a.axis === 'x' ? a.x1 + 4 : MARGIN.left + plotWidth - 4" [attr.y]="a.axis === 'x' ? MARGIN.top + 11 : a.y1 - 4" [attr.text-anchor]="a.axis === 'x' ? 'start' : 'end'">{{ a.label }}</text>
                    }
                  }
                  @case ("shape") {
                    <polygon class="st-lineChart__annotationShape" [attr.points]="annotationShapePoints(a)"></polygon>
                    @if (a.label) {
                      <text class="st-lineChart__annotationLabel" [attr.x]="a.labelX" [attr.y]="a.labelY" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("point") {
                    <circle class="st-lineChart__annotationPoint" [attr.cx]="a.x" [attr.cy]="a.y" r="4.5"></circle>
                    @if (a.label) {
                      <text class="st-lineChart__annotationLabel" [attr.x]="a.x" [attr.y]="a.y - 8" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("label") {
                    <text class="st-lineChart__annotationText" [attr.x]="a.x" [attr.y]="a.y" [attr.text-anchor]="a.anchor">{{ a.text }}</text>
                  }
                }
              }
            </g>
          }

          @if (dataLabelItems.length > 0) {
            <g aria-hidden="true">
              @for (d of dataLabelItems; track d.key) {
                <text class="st-lineChart__dataLabel" [attr.x]="d.x" [attr.y]="d.y" text-anchor="middle">{{ d.text }}</text>
              }
            </g>
          }

          @if (hoveredPoint) {
            <g class="st-lineChart__crosshair" aria-hidden="true">
              <line class="st-lineChart__crosshairLine" [attr.x1]="hoveredPoint.x" [attr.x2]="hoveredPoint.x" [attr.y1]="MARGIN.top" [attr.y2]="MARGIN.top + plotHeight"></line>
              <circle class="st-lineChart__crosshairMarker" [attr.cx]="hoveredPoint.x" [attr.cy]="hoveredPoint.y" r="5"></circle>
            </g>
          }
        </svg>

        @if (navEnabled) {
          <svg
            class="st-lineChart__navLayer"
            [attr.viewBox]="viewBox"
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            height="100%"
            role="group"
            [attr.aria-label]="label + ' — points de données'"
          >
            @for (p of points; track p.index) {
              <rect
                class="st-lineChart__navDatum"
                [attr.x]="p.x - 9"
                [attr.y]="p.y - 9"
                width="18"
                height="18"
                rx="3"
                role="img"
                [attr.tabindex]="rovingTabIndexFor(p.index)"
                [attr.aria-label]="datapointLabel(p)"
                (keydown)="handleDatapointKeyDown($event, p.index)"
                (focus)="handleDatapointFocus(p.index)"
              ></rect>
            }
          </svg>
        }
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredPoint) {
        <div
          class="st-lineChart__tooltip"
          role="presentation"
          [style.left.%]="tooltipLeft(hoveredPoint)"
          [style.top.%]="tooltipTop(hoveredPoint)"
        >
          <span class="st-lineChart__tooltipLabel">{{ hoveredPoint.datum.x }}</span>
          <span class="st-lineChart__tooltipValue">{{ hoveredPoint.datum.y }}</span>
        </div>
      }
    </div>
  `,
})
export class LineChart {
  static readonly stComponentName = "LineChart";
  readonly componentName = "LineChart";
  readonly MARGIN = MARGIN;

  private hoveredIndex: number | null = null;
  private focusedIndex = -1;

  @NgInput() data!: LineChartDatum[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() tone?: LineChartTone;
  @NgInput() smooth?: boolean;
  @NgInput() area?: boolean;
  @NgInput() label!: string;
  @NgInput() referenceLines?: ChartReferenceLine[];
  @NgInput() bands?: ChartBand[];
  @NgInput() goalLine?: ChartGoalLine;
  @NgInput() trend?: boolean;
  @NgInput() annotations?: ChartAnnotation[];
  @NgInput() dataLabels?: DataLabelsProp;
  @NgInput() domain?: [number, number];
  @NgInput() scale?: ChartScale;
  @NgInput() invertAxis?: boolean;
  @NgInput() showLegend?: boolean;
  @NgInput() hoverKey?: string | null;
  @NgInput() onHoverKeyChange?: (key: string | null) => void;
  @NgInput() keyboardNav?: boolean;
  @NgInput() onSelectKey?: (key: string | null) => void;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-lineChart", `st-lineChart--${this.tone ?? "category1"}`, this.classInput);
  }

  get widthValue(): number { return this.width ?? 480; }
  get heightValue(): number { return this.height ?? 240; }
  get viewBox(): string { return `0 0 ${this.widthValue} ${this.heightValue}`; }
  get plotWidth(): number { return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1); }
  get plotHeight(): number { return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1); }

  get safeData(): LineChartDatum[] { return this.data ?? []; }

  get yValues(): number[] { return this.safeData.map((d) => d.y).filter(Number.isFinite); }

  get ticks(): number[] {
    if (this.yValues.length === 0) return [0];
    const validDomain = validLinearDomain(this.domain);
    if (validDomain) return fixedTicks(validDomain[0], validDomain[1]);
    const rawMin = Math.min(0, ...this.yValues);
    const rawMax = Math.max(0, ...this.yValues);
    return niceTicks(rawMin, rawMax, 5);
  }

  get yDomain(): { min: number; max: number } {
    const t = this.ticks;
    return { min: t[0] ?? 0, max: t[t.length - 1] ?? 0 };
  }

  get xIsNumeric(): boolean {
    return this.safeData.length > 0 && this.safeData.every((d) => isNumeric(d.x as number));
  }

  get xDomainMin(): number {
    if (!this.xIsNumeric) return 0;
    return Math.min(...this.safeData.map((d) => d.x as number));
  }

  get xDomainMax(): number {
    if (!this.xIsNumeric) return Math.max(this.safeData.length - 1, 1);
    return Math.max(...this.safeData.map((d) => d.x as number));
  }

  xPixel(datum: LineChartDatum, index: number): number {
    if (this.xIsNumeric) {
      return MARGIN.left + scaleLinear(datum.x as number, this.xDomainMin, this.xDomainMax, 0, this.plotWidth);
    }
    const denom = Math.max(this.safeData.length - 1, 1);
    const x = this.safeData.length === 1 ? this.plotWidth / 2 : (index / denom) * this.plotWidth;
    return MARGIN.left + x;
  }

  yPixel(y: number): number {
    return MARGIN.top + scaleLinear(y, this.yDomain.min, this.yDomain.max, this.plotHeight, 0);
  }

  get points(): Array<{ x: number; y: number; datum: LineChartDatum; index: number }> {
    return this.safeData.map((datum, index) => ({
      x: this.xPixel(datum, index),
      y: this.yPixel(datum.y),
      datum,
      index,
    }));
  }

  get forecastRunPaths(): Array<{ path: string; forecast: boolean }> {
    if (this.points.length < 2) {
      if (this.points.length === 1) return [{ path: buildLinearPath(this.points), forecast: this.safeData[0]?.forecast ?? false }];
      return [];
    }
    const flags = this.safeData.map((d) => Boolean(d.forecast));
    const runs = forecastRuns(flags);
    return runs.map((run) => {
      const seg = this.points.slice(run.start, run.end + 1);
      return { path: this.smooth ? buildSmoothPath(seg) : buildLinearPath(seg), forecast: run.forecast };
    });
  }

  get areaPath(): string {
    if (this.points.length < 2) return "";
    const baseY = MARGIN.top + scaleLinear(Math.max(0, this.yDomain.min), this.yDomain.min, this.yDomain.max, this.plotHeight, 0);
    const first = this.points[0]!;
    const last = this.points[this.points.length - 1]!;
    const line = this.smooth ? buildSmoothPath(this.points) : buildLinearPath(this.points);
    return `${line} L${last.x.toFixed(2)},${baseY.toFixed(2)} L${first.x.toFixed(2)},${baseY.toFixed(2)} Z`;
  }

  get gridLines(): Array<{ value: number; y: number }> {
    return this.ticks.map((value) => ({ value, y: this.yPixel(value) }));
  }

  get xTickEntries(): Array<{ key: string; x: number; label: string }> {
    if (this.safeData.length === 0) return [];
    if (!this.xIsNumeric) {
      return this.points.map((p, i) => ({
        key: String(this.safeData[i]!.x),
        x: p.x,
        label: String(this.safeData[i]!.x),
      }));
    }
    const target = Math.min(5, this.safeData.length);
    const stride = Math.max(1, Math.round((this.safeData.length - 1) / (target - 1 || 1)));
    const entries: Array<{ key: string; x: number; label: string }> = [];
    for (let i = 0; i < this.safeData.length; i += stride) {
      entries.push({ key: String(i), x: this.points[i]!.x, label: String(this.safeData[i]!.x) });
    }
    return entries;
  }

  get bandRects(): Array<{ key: number; x: number; y: number; width: number; height: number; tone?: string }> {
    return (this.bands ?? [])
      .filter((b) => Number.isFinite(b.from) && Number.isFinite(b.to))
      .map((b, key) => {
        const p1 = this.yPixel(b.from);
        const p2 = this.yPixel(b.to);
        return { key, x: MARGIN.left, y: Math.min(p1, p2), width: this.plotWidth, height: Math.max(Math.abs(p2 - p1), 0.5), tone: b.tone };
      });
  }

  bandClass(band: { tone?: string }): string {
    return `st-lineChart__band st-lineChart__band--${band.tone ?? "neutral"}`;
  }

  get refLines(): Array<{ key: number; x1: number; y1: number; x2: number; y2: number; label?: string; tone?: string }> {
    return (this.referenceLines ?? [])
      .filter((l) => Number.isFinite(l.value))
      .map((l, key) => {
        const y = this.yPixel(l.value);
        return { key, x1: MARGIN.left, y1: y, x2: this.widthValue - MARGIN.right, y2: y, label: l.label, tone: l.tone };
      });
  }

  refLineClass(line: { tone?: string }): string {
    return `st-lineChart__refLine st-lineChart__refLine--${line.tone ?? "neutral"}`;
  }

  get goalGeom(): { p: number; label?: string; value: number } | null {
    if (!this.goalLine || !Number.isFinite(this.goalLine.value)) return null;
    return { p: this.yPixel(this.goalLine.value), label: this.goalLine.label, value: this.goalLine.value };
  }

  get annotationContext() {
    const self = this;
    return {
      xScale: (value: number | string): number | null => {
        if (self.xIsNumeric) {
          if (typeof value !== "number" || !Number.isFinite(value)) return null;
          return scaleLinear(value, self.xDomainMin, self.xDomainMax, 0, self.plotWidth);
        }
        const i = self.safeData.findIndex((d) => d.x === value);
        if (i < 0) return null;
        const denom = Math.max(self.safeData.length - 1, 1);
        return self.safeData.length === 1 ? self.plotWidth / 2 : (i / denom) * self.plotWidth;
      },
      yScale: (value: number): number | null => {
        if (!Number.isFinite(value)) return null;
        return scaleLinear(value, self.yDomain.min, self.yDomain.max, self.plotHeight, 0);
      },
      plotLeft: MARGIN.left,
      plotTop: MARGIN.top,
      plotWidth: self.plotWidth,
      plotHeight: self.plotHeight,
    };
  }

  get resolvedAnnotations(): ResolvedAnnotation[] {
    return resolveAnnotations(this.annotations, this.annotationContext);
  }

  get annotationRegions(): AnnotationRegion[] {
    return this.resolvedAnnotations.filter((a): a is AnnotationRegion => a.kind === "region");
  }

  get annotationAbove(): AnnotationAbove[] {
    return this.resolvedAnnotations.filter((a): a is AnnotationAbove => a.kind !== "region");
  }

  annotationShapePoints(annotation: Extract<ResolvedAnnotation, { kind: "shape" }>): string {
    return polygonPoints(annotation.points);
  }

  get dataLabelItems(): Array<{ key: string; x: number; y: number; text: string }> {
    const opts = normalizeDataLabels(this.dataLabels);
    if (!opts.enabled) return [];
    return this.points.map((p) => ({
      key: String(p.index),
      x: p.x,
      y: p.y - 8,
      text: formatDataLabel(p.datum.y, opts, formatTick) ?? "",
    }));
  }

  get dataValueItems(): string[] {
    return [
      ...this.safeData.map((d) => `${d.x}: ${d.y}`),
      ...overlayDataListItems({ referenceLines: this.referenceLines, bands: this.bands, goalLine: this.goalLine }),
      ...annotationDataListItems(this.annotations),
    ];
  }

  get hoverKeys(): string[] {
    return this.safeData.map((d) => keyForX(d.x));
  }

  get activeIndex(): number {
    return resolveActiveIndex(this.hoverKey, this.hoveredIndex, this.hoverKeys);
  }

  get hoveredPoint(): { x: number; y: number; datum: LineChartDatum; index: number } | null {
    const idx = this.activeIndex;
    return idx >= 0 ? (this.points[idx] ?? null) : null;
  }

  get navEnabled(): boolean {
    return (this.keyboardNav === true || typeof this.onSelectKey === "function") && this.points.length > 0;
  }

  formatTickLabel(v: number): string { return formatTick(v); }

  datapointLabel(pt: { datum: LineChartDatum }): string {
    return datapointAriaLabel(String(pt.datum.x), pt.datum.y);
  }

  rovingTabIndexFor(index: number): number {
    return rovingTabIndex(index, this.focusedIndex, this.points.length);
  }

  tooltipLeft(pt: { x: number }): number {
    return (pt.x / this.widthValue) * 100;
  }

  tooltipTop(pt: { y: number }): number {
    return (pt.y / this.heightValue) * 100;
  }

  handleLeave(): void {
    this.hoveredIndex = null;
    this.onHoverKeyChange?.(null);
  }

  handleVisualPointerMove(e: PointerEvent): void {
    const target = e.target as Element | null;
    const raw = Number(target?.getAttribute?.("data-chart-index"));
    const index = Number.isInteger(raw) ? raw : null;
    this.hoveredIndex = index;
    this.onHoverKeyChange?.(index == null ? null : this.hoverKeys[index] ?? null);
  }

  handleDatapointFocus(index: number): void {
    this.focusedIndex = index;
    this.hoveredIndex = index;
    this.onHoverKeyChange?.(this.hoverKeys[index] ?? null);
  }

  handleDatapointKeyDown(e: KeyboardEvent, index: number): void {
    const action = datapointNavAction(e.key, index, this.points.length);
    if (!action) return;
    e.preventDefault();
    if (action.kind === "move") {
      this.focusedIndex = action.index;
      this.hoveredIndex = action.index;
      this.onHoverKeyChange?.(this.hoverKeys[action.index] ?? null);
    } else if (action.kind === "select") {
      this.onSelectKey?.(this.hoverKeys[index] ?? null);
    } else {
      this.focusedIndex = -1;
      this.hoveredIndex = null;
      this.onSelectKey?.(null);
    }
  }
}
