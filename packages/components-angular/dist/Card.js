import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Card {
    static stComponentName = "Card";
    componentName = "Card";
    interactive;
    classInput;
    get hostClass() {
        return classNames("st-card", this.interactive && "st-card--interactive", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Card, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Card, isStandalone: true, selector: "st-card", inputs: { interactive: "interactive", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <section [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </section>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Card, decorators: [{
            type: Component,
            args: [{
                    selector: "st-card",
                    standalone: true,
                    template: `
    <section [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </section>
  `,
                }]
        }], propDecorators: { interactive: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Card.js.map