import { Component, Input as NgInput } from "@angular/core";
import { Badge } from "./Badge.js";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
let _navSectionCounter = 0;
export class NavSection {
    static stComponentName = "NavSection";
    componentName = "NavSection";
    uid = `st-navSection-${++_navSectionCounter}`;
    localOpen;
    label;
    count;
    collapsible;
    open;
    as;
    classInput;
    get hasCount() {
        return this.count !== undefined && this.count !== null;
    }
    /** Count bubble accessible name (« N éléments »). */
    get countAriaLabel() {
        return `${this.count} éléments`;
    }
    /** Trigger accessible name : announces the count alongside the label. */
    get triggerAriaLabel() {
        return this.hasCount ? `${this.label}, ${this.count}` : this.label;
    }
    /** `open` is the INITIAL value (mirror of the Vue/Svelte `bind:open`): the
     * section owns its disclosure state once mounted. Defaults to open. */
    get currentOpen() {
        return this.localOpen ?? this.open ?? true;
    }
    toggle() {
        this.localOpen = !this.currentOpen;
    }
    get rootClasses() {
        return classNames("st-navSection", this.collapsible ? "st-navSection--collapsible" : "st-navSection--static", this.classInput);
    }
    /** Collapsible variant reuses the Collapsible anatomy (no size modifier, like
     * the Vue/React reference) merged with the NavSection root classes. */
    get collapsibleClass() {
        return classNames("st-collapsible", this.currentOpen && "st-collapsible--open", this.rootClasses);
    }
    get staticClass() {
        return this.rootClasses;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavSection, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: NavSection, isStandalone: true, selector: "st-nav-section", inputs: { label: "label", count: "count", collapsible: "collapsible", open: "open", as: "as", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    @if (collapsible) {
      <div [attr.data-st-component]="componentName" [class]="collapsibleClass">
        <button
          type="button"
          class="st-collapsible__trigger"
          [attr.aria-expanded]="currentOpen ? 'true' : 'false'"
          [attr.aria-controls]="uid + '-region'"
          [id]="uid + '-trigger'"
          [attr.aria-label]="triggerAriaLabel"
          (click)="toggle()"
        >
          <span class="st-collapsible__title">{{ label }}</span>
          @if (hasCount) {
            <span class="st-collapsible__trailing">
              <st-badge shape="circle" size="sm" [attr.aria-label]="countAriaLabel">{{ count }}</st-badge>
            </span>
          }
          <span class="st-collapsible__icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </button>
        @if (currentOpen) {
          <div
            class="st-collapsible__region"
            role="region"
            [id]="uid + '-region'"
            [attr.aria-labelledby]="uid + '-trigger'"
          >
            <ng-content></ng-content>
          </div>
        }
      </div>
    } @else {
      <section
        [attr.data-st-component]="componentName"
        [class]="staticClass"
        role="group"
        [attr.aria-labelledby]="uid + '-label'"
      >
        <div class="st-navSection__header">
          <h3 class="st-overline st-navSection__label" [id]="uid + '-label'">{{ label }}@if (hasCount) {<st-badge class="st-navSection__count" shape="circle" size="sm" [attr.aria-label]="countAriaLabel">{{ count }}</st-badge>}</h3>
        </div>
        <div class="st-navSection__body">
          <ng-content></ng-content>
        </div>
      </section>
    }
  `, isInline: true, dependencies: [{ kind: "component", type: Badge, selector: "st-badge", inputs: ["tone", "shape", "size", "label", "class"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavSection, decorators: [{
            type: Component,
            args: [{
                    selector: "st-nav-section",
                    standalone: true,
                    imports: [Badge],
                    template: `
    @if (collapsible) {
      <div [attr.data-st-component]="componentName" [class]="collapsibleClass">
        <button
          type="button"
          class="st-collapsible__trigger"
          [attr.aria-expanded]="currentOpen ? 'true' : 'false'"
          [attr.aria-controls]="uid + '-region'"
          [id]="uid + '-trigger'"
          [attr.aria-label]="triggerAriaLabel"
          (click)="toggle()"
        >
          <span class="st-collapsible__title">{{ label }}</span>
          @if (hasCount) {
            <span class="st-collapsible__trailing">
              <st-badge shape="circle" size="sm" [attr.aria-label]="countAriaLabel">{{ count }}</st-badge>
            </span>
          }
          <span class="st-collapsible__icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </button>
        @if (currentOpen) {
          <div
            class="st-collapsible__region"
            role="region"
            [id]="uid + '-region'"
            [attr.aria-labelledby]="uid + '-trigger'"
          >
            <ng-content></ng-content>
          </div>
        }
      </div>
    } @else {
      <section
        [attr.data-st-component]="componentName"
        [class]="staticClass"
        role="group"
        [attr.aria-labelledby]="uid + '-label'"
      >
        <div class="st-navSection__header">
          <h3 class="st-overline st-navSection__label" [id]="uid + '-label'">{{ label }}@if (hasCount) {<st-badge class="st-navSection__count" shape="circle" size="sm" [attr.aria-label]="countAriaLabel">{{ count }}</st-badge>}</h3>
        </div>
        <div class="st-navSection__body">
          <ng-content></ng-content>
        </div>
      </section>
    }
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], count: [{
                type: NgInput
            }], collapsible: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], as: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=NavSection.js.map