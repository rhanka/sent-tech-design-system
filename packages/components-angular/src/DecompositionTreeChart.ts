import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type DecompositionTreeNode = {
  label: string;
  value: number;
  parent?: string;
};

export type DecompositionTreeLevel = {
  dimension: string;
  nodes: DecompositionTreeNode[];
};

export type DecompositionTreeData = {
  measure: string;
  levels: DecompositionTreeLevel[];
};

export type DecompositionTreeChartProps = {
  data: DecompositionTreeData;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

@Component({
  selector: "st-decomposition-tree-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class DecompositionTreeChart {
  static readonly stComponentName = "DecompositionTreeChart";
  readonly componentName = "DecompositionTreeChart";
  @NgInput() data!: DecompositionTreeData;
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-decompositionTreeChart", this.classInput].filter(Boolean).join(" ");
  }
}
