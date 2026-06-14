import { Component, Input as NgInput } from "@angular/core";

export type WindBarbChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type WindBarbChartDatum = {
  at: number;
  speed: number;
  direction: number;
};

export type WindBarbChartProps = {
  data: WindBarbChartDatum[];
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

@Component({
  selector: "st-wind-barb-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class WindBarbChart {
  static readonly stComponentName = "WindBarbChart";
  readonly componentName = "WindBarbChart";
  @NgInput() data!: WindBarbChartDatum[];
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-windBarbChart", this.classInput].filter(Boolean).join(" ");
  }
}
