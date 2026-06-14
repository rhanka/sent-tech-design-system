import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

import { contrastTextForTone } from "./chartContrast.js";

export type LollipopChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type LollipopChartDatum = {
  label: string;
  value: number;
  tone?: LollipopChartTone;
};

export type LollipopChartProps = {
  data: LollipopChartDatum[];
  width?: number;
  height?: number;
  orientation?: "vertical" | "horizontal";
  label: string;
  /**
   * Fixed value-axis domain `[min, max]`. When provided (and finite), the value
   * scale uses it instead of the data-derived min/max — letting several
   * LollipopCharts in a grid share one scale. When absent or invalid, the scale
   * falls back to the auto data range (unchanged).
   */
  domain?: [number, number];
  class?: string;
};

@Component({
  selector: "st-lollipop-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class LollipopChart {
  static readonly stComponentName = "LollipopChart";
  readonly componentName = "LollipopChart";
  @NgInput() data!: LollipopChartDatum[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() orientation?: "vertical" | "horizontal";
  @NgInput() label!: string;
  @NgInput() domain?: [number, number];
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-lollipopChart", this.classInput].filter(Boolean).join(" ");
  }
}
