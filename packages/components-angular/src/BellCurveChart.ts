import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import {
  CHART_MARGIN,
  buildLinearPath,
  buildSmoothPath,
  chartDataList,
  formatTick,
  niceTicks,
  scaleLinear,
} from "./chartScale.js";

export type BellCurveChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type BellCurveChartProps = {
  data: number[];
  width?: number;
  height?: number;
  tone?: BellCurveChartTone;
  smooth?: boolean;
  intervals?: number;
  label: string;
  class?: string;
};

@Component({
  selector: "st-bell-curve-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class BellCurveChart {
  static readonly stComponentName = "BellCurveChart";
  readonly componentName = "BellCurveChart";
  @NgInput() data!: number[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() tone?: BellCurveChartTone;
  @NgInput() smooth?: boolean;
  @NgInput() intervals?: number;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-bellCurveChart", this.classInput].filter(Boolean).join(" ");
  }
}
