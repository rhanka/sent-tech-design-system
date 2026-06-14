import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

export type ContainerProps = {
  size?: ContainerSize;
  /** Apply horizontal padding using the spacing scale. */
  padding?: boolean;
  as?: string;
  class?: string;
};

@Component({
  selector: "st-container",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Container {
  static readonly stComponentName = "Container";
  readonly componentName = "Container";
  @NgInput() size?: ContainerSize;
  @NgInput() padding?: boolean;
  @NgInput() as?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-container", this.classInput].filter(Boolean).join(" ");
  }
}
