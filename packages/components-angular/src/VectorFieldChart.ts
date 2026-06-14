import { Component, Input as NgInput } from "@angular/core";

export type VectorFieldChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type VectorFieldChartDatum = {
  x: number;
  y: number;
  length: number;
  direction: number;
};

export type VectorFieldChartProps = {
  data: VectorFieldChartDatum[];
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

@Component({
  selector: "st-vector-field-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class VectorFieldChart {
  static readonly stComponentName = "VectorFieldChart";
  readonly componentName = "VectorFieldChart";
  @NgInput() data!: VectorFieldChartDatum[];
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-vectorFieldChart", this.classInput].filter(Boolean).join(" ");
  }
}
