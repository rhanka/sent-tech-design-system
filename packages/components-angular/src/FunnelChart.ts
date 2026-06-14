import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList, labelColorForTone } from "./chartScale.js";

export type FunnelChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type FunnelChartDatum = {
  label: string;
  value: number;
  tone?: FunnelChartTone;
};

export type FunnelChartProps = {
  data: FunnelChartDatum[];
  orientation?: "vertical" | "horizontal";
  showPercentages?: boolean;
  percentMode?: "ofFirst" | "ofPrevious";
  legend?: boolean;
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

@Component({
  selector: "st-funnel-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class FunnelChart {
  static readonly stComponentName = "FunnelChart";
  readonly componentName = "FunnelChart";
  @NgInput() data!: FunnelChartDatum[];
  @NgInput() orientation?: "vertical" | "horizontal";
  @NgInput() showPercentages?: boolean;
  @NgInput() percentMode?: "ofFirst" | "ofPrevious";
  @NgInput() legend?: boolean;
  @NgInput() label!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-funnelChart", this.classInput].filter(Boolean).join(" ");
  }
}
