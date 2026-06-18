import { Component, ElementRef, Input as NgInput, QueryList, ViewChildren } from "@angular/core";

import { classNames } from "./classNames.js";

import {
  CHART_MARGIN,
  clampFraction,
  extendValueDomain,
  fixedLogTicks,
  fixedTicks,
  formatTick,
  logTicks,
  niceTicks,
  overlayDataListItems,
  overlayToneClass,
  smallestPositive,
  validLinearDomain,
  validLogDomain,
  type ChartBand,
  type ChartGoalLine,
  type ChartReferenceLine,
  type ChartScale,
} from "./chartScale.js";

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

export type BarChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type BarChartDatum = {
  label: string;
  value: number;
  tone?: BarChartTone;
  /** Lower error-bar extent (value-axis units). Drawn only when finite. */
  errorLow?: number;
  /** Upper error-bar extent (value-axis units). Drawn only when finite. */
  errorHigh?: number;
};

export type BarChartProps = {
  data: BarChartDatum[];
  width?: number;
  height?: number;
  orientation?: "vertical" | "horizontal";
  label: string;
  /**
   * Fixed value-axis domain `[min, max]`. When provided (and finite), the value
   * scale uses it instead of the data-derived min/max — letting several
   * BarCharts in a grid share one scale (small multiples). When absent or
   * invalid, the scale falls back to the auto data range (unchanged).
   */
  domain?: [number, number];
  /**
   * Keys of the currently selected bars (a bar's key is its `label`).
   * CONTROLLED — the parent owns the toggle; the component never stores
   * selection. When non-empty the selected bars stay full opacity (+ accent)
   * and the rest dim; when empty every bar is normal. Defaults to [].
   */
  selectedKeys?: string[];
  /**
   * Called with the bar's key (its `label`) when the user selects it. When
   * provided, an ACCESSIBLE row of filter chips (real <button>s) is rendered
   * OUTSIDE the aria-hidden SVG — that is the keyboard + screen-reader surface.
   * The SVG bars themselves stay decorative (aria-hidden) and only offer a
   * mouse click shortcut for sighted pointer users. When omitted the chart is
   * purely presentational (no interactivity, unchanged).
   */
  onSelect?: (key: string) => void;
  /** Reference lines on the value axis (default `axis: "y"`). */
  referenceLines?: ChartReferenceLine[];
  /** Shaded value-axis bands between `from`..`to`. */
  bands?: ChartBand[];
  /** A single goal line, emphasised above the bars. */
  goalLine?: ChartGoalLine;
  /**
   * Annotation overlay in DATA space. The x coordinate is categorical — it
   * matches a bar by its `label`; y/value coordinates are value-axis numbers.
   */
  annotations?: ChartAnnotation[];
  /**
   * Per-bar value labels. `false`/absent (default) → none. `true` → each bar's
   * value with the chart's numeric formatter. Object → `format(value)` and/or a
   * `position` override. Default position is `outside` (above the bar in
   * vertical mode, past the bar end in horizontal mode). Labels are
   * `aria-hidden` — the values already live in the accessible ChartDataList.
   */
  dataLabels?: DataLabelsProp;
  /**
   * Value-axis scale. `"linear"` (default) is unchanged. `"log"` switches the
   * value axis to base-10 logarithmic — values `<= 0` are ignored for
   * domain/ticks and clamped to the lowest tick when positioned.
   */
  scale?: ChartScale;
  /** Inverts the value axis (high values toward the origin). Default false. */
  invertAxis?: boolean;
  /**
   * Toggles the legend if the chart has one. BarChart has no separate legend
   * surface (its filter chips double as one); accepted for cross-chart parity
   * and otherwise ignored.
   */
  showLegend?: boolean;
  /**
   * CONTROLLED synchronised hover key (FR-3). A bar's key is its `label`. When
   * provided (string or null), the crosshair + tooltip track this key instead of
   * the chart's internal pointer hover (null ⇒ nothing shown), letting a parent
   * share one hover channel across several aligned charts. Absent (`undefined`)
   * keeps the legacy uncontrolled behaviour. Independent of `selectedKeys`.
   */
  hoverKey?: string | null;
  /**
   * Emitted when the user hovers a bar (its `label`) or leaves the plot (`null`).
   * Always fired on pointer move/leave — even while CONTROLLED — so dataviz can
   * keep the shared hover channel in sync.
   */
  onHoverKeyChange?: (key: string | null) => void;
  /**
   * FR-5 — keyboard navigation of the data points (roving tabindex). When `true`
   * (or implied by wiring `onSelectKey`), a thin focusable overlay is rendered
   * over the bars: the chart owns ONE tab stop, ←/↑/→/↓ move the focus between
   * bars (data order), Home/End jump to the first/last, Enter/Space select the
   * focused bar (`onSelectKey`), Escape leaves the navigation. Each focused bar
   * announces its `label` + value. Absent ⇒ no overlay, rendering unchanged.
   */
  keyboardNav?: boolean;
  /**
   * Emitted when the user selects the focused bar via Enter/Space (its `label`),
   * or `null` when the navigation is left via Escape. Wiring it also turns the
   * keyboard navigation on. Independent of `onSelect`/`selectedKeys`.
   */
  onSelectKey?: (key: string | null) => void;
  class?: string;
};

