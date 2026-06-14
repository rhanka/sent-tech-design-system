import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type GaugeChartTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type GaugeChartThreshold = {
  value: number;
  tone: GaugeChartTone;
};

export type GaugeChartFormat = "number" | "percent";

export type GaugeChartProps = {
  value: number;
  min?: number;
  max?: number;
  thresholds?: GaugeChartThreshold[];
  label?: string;
  format?: GaugeChartFormat;
  unit?: string;
  size?: number;
  thickness?: number;
  startAngle?: number;
  endAngle?: number;
  class?: string;
};

@Component({
  selector: "st-gauge-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class GaugeChart {
  static readonly stComponentName = "GaugeChart";
  readonly componentName = "GaugeChart";
  @NgInput() value!: number;
  @NgInput() min?: number;
  @NgInput() max?: number;
  @NgInput() thresholds?: GaugeChartThreshold[];
  @NgInput() label?: string;
  @NgInput() format?: GaugeChartFormat;
  @NgInput() unit?: string;
  @NgInput() size?: number;
  @NgInput() thickness?: number;
  @NgInput() startAngle?: number;
  @NgInput() endAngle?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-gaugeChart", this.classInput].filter(Boolean).join(" ");
  }
}
