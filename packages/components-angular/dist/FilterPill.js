import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class FilterPill {
    static stComponentName = "FilterPill";
    componentName = "FilterPill";
    field;
    value;
    operator;
    active = true;
    removable = true;
    disabled = false;
    tone = "neutral";
    onClick;
    onRemove;
    classInput;
    remove = new EventEmitter();
    get hasClick() {
        return typeof this.onClick === "function";
    }
    get hostClass() {
        return classNames("st-filterPill", `st-filterPill--${this.tone}`, this.active !== false ? "st-filterPill--active" : undefined, this.disabled ? "st-filterPill--disabled" : undefined, this.classInput);
    }
    handleClick() {
        if (this.disabled)
            return;
        this.onClick?.();
    }
    handleRemove() {
        if (this.disabled)
            return;
        this.onRemove?.();
        this.remove.emit();
    }
    handleBodyKeydown(event) {
        if (this.disabled)
            return;
        if ((event.key === "Delete" || event.key === "Backspace") && this.removable !== false) {
            event.preventDefault();
            this.onRemove?.();
            this.remove.emit();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: FilterPill, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: FilterPill, isStandalone: true, selector: "st-filter-pill", inputs: { field: "field", value: "value", operator: "operator", active: "active", removable: "removable", disabled: "disabled", tone: "tone", onClick: "onClick", onRemove: "onRemove", classInput: ["class", "classInput"] }, outputs: { remove: "remove" }, ngImport: i0, template: `
    <span
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="group"
      [attr.aria-label]="'Filtre ' + field"
    >
      @if (hasClick) {
        <button
          type="button"
          class="st-filterPill__body"
          [attr.aria-pressed]="active !== false ? 'true' : 'false'"
          [disabled]="disabled || null"
          (click)="handleClick()"
          (keydown)="handleBodyKeydown($event)"
        >
          <span class="st-filterPill__field">{{ field }}</span>
          @if (operator) {
            <span class="st-filterPill__operator" aria-hidden="true">{{ operator }}</span>
          }
          <span class="st-filterPill__value">{{ value }}</span>
        </button>
      } @else {
        <span class="st-filterPill__body st-filterPill__body--static">
          <span class="st-filterPill__field">{{ field }}</span>
          @if (operator) {
            <span class="st-filterPill__operator" aria-hidden="true">{{ operator }}</span>
          }
          <span class="st-filterPill__value">{{ value }}</span>
        </span>
      }
      @if (removable !== false) {
        <button
          type="button"
          class="st-filterPill__remove"
          [attr.aria-label]="'Retirer le filtre ' + field"
          [disabled]="disabled || null"
          (click)="handleRemove()"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M18 6 6 18"/>
            <path d="m6 6 12 12"/>
          </svg>
        </button>
      }
    </span>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: FilterPill, decorators: [{
            type: Component,
            args: [{
                    selector: "st-filter-pill",
                    standalone: true,
                    template: `
    <span
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="group"
      [attr.aria-label]="'Filtre ' + field"
    >
      @if (hasClick) {
        <button
          type="button"
          class="st-filterPill__body"
          [attr.aria-pressed]="active !== false ? 'true' : 'false'"
          [disabled]="disabled || null"
          (click)="handleClick()"
          (keydown)="handleBodyKeydown($event)"
        >
          <span class="st-filterPill__field">{{ field }}</span>
          @if (operator) {
            <span class="st-filterPill__operator" aria-hidden="true">{{ operator }}</span>
          }
          <span class="st-filterPill__value">{{ value }}</span>
        </button>
      } @else {
        <span class="st-filterPill__body st-filterPill__body--static">
          <span class="st-filterPill__field">{{ field }}</span>
          @if (operator) {
            <span class="st-filterPill__operator" aria-hidden="true">{{ operator }}</span>
          }
          <span class="st-filterPill__value">{{ value }}</span>
        </span>
      }
      @if (removable !== false) {
        <button
          type="button"
          class="st-filterPill__remove"
          [attr.aria-label]="'Retirer le filtre ' + field"
          [disabled]="disabled || null"
          (click)="handleRemove()"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M18 6 6 18"/>
            <path d="m6 6 12 12"/>
          </svg>
        </button>
      }
    </span>
  `,
                }]
        }], propDecorators: { field: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], operator: [{
                type: NgInput
            }], active: [{
                type: NgInput
            }], removable: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], tone: [{
                type: NgInput
            }], onClick: [{
                type: NgInput
            }], onRemove: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], remove: [{
                type: Output
            }] } });
//# sourceMappingURL=FilterPill.js.map