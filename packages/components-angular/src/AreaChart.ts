import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import {
  buildLinearPath,
  buildSmoothPath,
  CHART_MARGIN,
  chartDataList,
  formatTick,
  isNumeric,
  niceTicks,
  scaleLinear,
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

export type AreaChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type AreaChartDatum = {
  x: number | string;
  y: number;
};

export type AreaChartProps = {
  data: (number | AreaChartDatum)[];
  width?: number;
  height?: number;
  tone?: AreaChartTone;
  smooth?: boolean;
  label: string;
  /**
   * Annotation overlay in DATA space (points, labels, axis lines, regions,
   * polygons), resolved to pixels via the chart scales. Regions render behind
   * the area, every other kind above it. Additive: absent ⇒ unchanged.
   */
  annotations?: ChartAnnotation[];
  /**
   * Per-point value labels. `false`/absent (default) → none. `true` → each
   * point's value with the chart's numeric formatter. Object → `format(value)`
   * and/or a `position` override. Default position is `top` (above the point).
   * Labels are `aria-hidden` — the values already live in the accessible
   * ChartDataList.
   */
  dataLabels?: DataLabelsProp;
  /**
   * CONTROLLED synchronised hover key (FR-3). A datum's key is `String(x)`. When
   * provided (string or null), the crosshair + tooltip track this key instead of
   * the chart's internal pointer hover (null ⇒ nothing shown), letting a parent
   * share one hover channel across several aligned charts. Absent (`undefined`)
   * keeps the legacy uncontrolled behaviour.
   */
  hoverKey?: string | null;
  /**
   * Emitted when the user hovers a datum (its key) or leaves the plot (`null`).
   * Always fired on pointer move/leave — even while CONTROLLED — so dataviz can
   * keep the shared hover channel in sync.
   */
  onHoverKeyChange?: (key: string | null) => void;
  /**
   * FR-5 — keyboard navigation of the data points (roving tabindex). When `true`
   * (or implied by wiring `onSelectKey`), a thin focusable overlay is rendered
   * over the points: the chart owns ONE tab stop, ←/↑/→/↓ move the focus between
   * points (data order), Home/End jump to the first/last, Enter/Space select the
   * focused point (`onSelectKey`), Escape leaves the navigation. Each focused
   * point announces its `x` + value. Absent ⇒ no overlay, rendering unchanged.
   */
  keyboardNav?: boolean;
  /**
   * Emitted when the user selects the focused point via Enter/Space (its key,
   * `String(x)`), or `null` when the navigation is left via Escape. Wiring it
   * also turns the keyboard navigation on.
   */
  onSelectKey?: (key: string | null) => void;
  class?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 44 };

type AnnotationRegion = Extract<ResolvedAnnotation, { kind: "region" }>;
type AnnotationAbove = Extract<ResolvedAnnotation, { kind: "line" | "shape" | "point" | "label" }>;

@Component({
  selector: "st-area-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-areaChart__visual"
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
          <defs>
            <linearGradient [attr.id]="gradientId" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="currentColor" stop-opacity="0.3"></stop>
              <stop offset="100%" stop-color="currentColor" stop-opacity="0.0"></stop>
            </linearGradient>
          </defs>

          @for (g of gridLines; track g.value) {
            <line class="st-areaChart__grid" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="g.y" [attr.y2]="g.y"></line>
            <text class="st-areaChart__tickLabel" [attr.x]="MARGIN.left - 6" [attr.y]="g.y" text-anchor="end" dominant-baseline="middle">{{ formatTickLabel(g.value) }}</text>
          }

          <line class="st-areaChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left" [attr.y1]="MARGIN.top" [attr.y2]="heightValue - MARGIN.bottom"></line>
          <line class="st-areaChart__axis" [attr.x1]="MARGIN.left" [attr.x2]="widthValue - MARGIN.right" [attr.y1]="heightValue - MARGIN.bottom" [attr.y2]="heightValue - MARGIN.bottom"></line>

          @for (tick of xTickEntries; track tick.key) {
            <text class="st-areaChart__tickLabel" [attr.x]="tick.x" [attr.y]="heightValue - MARGIN.bottom + 16" text-anchor="middle">{{ tick.label }}</text>
          }

          @if (annotationRegions.length > 0) {
            <g class="st-areaChart__annotations st-areaChart__annotations--behind">
              @for (a of annotationRegions; track a.key) {
                <rect class="st-areaChart__annotationRegion" [attr.x]="a.x" [attr.y]="a.y" [attr.width]="a.width" [attr.height]="a.height"></rect>
                @if (a.label) {
                  <text class="st-areaChart__annotationLabel" [attr.x]="a.x + 4" [attr.y]="a.y + 11">{{ a.label }}</text>
                }
              }
            </g>
          }

          @if (areaPath) {
            <path class="st-areaChart__area" [attr.d]="areaPath" [attr.fill]="'url(#' + gradientId + ')'"></path>
          }
          @if (linePath) {
            <path class="st-areaChart__line" [attr.d]="linePath" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          }

          @for (p of points; track p.index) {
            <circle class="st-areaChart__dot" [attr.cx]="p.x" [attr.cy]="p.y" r="4" [attr.data-chart-index]="p.index"></circle>
          }

          @if (annotationAbove.length > 0) {
            <g class="st-areaChart__annotations st-areaChart__annotations--above">
              @for (a of annotationAbove; track a.key) {
                @switch (a.kind) {
                  @case ("line") {
                    <line class="st-areaChart__annotationLine" [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2"></line>
                    @if (a.label) {
                      <text
                        class="st-areaChart__annotationLabel"
                        [attr.x]="a.axis === 'x' ? a.x1 + 4 : MARGIN.left + plotWidth - 4"
                        [attr.y]="a.axis === 'x' ? MARGIN.top + 11 : a.y1 - 4"
                        [attr.text-anchor]="a.axis === 'x' ? 'start' : 'end'"
                      >{{ a.label }}</text>
                    }
                  }
                  @case ("shape") {
                    <polygon class="st-areaChart__annotationShape" [attr.points]="annotationShapePoints(a)"></polygon>
                    @if (a.label) {
                      <text class="st-areaChart__annotationLabel" [attr.x]="a.labelX" [attr.y]="a.labelY" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("point") {
                    <circle class="st-areaChart__annotationPoint" [attr.cx]="a.x" [attr.cy]="a.y" r="4.5"></circle>
                    @if (a.label) {
                      <text class="st-areaChart__annotationLabel" [attr.x]="a.x" [attr.y]="a.y - 8" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("label") {
                    <text class="st-areaChart__annotationText" [attr.x]="a.x" [attr.y]="a.y" [attr.text-anchor]="a.anchor">{{ a.text }}</text>
                  }
                }
              }
            </g>
          }

          @if (dataLabelItems.length > 0) {
            <g class="st-areaChart__dataLabels" aria-hidden="true">
              @for (d of dataLabelItems; track d.key) {
                <text class="st-areaChart__dataLabel" [attr.x]="d.x" [attr.y]="d.y" text-anchor="middle" [attr.dominant-baseline]="d.baseline">{{ d.text }}</text>
              }
            </g>
          }

          @if (hoveredPoint) {
            <g class="st-areaChart__crosshair" aria-hidden="true">
              <line class="st-areaChart__crosshairLine" [attr.x1]="hoveredPoint.x" [attr.x2]="hoveredPoint.x" [attr.y1]="MARGIN.top" [attr.y2]="MARGIN.top + plotHeight"></line>
              <circle class="st-areaChart__crosshairMarker" [attr.cx]="hoveredPoint.x" [attr.cy]="hoveredPoint.y" r="5"></circle>
            </g>
          }
        </svg>

        @if (navEnabled) {
          <svg
            class="st-areaChart__navLayer"
            [attr.viewBox]="viewBox"
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            height="100%"
            role="group"
            [attr.aria-label]="label + ' — points de données'"
          >
            @for (p of points; track p.index) {
              <rect
                class="st-areaChart__navDatum"
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
          class="st-areaChart__tooltip"
          role="presentation"
          [style.left.%]="tooltipLeft(hoveredPoint)"
          [style.top.%]="tooltipTop(hoveredPoint)"
        >
          <span class="st-areaChart__tooltipLabel">{{ hoveredPoint.datum.x }}</span>
          <span class="st-areaChart__tooltipValue">{{ hoveredPoint.datum.y }}</span>
        </div>
      }
    </div>
  `,
})
export class AreaChart {
  static readonly stComponentName = "AreaChart";
  readonly componentName = "AreaChart";
  readonly MARGIN = MARGIN;
  readonly gradientId = "areaGrad-" + Math.random().toString(36).substring(2, 9);

  private hoveredIndex: number | null = null;
  private focusedIndex = -1;

  @NgInput() data!: (number | AreaChartDatum)[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() tone?: AreaChartTone;
  @NgInput() smooth?: boolean;
  @NgInput() label!: string;
  @NgInput() annotations?: ChartAnnotation[];
  @NgInput() dataLabels?: DataLabelsProp;
  @NgInput() hoverKey?: string | null;
  @NgInput() onHoverKeyChange?: (key: string | null) => void;
  @NgInput() keyboardNav?: boolean;
  @NgInput() onSelectKey?: (key: string | null) => void;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-areaChart", `st-areaChart--${this.tone ?? "category1"}`, this.classInput);
  }

  get widthValue(): number { return this.width ?? 480; }
  get heightValue(): number { return this.height ?? 240; }
  get viewBox(): string { return `0 0 ${this.widthValue} ${this.heightValue}`; }
  get plotWidth(): number { return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1); }
  get plotHeight(): number { return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1); }

  get normalizedData(): AreaChartDatum[] {
    return (this.data ?? []).map((d, i) =>
      typeof d === "number" ? { x: i, y: d } : d
    );
  }

  get yValues(): number[] {
    return this.normalizedData.map((d) => d.y).filter(Number.isFinite);
  }

  get yTicks(): number[] {
    if (this.yValues.length === 0) return [0];
    const minRaw = Math.min(...this.yValues);
    const maxRaw = Math.max(...this.yValues);
    const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
    const minTickVal = Math.min(0, minRaw - padded);
    return niceTicks(minTickVal, maxRaw + padded, 5);
  }

  get yDomain(): { min: number; max: number } {
    const t = this.yTicks;
    return { min: t[0] ?? 0, max: t[t.length - 1] ?? 0 };
  }

  get xIsNumeric(): boolean {
    return this.normalizedData.length > 0 && this.normalizedData.every((d) => isNumeric(d.x as number));
  }

  get xDomainMin(): number {
    if (!this.xIsNumeric) return 0;
    return Math.min(...this.normalizedData.map((d) => d.x as number));
  }

  get xDomainMax(): number {
    if (!this.xIsNumeric) return Math.max(this.normalizedData.length - 1, 1);
    return Math.max(...this.normalizedData.map((d) => d.x as number));
  }

  xPixel(datum: AreaChartDatum, index: number): number {
    if (this.xIsNumeric) {
      return MARGIN.left + scaleLinear(datum.x as number, this.xDomainMin, this.xDomainMax, 0, this.plotWidth);
    }
    const denom = Math.max(this.normalizedData.length - 1, 1);
    const x = this.normalizedData.length === 1 ? this.plotWidth / 2 : (index / denom) * this.plotWidth;
    return MARGIN.left + x;
  }

  yPixel(y: number): number {
    return MARGIN.top + scaleLinear(y, this.yDomain.min, this.yDomain.max, this.plotHeight, 0);
  }

  get points(): Array<{ x: number; y: number; datum: AreaChartDatum; index: number }> {
    return this.normalizedData.map((datum, index) => ({
      x: this.xPixel(datum, index),
      y: this.yPixel(datum.y),
      datum,
      index,
    }));
  }

  get linePath(): string {
    if (this.points.length === 0) return "";
    return this.smooth ? buildSmoothPath(this.points) : buildLinearPath(this.points);
  }

  get areaPath(): string {
    if (this.points.length === 0) return "";
    const base = MARGIN.top + scaleLinear(Math.max(0, this.yDomain.min), this.yDomain.min, this.yDomain.max, this.plotHeight, 0);
    const first = this.points[0]!;
    const last = this.points[this.points.length - 1]!;
    return `${this.linePath} L${last.x.toFixed(2)},${base.toFixed(2)} L${first.x.toFixed(2)},${base.toFixed(2)} Z`;
  }

  get gridLines(): Array<{ value: number; y: number }> {
    return this.yTicks.map((value) => ({ value, y: this.yPixel(value) }));
  }

  get xTickEntries(): Array<{ key: string; x: number; label: string }> {
    if (this.normalizedData.length === 0) return [];
    if (!this.xIsNumeric) {
      return this.points.map((p, i) => ({
        key: String(this.normalizedData[i]!.x),
        x: p.x,
        label: String(this.normalizedData[i]!.x),
      }));
    }
    const target = Math.min(5, this.normalizedData.length);
    const stride = Math.max(1, Math.round((this.normalizedData.length - 1) / (target - 1 || 1)));
    const entries: Array<{ key: string; x: number; label: string }> = [];
    for (let i = 0; i < this.normalizedData.length; i += stride) {
      entries.push({ key: String(i), x: this.points[i]!.x, label: String(this.normalizedData[i]!.x) });
    }
    const lastIdx = this.normalizedData.length - 1;
    if (entries[entries.length - 1]?.label !== String(this.normalizedData[lastIdx]!.x)) {
      entries.push({ key: String(lastIdx), x: this.points[lastIdx]!.x, label: String(this.normalizedData[lastIdx]!.x) });
    }
    return entries;
  }

  get annotationContext() {
    const self = this;
    return {
      xScale: (value: number | string): number | null => {
        if (self.xIsNumeric) {
          if (typeof value !== "number" || !Number.isFinite(value)) return null;
          if (value < self.xDomainMin || value > self.xDomainMax) return null;
          return scaleLinear(value, self.xDomainMin, self.xDomainMax, 0, self.plotWidth);
        }
        const i = self.normalizedData.findIndex((d) => d.x === value);
        if (i < 0) return null;
        const denom = Math.max(self.normalizedData.length - 1, 1);
        return self.normalizedData.length === 1 ? self.plotWidth / 2 : (i / denom) * self.plotWidth;
      },
      yScale: (value: number): number | null => {
        if (!Number.isFinite(value) || value < self.yDomain.min || value > self.yDomain.max) return null;
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

  get dataLabelItems(): Array<{ key: string; x: number; y: number; text: string; baseline: string }> {
    const opts = normalizeDataLabels(this.dataLabels);
    if (!opts.enabled) return [];
    return this.points.map((p) => {
      const text = formatDataLabel(p.datum.y, opts, formatTick);
      const center = opts.position === "center" || opts.position === "inside";
      return { key: String(p.index), x: p.x, y: center ? p.y : p.y - 8, text: text ?? "", baseline: center ? "middle" : "auto" };
    });
  }

  get dataValueItems(): string[] {
    return [
      ...this.normalizedData.map((d) => `${d.x}: ${d.y}`),
      ...annotationDataListItems(this.annotations),
    ];
  }

  get hoverKeys(): string[] {
    return this.normalizedData.map((d) => keyForX(d.x));
  }

  get activeIndex(): number {
    return resolveActiveIndex(this.hoverKey, this.hoveredIndex, this.hoverKeys);
  }

  get hoveredPoint(): { x: number; y: number; datum: AreaChartDatum; index: number } | null {
    const idx = this.activeIndex;
    return idx >= 0 ? (this.points[idx] ?? null) : null;
  }

  get navEnabled(): boolean {
    return (this.keyboardNav === true || typeof this.onSelectKey === "function") && this.points.length > 0;
  }

  formatTickLabel(v: number): string { return formatTick(v); }

  datapointLabel(pt: { datum: AreaChartDatum }): string {
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
