import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type ViolinChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ViolinChartDatum = {
  label: string;
  values: number[];
  tone?: ViolinChartTone;
};

export type ViolinChartProps = {
  data: ViolinChartDatum[];
  bins?: number;
  quartiles?: boolean;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

@Component({
  selector: "st-violin-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ViolinChart {
  static readonly stComponentName = "ViolinChart";
  readonly componentName = "ViolinChart";
  @NgInput() data!: ViolinChartDatum[];
  @NgInput() bins?: number;
  @NgInput() quartiles?: boolean;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-violinChart", this.classInput].filter(Boolean).join(" ");
  }
}
