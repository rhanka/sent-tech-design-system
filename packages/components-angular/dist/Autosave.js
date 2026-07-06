import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Autosave {
    static stComponentName = "Autosave";
    componentName = "Autosave";
    status;
    lastSaved;
    onRetry;
    labels;
    retryLabel;
    locale;
    classInput;
    retry = new EventEmitter();
    get resolvedStatus() {
        return this.status ?? "idle";
    }
    get isFr() {
        return (this.locale ?? "fr-FR").toLowerCase().startsWith("fr");
    }
    get defaultLabels() {
        return this.isFr
            ? {
                idle: "Modifications enregistrées",
                saving: "Enregistrement…",
                saved: "Enregistré",
                error: "Échec de l'enregistrement",
            }
            : {
                idle: "All changes saved",
                saving: "Saving…",
                saved: "Saved",
                error: "Failed to save",
            };
    }
    get statusLabel() {
        return this.labels?.[this.resolvedStatus] ?? this.defaultLabels[this.resolvedStatus];
    }
    get resolvedRetryLabel() {
        return this.retryLabel ?? (this.isFr ? "Réessayer" : "Retry");
    }
    get role() {
        return this.resolvedStatus === "error" ? "alert" : "status";
    }
    get relativeTime() {
        if (!this.lastSaved)
            return "";
        const date = this.lastSaved instanceof Date ? this.lastSaved : new Date(this.lastSaved);
        if (Number.isNaN(date.getTime()))
            return "";
        const diffMs = Date.now() - date.getTime();
        const diffSec = Math.round(diffMs / 1000);
        const rtf = new Intl.RelativeTimeFormat(this.locale ?? "fr-FR", { numeric: "auto" });
        if (Math.abs(diffSec) < 60)
            return rtf.format(-diffSec, "second");
        const diffMin = Math.round(diffSec / 60);
        if (Math.abs(diffMin) < 60)
            return rtf.format(-diffMin, "minute");
        const diffHour = Math.round(diffMin / 60);
        if (Math.abs(diffHour) < 24)
            return rtf.format(-diffHour, "hour");
        const diffDay = Math.round(diffHour / 24);
        return rtf.format(-diffDay, "day");
    }
    get showRelative() {
        return ((this.resolvedStatus === "saved" || this.resolvedStatus === "idle") &&
            this.relativeTime !== "");
    }
    get hostClass() {
        return classNames("st-autosave", `st-autosave--${this.resolvedStatus}`, this.classInput);
    }
    triggerRetry() {
        this.retry.emit();
        this.onRetry?.();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Autosave, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Autosave, isStandalone: true, selector: "st-autosave", inputs: { status: "status", lastSaved: "lastSaved", onRetry: "onRetry", labels: "labels", retryLabel: "retryLabel", locale: "locale", classInput: ["class", "classInput"] }, outputs: { retry: "retry" }, ngImport: i0, template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.role]="role"
      aria-live="polite"
    >
      <span class="st-autosave__icon" aria-hidden="true">
        @if (resolvedStatus === 'saving') {
          <span class="st-autosave__spinner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          </span>
        } @else if (resolvedStatus === 'saved') {
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        } @else if (resolvedStatus === 'error') {
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="8" y2="12"/>
            <line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
        }
      </span>
      <span class="st-autosave__label">{{ statusLabel }}</span>
      @if (showRelative) {
        <span class="st-autosave__time">{{ relativeTime }}</span>
      }
      @if (resolvedStatus === 'error' && onRetry) {
        <button type="button" class="st-autosave__retry" (click)="triggerRetry()">{{ resolvedRetryLabel }}</button>
      }
    </div>
  `, isInline: true, styles: [":host { display: contents; }"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Autosave, decorators: [{
            type: Component,
            args: [{ selector: "st-autosave", standalone: true, template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.role]="role"
      aria-live="polite"
    >
      <span class="st-autosave__icon" aria-hidden="true">
        @if (resolvedStatus === 'saving') {
          <span class="st-autosave__spinner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          </span>
        } @else if (resolvedStatus === 'saved') {
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        } @else if (resolvedStatus === 'error') {
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="8" y2="12"/>
            <line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
        }
      </span>
      <span class="st-autosave__label">{{ statusLabel }}</span>
      @if (showRelative) {
        <span class="st-autosave__time">{{ relativeTime }}</span>
      }
      @if (resolvedStatus === 'error' && onRetry) {
        <button type="button" class="st-autosave__retry" (click)="triggerRetry()">{{ resolvedRetryLabel }}</button>
      }
    </div>
  `, styles: [":host { display: contents; }"] }]
        }], propDecorators: { status: [{
                type: NgInput
            }], lastSaved: [{
                type: NgInput
            }], onRetry: [{
                type: NgInput
            }], labels: [{
                type: NgInput
            }], retryLabel: [{
                type: NgInput
            }], locale: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], retry: [{
                type: Output
            }] } });
//# sourceMappingURL=Autosave.js.map