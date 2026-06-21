import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class SelectionChip {
    static stComponentName = "SelectionChip";
    componentName = "SelectionChip";
    label;
    count;
    tone;
    onClear;
    disabled;
    classInput;
    clear = new EventEmitter();
    get showCount() {
        return this.count !== undefined && Number.isFinite(this.count);
    }
    get hasClear() {
        return typeof this.onClear === "function";
    }
    get hostClass() {
        return classNames("st-selectionChip", this.tone && `st-selectionChip--${this.tone}`, this.disabled ? "st-selectionChip--disabled" : undefined, this.classInput);
    }
    handleClear(event) {
        event.stopPropagation();
        if (this.disabled)
            return;
        this.onClear?.();
        this.clear.emit();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SelectionChip, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: SelectionChip, isStandalone: true, selector: "st-selection-chip", inputs: { label: "label", count: "count", tone: "tone", onClear: "onClear", disabled: "disabled", classInput: ["class", "classInput"] }, outputs: { clear: "clear" }, ngImport: i0, template: `
    <span
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-disabled]="disabled ? 'true' : null"
    >
      <span class="st-selectionChip__label">{{ label }}</span>
      @if (showCount) {
        <span class="st-selectionChip__count" [attr.aria-label]="'(' + count + ')'">
          ({{ count }})
        </span>
      }
      @if (hasClear) {
        <button
          type="button"
          class="st-selectionChip__clear"
          [attr.aria-label]="'Effacer ' + label"
          [disabled]="disabled"
          (click)="handleClear($event)"
        >&#x2715;</button>
      }
    </span>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SelectionChip, decorators: [{
            type: Component,
            args: [{
                    selector: "st-selection-chip",
                    standalone: true,
                    template: `
    <span
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-disabled]="disabled ? 'true' : null"
    >
      <span class="st-selectionChip__label">{{ label }}</span>
      @if (showCount) {
        <span class="st-selectionChip__count" [attr.aria-label]="'(' + count + ')'">
          ({{ count }})
        </span>
      }
      @if (hasClear) {
        <button
          type="button"
          class="st-selectionChip__clear"
          [attr.aria-label]="'Effacer ' + label"
          [disabled]="disabled"
          (click)="handleClear($event)"
        >&#x2715;</button>
      }
    </span>
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], count: [{
                type: NgInput
            }], tone: [{
                type: NgInput
            }], onClear: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], clear: [{
                type: Output
            }] } });
//# sourceMappingURL=SelectionChip.js.map