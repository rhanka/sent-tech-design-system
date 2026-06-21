import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class LanguageSelector {
    static stComponentName = "LanguageSelector";
    componentName = "LanguageSelector";
    options;
    value;
    open;
    classInput;
    onChange(_event) { }
    get hostClass() {
        return classNames("st-languageSelector", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: LanguageSelector, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: LanguageSelector, isStandalone: true, selector: "st-language-selector", inputs: { options: "options", value: "value", open: "open", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <select class="st-languageSelector__select" [value]="value" (change)="onChange($event)">
        @for (opt of options; track opt.value) {
          <option [value]="opt.value" [selected]="opt.value === value">{{ opt.label }}</option>
        }
      </select>
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
      <select class="st-languageSelector__select" [value]="value" (change)="onChange($event)">
        @for (opt of options; track opt.value) {
          <option [value]="opt.value" [selected]="opt.value === value">{{ opt.label }}</option>
        }
      </select>
    </div>
  `,
                }]
        }], propDecorators: { options: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=LanguageSelector.js.map