import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type TimelineChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type TimelineChartEvent = {
  /** Point on the axis (year, day index, ordinal step…). */
  position: number;
  /** Required short label, shown above/below the marker (alternated). */
  label: string;
  /** Optional longer description, surfaced in the accessible list + tooltip. */
  description?: string;
  /** Optional explicit categorical tone; otherwise cycles category1..8. */
  tone?: TimelineChartTone;
};

export type TimelineChartProps = {
  data: TimelineChartEvent[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

@Component({
  selector: "st-timeline-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class TimelineChart {
  static readonly stComponentName = "TimelineChart";
  readonly componentName = "TimelineChart";
  @NgInput() data!: TimelineChartEvent[];
  @NgInput() label!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-timelineChart", this.classInput].filter(Boolean).join(" ");
  }
}
