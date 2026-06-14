import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type CalendarHeatmapChartDatum = {
  date: string;
  value: number;
};

export type CalendarHeatmapChartProps = {
  data: CalendarHeatmapChartDatum[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

@Component({
  selector: "st-calendar-heatmap-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class CalendarHeatmapChart {
  static readonly stComponentName = "CalendarHeatmapChart";
  readonly componentName = "CalendarHeatmapChart";
  @NgInput() data!: CalendarHeatmapChartDatum[];
  @NgInput() label!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-calendarHeatmapChart", this.classInput].filter(Boolean).join(" ");
  }
}
