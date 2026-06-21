import { Component, ElementRef, Input as NgInput, QueryList, ViewChildren } from "@angular/core";

import { classNames } from "./classNames.js";

import { niceTicks, scaleLinear } from "./chartScale.js";

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

export type ScatterPlotTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ScatterPlotDatum = {
  x: number;
  y: number;
  label?: string;
  tone?: ScatterPlotTone;
  /**
   * Per-datum radius, clamped to a sane maximum (32). Non-finite or
   * negative ⇒ falls back to the global `radius`.
   */
  r?: number;
};

/** Cluster centroid marker (ring + cross), drawn above the data points. */
export type ScatterPlotCentroid = {
  x: number;
  y: number;
  tone?: ScatterPlotTone;
  label?: string;
};

export type ScatterPlotProps = {
  data: ScatterPlotDatum[];
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  radius?: number;
  centroids?: ScatterPlotCentroid[];
  annotations?: ChartAnnotation[];
  dataLabels?: DataLabelsProp;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  keyboardNav?: boolean;
  onSelectKey?: (key: string | null) => void;
  label: string;
  class?: string;
};

const SCATTER_TONES = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
] as const;

const SCATTER_MARGIN = { top: 14, right: 18, bottom: 36, left: 48 };
const MAX_POINT_RADIUS = 32;
const NAV_HIT = 18;

type PointGeom = {
  cx: number;
  cy: number;
  r: number;
  datum: ScatterPlotDatum;
  index: number;
  tone: ScatterPlotTone;
};

type CentroidMark = {
  cx: number;
  cy: number;
  tone: ScatterPlotTone;
  label?: string;
};

type AnnotationRegion = Extract<ResolvedAnnotation, { kind: "region" }>;
type AnnotationAbove = Extract<ResolvedAnnotation, { kind: "line" | "shape" | "point" | "label" }>;

