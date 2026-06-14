import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type SparklineTone = "neutral" | "success" | "warning" | "error";

export type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  tone?: SparklineTone;
  strokeWidth?: number;
  area?: boolean;
  label?: string;
  class?: string;
};

@Component({
  selector: "st-sparkline",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Sparkline {
  static readonly stComponentName = "Sparkline";
  readonly componentName = "Sparkline";
  @NgInput() data!: number[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() tone?: SparklineTone;
  @NgInput() strokeWidth?: number;
  @NgInput() area?: boolean;
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-sparkline", this.classInput].filter(Boolean).join(" ");
  }
}
