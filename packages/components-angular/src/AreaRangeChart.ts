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

export type AreaRangeChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type AreaRangeChartDatum = {
  x: number | string;
  low: number;
  high: number;
};

export type AreaRangeChartProps = {
  data: AreaRangeChartDatum[];
  width?: number;
  height?: number;
  tone?: AreaRangeChartTone;
  smooth?: boolean;
  label: string;
  class?: string;
};

@Component({
  selector: "st-area-range-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class AreaRangeChart {
  static readonly stComponentName = "AreaRangeChart";
  readonly componentName = "AreaRangeChart";
  @NgInput() data!: AreaRangeChartDatum[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() tone?: AreaRangeChartTone;
  @NgInput() smooth?: boolean;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-areaRangeChart", this.classInput].filter(Boolean).join(" ");
  }
}
