import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type HeikinAshiChartDatum = {
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type HeikinAshiChartProps = {
  data: HeikinAshiChartDatum[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

@Component({
  selector: "st-heikin-ashi-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class HeikinAshiChart {
  static readonly stComponentName = "HeikinAshiChart";
  readonly componentName = "HeikinAshiChart";
  @NgInput() data!: HeikinAshiChartDatum[];
  @NgInput() label!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-heikinAshiChart", this.classInput].filter(Boolean).join(" ");
  }
}
