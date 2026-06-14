import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type OrganizationChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type OrganizationChartNode = {
  id: string;
  parentId?: string | null;
  label: string;
  tone?: OrganizationChartTone;
};

export type OrganizationChartProps = {
  data: OrganizationChartNode[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

@Component({
  selector: "st-organization-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class OrganizationChart {
  static readonly stComponentName = "OrganizationChart";
  readonly componentName = "OrganizationChart";
  @NgInput() data!: OrganizationChartNode[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-organizationChart", this.classInput].filter(Boolean).join(" ");
  }
}
