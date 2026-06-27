import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { formatTick, niceTicks, scaleLinear } from "./chartScale.js";

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
  /**
   * Cluster centroid markers (ring + cross), drawn above the points. Their
   * coordinates are folded into the axis domain. Non-finite x/y are skipped.
   */
  centroids?: ScatterPlotCentroid[];
  /**
   * Annotation overlay in DATA space (points, labels, axis lines, regions,
   * polygons). Both axes are continuous (linear). Additive: absent ⇒ unchanged.
   */
  annotations?: ChartAnnotation[];
  /**
   * Per-point value labels. `false`/absent (default) → none. `true` → each
   * point's value (the datum `label` wins when present). Object → `format` /
   * `position`. Default position is `top`. Labels are `aria-hidden`.
   */
  dataLabels?: DataLabelsProp;
  /**
   * CONTROLLED synchronised hover key (FR-3). A point's key is its `label` when
   * present, otherwise `"x,y"`. Absent (`undefined`) keeps the uncontrolled
   * behaviour.
   */
  hoverKey?: string | null;
  /** Emitted on hover (the key) / leave (`null`); fired even while controlled. */
  onHoverKeyChange?: (key: string | null) => void;
  /** FR-5 — roving-tabindex keyboard navigation of the data points. */
  keyboardNav?: boolean;
  /** Emitted on Enter/Space select (the key) / Escape (`null`); enables nav. */
  onSelectKey?: (key: string | null) => void;
  label: string;
  class?: string;
};

const MARGIN = { top: 14, right: 18, bottom: 36, left: 48 } as const;

const TONES: ScatterPlotTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

// Sane upper bound for a per-datum radius (keeps oversized bubbles inside the
// plot); non-finite/negative values fall back to the global radius.
const MAX_POINT_RADIUS = 32;

// Comfortable square hit area centred on each dot (keyboard nav layer).
const NAV_HIT = 18;

type ScatterScales = {
  xTicks: number[];
  yTicks: number[];
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  plotW: number;
  plotH: number;
};

