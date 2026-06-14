import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type AnomalySwimLaneTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type AnomalySwimLaneBucket = {
  at: number;
  score: number;
};

export type AnomalySwimLaneSeries = {
  job: string;
  buckets: AnomalySwimLaneBucket[];
};

export type AnomalySwimLaneChartProps = {
  data: AnomalySwimLaneSeries[];
  max?: number;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

@Component({
  selector: "st-anomaly-swim-lane-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class AnomalySwimLaneChart {
  static readonly stComponentName = "AnomalySwimLaneChart";
  readonly componentName = "AnomalySwimLaneChart";
  @NgInput() data!: AnomalySwimLaneSeries[];
  @NgInput() max?: number;
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-anomalySwimLaneChart", this.classInput].filter(Boolean).join(" ");
  }
}
