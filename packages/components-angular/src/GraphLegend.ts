import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import {
  nodeShapePath,
  type ForceGraphLegendEntry,
} from "./ForceGraph.js";

export type GraphLegendProps = {
  entries: ForceGraphLegendEntry[];
  /** Optional heading shown above entries. */
  title?: string;
  class?: string;
};

@Component({
  selector: "st-graph-legend",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class GraphLegend {
  static readonly stComponentName = "GraphLegend";
  readonly componentName = "GraphLegend";
  @NgInput() entries!: ForceGraphLegendEntry[];
  @NgInput() title?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-graphLegend", this.classInput].filter(Boolean).join(" ");
  }
}