@Component({
  selector: "st-scatter-plot",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-scatterPlot__visual"
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
          @for (t of scales.yTicks; track t) {
            <line
              class="st-scatterPlot__grid"
              [attr.x1]="margin.left"
              [attr.x2]="widthValue - margin.right"
              [attr.y1]="yPos(t)"
              [attr.y2]="yPos(t)"
            ></line>
            <text
              class="st-scatterPlot__tick"
              [attr.x]="margin.left - 6"
              [attr.y]="yPos(t)"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ fmt(t) }}</text>
          }
          @for (t of scales.xTicks; track t) {
            <text
              class="st-scatterPlot__tick"
              [attr.x]="xPos(t)"
              [attr.y]="heightValue - margin.bottom + 16"
              text-anchor="middle"
            >{{ fmt(t) }}</text>
          }

          <line class="st-scatterPlot__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-scatterPlot__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>

          @if (xLabel) {
            <text class="st-scatterPlot__axisLabel" [attr.x]="margin.left + scales.plotW / 2" [attr.y]="heightValue - 4" text-anchor="middle">{{ xLabel }}</text>
          }
          @if (yLabel) {
            <text class="st-scatterPlot__axisLabel" x="12" [attr.y]="margin.top + scales.plotH / 2" text-anchor="middle" [attr.transform]="'rotate(-90 12 ' + (margin.top + scales.plotH / 2) + ')'">{{ yLabel }}</text>
          }

          @if (annotationRegions.length > 0) {
            <g class="st-scatterPlot__annotations st-scatterPlot__annotations--behind">
              @for (a of annotationRegions; track a.key) {
                <rect class="st-scatterPlot__annotationRegion" [attr.x]="a.x" [attr.y]="a.y" [attr.width]="a.width" [attr.height]="a.height"></rect>
                @if (a.label) {
                  <text class="st-scatterPlot__annotationLabel" [attr.x]="a.x + 4" [attr.y]="a.y + 11">{{ a.label }}</text>
                }
              }
            </g>
          }

          @for (p of points; track p.index) {
            <circle
              [class]="'st-scatterPlot__point st-scatterPlot__point--' + p.tone"
              [attr.cx]="p.cx"
              [attr.cy]="p.cy"
              [attr.r]="p.r"
              [attr.data-chart-index]="p.index"
            ></circle>
          }

          @for (c of centroidMarks; track $index) {
            <g [class]="'st-scatterPlot__centroid st-scatterPlot__centroid--' + c.tone">
              <circle class="st-scatterPlot__centroidRing" [attr.cx]="c.cx" [attr.cy]="c.cy" r="7"></circle>
              <line class="st-scatterPlot__centroidCross" [attr.x1]="c.cx - 3.5" [attr.x2]="c.cx + 3.5" [attr.y1]="c.cy" [attr.y2]="c.cy"></line>
              <line class="st-scatterPlot__centroidCross" [attr.x1]="c.cx" [attr.x2]="c.cx" [attr.y1]="c.cy - 3.5" [attr.y2]="c.cy + 3.5"></line>
            </g>
          }

          @if (annotationsAbove.length > 0) {
            <g class="st-scatterPlot__annotations st-scatterPlot__annotations--above">
              @for (a of annotationsAbove; track a.key) {
                @switch (a.kind) {
                  @case ("line") {
                    <line class="st-scatterPlot__annotationLine" [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2"></line>
                    @if (a.label) {
                      <text
                        class="st-scatterPlot__annotationLabel"
                        [attr.x]="a.axis === 'x' ? a.x1 + 4 : margin.left + scales.plotW - 4"
                        [attr.y]="a.axis === 'x' ? margin.top + 11 : a.y1 - 4"
                        [attr.text-anchor]="a.axis === 'x' ? 'start' : 'end'"
                      >{{ a.label }}</text>
                    }
                  }
                  @case ("shape") {
                    <polygon class="st-scatterPlot__annotationShape" [attr.points]="polygonPts(a.points)"></polygon>
                    @if (a.label) {
                      <text class="st-scatterPlot__annotationLabel" [attr.x]="a.labelX" [attr.y]="a.labelY" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("point") {
                    <circle class="st-scatterPlot__annotationPoint" [attr.cx]="a.x" [attr.cy]="a.y" r="4.5"></circle>
                    @if (a.label) {
                      <text class="st-scatterPlot__annotationLabel" [attr.x]="a.x" [attr.y]="a.y - 8" text-anchor="middle">{{ a.label }}</text>
                    }
                  }
                  @case ("label") {
                    <text class="st-scatterPlot__annotationText" [attr.x]="a.x" [attr.y]="a.y" [attr.text-anchor]="a.anchor">{{ a.text }}</text>
                  }
                }
              }
            </g>
          }

          @if (dataLabelItems.length > 0) {
            <g class="st-scatterPlot__dataLabels" aria-hidden="true">
              @for (d of dataLabelItems; track d.key) {
                <text class="st-scatterPlot__dataLabel" [attr.x]="d.x" [attr.y]="d.y" text-anchor="middle" [attr.dominant-baseline]="d.baseline">{{ d.text }}</text>
              }
            </g>
          }

          @if (activeIndex >= 0 && points[activeIndex]) {
            <g class="st-scatterPlot__crosshair" aria-hidden="true">
              <line class="st-scatterPlot__crosshairLine" [attr.x1]="points[activeIndex]!.cx" [attr.x2]="points[activeIndex]!.cx" [attr.y1]="margin.top" [attr.y2]="margin.top + scales.plotH"></line>
              <line class="st-scatterPlot__crosshairLine" [attr.x1]="margin.left" [attr.x2]="margin.left + scales.plotW" [attr.y1]="points[activeIndex]!.cy" [attr.y2]="points[activeIndex]!.cy"></line>
              <circle class="st-scatterPlot__crosshairMarker" [attr.cx]="points[activeIndex]!.cx" [attr.cy]="points[activeIndex]!.cy" r="5"></circle>
            </g>
          }
        </svg>

        @if (navEnabled) {
          <svg
            class="st-scatterPlot__navLayer"
            [attr.viewBox]="viewBox"
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            height="100%"
            role="group"
            [attr.aria-label]="label + ' — points de données'"
          >
            @for (p of points; track p.index) {
              <rect
                #navDatum
                class="st-scatterPlot__navDatum"
                [attr.x]="p.cx - navHit / 2"
                [attr.y]="p.cy - navHit / 2"
                [attr.width]="navHit"
                [attr.height]="navHit"
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

      @if (activeIndex >= 0 && points[activeIndex]) {
        <div
          class="st-scatterPlot__tooltip"
          role="presentation"
          [style.left.%]="(points[activeIndex]!.cx / widthValue) * 100"
          [style.top.%]="(points[activeIndex]!.cy / heightValue) * 100"
        >
          @if (points[activeIndex]!.datum.label) {
            <span class="st-scatterPlot__tooltipLabel">{{ points[activeIndex]!.datum.label }}</span>
          }
          <span class="st-scatterPlot__tooltipValue">x {{ points[activeIndex]!.datum.x }} · y {{ points[activeIndex]!.datum.y }}</span>
        </div>
      }
    </div>
  `,
})
export class ScatterPlot {
  static readonly stComponentName = "ScatterPlot";
  readonly componentName = "ScatterPlot";

  @ViewChildren("navDatum") private navDatumElements?: QueryList<ElementRef<SVGElement>>;

  @NgInput() data: ScatterPlotDatum[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() xLabel?: string;
  @NgInput() yLabel?: string;
  @NgInput() radius?: number;
  @NgInput() centroids?: ScatterPlotCentroid[];
  @NgInput() annotations?: ChartAnnotation[];
  @NgInput() dataLabels?: DataLabelsProp;
  @NgInput() hoverKey?: string | null;
  @NgInput() onHoverKeyChange?: (key: string | null) => void;
  @NgInput() keyboardNav?: boolean;
  @NgInput() onSelectKey?: (key: string | null) => void;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;

  readonly margin = SCATTER_MARGIN;
  readonly navHit = NAV_HIT;

  private hoveredIndex: number | null = null;
  private focusedIndex = -1;

  get hostClass(): string {
    return classNames("st-scatterPlot", this.classInput);
  }

  get widthValue(): number { return this.width ?? 480; }
  get heightValue(): number { return this.height ?? 280; }
  get radiusValue(): number { return this.radius ?? 5; }

  get viewBox(): string {
    return `0 0 ${this.widthValue} ${this.heightValue}`;
  }

  private get validCentroids(): ScatterPlotCentroid[] {
    return (this.centroids ?? []).filter((c) => Number.isFinite(c.x) && Number.isFinite(c.y));
  }

  get scales() {
    const data = this.data;
    const vc = this.validCentroids;
    const xs = [...data.map((d) => d.x), ...vc.map((c) => c.x)].filter(Number.isFinite);
    const ys = [...data.map((d) => d.y), ...vc.map((c) => c.y)].filter(Number.isFinite);
    const xTicks = niceTicks(Math.min(...xs), Math.max(...xs));
    const yTicks = niceTicks(Math.min(...ys), Math.max(...ys));
    const plotW = Math.max(this.widthValue - this.margin.left - this.margin.right, 1);
    const plotH = Math.max(this.heightValue - this.margin.top - this.margin.bottom, 1);
    return {
      xTicks, yTicks,
      xMin: xTicks[0], xMax: xTicks[xTicks.length - 1],
      yMin: yTicks[0], yMax: yTicks[yTicks.length - 1],
      plotW, plotH,
    };
  }

  xPos(v: number): number {
    const { xMin, xMax, plotW } = this.scales;
    return this.margin.left + scaleLinear(v, xMin, xMax, 0, plotW);
  }

  yPos(v: number): number {
    const { yMin, yMax, plotH } = this.scales;
    return this.margin.top + scaleLinear(v, yMin, yMax, plotH, 0);
  }

  fmt(v: number): string {
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    return Number.isInteger(v) ? String(v) : v.toFixed(1);
  }

  get points(): PointGeom[] {
    return this.data.map((d, i) => ({
      cx: this.xPos(d.x),
      cy: this.yPos(d.y),
      r: typeof d.r === "number" && Number.isFinite(d.r) && d.r >= 0
        ? Math.min(d.r, MAX_POINT_RADIUS)
        : this.radiusValue,
      datum: d,
      index: i,
      tone: d.tone ?? SCATTER_TONES[i % SCATTER_TONES.length],
    }));
  }

  get centroidMarks(): CentroidMark[] {
    return this.validCentroids.map((c, i) => ({
      cx: this.xPos(c.x),
      cy: this.yPos(c.y),
      tone: c.tone ?? SCATTER_TONES[i % SCATTER_TONES.length],
      label: c.label,
    }));
  }

  private get resolvedAnnotations(): ResolvedAnnotation[] {
    const { xMin, xMax, yMin, yMax, plotW, plotH } = this.scales;
    const m = this.margin;
    return resolveAnnotations(this.annotations, {
      xScale: (v: number | string): number | null => {
        if (typeof v !== "number" || !Number.isFinite(v)) return null;
        if (v < xMin || v > xMax) return null;
        return scaleLinear(v, xMin, xMax, 0, plotW);
      },
      yScale: (v: number): number | null => {
        if (!Number.isFinite(v)) return null;
        if (v < yMin || v > yMax) return null;
        return scaleLinear(v, yMin, yMax, plotH, 0);
      },
      plotLeft: m.left,
      plotTop: m.top,
      plotWidth: plotW,
      plotHeight: plotH,
    });
  }

  get annotationRegions(): AnnotationRegion[] {
    return this.resolvedAnnotations.filter((a): a is AnnotationRegion => a.kind === "region");
  }

  get annotationsAbove(): AnnotationAbove[] {
    return this.resolvedAnnotations.filter((a): a is AnnotationAbove => a.kind !== "region");
  }

  polygonPts(pts: ReadonlyArray<{ x: number; y: number }>): string {
    return polygonPoints(pts);
  }

  get dataLabelItems(): Array<{ key: number; x: number; y: number; text: string; baseline: string }> {
    const opts = normalizeDataLabels(this.dataLabels);
    if (!opts.enabled) return [];
    return this.points.map((p) => {
      const text = p.datum.label ?? formatDataLabel(p.datum.y, opts, this.fmt.bind(this));
      const isCenter = opts.position === "center" || opts.position === "inside";
      return {
        key: p.index,
        x: p.cx,
        y: isCenter ? p.cy : p.cy - (p.r + 5),
        text,
        baseline: isCenter ? "middle" : "auto",
      };
    });
  }

  get dataValueItems(): string[] {
    return [
      ...this.data.map((d) => d.label ? `${d.label}: x ${d.x}, y ${d.y}` : `x ${d.x}, y ${d.y}`),
      ...this.validCentroids.map((c) => c.label ? `Centroïde ${c.label}: (${c.x}, ${c.y})` : `Centroïde: (${c.x}, ${c.y})`),
      ...annotationDataListItems(this.annotations),
    ];
  }

  private get hoverKeys(): string[] {
    return this.data.map((d) => d.label ?? `${d.x},${d.y}`);
  }

  get activeIndex(): number {
    return resolveActiveIndex(this.hoverKey, this.hoveredIndex, this.hoverKeys);
  }

  get navEnabled(): boolean {
    return (this.keyboardNav === true || this.onSelectKey !== undefined) && this.points.length > 0;
  }

  rovingTabIndexFor(index: number): number {
    return rovingTabIndex(index, this.focusedIndex, this.points.length);
  }

  datapointLabel(p: PointGeom): string {
    return datapointAriaLabel(p.datum.label ?? `${p.datum.x}, ${p.datum.y}`, p.datum.y);
  }

  private emitHoverKey(index: number | null): void {
    this.onHoverKeyChange?.(index == null ? null : (this.hoverKeys[index] ?? null));
  }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) {
      this.hoveredIndex = null;
      this.emitHoverKey(null);
      return;
    }
    const raw = Number(target.getAttribute("data-chart-index"));
    const index = Number.isInteger(raw) ? raw : null;
    this.hoveredIndex = index;
    this.emitHoverKey(index);
  }

  handleLeave(): void {
    this.hoveredIndex = null;
    this.emitHoverKey(null);
  }

  handleDatapointKeyDown(event: KeyboardEvent, index: number): void {
    const action = datapointNavAction(event.key, index, this.points.length);
    if (!action) return;
    event.preventDefault();
    if (action.kind === "move") {
      this.focusedIndex = action.index;
      const elems = this.navDatumElements?.toArray();
      elems?.[action.index]?.nativeElement.focus();
      this.emitHoverKey(action.index);
    } else if (action.kind === "select") {
      this.onSelectKey?.(this.hoverKeys[index] ?? null);
    } else {
      this.focusedIndex = -1;
      this.emitHoverKey(null);
      this.onSelectKey?.(null);
      (event.currentTarget as SVGElement).blur();
    }
  }

  handleDatapointFocus(index: number): void {
    this.focusedIndex = index;
    this.emitHoverKey(index);
  }
}
