import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

import { contrastTextForTone } from "./chartContrast.js";

export type SunburstChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type SunburstChartDatum = {
  label: string;
  value?: number;
  tone?: SunburstChartTone;
  children?: SunburstChartDatum[];
};

export type SunburstChartProps = {
  data: SunburstChartDatum;
  width?: number;
  height?: number;
  legend?: boolean;
  label: string;
  class?: string;
};

@Component({
  selector: "st-sunburst-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class SunburstChart {
  static readonly stComponentName = "SunburstChart";
  readonly componentName = "SunburstChart";
  @NgInput() data!: SunburstChartDatum;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() legend?: boolean;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-sunburstChart", this.classInput].filter(Boolean).join(" ");
  }
}
