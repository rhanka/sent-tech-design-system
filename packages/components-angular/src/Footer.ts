import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type FooterLink = { label: unknown; href: string };

export type FooterColumn = { title?: unknown; links: FooterLink[] };

export type FooterProps = {
  brand?: unknown;
  columns?: FooterColumn[];
  links?: FooterLink[];
  copyright?: unknown;
  class?: string;
};

@Component({
  selector: "st-footer",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Footer {
  static readonly stComponentName = "Footer";
  readonly componentName = "Footer";
  @NgInput() brand?: unknown;
  @NgInput() columns?: FooterColumn[];
  @NgInput() links?: FooterLink[];
  @NgInput() copyright?: unknown;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-footer", this.classInput].filter(Boolean).join(" ");
  }
}
