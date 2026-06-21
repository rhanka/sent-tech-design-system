import { Component, Input as NgInput } from "@angular/core";
import * as i0 from "@angular/core";
export class NavRail {
    static stComponentName = "NavRail";
    componentName = "NavRail";
    items;
    label = "Primary navigation";
    activeItemId;
    classInput;
    get hostClass() {
        return ["st-navRail", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavRail, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: NavRail, isStandalone: true, selector: "st-nav-rail", inputs: { items: "items", label: "label", activeItemId: "activeItemId", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <nav [attr.data-st-component]="componentName" [attr.aria-label]="label" [class]="hostClass">
      @if (items && items.length) {
        <ul class="st-navRail__list">
          @for (item of items; track item.id) {
            <li class="st-navRail__item">
              <a [href]="item.href || '#'"
                class="st-navRail__link"
                [class.st-navRail__link--active]="item.active || item.id === activeItemId"
                [class.st-navRail__link--disabled]="item.disabled"
                [attr.aria-current]="(item.active || item.id === activeItemId) ? 'page' : null"
                [attr.aria-disabled]="item.disabled || null">
                <span class="st-navRail__label">{{ item.label }}</span>
                @if (item.badge) { <span class="st-navRail__badge">{{ item.badge }}</span> }
              </a>
            </li>
          }
        </ul>
      }
      <ng-content></ng-content>
    </nav>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavRail, decorators: [{
            type: Component,
            args: [{
                    selector: "st-nav-rail",
                    standalone: true,
                    template: `
    <nav [attr.data-st-component]="componentName" [attr.aria-label]="label" [class]="hostClass">
      @if (items && items.length) {
        <ul class="st-navRail__list">
          @for (item of items; track item.id) {
            <li class="st-navRail__item">
              <a [href]="item.href || '#'"
                class="st-navRail__link"
                [class.st-navRail__link--active]="item.active || item.id === activeItemId"
                [class.st-navRail__link--disabled]="item.disabled"
                [attr.aria-current]="(item.active || item.id === activeItemId) ? 'page' : null"
                [attr.aria-disabled]="item.disabled || null">
                <span class="st-navRail__label">{{ item.label }}</span>
                @if (item.badge) { <span class="st-navRail__badge">{{ item.badge }}</span> }
              </a>
            </li>
          }
        </ul>
      }
      <ng-content></ng-content>
    </nav>
  `,
                }]
        }], propDecorators: { items: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], activeItemId: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=NavRail.js.map