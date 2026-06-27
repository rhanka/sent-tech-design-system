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
    visible = false;
    onScroll;
    get resolvedLabel() {
        return this.label ?? "Retour en haut";
    }
    get resolvedAutoHide() {
        return this.autoHide !== false;
    }
    get ariaHidden() {
        return this.resolvedAutoHide && !this.visible;
    }
    ngOnInit() {
        if (!this.resolvedAutoHide) {
            this.visible = true;
            return;
        }
        if (typeof window === "undefined")
            return;
        const threshold = this.threshold ?? 240;
        this.onScroll = () => {
            this.visible = window.scrollY > threshold;
        };
        this.onScroll();
        window.addEventListener("scroll", this.onScroll, { passive: true });
    }
    ngOnDestroy() {
        if (this.onScroll && typeof window !== "undefined") {
            window.removeEventListener("scroll", this.onScroll);
        }
    }
    get hostClass() {
        return classNames("st-backToTop", this.classInput);
    }
    goTop() {
        if (typeof window === "undefined")
            return;
        const behavior = this.smooth !== false ? "smooth" : "auto";
        const anchor = (this.targetId ?? "top").replace(/^#/, "");
        const el = anchor ? document.getElementById(anchor) : null;
        if (el) {
            el.scrollIntoView({ behavior, block: "start" });
        }
        else {
            window.scrollTo({ top: 0, behavior });
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: BackToTop, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: BackToTop, isStandalone: true, selector: "st-back-to-top", inputs: { label: "label", disabled: "disabled", targetId: "targetId", threshold: "threshold", autoHide: "autoHide", smooth: "smooth", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <button
      type="button"
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [disabled]="disabled ?? false"
      [attr.aria-label]="resolvedLabel"
      [attr.aria-hidden]="ariaHidden"
      [attr.aria-live]="ariaHidden ? 'polite' : null"
      [attr.tabindex]="ariaHidden ? -1 : null"
      (click)="goTop()"
    >
      <span class="st-backToTop__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 19V5"/>
          <path d="M5 12l7-7 7 7"/>
        </svg>
      </span>
      <span class="st-backToTop__label">{{ resolvedLabel }}</span>
    </button>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: BackToTop, decorators: [{
            type: Component,
            args: [{
                    selector: "st-back-to-top",
                    standalone: true,
                    template: `
    <button
      type="button"
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [disabled]="disabled ?? false"
      [attr.aria-label]="resolvedLabel"
      [attr.aria-hidden]="ariaHidden"
      [attr.aria-live]="ariaHidden ? 'polite' : null"
      [attr.tabindex]="ariaHidden ? -1 : null"
      (click)="goTop()"
    >
      <span class="st-backToTop__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 19V5"/>
          <path d="M5 12l7-7 7 7"/>
        </svg>
      </span>
      <span class="st-backToTop__label">{{ resolvedLabel }}</span>
    </button>
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