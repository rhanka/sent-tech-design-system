import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import {
  CHART_MARGIN,
  chartDataList,
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
   * Annotation overlay in DATA space. The x coordinate is CATEGORICAL — it
   * matches a bar by its `label` (centre of band) and is ignored otherwise; the
   * y coordinate (and `value`/`from`/`to`) are value-axis numbers. Regions
   * render behind the bars, every other kind above. Additive: absent ⇒
   * unchanged.
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

@Component({
  selector: "st-bar-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class BarChart {
  static readonly stComponentName = "BarChart";
  readonly componentName = "BarChart";
  @NgInput() data!: BarChartDatum[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() orientation?: "vertical" | "horizontal";
  @NgInput() label!: string;
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
    return ["st-barChart", this.classInput].filter(Boolean).join(" ");
  }
}
