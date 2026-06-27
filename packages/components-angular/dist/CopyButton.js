import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class CopyButton {
    static stComponentName = "CopyButton";
    componentName = "CopyButton";
    text;
    value;
    label;
    copiedLabel;
    size;
    classInput;
    copied = false;
    copy() {
        const content = this.value ?? this.text ?? "";
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(content).then(() => {
                this.copied = true;
                setTimeout(() => {
                    this.copied = false;
                }, 2000);
            });
        }
    }
    get hostClass() {
        return classNames("st-copyButton", `st-copyButton--${this.size ?? "md"}`, this.copied && "st-copyButton--copied", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: CopyButton, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: CopyButton, isStandalone: true, selector: "st-copy-button", inputs: { text: "text", value: "value", label: "label", copiedLabel: "copiedLabel", size: "size", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <button type="button" [attr.data-st-component]="componentName" [class]="hostClass"
      aria-live="polite"
      (click)="copy()">
      <span class="st-copyButton__icon" aria-hidden="true">
        @if (copied) {
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        } @else {
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        }
      </span>
      <span class="st-copyButton__label">{{ copied ? (copiedLabel || 'Copié') : (label || 'Copier') }}</span>
    </button>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: CopyButton, decorators: [{
            type: Component,
            args: [{
                    selector: "st-copy-button",
                    standalone: true,
                    template: `
    <button type="button" [attr.data-st-component]="componentName" [class]="hostClass"
      aria-live="polite"
      (click)="copy()">
      <span class="st-copyButton__icon" aria-hidden="true">
        @if (copied) {
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        } @else {
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        }
      </span>
      <span class="st-copyButton__label">{{ copied ? (copiedLabel || 'Copié') : (label || 'Copier') }}</span>
    </button>
  `,
                }]
        }], propDecorators: { text: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], copiedLabel: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=CopyButton.js.map