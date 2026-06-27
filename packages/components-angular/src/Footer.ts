import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type FooterLink = { label: unknown; href: string };

export type FooterColumn = { title?: unknown; links: FooterLink[] };

export type FooterProps = {
  brand?: unknown;
  columns?: FooterColumn[];
  links?: FooterLink[];
  legalLinks?: FooterLink[];
  copyright?: unknown;
  legalNavLabel?: string;
  label?: string;
  class?: string;
};

@Component({
  selector: "st-footer",
  standalone: true,
  template: `
    <footer
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-label]="label || null"
    >
      @if (hasTop) {
        <div class="st-footer__top">
          @if (brand) {
            <div class="st-footer__brand">{{ brand }}</div>
          }
          <div class="st-footer__columns">
            @for (group of groups; track $index) {
              <nav>
                @if (group.title) {
                  <h2>{{ group.title }}</h2>
                }
                @for (link of group.links; track link.href) {
                  <a [href]="link.href">{{ link.label }}</a>
                }
              </nav>
            }
          </div>
        </div>
      }
      @if (hasBottom) {
        <div class="st-footer__bottom">
          @if (copyright) {
            <span class="st-footer__copyright">{{ copyright }}</span>
          }
          @if (legalLinks && legalLinks.length > 0) {
            <nav class="st-footer__legal" [attr.aria-label]="legalNavLabel ?? 'Legal links'">
              @for (link of legalLinks; track link.href) {
                <a [href]="link.href">{{ link.label }}</a>
              }
            </nav>
          }
        </div>
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
  @NgInput() legalLinks?: FooterLink[];
  @NgInput() copyright?: unknown;
  @NgInput() legalNavLabel?: string;
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  get groups(): FooterColumn[] {
    return this.columns ?? (this.links ? [{ links: this.links }] : []);
  }

  get hasTop(): boolean {
    return Boolean(this.brand) || this.groups.length > 0;
  }

  get hasBottom(): boolean {
    return Boolean(this.copyright) || Boolean(this.legalLinks && this.legalLinks.length > 0);
  }

  get hostClass(): string {
    return classNames("st-footer", this.classInput);
  }
}
