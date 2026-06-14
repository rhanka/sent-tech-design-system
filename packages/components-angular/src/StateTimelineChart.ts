import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type StateTimelineTone =
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

export type StateTimelineSegment = {
  start: number;
  end: number;
  state: string | number;
  tone?: StateTimelineTone;
};

export type StateTimelineSeries = {
  series: string;
  segments: StateTimelineSegment[];
};

export type StateTimelineChartProps = {
  data: StateTimelineSeries[];
  label?: string;
  width?: number;
  height?: number;
  class?: string;
};

@Component({
  selector: "st-state-timeline-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class StateTimelineChart {
  static readonly stComponentName = "StateTimelineChart";
  readonly componentName = "StateTimelineChart";
  @NgInput() data!: StateTimelineSeries[];
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-stateTimelineChart", this.classInput].filter(Boolean).join(" ");
  }
}
