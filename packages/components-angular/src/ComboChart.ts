import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { buildLinearPath, buildSmoothPath, chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

import {
  annotationDataListItems,
  polygonPoints,
  resolveAnnotations,
  type ChartAnnotation,
} from "./chartAnnotations.js";

import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";

import { keyForX, resolveActiveIndex } from "./chartCrosshair.js";

import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from "./chartKeyboardNav.js";

export type ComboChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ComboChartBarSeries = {
  label: string;
  data: number[];
  tone?: ComboChartTone;
};

export type ComboChartLineSeries = {
  label: string;
  data: number[];
  tone?: ComboChartTone;
  smooth?: boolean;
};

export type ComboChartProps = {
  categories: string[];
  bars?: ComboChartBarSeries[];
  lines?: ComboChartLineSeries[];
  leftAxisLabel?: string;
  rightAxisLabel?: string;
  legend?: boolean;
  /**
   * Interactive legend (FR-4). Ids/labels of bar/line series hidden from the
   * render (controlled by the parent; default = all visible). Hidden series
   * are omitted and their legend item is shown "off" (`aria-pressed`).
   * Undefined → legacy non-interactive legend, unless `onToggleSeries` is set.
   */
  hiddenSeries?: string[];
  /** Emitted on click / Enter / Space on a legend item. */
  onToggleSeries?: (seriesId: string) => void;
  /**
   * Annotation overlay in DATA space. The x coordinate is CATEGORICAL — it
   * matches a category by equality (band centre); the y coordinate (and
   * `value`/`from`/`to`) are LEFT (bar) value-axis numbers. Regions render
   * behind the bars, every other kind above. Additive: absent ⇒ unchanged.
   */
  annotations?: ChartAnnotation[];
  /**
   * Per-datum value labels on BOTH the bars and the line points. `false`/absent
   * (default) → none. `true` → each value with the chart's numeric formatter.
   * Object → `format(value)` and/or a `position` override. Labels are
   * `aria-hidden` — the values already live in the accessible ChartDataList.
   */
  dataLabels?: DataLabelsProp;
  /**
   * CONTROLLED synchronised hover key (FR-3). The key is the CATEGORY string.
   * When provided (string or null), the crosshair tracks this key instead of the
   * chart's internal pointer hover (null ⇒ nothing shown). Absent keeps the
   * legacy uncontrolled behaviour.
   */
  hoverKey?: string | null;
  /** Emitted when the user hovers a bar/point (its CATEGORY) or leaves (`null`). */
  onHoverKeyChange?: (key: string | null) => void;
  /**
   * FR-5 — keyboard navigation of the categories (roving tabindex). When `true`
   * (or implied by wiring `onSelectKey`), a focusable overlay of one column per
   * category is rendered: one tab stop, arrows move, Home/End jump, Enter/Space
   * select, Escape leaves. Absent ⇒ no overlay, rendering unchanged.
   */
  keyboardNav?: boolean;
  /** Emitted on Enter/Space (category) or `null` on Escape. */
  onSelectKey?: (key: string | null) => void;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

@Component({
  selector: "st-combo-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ComboChart {
  static readonly stComponentName = "ComboChart";
  readonly componentName = "ComboChart";
  @NgInput() categories!: string[];
  @NgInput() bars?: ComboChartBarSeries[];
  @NgInput() lines?: ComboChartLineSeries[];
  @NgInput() leftAxisLabel?: string;
  @NgInput() rightAxisLabel?: string;
  @NgInput() legend?: boolean;
  @NgInput() hiddenSeries?: string[];
  @NgInput() onToggleSeries?: (seriesId: string) => void;
  @NgInput() annotations?: ChartAnnotation[];
  @NgInput() dataLabels?: DataLabelsProp;
  @NgInput() hoverKey?: string | null;
  @NgInput() onHoverKeyChange?: (key: string | null) => void;
  @NgInput() keyboardNav?: boolean;
  @NgInput() onSelectKey?: (key: string | null) => void;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-comboChart", this.classInput].filter(Boolean).join(" ");
  }
}
