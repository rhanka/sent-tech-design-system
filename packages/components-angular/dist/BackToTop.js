import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class BackToTop {
    static stComponentName = "BackToTop";
    componentName = "BackToTop";
    label;
    disabled;
    targetId;
    threshold;
    autoHide;
    smooth;
    classInput;
    get hostClass() {
        return classNames("st-backToTop", this.classInput);
    }
    scrollToTop() {
        if (typeof window !== "undefined") {
            const el = this.targetId ? document.getElementById(this.targetId) : null;
            if (el) {
                el.scrollIntoView({ behavior: this.smooth !== false ? "smooth" : "auto" });
            }
            else {
                window.scrollTo({ top: 0, behavior: this.smooth !== false ? "smooth" : "auto" });
            }
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: BackToTop, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: BackToTop, isStandalone: true, selector: "st-back-to-top", inputs: { label: "label", disabled: "disabled", targetId: "targetId", threshold: "threshold", autoHide: "autoHide", smooth: "smooth", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <button type="button" class="st-backToTop__button" [disabled]="disabled" (click)="scrollToTop()" [attr.aria-label]="label || 'Retour en haut'">
        <svg class="st-backToTop__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
        @if (label) { <span class="st-backToTop__label">{{ label }}</span> }
      </button>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: BackToTop, decorators: [{
            type: Component,
            args: [{
                    selector: "st-back-to-top",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <button type="button" class="st-backToTop__button" [disabled]="disabled" (click)="scrollToTop()" [attr.aria-label]="label || 'Retour en haut'">
        <svg class="st-backToTop__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
        @if (label) { <span class="st-backToTop__label">{{ label }}</span> }
      </button>
    </div>
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], targetId: [{
                type: NgInput
            }], threshold: [{
                type: NgInput
            }], autoHide: [{
                type: NgInput
            }], smooth: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=BackToTop.js.map