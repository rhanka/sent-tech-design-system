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
    <a [href]="href || '#main-content'" [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content>Aller au contenu principal</ng-content>
    </a>
  `,
})
export class SkipLink {
  static readonly stComponentName = "SkipLink";
  readonly componentName = "SkipLink";
  @NgInput() href?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-skipLink", this.classInput);
  }
}
