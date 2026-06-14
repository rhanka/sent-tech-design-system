import { Component, Input as NgInput } from "@angular/core";

export type ContourChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ContourChartDatum = {
  x: number;
  y: number;
  value: number;
};

export type ContourChartProps = {
  data: ContourChartDatum[];
  levels?: number;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

@Component({
  selector: "st-contour-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ContourChart {
  static readonly stComponentName = "ContourChart";
  readonly componentName = "ContourChart";
  @NgInput() data!: ContourChartDatum[];
  @NgInput() levels?: number;
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-contourChart", this.classInput].filter(Boolean).join(" ");
  }
}
