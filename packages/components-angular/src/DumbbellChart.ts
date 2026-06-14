import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { CHART_MARGIN, chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

import { GraphLegend } from "./GraphLegend.js";

export type DumbbellChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type DumbbellChartDatum = {
  category: string;
  low: number;
  high: number;
};

export type DumbbellChartProps = {
  data: DumbbellChartDatum[];
  width?: number;
  height?: number;
  lowTone?: DumbbellChartTone;
  highTone?: DumbbellChartTone;
  lowLabel?: string;
  highLabel?: string;
  label: string;
  class?: string;
};

@Component({
  selector: "st-dumbbell-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class DumbbellChart {
  static readonly stComponentName = "DumbbellChart";
  readonly componentName = "DumbbellChart";
  @NgInput() data!: DumbbellChartDatum[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() lowTone?: DumbbellChartTone;
  @NgInput() highTone?: DumbbellChartTone;
  @NgInput() lowLabel?: string;
  @NgInput() highLabel?: string;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-dumbbellChart", this.classInput].filter(Boolean).join(" ");
  }
}
