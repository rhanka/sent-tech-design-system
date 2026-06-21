import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class LoadingState {
    static stComponentName = "LoadingState";
    componentName = "LoadingState";
    label;
    title;
    variant;
    classInput;
    get hostClass() {
        return classNames("st-loading", `st-loading--${this.variant ?? "spinner"}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: LoadingState, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: LoadingState, isStandalone: true, selector: "st-loading-state", inputs: { label: "label", title: "title", variant: "variant", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="status">
      @if ((variant ?? 'spinner') === 'spinner') {
        <span class="st-loading__spinner" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" opacity="0.25"/>
            <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
      } @else {
        <div class="st-skeleton st-loading__skeleton">
          <div class="st-skeleton__line"></div>
          <div class="st-skeleton__line"></div>
          <div class="st-skeleton__line" style="width:75%"></div>
        </div>
      }
      @if (title ?? label) { <p class="st-loading__label">{{ title ?? label }}</p> }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: LoadingState, decorators: [{
            type: Component,
            args: [{
                    selector: "st-loading-state",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="status">
      @if ((variant ?? 'spinner') === 'spinner') {
        <span class="st-loading__spinner" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" opacity="0.25"/>
            <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
      } @else {
        <div class="st-skeleton st-loading__skeleton">
          <div class="st-skeleton__line"></div>
          <div class="st-skeleton__line"></div>
          <div class="st-skeleton__line" style="width:75%"></div>
        </div>
      }
      @if (title ?? label) { <p class="st-loading__label">{{ title ?? label }}</p> }
    </div>
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], title: [{
                type: NgInput
            }], variant: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=LoadingState.js.map