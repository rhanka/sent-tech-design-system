import { Component, Input as NgInput } from "@angular/core";

export type PointAndFigureChartMark = "x" | "o";

export type PointAndFigureChartDatum = {
  date: number;
  close: number;
};

export type PointAndFigureChartProps = {
  data: PointAndFigureChartDatum[];
  boxSize?: number;
  reversal?: number;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

@Component({
  selector: "st-point-and-figure-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class PointAndFigureChart {
  static readonly stComponentName = "PointAndFigureChart";
  readonly componentName = "PointAndFigureChart";
  @NgInput() data!: PointAndFigureChartDatum[];
  @NgInput() boxSize?: number;
  @NgInput() reversal?: number;
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-pointAndFigureChart", this.classInput].filter(Boolean).join(" ");
  }
}
