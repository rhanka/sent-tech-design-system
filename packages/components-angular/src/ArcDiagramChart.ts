import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

import { GraphLegend } from "./GraphLegend.js";

export type ArcDiagramChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ArcDiagramChartLink = {
  from: string;
  to: string;
  weight: number;
};

export type ArcDiagramChartProps = {
  data: ArcDiagramChartLink[];
  labels?: Record<string, string>;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

@Component({
  selector: "st-arc-diagram-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ArcDiagramChart {
  static readonly stComponentName = "ArcDiagramChart";
  readonly componentName = "ArcDiagramChart";
  @NgInput() data!: ArcDiagramChartLink[];
  @NgInput() labels?: Record<string, string>;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-arcDiagramChart", this.classInput].filter(Boolean).join(" ");
  }
}
