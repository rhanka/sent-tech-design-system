import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type BoxPlotChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type BoxPlotChartDatum = {
  label: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: number[];
  tone?: BoxPlotChartTone;
};

export type BoxPlotChartProps = {
  data: BoxPlotChartDatum[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

@Component({
  selector: "st-box-plot-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class BoxPlotChart {
  static readonly stComponentName = "BoxPlotChart";
  readonly componentName = "BoxPlotChart";
  @NgInput() data!: BoxPlotChartDatum[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-boxPlotChart", this.classInput].filter(Boolean).join(" ");
  }
}
