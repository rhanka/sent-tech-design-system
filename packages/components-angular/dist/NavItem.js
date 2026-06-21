import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class NavItem {
    static stComponentName = "NavItem";
    componentName = "NavItem";
    value;
    title;
    caption;
    depth;
    swatch;
    count;
    status;
    selected;
    active;
    disabled;
    href;
    divider;
    classInput;
    get hostClass() {
        const depth = Math.min(Math.max(Math.trunc(Number(this.depth) || 0), 0), 3);
        const status = this.status ?? "neutral";
        return classNames("st-navItem", `st-navItem--depth${depth}`, status !== "neutral" ? `st-navItem--status-${status}` : null, (this.active || this.selected) ? "st-navItem--active" : null, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavItem, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: NavItem, isStandalone: true, selector: "st-nav-item", inputs: { value: "value", title: "title", caption: "caption", depth: "depth", swatch: "swatch", count: "count", status: "status", selected: "selected", active: "active", disabled: "disabled", href: "href", divider: "divider", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <a
      [attr.data-st-component]="componentName"
      [attr.href]="disabled ? null : href"
      [attr.aria-disabled]="disabled ? 'true' : null"
      [attr.aria-current]="(active || selected) ? 'page' : null"
      [class]="hostClass"
    >
      <span class="st-navItem__body">
        <span class="st-navItem__title">{{ title }}<ng-content></ng-content></span>
        @if (caption) {
          <span class="st-navItem__caption">{{ caption }}</span>
        }
      </span>
      @if (count !== undefined) {
        <span class="st-navItem__count" aria-label="{{ count }}">{{ count }}</span>
      }
    </a>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavItem, decorators: [{
            type: Component,
            args: [{
                    selector: "st-nav-item",
                    standalone: true,
                    template: `
    <a
      [attr.data-st-component]="componentName"
      [attr.href]="disabled ? null : href"
      [attr.aria-disabled]="disabled ? 'true' : null"
      [attr.aria-current]="(active || selected) ? 'page' : null"
      [class]="hostClass"
    >
      <span class="st-navItem__body">
        <span class="st-navItem__title">{{ title }}<ng-content></ng-content></span>
        @if (caption) {
          <span class="st-navItem__caption">{{ caption }}</span>
        }
      </span>
      @if (count !== undefined) {
        <span class="st-navItem__count" aria-label="{{ count }}">{{ count }}</span>
      }
    </a>
  `,
                }]
        }], propDecorators: { value: [{
                type: NgInput
            }], title: [{
                type: NgInput
            }], caption: [{
                type: NgInput
            }], depth: [{
                type: NgInput
            }], swatch: [{
                type: NgInput
            }], count: [{
                type: NgInput
            }], status: [{
                type: NgInput
            }], selected: [{
                type: NgInput
            }], active: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], href: [{
                type: NgInput
            }], divider: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=NavItem.js.map