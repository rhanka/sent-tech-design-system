import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type WaterfallType = "increase" | "decrease" | "total";

export type WaterfallChartDatum = {
  label: string;
  value: number;
  type?: WaterfallType;
};

export type WaterfallChartProps = {
  data: WaterfallChartDatum[];
  width?: number;
  height?: number;
  connectors?: boolean;
  format?: (value: number) => string;
  label: string;
  class?: string;
};

@Component({
  selector: "st-waterfall-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class WaterfallChart {
  static readonly stComponentName = "WaterfallChart";
  readonly componentName = "WaterfallChart";
  @NgInput() data!: WaterfallChartDatum[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() connectors?: boolean;
  @NgInput() format?: (value: number) => string;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-waterfallChart", this.classInput].filter(Boolean).join(" ");
  }
}