type ScatterPoint = {
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
          @for (g of yGridLines; track g.value) {
            <line
              class="st-scatterPlot__grid"
              [attr.x1]="MARGIN.left"
              [attr.x2]="widthValue - MARGIN.right"
              [attr.y1]="g.y"
              [attr.y2]="g.y"
            ></line>
            <text
              class="st-scatterPlot__tick"
              [attr.x]="MARGIN.left - 6"
              [attr.y]="g.y"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ formatTickLabel(g.value) }}</text>
          }

          @for (t of xTickEntries; track t.value) {
            <text
              class="st-scatterPlot__tick"
              [attr.x]="t.x"
              [attr.y]="heightValue - MARGIN.bottom + 16"
              text-anchor="middle"
            >{{ formatTickLabel(t.value) }}</text>
          }

          <line
            class="st-scatterPlot__axis"
            [attr.x1]="MARGIN.left"
            [attr.x2]="MARGIN.left"
            [attr.y1]="MARGIN.top"
            [attr.y2]="heightValue - MARGIN.bottom"
          ></line>
          <line
            class="st-scatterPlot__axis"
            [attr.x1]="MARGIN.left"
            [attr.x2]="widthValue - MARGIN.right"
            [attr.y1]="heightValue - MARGIN.bottom"
            [attr.y2]="heightValue - MARGIN.bottom"
          ></line>

          @if (xLabel) {
            <text
              class="st-scatterPlot__axisLabel"
              [attr.x]="MARGIN.left + scales.plotW / 2"
              [attr.y]="heightValue - 4"
              text-anchor="middle"
            >{{ xLabel }}</text>
          }
          @if (yLabel) {
            <text
              class="st-scatterPlot__axisLabel"
              [attr.x]="12"
              [attr.y]="yAxisLabelY"
              text-anchor="middle"
              [attr.transform]="yAxisLabelTransform"
            >{{ yLabel }}</text>
          }

          @if (annotationRegions.length > 0) {
            <g class="st-scatterPlot__annotations st-scatterPlot__annotations--behind">
              @for (a of annotationRegions; track a.key) {
                <rect
                  class="st-scatterPlot__annotationRegion"
                  [attr.x]="a.x"
                  [attr.y]="a.y"
                  [attr.width]="a.width"
                  [attr.height]="a.height"
                ></rect>
                @if (a.label) {
                  <text class="st-scatterPlot__annotationLabel" [attr.x]="a.x + 4" [attr.y]="a.y + 11">{{ a.label }}</text>
                }
              }
            </g>
          }

          @for (p of points; track p.index) {
            <circle
              [attr.class]="pointClass(p.tone)"
              [attr.cx]="p.cx"
              [attr.cy]="p.cy"
              [attr.r]="p.r"
              [attr.data-chart-index]="p.index"
            ></circle>
          }

          @for (c of centroidMarks; track $index) {
            <g [attr.class]="centroidClass(c.tone)">
              <circle class="st-scatterPlot__centroidRing" [attr.cx]="c.cx" [attr.cy]="c.cy" r="7"></circle>
              <line class="st-scatterPlot__centroidCross" [attr.x1]="c.cx - 3.5" [attr.x2]="c.cx + 3.5" [attr.y1]="c.cy" [attr.y2]="c.cy"></line>
              <line class="st-scatterPlot__centroidCross" [attr.x1]="c.cx" [attr.x2]="c.cx" [attr.y1]="c.cy - 3.5" [attr.y2]="c.cy + 3.5"></line>
            </g>
          }

          @if (annotationAbove.length > 0) {
            <g class="st-scatterPlot__annotations st-scatterPlot__annotations--above">
              @for (a of annotationAbove; track a.key) {
                @switch (a.kind) {
                  @case ("line") {
                    <line class="st-scatterPlot__annotationLine" [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2"></line>
                    @if (a.label) {
                      <text
                        class="st-scatterPlot__annotationLabel"
                        [attr.x]="a.axis === 'x' ? a.x1 + 4 : MARGIN.left + scales.plotW - 4"
                        [attr.y]="a.axis === 'x' ? MARGIN.top + 11 : a.y1 - 4"
                        [attr.text-anchor]="a.axis === 'x' ? 'start' : 'end'"
                      >{{ a.label }}</text>
                    }
                  }
                  @case ("shape") {
                    <polygon class="st-scatterPlot__annotationShape" [attr.points]="annotationShapePoints(a)"></polygon>
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
                <text
                  class="st-scatterPlot__dataLabel"
                  [attr.x]="d.x"
                  [attr.y]="d.y"
                  text-anchor="middle"
                  [attr.dominant-baseline]="d.baseline"
                >{{ d.text }}</text>
              }
            </g>
          }

          @if (activePoint; as cp) {
            <g class="st-scatterPlot__crosshair" aria-hidden="true">
              <line class="st-scatterPlot__crosshairLine" [attr.x1]="cp.cx" [attr.x2]="cp.cx" [attr.y1]="MARGIN.top" [attr.y2]="MARGIN.top + scales.plotH"></line>
              <line class="st-scatterPlot__crosshairLine" [attr.x1]="MARGIN.left" [attr.x2]="MARGIN.left + scales.plotW" [attr.y1]="cp.cy" [attr.y2]="cp.cy"></line>
              <circle class="st-scatterPlot__crosshairMarker" [attr.cx]="cp.cx" [attr.cy]="cp.cy" r="5"></circle>
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
                class="st-scatterPlot__navDatum"
                [attr.x]="p.cx - NAV_HIT / 2"
                [attr.y]="p.cy - NAV_HIT / 2"
                [attr.width]="NAV_HIT"
                [attr.height]="NAV_HIT"
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

      @if (dataValueItems.length > 0) {
        <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
          @for (item of dataValueItems; track $index) {
            <li>{{ item }}</li>
          }
        </ul>
      }

      @if (activePoint; as p) {
        <div
          class="st-scatterPlot__tooltip"
          role="presentation"
          [style.left.%]="(p.cx / widthValue) * 100"
          [style.top.%]="(p.cy / heightValue) * 100"
        >
          @if (p.datum.label) {
            <span class="st-scatterPlot__tooltipLabel">{{ p.datum.label }}</span>
          }
          <span class="st-scatterPlot__tooltipValue">x {{ p.datum.x }} · y {{ p.datum.y }}</span>
        </div>
      }
    </div>
  `,
})
export class ScatterPlot {
  static readonly stComponentName = "ScatterPlot";
  readonly componentName = "ScatterPlot";
  readonly MARGIN = MARGIN;
  readonly NAV_HIT = NAV_HIT;

  private hoveredIndex: number | null = null;
  private focusedIndex = -1;

  @NgInput() data!: ScatterPlotDatum[];
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
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-scatterPlot", this.classInput);
  }

  get safeData(): ScatterPlotDatum[] {
    return this.data ?? [];
  }

  get widthValue(): number {
    return this.width ?? 480;
  }

  get heightValue(): number {
    return this.height ?? 280;
  }

  get radiusValue(): number {
    return this.radius ?? 5;
  }

  get viewBox(): string {
    return `0 0 ${this.widthValue} ${this.heightValue}`;
  }

  /** Centroids guarded once: non-finite coordinates are skipped entirely. */
  get validCentroids(): ScatterPlotCentroid[] {
    return (this.centroids ?? []).filter((c) => Number.isFinite(c.x) && Number.isFinite(c.y));
  }

  get scales(): ScatterScales {
    // Centroid coordinates are folded into the domain so markers always sit
    // inside the plot (and a centroids-only chart still gets a real scale).
    const xs = [...this.safeData.map((d) => d.x), ...this.validCentroids.map((c) => c.x)].filter(Number.isFinite);
    const ys = [...this.safeData.map((d) => d.y), ...this.validCentroids.map((c) => c.y)].filter(Number.isFinite);
    const xTicks = niceTicks(Math.min(...xs), Math.max(...xs));
    const yTicks = niceTicks(Math.min(...ys), Math.max(...ys));
    const plotW = Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1);
    const plotH = Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1);
    return {
      xTicks,
      yTicks,
      xMin: xTicks[0]!,
      xMax: xTicks[xTicks.length - 1]!,
      yMin: yTicks[0]!,
      yMax: yTicks[yTicks.length - 1]!,
      plotW,
      plotH,
    };
  }

  get points(): ScatterPoint[] {
    const { xMin, xMax, yMin, yMax, plotW, plotH } = this.scales;
    return this.safeData.map((d, i) => ({
      cx: MARGIN.left + scaleLinear(d.x, xMin, xMax, 0, plotW),
      cy: MARGIN.top + scaleLinear(d.y, yMin, yMax, plotH, 0),
      r: typeof d.r === "number" && Number.isFinite(d.r) && d.r >= 0 ? Math.min(d.r, MAX_POINT_RADIUS) : this.radiusValue,
      datum: d,
      index: i,
      tone: d.tone ?? TONES[i % TONES.length]!,
    }));
  }

  get centroidMarks(): CentroidMark[] {
    const { xMin, xMax, yMin, yMax, plotW, plotH } = this.scales;
    return this.validCentroids.map((c, i) => ({
      cx: MARGIN.left + scaleLinear(c.x, xMin, xMax, 0, plotW),
      cy: MARGIN.top + scaleLinear(c.y, yMin, yMax, plotH, 0),
      tone: c.tone ?? TONES[i % TONES.length]!,
      label: c.label,
    }));
  }

  get yGridLines(): Array<{ value: number; y: number }> {
    const { yTicks, yMin, yMax, plotH } = this.scales;
    return yTicks.map((value) => ({ value, y: MARGIN.top + scaleLinear(value, yMin, yMax, plotH, 0) }));
  }

  get xTickEntries(): Array<{ value: number; x: number }> {
    const { xTicks, xMin, xMax, plotW } = this.scales;
    return xTicks.map((value) => ({ value, x: MARGIN.left + scaleLinear(value, xMin, xMax, 0, plotW) }));
  }

  get yAxisLabelY(): number {
    return MARGIN.top + this.scales.plotH / 2;
  }

  get yAxisLabelTransform(): string {
    return `rotate(-90 12 ${this.yAxisLabelY})`;
  }

  // --- Annotation overlay ----------------------------------------------------
  private get annotationContext() {
    const self = this;
    return {
      xScale: (v: number | string): number | null => {
        const { xMin, xMax, plotW } = self.scales;
        if (typeof v !== "number" || !Number.isFinite(v)) return null;
        if (v < xMin || v > xMax) return null;
        return scaleLinear(v, xMin, xMax, 0, plotW);
      },
      yScale: (v: number): number | null => {
        const { yMin, yMax, plotH } = self.scales;
        if (!Number.isFinite(v)) return null;
        if (v < yMin || v > yMax) return null;
        return scaleLinear(v, yMin, yMax, plotH, 0);
      },
      plotLeft: MARGIN.left,
      plotTop: MARGIN.top,
      plotWidth: self.scales.plotW,
      plotHeight: self.scales.plotH,
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

  // --- Data labels -----------------------------------------------------------
  get dataLabelItems(): Array<{ key: number; x: number; y: number; text: string; baseline: string }> {
    const opts = normalizeDataLabels(this.dataLabels);
    if (!opts.enabled) return [];
    return this.points.map((p) => {
      const text = p.datum.label ?? formatDataLabel(p.datum.y, opts, formatTick) ?? "";
      const center = opts.position === "center" || opts.position === "inside";
      return {
        key: p.index,
        x: p.cx,
        y: center ? p.cy : p.cy - (p.r + 5),
        text,
        baseline: center ? "middle" : "auto",
      };
    });
  }

  get dataValueItems(): string[] {
    return [
      ...this.safeData.map((d) => (d.label ? `${d.label}: x ${d.x}, y ${d.y}` : `x ${d.x}, y ${d.y}`)),
      ...this.validCentroids.map((c) =>
        c.label ? `Centroïde ${c.label}: (${c.x}, ${c.y})` : `Centroïde: (${c.x}, ${c.y})`,
      ),
      ...annotationDataListItems(this.annotations),
    ];
  }

  // --- Hover / crosshair -----------------------------------------------------
  private keyForPoint(d: ScatterPlotDatum): string {
    return d.label ?? `${d.x},${d.y}`;
  }

  get hoverKeys(): string[] {
    return this.safeData.map((d) => this.keyForPoint(d));
  }

  get activeIndex(): number {
    return resolveActiveIndex(this.hoverKey, this.hoveredIndex, this.hoverKeys);
  }

  get activePoint(): ScatterPoint | null {
    const idx = this.activeIndex;
    return idx >= 0 ? this.points[idx] ?? null : null;
  }

  get navEnabled(): boolean {
    return (this.keyboardNav === true || typeof this.onSelectKey === "function") && this.points.length > 0;
  }

  formatTickLabel(value: number): string {
    return formatTick(value);
  }

  pointClass(tone: ScatterPlotTone): string {
    return `st-scatterPlot__point st-scatterPlot__point--${tone}`;
  }

  centroidClass(tone: ScatterPlotTone): string {
    return `st-scatterPlot__centroid st-scatterPlot__centroid--${tone}`;
  }

  datapointLabel(p: ScatterPoint): string {
    return datapointAriaLabel(p.datum.label ?? `${p.datum.x}, ${p.datum.y}`, p.datum.y);
  }

  rovingTabIndexFor(index: number): number {
    return rovingTabIndex(index, this.focusedIndex, this.points.length);
  }

  private emitHoverKey(index: number | null): void {
    this.onHoverKeyChange?.(index == null ? null : this.hoverKeys[index] ?? null);
  }

  handleLeave(): void {
    this.hoveredIndex = null;
    this.emitHoverKey(null);
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

  handleDatapointFocus(index: number): void {
    this.focusedIndex = index;
    this.emitHoverKey(index);
  }

  handleDatapointKeyDown(event: KeyboardEvent, index: number): void {
    const action = datapointNavAction(event.key, index, this.points.length);
    if (!action) return;
    event.preventDefault();
    if (action.kind === "move") {
      this.focusedIndex = action.index;
      this.emitHoverKey(action.index);
    } else if (action.kind === "select") {
      this.onSelectKey?.(this.hoverKeys[index] ?? null);
    } else {
      this.focusedIndex = -1;
      this.emitHoverKey(null);
      this.onSelectKey?.(null);
    }
  }
}
