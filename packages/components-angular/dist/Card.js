import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Card {
    static stComponentName = "Card";
    componentName = "Card";
    interactive;
    title;
    subtitle;
    classInput;
    get hostClass() {
        return classNames("st-card", this.interactive && "st-card--interactive", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Card, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Card, isStandalone: true, selector: "st-card", inputs: { interactive: "interactive", title: "title", subtitle: "subtitle", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (title || subtitle) {
        <div class="st-card__header">
          @if (title) {
            <h3 class="st-card__title">{{ title }}</h3>
          }
          @if (subtitle) {
            <p class="st-card__subtitle">{{ subtitle }}</p>
          }
        </div>
      }
      <div class="st-card__body">
        <ng-content></ng-content>
      </div>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Card, decorators: [{
            type: Component,
            args: [{
                    selector: "st-card",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (title || subtitle) {
        <div class="st-card__header">
          @if (title) {
            <h3 class="st-card__title">{{ title }}</h3>
          }
          @if (subtitle) {
            <p class="st-card__subtitle">{{ subtitle }}</p>
          }
        </div>
      }
      <div class="st-card__body">
        <ng-content></ng-content>
      </div>
    </div>
  `,
                }]
        }], propDecorators: { interactive: [{
                type: NgInput
            }], title: [{
                type: NgInput
            }], subtitle: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Card.js.map