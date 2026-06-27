import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Quote {
    static stComponentName = "Quote";
    componentName = "Quote";
    author;
    source;
    classInput;
    get hostClass() {
        return classNames("st-quote", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Quote, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Quote, isStandalone: true, selector: "st-quote", inputs: { author: "author", source: "source", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <blockquote [attr.data-st-component]="componentName" [class]="hostClass">
      <p class="st-quote__text"><ng-content></ng-content></p>
      @if (author || source) {
        <footer class="st-quote__attribution">
          @if (author) { <span class="st-quote__author">{{ author }}</span> }
          @if (source) { <span class="st-quote__source">{{ source }}</span> }
        </footer>
      }
    </blockquote>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Quote, decorators: [{
            type: Component,
            args: [{
                    selector: "st-quote",
                    standalone: true,
                    template: `
    <blockquote [attr.data-st-component]="componentName" [class]="hostClass">
      <p class="st-quote__text"><ng-content></ng-content></p>
      @if (author || source) {
        <footer class="st-quote__attribution">
          @if (author) { <span class="st-quote__author">{{ author }}</span> }
          @if (source) { <span class="st-quote__source">{{ source }}</span> }
        </footer>
      }
    </blockquote>
  `,
                }]
        }], propDecorators: { author: [{
                type: NgInput
            }], source: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Quote.js.map