import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class LanguageToggle {
    static stComponentName = "LanguageToggle";
    componentName = "LanguageToggle";
    locale;
    frLabel;
    enLabel;
    label;
    selectId;
    variant;
    accordionLabel;
    classInput;
    get hostClass() {
        return classNames("st-languageToggle", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: LanguageToggle, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: LanguageToggle, isStandalone: true, selector: "st-language-toggle", inputs: { locale: "locale", frLabel: "frLabel", enLabel: "enLabel", label: "label", selectId: "selectId", variant: "variant", accordionLabel: "accordionLabel", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <button type="button" class="st-languageToggle__btn"
        [class.st-languageToggle__btn--active]="locale === 'fr'"
        [attr.aria-pressed]="locale === 'fr'">{{ frLabel || 'FR' }}</button>
      <button type="button" class="st-languageToggle__btn"
        [class.st-languageToggle__btn--active]="locale === 'en'"
        [attr.aria-pressed]="locale === 'en'">{{ enLabel || 'EN' }}</button>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: LanguageToggle, decorators: [{
            type: Component,
            args: [{
                    selector: "st-language-toggle",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <button type="button" class="st-languageToggle__btn"
        [class.st-languageToggle__btn--active]="locale === 'fr'"
        [attr.aria-pressed]="locale === 'fr'">{{ frLabel || 'FR' }}</button>
      <button type="button" class="st-languageToggle__btn"
        [class.st-languageToggle__btn--active]="locale === 'en'"
        [attr.aria-pressed]="locale === 'en'">{{ enLabel || 'EN' }}</button>
    </div>
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
            }] } });
//# sourceMappingURL=LanguageToggle.js.map