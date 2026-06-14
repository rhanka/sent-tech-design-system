import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { buildLinearPath, buildSmoothPath, chartDataList, scaleLinear } from "./chartScale.js";

export type StreamgraphChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type StreamgraphChartSeriesValue = {
  label: string;
  value: number;
  tone?: StreamgraphChartTone;
};

export type StreamgraphChartDatum = {
  category: string;
  values: StreamgraphChartSeriesValue[];
};

export type StreamgraphChartProps = {
  data: StreamgraphChartDatum[];
  width?: number;
  height?: number;
  label: string;
  smooth?: boolean;
  showLegend?: boolean;
  class?: string;
};

@Component({
  selector: "st-streamgraph-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class StreamgraphChart {
  static readonly stComponentName = "StreamgraphChart";
  readonly componentName = "StreamgraphChart";
  @NgInput() data!: StreamgraphChartDatum[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput() smooth?: boolean;
  @NgInput() showLegend?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-streamgraphChart", this.classInput].filter(Boolean).join(" ");
  }
}
