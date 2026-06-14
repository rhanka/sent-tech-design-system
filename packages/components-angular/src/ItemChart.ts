import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type ItemChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ItemChartDatum = {
  label: string;
  value: number;
  tone?: ItemChartTone;
};

export type ItemChartSeat = {
  x: number;
  y: number;
  r: number;
  tone: ItemChartTone;
  groupIndex: number;
};

export type ItemChartProps = {
  data: ItemChartDatum[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

@Component({
  selector: "st-item-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ItemChart {
  static readonly stComponentName = "ItemChart";
  readonly componentName = "ItemChart";
  @NgInput() data!: ItemChartDatum[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-itemChart", this.classInput].filter(Boolean).join(" ");
  }
}
