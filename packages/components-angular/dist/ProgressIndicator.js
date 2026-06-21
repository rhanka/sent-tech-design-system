import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class ProgressIndicator {
    static stComponentName = "ProgressIndicator";
    componentName = "ProgressIndicator";
    items;
    orientation;
    vertical;
    label;
    classInput;
    get resolvedOrientation() {
        return this.vertical ? "vertical" : (this.orientation ?? "horizontal");
    }
    get hostClass() {
        return classNames("st-progressIndicator", `st-progressIndicator--${this.resolvedOrientation}`, this.classInput);
    }
    itemKey(item, index) {
        return item.id ?? item.value ?? String(index);
    }
    itemClass(item) {
        return classNames("st-progressIndicator__item", item.status && `st-progressIndicator__item--${item.status}`);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ProgressIndicator, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: ProgressIndicator, isStandalone: true, selector: "st-progress-indicator", inputs: { items: "items", orientation: "orientation", vertical: "vertical", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <ol
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-label]="label ?? 'Progression'"
    >
      @for (item of items ?? []; track itemKey(item, $index)) {
        <li [class]="itemClass(item)" [attr.aria-current]="item.status === 'current' ? 'step' : null">
          <span class="st-progressIndicator__indicator">
            <span class="st-progressIndicator__circle">
              @if (item.status === 'complete') {
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              }
            </span>
          </span>
          <span class="st-progressIndicator__content">
            <span class="st-progressIndicator__label">{{ item.label }}</span>
            @if (item.description) {
              <span class="st-progressIndicator__description">{{ item.description }}</span>
            }
          </span>
        </li>
      }
      <ng-content></ng-content>
    </ol>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ProgressIndicator, decorators: [{
            type: Component,
            args: [{
                    selector: "st-progress-indicator",
                    standalone: true,
                    template: `
    <ol
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-label]="label ?? 'Progression'"
    >
      @for (item of items ?? []; track itemKey(item, $index)) {
        <li [class]="itemClass(item)" [attr.aria-current]="item.status === 'current' ? 'step' : null">
          <span class="st-progressIndicator__indicator">
            <span class="st-progressIndicator__circle">
              @if (item.status === 'complete') {
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              }
            </span>
          </span>
          <span class="st-progressIndicator__content">
            <span class="st-progressIndicator__label">{{ item.label }}</span>
            @if (item.description) {
              <span class="st-progressIndicator__description">{{ item.description }}</span>
            }
          </span>
        </li>
      }
      <ng-content></ng-content>
    </ol>
  `,
                }]
        }], propDecorators: { items: [{
                type: NgInput
            }], orientation: [{
                type: NgInput
            }], vertical: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ProgressIndicator.js.map