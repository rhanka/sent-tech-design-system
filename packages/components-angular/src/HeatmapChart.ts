import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type HeatmapChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type HeatmapChartDatum = {
  x: string;
  y: string;
  value: number;
  tone?: HeatmapChartTone;
};

export type HeatmapChartProps = {
  data: HeatmapChartDatum[];
  width?: number;
  height?: number;
  legend?: boolean;
  label: string;
  class?: string;
};

@Component({
  selector: "st-heatmap-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class HeatmapChart {
  static readonly stComponentName = "HeatmapChart";
  readonly componentName = "HeatmapChart";
  @NgInput() data!: HeatmapChartDatum[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() legend?: boolean;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-heatmapChart", this.classInput].filter(Boolean).join(" ");
  }
}
