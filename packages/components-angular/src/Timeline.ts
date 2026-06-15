import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type TimelineTone = "neutral" | "info" | "success" | "warning" | "danger";

export type TimelineOrientation = "vertical" | "horizontal";

export type TimelineItem = {
  title: string;
  meta?: string;
  description?: string;
  tone?: TimelineTone;
};

export type TimelineProps = {
  items: TimelineItem[];
  orientation?: TimelineOrientation;
  class?: string;
};

@Component({
  selector: "st-timeline",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Timeline {
  static readonly stComponentName = "Timeline";
  readonly componentName = "Timeline";
  @NgInput() items!: TimelineItem[];
  @NgInput() orientation?: TimelineOrientation;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-timeline",
      `st-timeline--${this.orientation ?? "vertical"}`,
      this.classInput,
    );
  }
}
