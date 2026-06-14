import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type HistogramChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type HistogramChartBin = {
  label: string;
  value: number;
  tone?: HistogramChartTone;
};

export type HistogramChartDatum = number | HistogramChartBin;

export type HistogramChartProps = {
  data: HistogramChartDatum[];
  bins?: number;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

@Component({
  selector: "st-histogram-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class HistogramChart {
  static readonly stComponentName = "HistogramChart";
  readonly componentName = "HistogramChart";
  @NgInput() data!: HistogramChartDatum[];
  @NgInput() bins?: number;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-histogramChart", this.classInput].filter(Boolean).join(" ");
  }
}
