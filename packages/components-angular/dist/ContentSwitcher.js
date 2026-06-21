import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class ContentSwitcher {
    static stComponentName = "ContentSwitcher";
    componentName = "ContentSwitcher";
    items;
    value;
    activeId;
    size;
    onchange;
    classInput;
    localValue;
    get hostClass() {
        return classNames("st-contentSwitcher", this.size && `st-contentSwitcher--${this.size}`, this.classInput);
    }
    itemKey(item, index) {
        return item.id ?? item.value ?? String(index);
    }
    isActive(item, index) {
        const active = this.value ?? this.localValue ?? this.activeId;
        if (!active)
            return index === 0;
        return item.value === active || item.id === active;
    }
    buttonClass(item, index) {
        return classNames("st-contentSwitcher__button", this.isActive(item, index) && "st-contentSwitcher__button--active");
    }
    select(item, index) {
        const key = item.value ?? item.id ?? String(index);
        this.localValue = key;
        this.onchange?.(key);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ContentSwitcher, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: ContentSwitcher, isStandalone: true, selector: "st-content-switcher", inputs: { items: "items", value: "value", activeId: "activeId", size: "size", onchange: "onchange", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="group">
      @for (item of items ?? []; track itemKey(item, $index)) {
        <button
          type="button"
          [class]="buttonClass(item, $index)"
          [disabled]="item.disabled ?? false"
          [attr.aria-pressed]="isActive(item, $index)"
          (click)="select(item, $index)"
        >{{ item.label }}</button>
      }
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ContentSwitcher, decorators: [{
            type: Component,
            args: [{
                    selector: "st-content-switcher",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="group">
      @for (item of items ?? []; track itemKey(item, $index)) {
        <button
          type="button"
          [class]="buttonClass(item, $index)"
          [disabled]="item.disabled ?? false"
          [attr.aria-pressed]="isActive(item, $index)"
          (click)="select(item, $index)"
        >{{ item.label }}</button>
      }
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { items: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], activeId: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], onchange: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ContentSwitcher.js.map