import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";

export type StackedBarTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type StackedBarSegment = {
  label: string;
  value: number;
  tone?: StackedBarTone;
};

export type StackedBarDatum = {
  label: string;
  segments: StackedBarSegment[];
};

export type StackedBarChartProps = {
  data: StackedBarDatum[];
  width?: number;
  height?: number;
  label: string;
  showLegend?: boolean;
  /**
   * Per-segment value labels. `false`/absent (default) → none. `true` → each
   * segment's value with the chart's numeric formatter. Object → `format(value)`
   * and/or a `position` override (default `center` of the segment). Segments too
   * short to host a legible label are skipped. Labels are `aria-hidden` — the
   * values already live in the accessible ChartDataList.
   */
  dataLabels?: DataLabelsProp;
  /**
   * Interactive legend (FR-4). Ids/labels of series hidden from the render
   * (controlled by the parent; default = all visible). Each segment whose
   * `label` ∈ `hiddenSeries` is omitted and its legend item is shown "off"
   * (`aria-pressed`). Undefined → legacy non-interactive legend, unless
   * `onToggleSeries` is provided.
   */
  hiddenSeries?: string[];
  /** Emitted on click / Enter / Space on a legend item. */
  onToggleSeries?: (seriesId: string) => void;
  class?: string;
};

@Component({
  selector: "st-stacked-bar-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class StackedBarChart {
  static readonly stComponentName = "StackedBarChart";
  readonly componentName = "StackedBarChart";
  @NgInput() data!: StackedBarDatum[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput() showLegend?: boolean;
  @NgInput() dataLabels?: DataLabelsProp;
  @NgInput() hiddenSeries?: string[];
  @NgInput() onToggleSeries?: (seriesId: string) => void;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-stackedBarChart", this.classInput].filter(Boolean).join(" ");
  }
}
