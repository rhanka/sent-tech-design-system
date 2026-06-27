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
    <div [attr.data-st-component]="componentName" [class]="hostClass" [style.aspect-ratio]="resolvedRatio">
      <ng-content></ng-content>
    </div>
  `,
})
export class AspectRatio {
  static readonly stComponentName = "AspectRatio";
  readonly componentName = "AspectRatio";
  @NgInput() ratio: number | string = "16 / 9";
  @NgInput("class") classInput?: string;

  get resolvedRatio(): string {
    return typeof this.ratio === "number" ? String(this.ratio) : this.ratio;
  }

  get hostClass(): string {
    return ["st-aspectRatio", this.classInput].filter(Boolean).join(" ");
  }
}
