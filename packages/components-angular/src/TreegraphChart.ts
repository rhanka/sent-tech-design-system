import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type TreegraphChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type TreegraphChartNode = {
  id: string;
  parentId?: string | null;
  label: string;
  tone?: TreegraphChartTone;
};

export type TreegraphChartProps = {
  data: TreegraphChartNode[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

@Component({
  selector: "st-treegraph-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class TreegraphChart {
  static readonly stComponentName = "TreegraphChart";
  readonly componentName = "TreegraphChart";
  @NgInput() data!: TreegraphChartNode[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-treegraphChart", this.classInput].filter(Boolean).join(" ");
  }
}
