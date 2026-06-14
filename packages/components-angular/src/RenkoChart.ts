import { Component, Input as NgInput } from "@angular/core";

export type RenkoChartDirection = "up" | "down";

export type RenkoChartDatum = {
  date: number;
  close: number;
};

export type RenkoChartProps = {
  data: RenkoChartDatum[];
  boxSize?: number;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

@Component({
  selector: "st-renko-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class RenkoChart {
  static readonly stComponentName = "RenkoChart";
  readonly componentName = "RenkoChart";
  @NgInput() data!: RenkoChartDatum[];
  @NgInput() boxSize?: number;
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-renkoChart", this.classInput].filter(Boolean).join(" ");
  }
}