type BarGeometry = {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  datum: BarChartDatum;
  tone: BarChartTone;
};

type GridItem = {
  key: string;
  value: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  labelX: number;
  labelY: number;
  textAnchor: "start" | "middle" | "end";
  dominantBaseline?: string;
};

type CategoryLabel = {
  key: string;
  x: number;
  y: number;
  text: string;
  textAnchor: "start" | "middle" | "end";
  dominantBaseline?: string;
};

type BandRect = {
  key: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  tone?: ChartBand["tone"];
};

type RefLine = {
  key: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  label?: string;
  tone?: ChartReferenceLine["tone"];
};

type GoalGeom = {
  p: number;
  label?: string;
  value: number;
};

type ErrorGeom = {
  key: string;
  stem: { x1: number; y1: number; x2: number; y2: number };
  capLow: { x1: number; y1: number; x2: number; y2: number };
  capHigh: { x1: number; y1: number; x2: number; y2: number };
};

type DataLabelItem = {
  key: string;
  x: number;
  y: number;
  text: string;
  anchor: "start" | "middle" | "end";
  baseline: string;
};

type AnnotationRegion = Extract<ResolvedAnnotation, { kind: "region" }>;
type AnnotationLine = Extract<ResolvedAnnotation, { kind: "line" }>;
type AnnotationShape = Extract<ResolvedAnnotation, { kind: "shape" }>;
type AnnotationPoint = Extract<ResolvedAnnotation, { kind: "point" }>;
type AnnotationLabel = Extract<ResolvedAnnotation, { kind: "label" }>;
type AnnotationAbove = AnnotationLine | AnnotationShape | AnnotationPoint | AnnotationLabel;

