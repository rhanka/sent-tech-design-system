import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class InlineLoading {
    static stComponentName = "InlineLoading";
    componentName = "InlineLoading";
    label;
    status;
    classInput;
    get hostClass() {
        return classNames("st-inlineLoading", this.status && `st-inlineLoading--${this.status}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: InlineLoading, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: InlineLoading, isStandalone: true, selector: "st-inline-loading", inputs: { label: "label", status: "status", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="status" [attr.aria-label]="label">
      <span class="st-inlineLoading__spinner" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" opacity="0.25"/>
          <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </span>
      @if (label) { <span class="st-inlineLoading__label">{{ label }}</span> }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: InlineLoading, decorators: [{
            type: Component,
            args: [{
                    selector: "st-inline-loading",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="status" [attr.aria-label]="label">
      <span class="st-inlineLoading__spinner" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" opacity="0.25"/>
          <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </span>
      @if (label) { <span class="st-inlineLoading__label">{{ label }}</span> }
    </div>
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], status: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=InlineLoading.js.map