import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type ParetoChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ParetoChartDatum = {
  label: string;
  value: number;
  tone?: ParetoChartTone;
};

export type ParetoChartProps = {
  data: ParetoChartDatum[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

@Component({
  selector: "st-pareto-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ParetoChart {
  static readonly stComponentName = "ParetoChart";
  readonly componentName = "ParetoChart";
  @NgInput() data!: ParetoChartDatum[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-paretoChart", this.classInput].filter(Boolean).join(" ");
  }
}
