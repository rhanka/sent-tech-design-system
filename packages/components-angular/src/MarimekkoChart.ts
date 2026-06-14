import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

import { contrastTextForTone } from "./chartContrast.js";

export type MarimekkoChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type MarimekkoChartSegment = {
  label: string;
  value: number;
  tone?: MarimekkoChartTone;
};

export type MarimekkoChartDatum = {
  label: string;
  width: number;
  segments: MarimekkoChartSegment[];
};

export type MarimekkoChartProps = {
  data: MarimekkoChartDatum[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

@Component({
  selector: "st-marimekko-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class MarimekkoChart {
  static readonly stComponentName = "MarimekkoChart";
  readonly componentName = "MarimekkoChart";
  @NgInput() data!: MarimekkoChartDatum[];
  @NgInput() label!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-marimekkoChart", this.classInput].filter(Boolean).join(" ");
  }
}
