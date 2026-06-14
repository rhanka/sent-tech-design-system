import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import {
  buildSmoothPath,
  CHART_MARGIN,
  chartDataList,
  formatTick,
  isNumeric,
  niceTicks,
  scaleLinear,
} from "./chartScale.js";

export type AreaSplineRangeChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type AreaSplineRangeChartDatum = {
  x: number | string;
  low: number;
  high: number;
};

export type AreaSplineRangeChartProps = {
  data: AreaSplineRangeChartDatum[];
  width?: number;
  height?: number;
  tone?: AreaSplineRangeChartTone;
  label: string;
  class?: string;
};

@Component({
  selector: "st-area-spline-range-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class AreaSplineRangeChart {
  static readonly stComponentName = "AreaSplineRangeChart";
  readonly componentName = "AreaSplineRangeChart";
  @NgInput() data!: AreaSplineRangeChartDatum[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() tone?: AreaSplineRangeChartTone;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-areaSplineRangeChart", this.classInput].filter(Boolean).join(" ");
  }
}
