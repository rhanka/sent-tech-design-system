import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type BulletChartDatum = {
  label: string;
  value: number;
  target: number;
  ranges?: number[];
};

export type BulletChartProps = {
  data: BulletChartDatum[];
  label: string;
  orientation?: "horizontal" | "vertical";
  width?: number;
  height?: number;
  class?: string;
};

@Component({
  selector: "st-bullet-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class BulletChart {
  static readonly stComponentName = "BulletChart";
  readonly componentName = "BulletChart";
  @NgInput() data!: BulletChartDatum[];
  @NgInput() label!: string;
  @NgInput() orientation?: "horizontal" | "vertical";
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-bulletChart", this.classInput].filter(Boolean).join(" ");
  }
}
