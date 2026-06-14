import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList, labelColorForTone } from "./chartScale.js";

export type TreemapChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type TreemapChartDatum = {
  label: string;
  value: number;
  tone?: TreemapChartTone;
  children?: TreemapChartDatum[];
};

export type TreemapTiling = "squarified";

export type TreemapChartProps = {
  data: TreemapChartDatum[];
  tiling?: TreemapTiling;
  showLabels?: boolean;
  legend?: boolean;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

@Component({
  selector: "st-treemap-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class TreemapChart {
  static readonly stComponentName = "TreemapChart";
  readonly componentName = "TreemapChart";
  @NgInput() data!: TreemapChartDatum[];
  @NgInput() tiling?: TreemapTiling;
  @NgInput() showLabels?: boolean;
  @NgInput() legend?: boolean;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-treemapChart", this.classInput].filter(Boolean).join(" ");
  }
}
