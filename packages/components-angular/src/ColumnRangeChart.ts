import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList, formatTick, niceTicks } from "./chartScale.js";

export type ColumnRangeChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ColumnRangeChartDatum = {
  category: string;
  low: number;
  high: number;
  tone?: ColumnRangeChartTone;
};

export type ColumnRangeChartProps = {
  data: ColumnRangeChartDatum[];
  width?: number;
  height?: number;
  orientation?: "vertical" | "horizontal";
  label: string;
  /**
   * Fixed value-axis domain `[min, max]`. When provided (and finite), the value
   * scale uses it instead of the data-derived min/max — letting several
   * ColumnRangeCharts in a grid share one scale. When absent or invalid, the
   * scale falls back to the auto data range (unchanged).
   */
  domain?: [number, number];
  class?: string;
};

@Component({
  selector: "st-column-range-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ColumnRangeChart {
  static readonly stComponentName = "ColumnRangeChart";
  readonly componentName = "ColumnRangeChart";
  @NgInput() data!: ColumnRangeChartDatum[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() orientation?: "vertical" | "horizontal";
  @NgInput() label!: string;
  @NgInput() domain?: [number, number];
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-columnRangeChart", this.classInput].filter(Boolean).join(" ");
  }
}
