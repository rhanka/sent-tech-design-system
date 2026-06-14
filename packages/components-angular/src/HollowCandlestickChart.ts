import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type HollowCandlestickChartDatum = {
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type HollowCandlestickChartProps = {
  data: HollowCandlestickChartDatum[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

@Component({
  selector: "st-hollow-candlestick-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class HollowCandlestickChart {
  static readonly stComponentName = "HollowCandlestickChart";
  readonly componentName = "HollowCandlestickChart";
  @NgInput() data!: HollowCandlestickChartDatum[];
  @NgInput() label!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-hollowCandlestickChart", this.classInput].filter(Boolean).join(" ");
  }
}
