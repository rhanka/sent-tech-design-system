import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class LanguageSelector {
    static stComponentName = "LanguageSelector";
    componentName = "LanguageSelector";
    open = false;
    options;
    value = "";
    label = "Choisir la langue";
    disabled = false;
    classInput;
    valueChange = new EventEmitter();
    change = new EventEmitter();
    get current() {
        return (this.options ?? []).find((o) => o.value === this.value) ?? (this.options ?? [])[0];
    }
    get hostClass() {
        return classNames("st-languageSelector", this.classInput);
    }
    choose(next) {
        this.value = next;
        this.open = false;
        this.valueChange.emit(next);
        this.change.emit(next);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: LanguageSelector, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: LanguageSelector, isStandalone: true, selector: "st-language-selector", inputs: { options: "options", value: "value", label: "label", disabled: "disabled", classInput: ["class", "classInput"] }, outputs: { valueChange: "valueChange", change: "change" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <button
        type="button"
        class="st-languageSelector__trigger"
        aria-haspopup="listbox"
        [attr.aria-expanded]="open"
        [attr.aria-label]="label"
        [disabled]="disabled ?? false"
        (click)="open = !open"
      >
        <span class="st-languageSelector__current">{{ current?.label ?? value }}</span>
        <span
          class="st-languageSelector__caret"
          [class.st-languageSelector__caret--open]="open"
          aria-hidden="true"
        ></span>
      </button>

      @if (open) {
        <ul class="st-languageSelector__menu" role="listbox" [attr.aria-label]="label">
          @for (option of options; track option.value) {
            <li>
              <button
                type="button"
                class="st-languageSelector__option"
                [class.st-languageSelector__option--active]="option.value === value"
                role="option"
                [attr.aria-selected]="option.value === value"
                (click)="choose(option.value)"
              >
                <span class="st-languageSelector__check" aria-hidden="true">{{ option.value === value ? "✓" : "" }}</span>
                {{ option.label }}
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: LanguageSelector, decorators: [{
            type: Component,
            args: [{
                    selector: "st-language-selector",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <button
        type="button"
        class="st-languageSelector__trigger"
        aria-haspopup="listbox"
        [attr.aria-expanded]="open"
        [attr.aria-label]="label"
        [disabled]="disabled ?? false"
        (click)="open = !open"
      >
        <span class="st-languageSelector__current">{{ current?.label ?? value }}</span>
        <span
          class="st-languageSelector__caret"
          [class.st-languageSelector__caret--open]="open"
          aria-hidden="true"
        ></span>
      </button>

      @if (open) {
        <ul class="st-languageSelector__menu" role="listbox" [attr.aria-label]="label">
          @for (option of options; track option.value) {
            <li>
              <button
                type="button"
                class="st-languageSelector__option"
                [class.st-languageSelector__option--active]="option.value === value"
                role="option"
                [attr.aria-selected]="option.value === value"
                (click)="choose(option.value)"
              >
                <span class="st-languageSelector__check" aria-hidden="true">{{ option.value === value ? "✓" : "" }}</span>
                {{ option.label }}
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
                }]
        }], propDecorators: { options: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], valueChange: [{
                type: Output
            }], change: [{
                type: Output,
                args: ["change"]
            }] } });
//# sourceMappingURL=LanguageSelector.js.map