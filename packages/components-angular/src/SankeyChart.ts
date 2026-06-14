import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type SankeyChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type SankeyChartNode = {
  id: string;
  label: string;
  tone?: SankeyChartTone;
};

export type SankeyChartLink = {
  source: string;
  target: string;
  value: number;
  tone?: SankeyChartTone;
};

export type SankeyChartProps = {
  nodes: SankeyChartNode[];
  links: SankeyChartLink[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

@Component({
  selector: "st-sankey-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class SankeyChart {
  static readonly stComponentName = "SankeyChart";
  readonly componentName = "SankeyChart";
  @NgInput() nodes!: SankeyChartNode[];
  @NgInput() links!: SankeyChartLink[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-sankeyChart", this.classInput].filter(Boolean).join(" ");
  }
}
