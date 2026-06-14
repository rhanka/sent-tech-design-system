import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

import { contrastTextForTone } from "./chartContrast.js";

export type PackedBubblesChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type PackedBubblesChartDatum = {
  label: string;
  value: number;
  tone?: PackedBubblesChartTone;
};

export type PackedBubblesChartProps = {
  data: PackedBubblesChartDatum[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

@Component({
  selector: "st-packed-bubbles-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class PackedBubblesChart {
  static readonly stComponentName = "PackedBubblesChart";
  readonly componentName = "PackedBubblesChart";
  @NgInput() data!: PackedBubblesChartDatum[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-packedBubblesChart", this.classInput].filter(Boolean).join(" ");
  }
}
