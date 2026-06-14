import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type RadarChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type RadarChartSeries = {
  label: string;
  values: number[];
  tone?: RadarChartTone;
};

export type RadarChartProps = {
  axes: string[];
  series: RadarChartSeries[];
  maxValue?: number;
  levels?: number;
  width?: number;
  height?: number;
  legend?: boolean;
  label: string;
  class?: string;
};

@Component({
  selector: "st-radar-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class RadarChart {
  static readonly stComponentName = "RadarChart";
  readonly componentName = "RadarChart";
  @NgInput() axes!: string[];
  @NgInput() series!: RadarChartSeries[];
  @NgInput() maxValue?: number;
  @NgInput() levels?: number;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() legend?: boolean;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-radarChart", this.classInput].filter(Boolean).join(" ");
  }
}
