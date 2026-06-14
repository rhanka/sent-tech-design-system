import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type VennChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type VennChartArea = {
  sets: string[];
  value: number;
};

export type VennChartProps = {
  data: VennChartArea[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

@Component({
  selector: "st-venn-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class VennChart {
  static readonly stComponentName = "VennChart";
  readonly componentName = "VennChart";
  @NgInput() data!: VennChartArea[];
  @NgInput() label!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-vennChart", this.classInput].filter(Boolean).join(" ");
  }
}
