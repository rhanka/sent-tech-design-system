import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type ParallelCoordinatesChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ParallelAxis = {
  key: string;
  label: string;
  min?: number;
  max?: number;
};

export type ParallelCoordinatesChartProps = {
  axes: ParallelAxis[];
  data: Record<string, unknown>[];
  label: string;
  // FIX: prop is `tones` (PLURAL) — consistency with other charts
  tones?: ParallelCoordinatesChartTone[];
  width?: number;
  height?: number;
  class?: string;
};

@Component({
  selector: "st-parallel-coordinates-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ParallelCoordinatesChart {
  static readonly stComponentName = "ParallelCoordinatesChart";
  readonly componentName = "ParallelCoordinatesChart";
  @NgInput() axes!: ParallelAxis[];
  @NgInput() data!: Record<string, unknown>[];
  @NgInput() label!: string;
  @NgInput() tones?: ParallelCoordinatesChartTone[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-parallelCoordinatesChart", this.classInput].filter(Boolean).join(" ");
  }
}
