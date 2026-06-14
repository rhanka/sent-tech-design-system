import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import {
  CHART_MARGIN,
  chartDataList,
  formatTick,
  isNumeric,
  niceTicks,
  scaleLinear,
} from "./chartScale.js";

export type StepLineChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type StepLineChartDatum = {
  x: number | string;
  y: number;
};

export type StepLineChartProps = {
  data: StepLineChartDatum[];
  width?: number;
  height?: number;
  tone?: StepLineChartTone;
  label: string;
  class?: string;
};

@Component({
  selector: "st-step-line-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class StepLineChart {
  static readonly stComponentName = "StepLineChart";
  readonly componentName = "StepLineChart";
  @NgInput() data!: StepLineChartDatum[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() tone?: StepLineChartTone;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-stepLineChart", this.classInput].filter(Boolean).join(" ");
  }
}