@Component({
  selector: "st-bar-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-barChart__visual"
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
          @for (grid of gridItems; track grid.key) {
            <line class="st-barChart__grid" [attr.x1]="grid.x1" [attr.x2]="grid.x2" [attr.y1]="grid.y1" [attr.y2]="grid.y2"></line>
            <text
              class="st-barChart__tickLabel"
              [attr.x]="grid.labelX"
              [attr.y]="grid.labelY"
              [attr.text-anchor]="grid.textAnchor"
              [attr.dominant-baseline]="grid.dominantBaseline"
            >
              {{ formatTickLabel(grid.value) }}
            </text>
          }
          <line class="st-barChart__axis" [attr.x1]="margin.left" [attr.x2]="margin.left" [attr.y1]="margin.top" [attr.y2]="heightValue - margin.bottom"></line>
          <line class="st-barChart__axis" [attr.x1]="margin.left" [attr.x2]="widthValue - margin.right" [attr.y1]="heightValue - margin.bottom" [attr.y2]="heightValue - margin.bottom"></line>

          @for (category of categoryLabels; track category.key) {
            <text
              class="st-barChart__categoryLabel"
              [attr.x]="category.x"
              [attr.y]="category.y"
              [attr.text-anchor]="category.textAnchor"
              [attr.dominant-baseline]="category.dominantBaseline"
            >
              {{ category.text }}
            </text>
          }

          @for (band of bandRects; track band.key) {
            <rect [class]="bandClass(band)" [attr.x]="band.x" [attr.y]="band.y" [attr.width]="band.width" [attr.height]="band.height"></rect>
            @if (band.label) {
              <text class="st-barChart__overlayLabel" [attr.x]="band.x + 4" [attr.y]="band.y + 11">{{ band.label }}</text>
            }
          }
          @for (line of refLines; track line.key) {
            <line [class]="refLineClass(line)" [attr.x1]="line.x1" [attr.x2]="line.x2" [attr.y1]="line.y1" [attr.y2]="line.y2"></line>
            @if (line.label) {
              <text
                class="st-barChart__overlayLabel"
                [attr.x]="refLineLabelX(line)"
                [attr.y]="refLineLabelY(line)"
                [attr.text-anchor]="isVertical ? 'end' : 'start'"
              >
                {{ line.label }}
              </text>
            }
          }

          @if (annotationRegions.length > 0) {
            <g class="st-barChart__annotations st-barChart__annotations--behind">
              @for (annotation of annotationRegions; track annotation.key) {
                <rect class="st-barChart__annotationRegion" [attr.x]="annotation.x" [attr.y]="annotation.y" [attr.width]="annotation.width" [attr.height]="annotation.height"></rect>
                @if (annotation.label) {
                  <text class="st-barChart__annotationLabel" [attr.x]="annotation.x + 4" [attr.y]="annotation.y + 11">{{ annotation.label }}</text>
                }
              }
            </g>
          }

          @for (bar of bars; track bar.datum.label) {
            <rect
              [class]="barClass(bar)"
              [attr.x]="bar.x"
              [attr.y]="bar.y"
              [attr.width]="bar.width"
              [attr.height]="bar.height"
              rx="2"
              [attr.data-chart-index]="bar.index"
              (click)="selectBar(bar.datum.label)"
            ></rect>
          }

          @for (error of errorBarGeom; track error.key) {
            <g class="st-barChart__errorBar">
              <line class="st-barChart__errorStem" [attr.x1]="error.stem.x1" [attr.y1]="error.stem.y1" [attr.x2]="error.stem.x2" [attr.y2]="error.stem.y2"></line>
              <line class="st-barChart__errorCap" [attr.x1]="error.capLow.x1" [attr.y1]="error.capLow.y1" [attr.x2]="error.capLow.x2" [attr.y2]="error.capLow.y2"></line>
              <line class="st-barChart__errorCap" [attr.x1]="error.capHigh.x1" [attr.y1]="error.capHigh.y1" [attr.x2]="error.capHigh.x2" [attr.y2]="error.capHigh.y2"></line>
            </g>
          }

          @if (goalGeom; as goal) {
            @if (isVertical) {
              <line class="st-barChart__goalLine" [attr.x1]="margin.left" [attr.x2]="margin.left + plotWidth" [attr.y1]="goal.p" [attr.y2]="goal.p"></line>
              <text class="st-barChart__goalLabel" [attr.x]="margin.left + plotWidth - 4" [attr.y]="goal.p - 4" text-anchor="end">{{ goal.label ?? "Objectif " + goal.value }}</text>
            } @else {
              <line class="st-barChart__goalLine" [attr.x1]="goal.p" [attr.x2]="goal.p" [attr.y1]="margin.top" [attr.y2]="margin.top + plotHeight"></line>
              <text class="st-barChart__goalLabel" [attr.x]="goal.p + 4" [attr.y]="margin.top + 11" text-anchor="start">{{ goal.label ?? "Objectif " + goal.value }}</text>
            }
          }

          @if (annotationAbove.length > 0) {
            <g class="st-barChart__annotations st-barChart__annotations--above">
              @for (annotation of annotationAbove; track annotation.key) {
                @switch (annotation.kind) {
                  @case ("line") {
                    <line class="st-barChart__annotationLine" [attr.x1]="annotation.x1" [attr.y1]="annotation.y1" [attr.x2]="annotation.x2" [attr.y2]="annotation.y2"></line>
                    @if (annotation.label) {
                      <text
                        class="st-barChart__annotationLabel"
                        [attr.x]="annotationLineLabelX(annotation)"
                        [attr.y]="annotationLineLabelY(annotation)"
                        [attr.text-anchor]="annotationLineTextAnchor(annotation)"
                      >
                        {{ annotation.label }}
                      </text>
                    }
                  }
                  @case ("shape") {
                    <polygon class="st-barChart__annotationShape" [attr.points]="annotationShapePoints(annotation)"></polygon>
                    @if (annotation.label) {
                      <text class="st-barChart__annotationLabel" [attr.x]="annotation.labelX" [attr.y]="annotation.labelY" text-anchor="middle">{{ annotation.label }}</text>
                    }
                  }
                  @case ("point") {
                    <circle class="st-barChart__annotationPoint" [attr.cx]="annotation.x" [attr.cy]="annotation.y" r="4.5"></circle>
                    @if (annotation.label) {
                      <text class="st-barChart__annotationLabel" [attr.x]="annotation.x" [attr.y]="annotation.y - 8" text-anchor="middle">{{ annotation.label }}</text>
                    }
                  }
                  @case ("label") {
                    <text class="st-barChart__annotationText" [attr.x]="annotation.x" [attr.y]="annotation.y" [attr.text-anchor]="annotation.anchor">{{ annotation.text }}</text>
                  }
                }
              }
            </g>
          }

          @for (label of dataLabelItems; track label.key) {
            <text
              class="st-barChart__dataLabel"
              aria-hidden="true"
              [attr.x]="label.x"
              [attr.y]="label.y"
              [attr.text-anchor]="label.anchor"
              [attr.dominant-baseline]="label.baseline"
            >
              {{ label.text }}
            </text>
          }

          @if (hoveredBar; as bar) {
            <g class="st-barChart__crosshair" aria-hidden="true">
              @if (isVertical) {
                <line class="st-barChart__crosshairLine" [attr.x1]="bar.cx" [attr.x2]="bar.cx" [attr.y1]="margin.top" [attr.y2]="margin.top + plotHeight"></line>
              } @else {
                <line class="st-barChart__crosshairLine" [attr.x1]="margin.left" [attr.x2]="margin.left + plotWidth" [attr.y1]="bar.cy" [attr.y2]="bar.cy"></line>
              }
            </g>
          }
        </svg>

        @if (navEnabled) {
          <svg
            class="st-barChart__navLayer"
            [attr.viewBox]="viewBox"
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            height="100%"
            role="group"
            [attr.aria-label]="label + ' — points de données'"
          >
            @for (bar of bars; track bar.datum.label) {
              <rect
                #navDatum
                class="st-barChart__navDatum"
                [attr.x]="bar.x"
                [attr.y]="bar.y"
                [attr.width]="bar.width"
                [attr.height]="bar.height"
                role="img"
                [attr.tabindex]="rovingTabIndexFor(bar.index)"
                [attr.aria-label]="datapointLabel(bar)"
                (keydown)="handleDatapointKeyDown($event, bar.index)"
                (focus)="handleDatapointFocus(bar.index)"
              ></rect>
            }
          </svg>
        }
      </div>

      @if (interactive) {
        <div class="st-barChart__filters" role="group" [attr.aria-label]="'Filtrer par ' + label">
          @for (bar of bars; track bar.datum.label) {
            <button
              type="button"
              [class]="filterChipClass(bar)"
              [attr.aria-pressed]="selectedSet.has(bar.datum.label) ? 'true' : 'false'"
              (click)="selectBar(bar.datum.label)"
            >
              <span class="st-barChart__filterSwatch" aria-hidden="true"></span>
              {{ bar.datum.label }}: {{ bar.datum.value }}
            </button>
          }
        </div>
      }

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredBar; as bar) {
        <div
          class="st-barChart__tooltip"
          role="presentation"
          [style.left.%]="tooltipLeft(bar)"
          [style.top.%]="tooltipTop(bar)"
        >
          <span class="st-barChart__tooltipLabel">{{ bar.datum.label }}</span>
          <span class="st-barChart__tooltipValue">{{ bar.datum.value }}</span>
        </div>
      }
    </div>
  `,
})
export class BarChart {
  static readonly stComponentName = "BarChart";
  readonly componentName = "BarChart";
  readonly margin = CHART_MARGIN;

  @ViewChildren("navDatum") private navDatumElements?: QueryList<ElementRef<SVGElement>>;

  private hoveredIndex: number | null = null;
  private focusedIndex = -1;

  @NgInput() data: BarChartDatum[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() orientation?: "vertical" | "horizontal";
  @NgInput() label = "";
  @NgInput() domain?: [number, number];
  @NgInput() selectedKeys?: string[];
  @NgInput() onSelect?: (key: string) => void;
  @NgInput() referenceLines?: ChartReferenceLine[];
  @NgInput() bands?: ChartBand[];
  @NgInput() goalLine?: ChartGoalLine;
  @NgInput() annotations?: ChartAnnotation[];
  @NgInput() dataLabels?: DataLabelsProp;
  @NgInput() scale?: ChartScale;
  @NgInput() invertAxis?: boolean;
  @NgInput() showLegend?: boolean;
  @NgInput() hoverKey?: string | null;
  @NgInput() onHoverKeyChange?: (key: string | null) => void;
  @NgInput() keyboardNav?: boolean;
  @NgInput() onSelectKey?: (key: string | null) => void;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-barChart", this.classInput);
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

  get orientationValue(): "vertical" | "horizontal" {
    return this.orientation ?? "vertical";
  }

  get isVertical(): boolean {
    return this.orientationValue === "vertical";
  }

  get plotWidth(): number {
    return Math.max(this.widthValue - CHART_MARGIN.left - CHART_MARGIN.right, 1);
  }

  get plotHeight(): number {
    return Math.max(this.heightValue - CHART_MARGIN.top - CHART_MARGIN.bottom, 1);
  }

  get selectedSet(): Set<string> {
    return new Set(this.selectedKeys ?? []);
  }

  get hasSelection(): boolean {
    return this.selectedSet.size > 0;
  }

  get interactive(): boolean {
    return typeof this.onSelect === "function";
  }

  get goal(): ChartGoalLine | null {
    return this.goalLine && Number.isFinite(this.goalLine.value) ? this.goalLine : null;
  }

  get valueAxis(): "x" | "y" {
    return this.isVertical ? "y" : "x";
  }

  get errorExtents(): number[] {
    return this.data.flatMap((datum) =>
      [datum.errorLow, datum.errorHigh].filter((value): value is number => value !== undefined && Number.isFinite(value)),
    );
  }

  get ticks(): number[] {
    const isLog = this.scale === "log";
    const validDomain = isLog ? validLogDomain(this.domain) : validLinearDomain(this.domain);
    const valueReferenceLines = (this.referenceLines ?? []).filter((line) => (line.axis ?? "y") === this.valueAxis);
    const values = this.data.map((datum) => datum.value);

    if (isLog) {
      const posOverlays = [
        ...valueReferenceLines.map((line) => line.value),
        ...(this.bands ?? []).flatMap((band) => [band.from, band.to]),
        ...(this.goal ? [this.goal.value] : []),
        ...this.errorExtents,
      ];
      let lo: number;
      let hi: number;
      if (validDomain) {
        lo = validDomain[0];
        hi = validDomain[1];
      } else {
        lo = smallestPositive(...values, ...posOverlays);
        hi = Math.max(lo, ...values.filter((value) => value > 0), ...posOverlays.filter((value) => value > 0));
      }
      return validDomain ? fixedLogTicks(lo, hi) : logTicks(lo, hi);
    }

    let minRaw = validDomain ? validDomain[0] : Math.min(0, ...values);
    let maxRaw = validDomain ? validDomain[1] : Math.max(0, ...values);
    if (!validDomain) {
      [minRaw, maxRaw] = extendValueDomain(minRaw, maxRaw, {
        referenceLines: this.referenceLines,
        referenceAxis: this.valueAxis,
        bands: this.bands,
        goalLine: this.goal,
        extraValues: this.errorExtents,
      });
    }
    return validDomain ? fixedTicks(minRaw, maxRaw, 5) : niceTicks(minRaw, maxRaw, 5);
  }

  get domainMin(): number {
    return this.ticks[0] ?? 0;
  }

  get domainMax(): number {
    return this.ticks[this.ticks.length - 1] ?? this.domainMin;
  }

  get baselineValue(): number {
    return this.scale === "log" ? this.domainMin : Math.min(this.domainMax, Math.max(this.domainMin, 0));
  }

  valueFraction(value: number): number {
    let fraction: number;
    if (this.scale === "log") {
      const lo = Math.log10(this.domainMin);
      const hi = Math.log10(this.domainMax);
      const clamped = value > 0 ? value : this.domainMin;
      fraction = hi === lo ? 0 : (Math.log10(clamped) - lo) / (hi - lo);
    } else {
      fraction = this.domainMax === this.domainMin ? 0 : (value - this.domainMin) / (this.domainMax - this.domainMin);
    }
    return clampFraction(this.invertAxis ? 1 - fraction : fraction);
  }

  valuePos(value: number): number {
    return this.isVertical
      ? CHART_MARGIN.top + this.plotHeight * (1 - this.valueFraction(value))
      : CHART_MARGIN.left + this.plotWidth * this.valueFraction(value);
  }

  get bars(): BarGeometry[] {
    if (this.data.length === 0) return [];
    if (this.isVertical) {
      const band = this.plotWidth / this.data.length;
      const barWidth = band * 0.62;
      const zeroY = this.plotHeight * (1 - this.valueFraction(this.baselineValue));
      return this.data.map((datum, index) => {
        const valueY = this.plotHeight * (1 - this.valueFraction(datum.value));
        const y = Math.min(valueY, zeroY);
        const height = Math.abs(zeroY - valueY);
        const x = CHART_MARGIN.left + band * index + (band - barWidth) / 2;
        return {
          index,
          x,
          y: CHART_MARGIN.top + y,
          width: barWidth,
          height: Math.max(height, 0.5),
          cx: CHART_MARGIN.left + band * (index + 0.5),
          cy: CHART_MARGIN.top + valueY,
          datum,
          tone: (datum.tone ?? "category1") as BarChartTone,
        };
      });
    }

    const band = this.plotHeight / this.data.length;
    const barHeight = band * 0.62;
    const zeroX = this.plotWidth * this.valueFraction(this.baselineValue);
    return this.data.map((datum, index) => {
      const valueX = this.plotWidth * this.valueFraction(datum.value);
      const x = Math.min(valueX, zeroX);
      const width = Math.abs(valueX - zeroX);
      const y = CHART_MARGIN.top + band * index + (band - barHeight) / 2;
      return {
        index,
        x: CHART_MARGIN.left + x,
        y,
        width: Math.max(width, 0.5),
        height: barHeight,
        cx: CHART_MARGIN.left + valueX,
        cy: CHART_MARGIN.top + band * (index + 0.5),
        datum,
        tone: (datum.tone ?? "category1") as BarChartTone,
      };
    });
  }

  get gridItems(): GridItem[] {
    return this.ticks.map((tick) => {
      if (this.isVertical) {
        const y = CHART_MARGIN.top + this.plotHeight * (1 - this.valueFraction(tick));
        return {
          key: `y-${tick}`,
          value: tick,
          x1: CHART_MARGIN.left,
          x2: CHART_MARGIN.left + this.plotWidth,
          y1: y,
          y2: y,
          labelX: CHART_MARGIN.left - 6,
          labelY: y,
          textAnchor: "end",
          dominantBaseline: "middle",
        };
      }
      const x = CHART_MARGIN.left + this.plotWidth * this.valueFraction(tick);
      return {
        key: `x-${tick}`,
        value: tick,
        x1: x,
        x2: x,
        y1: CHART_MARGIN.top,
        y2: CHART_MARGIN.top + this.plotHeight,
        labelX: x,
        labelY: this.heightValue - CHART_MARGIN.bottom + 16,
        textAnchor: "middle",
      };
    });
  }

  get categoryLabels(): CategoryLabel[] {
    return this.bars.map((bar) =>
      this.isVertical
        ? {
            key: bar.datum.label,
            x: bar.x + bar.width / 2,
            y: this.heightValue - CHART_MARGIN.bottom + 16,
            text: bar.datum.label,
            textAnchor: "middle",
          }
        : {
            key: bar.datum.label,
            x: CHART_MARGIN.left - 6,
            y: bar.y + bar.height / 2,
            text: bar.datum.label,
            textAnchor: "end",
            dominantBaseline: "middle",
          },
    );
  }

  get bandRects(): BandRect[] {
    return (this.bands ?? [])
      .filter((band) => Number.isFinite(band.from) && Number.isFinite(band.to))
      .map((band, key) => {
        const p1 = this.valuePos(band.from);
        const p2 = this.valuePos(band.to);
        return this.isVertical
          ? {
              key,
              x: CHART_MARGIN.left,
              y: Math.min(p1, p2),
              width: this.plotWidth,
              height: Math.max(Math.abs(p2 - p1), 0.5),
              label: band.label,
              tone: band.tone,
            }
          : {
              key,
              x: Math.min(p1, p2),
              y: CHART_MARGIN.top,
              width: Math.max(Math.abs(p2 - p1), 0.5),
              height: this.plotHeight,
              label: band.label,
              tone: band.tone,
            };
      });
  }

  get refLines(): RefLine[] {
    return (this.referenceLines ?? [])
      .filter((line) => Number.isFinite(line.value))
      .map((line, key) => {
        const p = this.valuePos(line.value);
        return this.isVertical
          ? { key, x1: CHART_MARGIN.left, x2: CHART_MARGIN.left + this.plotWidth, y1: p, y2: p, label: line.label, tone: line.tone }
          : { key, x1: p, x2: p, y1: CHART_MARGIN.top, y2: CHART_MARGIN.top + this.plotHeight, label: line.label, tone: line.tone };
      });
  }

  private categoryPixel(value: number | string): number | null {
    const bar = this.bars.find((item) => item.datum.label === String(value));
    if (!bar) return null;
    return this.isVertical ? bar.cx - CHART_MARGIN.left : bar.cy - CHART_MARGIN.top;
  }

  private valuePixelRel(value: number): number | null {
    if (!Number.isFinite(value)) return null;
    return this.valuePos(value) - (this.isVertical ? CHART_MARGIN.top : CHART_MARGIN.left);
  }

  private transposeAnnotations(list: ChartAnnotation[] | undefined): ChartAnnotation[] | undefined {
    if (!list || this.isVertical) return list;
    return list.map((annotation): ChartAnnotation => {
      switch (annotation.kind) {
        case "line":
          return { ...annotation, axis: annotation.axis === "x" ? "y" : "x" };
        case "region":
          return { ...annotation, axis: annotation.axis === "x" ? "y" : "x" };
        case "point":
          return { ...annotation, x: annotation.y, y: typeof annotation.x === "number" ? annotation.x : Number.NaN };
        case "label":
          return { ...annotation, x: annotation.y, y: typeof annotation.x === "number" ? annotation.x : Number.NaN };
        case "shape":
          return {
            ...annotation,
            points: annotation.points.map((point) => ({
              x: point.y,
              y: typeof point.x === "number" ? point.x : Number.NaN,
            })),
          };
      }
    });
  }

  get resolvedAnnotations(): ResolvedAnnotation[] {
    const annXScale = (value: number | string): number | null =>
      this.isVertical ? this.categoryPixel(value) : typeof value === "number" ? this.valuePixelRel(value) : null;
    const annYScale = (value: number): number | null => (this.isVertical ? this.valuePixelRel(value) : this.categoryPixel(value));
    return resolveAnnotations(this.transposeAnnotations(this.annotations), {
      xScale: annXScale,
      yScale: annYScale,
      plotLeft: CHART_MARGIN.left,
      plotTop: CHART_MARGIN.top,
      plotWidth: this.plotWidth,
      plotHeight: this.plotHeight,
    });
  }

  get annotationRegions(): AnnotationRegion[] {
    return this.resolvedAnnotations.filter((annotation): annotation is AnnotationRegion => annotation.kind === "region");
  }

  get annotationAbove(): AnnotationAbove[] {
    return this.resolvedAnnotations.filter((annotation): annotation is AnnotationAbove => annotation.kind !== "region");
  }

  get goalGeom(): GoalGeom | null {
    return this.goal ? { p: this.valuePos(this.goal.value), label: this.goal.label, value: this.goal.value } : null;
  }

  get errorBarGeom(): ErrorGeom[] {
    const out: ErrorGeom[] = [];
    for (const bar of this.bars) {
      const { errorLow, errorHigh } = bar.datum;
      const hasLow = errorLow !== undefined && Number.isFinite(errorLow);
      const hasHigh = errorHigh !== undefined && Number.isFinite(errorHigh);
      if (!hasLow && !hasHigh) continue;
      const low = this.valuePos(hasLow ? (errorLow as number) : bar.datum.value);
      const high = this.valuePos(hasHigh ? (errorHigh as number) : bar.datum.value);
      const cap = 4;
      if (this.isVertical) {
        const cx = bar.x + bar.width / 2;
        out.push({
          key: bar.datum.label,
          stem: { x1: cx, y1: low, x2: cx, y2: high },
          capLow: { x1: cx - cap, y1: low, x2: cx + cap, y2: low },
          capHigh: { x1: cx - cap, y1: high, x2: cx + cap, y2: high },
        });
      } else {
        const cy = bar.y + bar.height / 2;
        out.push({
          key: bar.datum.label,
          stem: { x1: low, y1: cy, x2: high, y2: cy },
          capLow: { x1: low, y1: cy - cap, x2: low, y2: cy + cap },
          capHigh: { x1: high, y1: cy - cap, x2: high, y2: cy + cap },
        });
      }
    }
    return out;
  }

  get dataLabelItems(): DataLabelItem[] {
    const options = normalizeDataLabels(this.dataLabels);
    if (!options.enabled) return [];
    const items: DataLabelItem[] = [];
    for (const bar of this.bars) {
      const text = formatDataLabel(bar.datum.value, options, formatTick);
      const position = options.position ?? "outside";
      const inside = position === "inside" || position === "center";
      if (!text) continue;
      if (this.isVertical) {
        items.push({
          key: bar.datum.label,
          x: bar.cx,
          y: inside ? bar.y + bar.height / 2 : bar.cy - 6,
          text,
          anchor: "middle",
          baseline: inside ? "middle" : "auto",
        });
      } else {
        items.push({
          key: bar.datum.label,
          x: inside ? bar.x + bar.width / 2 : bar.cx + 4,
          y: bar.cy,
          text,
          anchor: inside ? "middle" : "start",
          baseline: "middle",
        });
      }
    }
    return items;
  }

  get dataValueItems(): string[] {
    return [
      ...this.data.map((datum) => `${datum.label}: ${datum.value}`),
      ...overlayDataListItems({
        referenceLines: this.referenceLines,
        bands: this.bands,
        goalLine: this.goal,
        trend: null,
      }),
      ...annotationDataListItems(this.annotations),
    ];
  }

  get hoverKeys(): string[] {
    return this.bars.map((bar) => bar.datum.label);
  }

  get activeIndex(): number {
    return resolveActiveIndex(this.hoverKey, this.hoveredIndex, this.hoverKeys);
  }

  get hoveredBar(): BarGeometry | null {
    return this.activeIndex >= 0 ? this.bars[this.activeIndex] ?? null : null;
  }

  get navEnabled(): boolean {
    return (this.keyboardNav === true || this.onSelectKey !== undefined) && this.bars.length > 0;
  }

  formatTickLabel(value: number): string {
    return formatTick(value);
  }

  bandClass(band: BandRect): string {
    return classNames("st-barChart__band", overlayToneClass("st-barChart__band", band.tone));
  }

  refLineClass(line: RefLine): string {
    return classNames("st-barChart__refLine", overlayToneClass("st-barChart__refLine", line.tone));
  }

  refLineLabelX(line: RefLine): number {
    return this.isVertical ? CHART_MARGIN.left + this.plotWidth - 4 : line.x1 + 4;
  }

  refLineLabelY(line: RefLine): number {
    return this.isVertical ? line.y1 - 4 : CHART_MARGIN.top + 11;
  }

  annotationLineLabelX(annotation: AnnotationLine): number {
    return annotation.axis === "x" ? annotation.x1 + 4 : CHART_MARGIN.left + this.plotWidth - 4;
  }

  annotationLineLabelY(annotation: AnnotationLine): number {
    return annotation.axis === "x" ? CHART_MARGIN.top + 11 : annotation.y1 - 4;
  }

  annotationLineTextAnchor(annotation: AnnotationLine): "start" | "end" {
    return annotation.axis === "x" ? "start" : "end";
  }

  annotationShapePoints(annotation: AnnotationShape): string {
    return polygonPoints(annotation.points);
  }

  barClass(bar: BarGeometry): string {
    const selected = this.selectedSet.has(bar.datum.label);
    return classNames(
      "st-barChart__bar",
      `st-barChart__bar--${bar.tone}`,
      selected && "st-barChart__bar--selected",
      this.hasSelection && !selected && "st-barChart__bar--dim",
      this.interactive && "st-barChart__bar--interactive",
    );
  }

  filterChipClass(bar: BarGeometry): string {
    return classNames(
      "st-barChart__filterChip",
      `st-barChart__filterChip--${bar.tone}`,
      this.selectedSet.has(bar.datum.label) && "st-barChart__filterChip--selected",
    );
  }

  selectBar(key: string): void {
    if (!this.interactive) return;
    this.onSelect?.(key);
  }

  tooltipLeft(bar: BarGeometry): number {
    return (bar.cx / this.widthValue) * 100;
  }

  tooltipTop(bar: BarGeometry): number {
    return (bar.cy / this.heightValue) * 100;
  }

  rovingTabIndexFor(index: number): number {
    return rovingTabIndex(index, this.focusedIndex, this.bars.length);
  }

  datapointLabel(bar: BarGeometry): string {
    return datapointAriaLabel(bar.datum.label, bar.datum.value);
  }

  private emitHoverKey(index: number | null): void {
    this.onHoverKeyChange?.(index == null ? null : this.hoverKeys[index] ?? null);
  }

  handleLeave(): void {
    this.hoveredIndex = null;
    this.emitHoverKey(null);
  }

  handleVisualPointerMove(event: PointerEvent): void {
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
    const action = datapointNavAction(event.key, index, this.bars.length);
    if (!action) return;
    event.preventDefault();
    if (action.kind === "move") {
      this.focusDatum(action.index);
    } else if (action.kind === "select") {
      this.onSelectKey?.(this.bars[index]?.datum.label ?? null);
    } else {
      this.focusedIndex = -1;
      this.emitHoverKey(null);
      this.onSelectKey?.(null);
      (event.currentTarget as { blur?: () => void } | null)?.blur?.();
    }
  }
}
