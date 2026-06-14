import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type StatusHistoryTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type StatusHistoryBucket = {
  at: number;
  value: string | number;
  tone?: StatusHistoryTone;
};

export type StatusHistorySeries = {
  series: string;
  buckets: StatusHistoryBucket[];
};

export type StatusHistoryChartProps = {
  data: StatusHistorySeries[];
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

@Component({
  selector: "st-status-history-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class StatusHistoryChart {
  static readonly stComponentName = "StatusHistoryChart";
  readonly componentName = "StatusHistoryChart";
  @NgInput() data!: StatusHistorySeries[];
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-statusHistoryChart", this.classInput].filter(Boolean).join(" ");
  }
}
