import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

import { contrastTextForTone } from "./chartContrast.js";

import { GraphLegend } from "./GraphLegend.js";

export type DependencyWheelChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type DependencyWheelChartLink = {
  from: string;
  to: string;
  weight: number;
};

export type DependencyWheelChartProps = {
  data: DependencyWheelChartLink[];
  labels?: Record<string, string>;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

@Component({
  selector: "st-dependency-wheel-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class DependencyWheelChart {
  static readonly stComponentName = "DependencyWheelChart";
  readonly componentName = "DependencyWheelChart";
  @NgInput() data!: DependencyWheelChartLink[];
  @NgInput() labels?: Record<string, string>;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-dependencyWheelChart", this.classInput].filter(Boolean).join(" ");
  }
}
