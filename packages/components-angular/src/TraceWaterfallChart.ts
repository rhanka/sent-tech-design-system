import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type TraceSpan = {
  spanId: string;
  parentSpanId?: string | null;
  service: string;
  start: number;
  duration: number;
};

export type TraceWaterfallChartProps = {
  data: { spans: TraceSpan[] };
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

@Component({
  selector: "st-trace-waterfall-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class TraceWaterfallChart {
  static readonly stComponentName = "TraceWaterfallChart";
  readonly componentName = "TraceWaterfallChart";
  @NgInput() data!: { spans: TraceSpan[] };
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-traceWaterfallChart", this.classInput].filter(Boolean).join(" ");
  }
}
