import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";

export type DonutChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type DonutChartDatum = {
  label: string;
  value: number;
  tone?: DonutChartTone;
};

export type DonutChartProps = {
  data: DonutChartDatum[];
  size?: number;
  thickness?: number;
  centerLabel?: string | null;
  /**
   * Per-slice value labels. `false`/absent (default) → none. `true` → each slice's
   * value with the default formatter. Object → `format(value)` and/or a `position`
   * override (default `center` of the arc). Slices too thin to fit a legible label
   * are skipped. Labels are `aria-hidden` — the values already live in the
   * accessible ChartDataList.
   */
  dataLabels?: DataLabelsProp;
  label: string;
  class?: string;
};

@Component({
  selector: "st-donut-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class DonutChart {
  static readonly stComponentName = "DonutChart";
  readonly componentName = "DonutChart";
  @NgInput() data!: DonutChartDatum[];
  @NgInput() size?: number;
  @NgInput() thickness?: number;
  @NgInput() centerLabel?: string | null;
  @NgInput() dataLabels?: DataLabelsProp;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-donutChart", this.classInput].filter(Boolean).join(" ");
  }
}
