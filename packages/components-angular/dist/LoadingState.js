import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class LoadingState {
    static stComponentName = "LoadingState";
    componentName = "LoadingState";
    label = "Loading";
    variant;
    classInput;
    get resolvedVariant() {
        return this.variant ?? "spinner";
    }
    get hostClass() {
        return classNames("st-loading", `st-loading--${this.resolvedVariant}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: LoadingState, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: LoadingState, isStandalone: true, selector: "st-loading-state", inputs: { label: "label", variant: "variant", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <section
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="status"
      [attr.aria-label]="label"
      aria-busy="true"
    >
      @if (resolvedVariant === 'spinner') {
        <span class="st-loading__spinner" aria-hidden="true"></span>
      } @else {
        <span class="st-loading__skeleton" aria-hidden="true"></span>
      }
      <span class="st-loading__label">{{ label }}</span>
    </section>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: LoadingState, decorators: [{
            type: Component,
            args: [{
                    selector: "st-loading-state",
                    standalone: true,
                    template: `
    <section
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="status"
      [attr.aria-label]="label"
      aria-busy="true"
    >
      @if (resolvedVariant === 'spinner') {
        <span class="st-loading__spinner" aria-hidden="true"></span>
      } @else {
        <span class="st-loading__skeleton" aria-hidden="true"></span>
      }
      <span class="st-loading__label">{{ label }}</span>
    </section>
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], variant: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=LoadingState.js.map