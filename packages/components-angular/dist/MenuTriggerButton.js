import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class MenuTriggerButton {
    static stComponentName = "MenuTriggerButton";
    componentName = "MenuTriggerButton";
    open;
    expanded;
    size = "md";
    variant = "ghost";
    disabled = false;
    classInput;
    get isOpen() {
        return this.open ?? this.expanded ?? false;
    }
    get hostClass() {
        return classNames(`st-iconButton st-iconButton--${this.size} st-iconButton--${this.variant}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MenuTriggerButton, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: MenuTriggerButton, isStandalone: true, selector: "st-menu-trigger-button", inputs: { open: "open", expanded: "expanded", size: "size", variant: "variant", disabled: "disabled", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <button
      type="button"
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      aria-haspopup="menu"
      [attr.aria-expanded]="isOpen"
      [disabled]="disabled ?? false"
    >
      <ng-content>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="m16 10-4 4-4-4"></path>
        </svg>
      </ng-content>
    </button>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MenuTriggerButton, decorators: [{
            type: Component,
            args: [{
                    selector: "st-menu-trigger-button",
                    standalone: true,
                    template: `
    <button
      type="button"
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      aria-haspopup="menu"
      [attr.aria-expanded]="isOpen"
      [disabled]="disabled ?? false"
    >
      <ng-content>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="m16 10-4 4-4-4"></path>
        </svg>
      </ng-content>
    </button>
  `,
                }]
        }], propDecorators: { open: [{
                type: NgInput
            }], expanded: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], variant: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=MenuTriggerButton.js.map