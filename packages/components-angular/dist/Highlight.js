import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Highlight {
    static stComponentName = "Highlight";
    componentName = "Highlight";
    tone;
    title;
    classInput;
    get hostClass() {
        return classNames("st-highlight", this.tone && `st-highlight--${this.tone}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Highlight, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Highlight, isStandalone: true, selector: "st-highlight", inputs: { tone: "tone", title: "title", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="note">
      @if (title) { <strong class="st-highlight__title">{{ title }}</strong> }
      <div class="st-highlight__body"><ng-content></ng-content></div>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Highlight, decorators: [{
            type: Component,
            args: [{
                    selector: "st-highlight",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="note">
      @if (title) { <strong class="st-highlight__title">{{ title }}</strong> }
      <div class="st-highlight__body"><ng-content></ng-content></div>
    </div>
  `,
                }]
        }], propDecorators: { tone: [{
                type: NgInput
            }], title: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Highlight.js.map