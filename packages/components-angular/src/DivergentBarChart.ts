import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type DivergentBarChartTone = "positive" | "negative" | "neutral";

export type DivergentBarChartDatum = {
  label: string;
  value: number;
  tone?: DivergentBarChartTone;
};

export type DivergentBarChartProps = {
  data: DivergentBarChartDatum[];
  width?: number;
  height?: number;
  domain?: [number, number];
  format?: (value: number) => string;
  showLegend?: boolean;
  label: string;
  class?: string;
};

@Component({
  selector: "st-divergent-bar-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class DivergentBarChart {
  static readonly stComponentName = "DivergentBarChart";
  readonly componentName = "DivergentBarChart";
  @NgInput() data!: DivergentBarChartDatum[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() domain?: [number, number];
  @NgInput() format?: (value: number) => string;
  @NgInput() showLegend?: boolean;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-divergentBarChart", this.classInput].filter(Boolean).join(" ");
  }
}
