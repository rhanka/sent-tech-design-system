import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type FooterLink = { label: unknown; href: string };

export type FooterColumn = { title?: unknown; links: FooterLink[] };

export type FooterProps = {
  brand?: unknown;
  columns?: FooterColumn[];
  links?: FooterLink[];
  copyright?: unknown;
  label?: string;
  class?: string;
};

@Component({
  selector: "st-footer",
  standalone: true,
  template: `
    <footer [attr.data-st-component]="componentName" [class]="hostClass" [attr.aria-label]="label ?? 'Pied de page'">
      <ng-content></ng-content>
      @if(copyright){
        <p class="st-footer__copyright">{{copyright}}</p>
      }
    </footer>
  `,
})
export class Footer {
  static readonly stComponentName = "Footer";
  readonly componentName = "Footer";
  @NgInput() brand?: unknown;
  @NgInput() columns?: FooterColumn[];
  @NgInput() links?: FooterLink[];
  @NgInput() copyright?: unknown;
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-footer", this.classInput);
  }
}
