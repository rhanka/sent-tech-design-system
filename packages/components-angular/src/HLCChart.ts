import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type HLCChartDatum = {
  label: string;
  high: number;
  low: number;
  close: number;
};

export type HLCChartProps = {
  data: HLCChartDatum[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

@Component({
  selector: "st-hlc-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class HLCChart {
  static readonly stComponentName = "HLCChart";
  readonly componentName = "HLCChart";
  @NgInput() data!: HLCChartDatum[];
  @NgInput() label!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-hlcchart", this.classInput].filter(Boolean).join(" ");
  }
}
