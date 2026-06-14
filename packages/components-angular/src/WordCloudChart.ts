import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type WordCloudChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type WordCloudChartWord = {
  text: string;
  weight: number;
  tone?: WordCloudChartTone;
};

export type WordCloudChartProps = {
  data: WordCloudChartWord[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

@Component({
  selector: "st-word-cloud-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class WordCloudChart {
  static readonly stComponentName = "WordCloudChart";
  readonly componentName = "WordCloudChart";
  @NgInput() data!: WordCloudChartWord[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-wordCloudChart", this.classInput].filter(Boolean).join(" ");
  }
}
