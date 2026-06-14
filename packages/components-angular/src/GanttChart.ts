import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type GanttChartTask = {
  task: string;
  start: number;
  end: number;
  category?: string;
};

export type GanttChartProps = {
  data: GanttChartTask[];
  label: string;
  width?: number;
  height?: number;
  marker?: number;
  class?: string;
};

@Component({
  selector: "st-gantt-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class GanttChart {
  static readonly stComponentName = "GanttChart";
  readonly componentName = "GanttChart";
  @NgInput() data!: GanttChartTask[];
  @NgInput() label!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() marker?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-ganttChart", this.classInput].filter(Boolean).join(" ");
  }
}
