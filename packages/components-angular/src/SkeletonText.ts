import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type SkeletonTextProps = {
  lines?: number;
  width?: string;
  heading?: boolean;
  paragraph?: boolean;
  class?: string;
};

@Component({
  selector: "st-skeleton-text",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class SkeletonText {
  static readonly stComponentName = "SkeletonText";
  readonly componentName = "SkeletonText";
  @NgInput() lines?: number;
  @NgInput() width?: string;
  @NgInput() heading?: boolean;
  @NgInput() paragraph?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-skeletonText", this.classInput].filter(Boolean).join(" ");
  }
}
