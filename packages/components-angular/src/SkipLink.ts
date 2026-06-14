import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type SkipLinkProps = {
  href?: string;
  class?: string;
};

@Component({
  selector: "st-skip-link",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class SkipLink {
  static readonly stComponentName = "SkipLink";
  readonly componentName = "SkipLink";
  @NgInput() href?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-skipLink", this.classInput].filter(Boolean).join(" ");
  }
}
