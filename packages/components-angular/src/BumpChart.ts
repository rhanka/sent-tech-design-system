import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type BumpChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type BumpChartSeries = {
  label: string;
  ranks: (number | null | undefined)[];
  tone?: BumpChartTone;
};

export type BumpChartProps = {
  data: BumpChartSeries[];
  categories: string[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

@Component({
  selector: "st-bump-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class BumpChart {
  static readonly stComponentName = "BumpChart";
  readonly componentName = "BumpChart";
  @NgInput() data!: BumpChartSeries[];
  @NgInput() categories!: string[];
  @NgInput() label!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-bumpChart", this.classInput].filter(Boolean).join(" ");
  }
}
