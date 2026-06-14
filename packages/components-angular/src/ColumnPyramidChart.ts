import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type ColumnPyramidChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ColumnPyramidChartDatum = {
  category: string;
  value: number;
  tone?: ColumnPyramidChartTone;
};

export type ColumnPyramidChartProps = {
  data: ColumnPyramidChartDatum[];
  width?: number;
  height?: number;
  label: string;
  /** Default tone for columns whose datum has no `tone`. */
  tone?: ColumnPyramidChartTone;
  class?: string;
};

@Component({
  selector: "st-column-pyramid-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ColumnPyramidChart {
  static readonly stComponentName = "ColumnPyramidChart";
  readonly componentName = "ColumnPyramidChart";
  @NgInput() data!: ColumnPyramidChartDatum[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput() tone?: ColumnPyramidChartTone;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-columnPyramidChart", this.classInput].filter(Boolean).join(" ");
  }
}
