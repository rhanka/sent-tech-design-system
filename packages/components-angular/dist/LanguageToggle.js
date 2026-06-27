import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
let _counter = 0;
export class LanguageToggle {
    static stComponentName = "LanguageToggle";
    componentName = "LanguageToggle";
    open = false;
    autoSelectId = `st-languageToggle-${++_counter}`;
    locale = "fr";
    frLabel = "FR";
    enLabel = "EN";
    label = "Langue";
    selectId;
    variant = "select";
    accordionLabel = "Langue";
    classInput;
    localeChange = new EventEmitter();
    get resolvedSelectId() {
        return this.selectId ?? this.autoSelectId;
    }
    get hostClass() {
        return classNames("st-languageToggle", this.classInput);
    }
    get selectClass() {
        return classNames("st-languageToggle__select", this.classInput);
    }
    emit(next) {
        this.localeChange.emit(next);
    }
    onSelectChange(event) {
        const value = event.target.value;
        this.emit(value);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: LanguageToggle, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: LanguageToggle, isStandalone: true, selector: "st-language-toggle", inputs: { locale: "locale", frLabel: "frLabel", enLabel: "enLabel", label: "label", selectId: "selectId", variant: "variant", accordionLabel: "accordionLabel", classInput: ["class", "classInput"] }, outputs: { localeChange: "localeChange" }, ngImport: i0, template: `
    @if (variant === "accordion") {
      <div [attr.data-st-component]="componentName" [class]="hostClass">
        <button
          type="button"
          class="st-languageToggle__accordionTrigger"
          [attr.aria-expanded]="open"
          (click)="open = !open"
        >
          <span>{{ accordionLabel }}</span>
          <span
            class="st-languageToggle__chevron"
            [class.st-languageToggle__chevron--open]="open"
            aria-hidden="true"
          >&#x25BE;</span>
        </button>
        @if (open) {
          <div class="st-languageToggle__accordionPanel">
            <button
              type="button"
              class="st-languageToggle__option"
              [class.st-languageToggle__option--active]="locale === 'fr'"
              [attr.aria-current]="locale === 'fr' ? 'true' : 'false'"
              (click)="emit('fr')"
            >
              {{ frLabel }}
            </button>
            <button
              type="button"
              class="st-languageToggle__option"
              [class.st-languageToggle__option--active]="locale === 'en'"
              [attr.aria-current]="locale === 'en' ? 'true' : 'false'"
              (click)="emit('en')"
            >
              {{ enLabel }}
            </button>
          </div>
        }
      </div>
    } @else {
      <label class="st-languageToggle__srLabel" [attr.for]="resolvedSelectId">{{ label }}</label>
      <select
        [attr.data-st-component]="componentName"
        [id]="resolvedSelectId"
        [class]="selectClass"
        [value]="locale"
        [attr.aria-label]="label"
        (change)="onSelectChange($event)"
      >
        <option value="fr">{{ frLabel }}</option>
        <option value="en">{{ enLabel }}</option>
      </select>
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: LanguageToggle, decorators: [{
            type: Component,
            args: [{
                    selector: "st-language-toggle",
                    standalone: true,
                    template: `
    @if (variant === "accordion") {
      <div [attr.data-st-component]="componentName" [class]="hostClass">
        <button
          type="button"
          class="st-languageToggle__accordionTrigger"
          [attr.aria-expanded]="open"
          (click)="open = !open"
        >
          <span>{{ accordionLabel }}</span>
          <span
            class="st-languageToggle__chevron"
            [class.st-languageToggle__chevron--open]="open"
            aria-hidden="true"
          >&#x25BE;</span>
        </button>
        @if (open) {
          <div class="st-languageToggle__accordionPanel">
            <button
              type="button"
              class="st-languageToggle__option"
              [class.st-languageToggle__option--active]="locale === 'fr'"
              [attr.aria-current]="locale === 'fr' ? 'true' : 'false'"
              (click)="emit('fr')"
            >
              {{ frLabel }}
            </button>
            <button
              type="button"
              class="st-languageToggle__option"
              [class.st-languageToggle__option--active]="locale === 'en'"
              [attr.aria-current]="locale === 'en' ? 'true' : 'false'"
              (click)="emit('en')"
            >
              {{ enLabel }}
            </button>
          </div>
        }
      </div>
    } @else {
      <label class="st-languageToggle__srLabel" [attr.for]="resolvedSelectId">{{ label }}</label>
      <select
        [attr.data-st-component]="componentName"
        [id]="resolvedSelectId"
        [class]="selectClass"
        [value]="locale"
        [attr.aria-label]="label"
        (change)="onSelectChange($event)"
      >
        <option value="fr">{{ frLabel }}</option>
        <option value="en">{{ enLabel }}</option>
      </select>
    }
  `,
                }]
        }], propDecorators: { locale: [{
                type: NgInput
            }], frLabel: [{
                type: NgInput
            }], enLabel: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], selectId: [{
                type: NgInput
            }], variant: [{
                type: NgInput
            }], accordionLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], localeChange: [{
                type: Output
            }] } });
//# sourceMappingURL=LanguageToggle.js.map