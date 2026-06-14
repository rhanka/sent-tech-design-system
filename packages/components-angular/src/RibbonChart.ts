import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type RibbonChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type RibbonChartDatum = {
  category: string;
  period: string | number;
  value: number;
  tone?: RibbonChartTone;
};

export type RibbonChartProps = {
  data: RibbonChartDatum[];
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

@Component({
  selector: "st-ribbon-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class RibbonChart {
  static readonly stComponentName = "RibbonChart";
  readonly componentName = "RibbonChart";
  @NgInput() data!: RibbonChartDatum[];
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-ribbonChart", this.classInput].filter(Boolean).join(" ");
  }
}
