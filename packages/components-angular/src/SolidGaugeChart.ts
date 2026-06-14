import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type SolidGaugeTone =
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

export type SolidGaugeThreshold = {
  value: number;
  tone: SolidGaugeTone;
};

export type SolidGaugeFormat = "number" | "percent";

export type SolidGaugeChartProps = {
  value: number;
  min?: number;
  max?: number;
  thresholds?: SolidGaugeThreshold[];
  innerRadius?: number;
  label?: string;
  format?: SolidGaugeFormat;
  unit?: string;
  size?: number;
  startAngle?: number;
  endAngle?: number;
  class?: string;
};

@Component({
  selector: "st-solid-gauge-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class SolidGaugeChart {
  static readonly stComponentName = "SolidGaugeChart";
  readonly componentName = "SolidGaugeChart";
  @NgInput() value!: number;
  @NgInput() min?: number;
  @NgInput() max?: number;
  @NgInput() thresholds?: SolidGaugeThreshold[];
  @NgInput() innerRadius?: number;
  @NgInput() label?: string;
  @NgInput() format?: SolidGaugeFormat;
  @NgInput() unit?: string;
  @NgInput() size?: number;
  @NgInput() startAngle?: number;
  @NgInput() endAngle?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-solidGaugeChart", this.classInput].filter(Boolean).join(" ");
  }
}
