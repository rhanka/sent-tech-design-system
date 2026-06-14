import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type Density2DTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type Density2DPoint = {
  x: number;
  y: number;
  weight?: number;
};

export type Density2DChartProps = {
  data: Density2DPoint[];
  bins?: number;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

@Component({
  selector: "st-density2-d-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Density2DChart {
  static readonly stComponentName = "Density2DChart";
  readonly componentName = "Density2DChart";
  @NgInput() data!: Density2DPoint[];
  @NgInput() bins?: number;
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-density2DChart", this.classInput].filter(Boolean).join(" ");
  }
}
