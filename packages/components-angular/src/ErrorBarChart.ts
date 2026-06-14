import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { CHART_MARGIN, chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

import { GraphLegend } from "./GraphLegend.js";

export type ErrorBarChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ErrorBarChartDatum = {
  category: string;
  value: number;
  low: number;
  high: number;
};

export type ErrorBarChartProps = {
  data: ErrorBarChartDatum[];
  width?: number;
  height?: number;
  tone?: ErrorBarChartTone;
  label: string;
  class?: string;
};

@Component({
  selector: "st-error-bar-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ErrorBarChart {
  static readonly stComponentName = "ErrorBarChart";
  readonly componentName = "ErrorBarChart";
  @NgInput() data!: ErrorBarChartDatum[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() tone?: ErrorBarChartTone;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-errorBarChart", this.classInput].filter(Boolean).join(" ");
  }
}
