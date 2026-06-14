import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

import { contrastTextForTone } from "./chartContrast.js";

export type VariablePieChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type VariablePieChartDatum = {
  label: string;
  value: number;
  z: number;
  tone?: VariablePieChartTone;
};

export type VariablePieChartProps = {
  data: VariablePieChartDatum[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

@Component({
  selector: "st-variable-pie-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class VariablePieChart {
  static readonly stComponentName = "VariablePieChart";
  readonly componentName = "VariablePieChart";
  @NgInput() data!: VariablePieChartDatum[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-variablePieChart", this.classInput].filter(Boolean).join(" ");
  }
}
