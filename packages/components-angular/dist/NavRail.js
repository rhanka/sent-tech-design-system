import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import * as i0 from "@angular/core";
export class NavRail {
    static stComponentName = "NavRail";
    componentName = "NavRail";
    items = [];
    label = "Primary navigation";
    activeItemId;
    classInput;
    itemSelect = new EventEmitter();
    get hostClass() {
        return ["st-navRail", this.classInput].filter(Boolean).join(" ");
    }
    isActive(item) {
        return item.active === true || item.id === this.activeItemId;
    }
    selectItem(item) {
        if (!item.disabled)
            this.itemSelect.emit(item.id);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavRail, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: NavRail, isStandalone: true, selector: "st-nav-rail", inputs: { items: "items", label: "label", activeItemId: "activeItemId", classInput: ["class", "classInput"] }, outputs: { itemSelect: "itemSelect" }, ngImport: i0, template: `
    <nav [attr.data-st-component]="componentName" [attr.aria-label]="label" [class]="hostClass">
      <div class="st-navRail__items">
        @for (item of items; track item.id) {
          @if (item.href && !item.disabled) {
            <a [href]="item.href"
              class="st-navRail__item"
              [class.st-navRail__item--active]="isActive(item)"
              [attr.aria-current]="isActive(item) ? 'page' : null"
              [attr.title]="item.label"
              (click)="selectItem(item)">
              <span class="st-navRail__label">{{ item.label }}</span>
              @if (item.badge != null) { <span class="st-navRail__badge">{{ item.badge }}</span> }
            </a>
          } @else {
            <button type="button"
              class="st-navRail__item"
              [class.st-navRail__item--active]="isActive(item)"
              [disabled]="item.disabled || null"
              [attr.aria-current]="isActive(item) ? 'page' : null"
              [attr.title]="item.label"
              (click)="selectItem(item)">
              <span class="st-navRail__label">{{ item.label }}</span>
              @if (item.badge != null) { <span class="st-navRail__badge">{{ item.badge }}</span> }
            </button>
          }
        }
        <ng-content></ng-content>
      </div>
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
      <div class="st-navRail__items">
        @for (item of items; track item.id) {
          @if (item.href && !item.disabled) {
            <a [href]="item.href"
              class="st-navRail__item"
              [class.st-navRail__item--active]="isActive(item)"
              [attr.aria-current]="isActive(item) ? 'page' : null"
              [attr.title]="item.label"
              (click)="selectItem(item)">
              <span class="st-navRail__label">{{ item.label }}</span>
              @if (item.badge != null) { <span class="st-navRail__badge">{{ item.badge }}</span> }
            </a>
          } @else {
            <button type="button"
              class="st-navRail__item"
              [class.st-navRail__item--active]="isActive(item)"
              [disabled]="item.disabled || null"
              [attr.aria-current]="isActive(item) ? 'page' : null"
              [attr.title]="item.label"
              (click)="selectItem(item)">
              <span class="st-navRail__label">{{ item.label }}</span>
              @if (item.badge != null) { <span class="st-navRail__badge">{{ item.badge }}</span> }
            </button>
          }
        }
        <ng-content></ng-content>
      </div>
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
            }], itemSelect: [{
                type: Output
            }] } });
//# sourceMappingURL=NavRail.js.map