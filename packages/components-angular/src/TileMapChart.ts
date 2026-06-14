import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type TileMapChartTile = {
  label: string;
  col: number;
  row: number;
  value: number;
};

export type TileMapChartProps = {
  data: TileMapChartTile[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

@Component({
  selector: "st-tile-map-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class TileMapChart {
  static readonly stComponentName = "TileMapChart";
  readonly componentName = "TileMapChart";
  @NgInput() data!: TileMapChartTile[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-tileMapChart", this.classInput].filter(Boolean).join(" ");
  }
}
