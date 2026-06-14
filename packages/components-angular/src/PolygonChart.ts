import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type PolygonChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type PolygonChartPoint = {
  x: number;
  y: number;
};

export type PolygonChartProps = {
  data: PolygonChartPoint[];
  label: string;
  tone?: PolygonChartTone;
  width?: number;
  height?: number;
  class?: string;
};

@Component({
  selector: "st-polygon-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class PolygonChart {
  static readonly stComponentName = "PolygonChart";
  readonly componentName = "PolygonChart";
  @NgInput() data!: PolygonChartPoint[];
  @NgInput() label!: string;
  @NgInput() tone?: PolygonChartTone;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-polygonChart", this.classInput].filter(Boolean).join(" ");
  }
}
