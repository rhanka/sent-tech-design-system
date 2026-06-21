import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class FilterBar {
    static stComponentName = "FilterBar";
    componentName = "FilterBar";
    label;
    onClearAll;
    clearAllLabel;
    classInput;
    get hasClearAll() {
        return typeof this.onClearAll === "function";
    }
    get hostClass() {
        return classNames("st-filterBar", this.classInput);
    }
    triggerClearAll() {
        this.onClearAll?.();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: FilterBar, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: FilterBar, isStandalone: true, selector: "st-filter-bar", inputs: { label: "label", onClearAll: "onClearAll", clearAllLabel: "clearAllLabel", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="group"
      [attr.aria-label]="label"
    >
      <div class="st-filterBar__pills">
        <ng-content></ng-content>
      </div>
      @if (hasClearAll) {
        <button
          type="button"
          class="st-filterBar__clearAll"
          (click)="triggerClearAll()"
        >{{ clearAllLabel || 'Tout effacer' }}</button>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: FilterBar, decorators: [{
            type: Component,
            args: [{
                    selector: "st-filter-bar",
                    standalone: true,
                    template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="group"
      [attr.aria-label]="label"
    >
      <div class="st-filterBar__pills">
        <ng-content></ng-content>
      </div>
      @if (hasClearAll) {
        <button
          type="button"
          class="st-filterBar__clearAll"
          (click)="triggerClearAll()"
        >{{ clearAllLabel || 'Tout effacer' }}</button>
      }
    </div>
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], onClearAll: [{
                type: NgInput
            }], clearAllLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=FilterBar.js.map