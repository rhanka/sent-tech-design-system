import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Footer {
    static stComponentName = "Footer";
    componentName = "Footer";
    brand;
    columns;
    links;
    legalLinks;
    copyright;
    legalNavLabel;
    label;
    classInput;
    get groups() {
        return this.columns ?? (this.links ? [{ links: this.links }] : []);
    }
    get hasTop() {
        return Boolean(this.brand) || this.groups.length > 0;
    }
    get hasBottom() {
        return Boolean(this.copyright) || Boolean(this.legalLinks && this.legalLinks.length > 0);
    }
    get hostClass() {
        return classNames("st-footer", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Footer, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Footer, isStandalone: true, selector: "st-footer", inputs: { brand: "brand", columns: "columns", links: "links", legalLinks: "legalLinks", copyright: "copyright", legalNavLabel: "legalNavLabel", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Footer, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { brand: [{
                type: NgInput
            }], columns: [{
                type: NgInput
            }], links: [{
                type: NgInput
            }], legalLinks: [{
                type: NgInput
            }], copyright: [{
                type: NgInput
            }], legalNavLabel: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Footer.js.map