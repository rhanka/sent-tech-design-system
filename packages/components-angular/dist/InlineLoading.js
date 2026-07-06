import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class InlineLoading {
    static stComponentName = "InlineLoading";
    componentName = "InlineLoading";
    label;
    status;
    locale = "fr-FR";
    classInput;
    get resolvedStatus() {
        return this.status ?? "active";
    }
    get hostClass() {
        return classNames("st-inlineLoading", `st-inlineLoading--${this.resolvedStatus}`, this.classInput);
    }
    get role() {
        return this.resolvedStatus === "error" ? "alert" : "status";
    }
    get isFr() {
        return this.locale.toLowerCase().startsWith("fr");
    }
    get fallbackLabel() {
        const labels = this.isFr
            ? { active: "Chargement", success: "Terminé", error: "Erreur", inactive: "Inactif" }
            : { active: "Loading", success: "Completed", error: "Error", inactive: "Inactive" };
        return labels[this.resolvedStatus];
    }
    get accessibleLabel() {
        return this.label ? null : this.fallbackLabel;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: InlineLoading, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: InlineLoading, isStandalone: true, selector: "st-inline-loading", inputs: { label: "label", status: "status", locale: "locale", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.role]="role"
      [attr.aria-label]="accessibleLabel"
      aria-live="polite"
    >
      <span class="st-inlineLoading__icon" aria-hidden="true">
        @if (resolvedStatus === 'active') {
          <span class="st-inlineLoading__spinner">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" opacity="0.25"/>
              <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
        } @else if (resolvedStatus === 'success') {
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        } @else if (resolvedStatus === 'error') {
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        }
      </span>
      @if (label) { <span class="st-inlineLoading__label">{{ label }}</span> }
    </div>
  `, isInline: true, styles: [":host { display: contents; }"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: InlineLoading, decorators: [{
            type: Component,
            args: [{ selector: "st-inline-loading", standalone: true, template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.role]="role"
      [attr.aria-label]="accessibleLabel"
      aria-live="polite"
    >
      <span class="st-inlineLoading__icon" aria-hidden="true">
        @if (resolvedStatus === 'active') {
          <span class="st-inlineLoading__spinner">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" opacity="0.25"/>
              <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
        } @else if (resolvedStatus === 'success') {
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        } @else if (resolvedStatus === 'error') {
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        }
      </span>
      @if (label) { <span class="st-inlineLoading__label">{{ label }}</span> }
    </div>
  `, styles: [":host { display: contents; }"] }]
        }], propDecorators: { label: [{
                type: NgInput
            }], status: [{
                type: NgInput
            }], locale: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=InlineLoading.js.map