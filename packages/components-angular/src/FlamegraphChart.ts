import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type FlamegraphNode = {
  name: string;
  value: number;
  children?: FlamegraphNode[];
};

export type FlamegraphChartProps = {
  data: FlamegraphNode;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

@Component({
  selector: "st-flamegraph-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class FlamegraphChart {
  static readonly stComponentName = "FlamegraphChart";
  readonly componentName = "FlamegraphChart";
  @NgInput() data!: FlamegraphNode;
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-flamegraphChart", this.classInput].filter(Boolean).join(" ");
  }
}
