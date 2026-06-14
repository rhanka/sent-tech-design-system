import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type AspectRatioProps = {
  ratio?: number | string;
  class?: string;
};

@Component({
  selector: "st-aspect-ratio",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class AspectRatio {
  static readonly stComponentName = "AspectRatio";
  readonly componentName = "AspectRatio";
  @NgInput() ratio?: number | string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-aspectRatio", this.classInput].filter(Boolean).join(" ");
  }
}
