import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type WaffleTone =
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

export type WaffleChartDatum = {
  label: string;
  value: number;
  tone?: WaffleTone;
};

export type WaffleChartProps = {
  data: WaffleChartDatum[];
  totalCells?: number;
  columns?: number;
  label?: string;
  size?: number;
  class?: string;
};

@Component({
  selector: "st-waffle-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class WaffleChart {
  static readonly stComponentName = "WaffleChart";
  readonly componentName = "WaffleChart";
  @NgInput() data!: WaffleChartDatum[];
  @NgInput() totalCells?: number;
  @NgInput() columns?: number;
  @NgInput() label?: string;
  @NgInput() size?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-waffleChart", this.classInput].filter(Boolean).join(" ");
  }
}
