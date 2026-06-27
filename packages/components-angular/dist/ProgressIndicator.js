import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class ProgressIndicator {
    static stComponentName = "ProgressIndicator";
    componentName = "ProgressIndicator";
    items;
    orientation;
    vertical;
    label;
    classInput;
    statusLabels = {
        complete: "Complete",
        current: "Current",
        upcoming: "Upcoming",
        invalid: "Invalid",
        disabled: "Disabled",
    };
    get resolvedOrientation() {
        return this.vertical ? "vertical" : (this.orientation ?? "horizontal");
    }
    get hostClass() {
        return classNames("st-progressIndicator", `st-progressIndicator--${this.resolvedOrientation}`, this.classInput);
    }
    resolvedStatus(item) {
        return item.status ?? "upcoming";
    }
    indicatorLabel(item) {
        const status = this.resolvedStatus(item);
        return `${this.statusLabels[status] ?? status}: ${item.label}`;
    }
    itemKey(item, index) {
        return item.id ?? item.value ?? String(index);
    }
    itemClass(item) {
        return classNames("st-progressIndicator__step", `st-progressIndicator__step--${this.resolvedStatus(item)}`);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ProgressIndicator, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: ProgressIndicator, isStandalone: true, selector: "st-progress-indicator", inputs: { items: "items", orientation: "orientation", vertical: "vertical", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <ol
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-label]="label ?? 'Progress'"
    >
      @for (item of items ?? []; track itemKey(item, $index); let index = $index, isLast = $last) {
        <li
          [class]="itemClass(item)"
          [attr.aria-current]="resolvedStatus(item) === 'current' ? 'step' : null"
        >
          <span
            class="st-progressIndicator__indicator"
            role="img"
            [attr.aria-label]="indicatorLabel(item)"
          >
            <span class="st-progressIndicator__circle">
              @switch (resolvedStatus(item)) {
                @case ('complete') {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
                }
                @case ('invalid') {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                }
                @case ('current') {
                  <span class="st-progressIndicator__dot"></span>
                }
                @default {
                  <span class="st-progressIndicator__index">{{ index + 1 }}</span>
                }
              }
            </span>
            @if (!isLast) {
              <span class="st-progressIndicator__connector"></span>
            }
          </span>
          <span class="st-progressIndicator__text">
            <span class="st-progressIndicator__label">{{ item.label }}</span>
            @if (item.description) {
              <span class="st-progressIndicator__description">{{ item.description }}</span>
            }
          </span>
        </li>
      }
    </ol>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ProgressIndicator, decorators: [{
            type: Component,
            args: [{
                    selector: "st-progress-indicator",
                    standalone: true,
                    template: `
    <ol
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-label]="label ?? 'Progress'"
    >
      @for (item of items ?? []; track itemKey(item, $index); let index = $index, isLast = $last) {
        <li
          [class]="itemClass(item)"
          [attr.aria-current]="resolvedStatus(item) === 'current' ? 'step' : null"
        >
          <span
            class="st-progressIndicator__indicator"
            role="img"
            [attr.aria-label]="indicatorLabel(item)"
          >
            <span class="st-progressIndicator__circle">
              @switch (resolvedStatus(item)) {
                @case ('complete') {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
                }
                @case ('invalid') {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                }
                @case ('current') {
                  <span class="st-progressIndicator__dot"></span>
                }
                @default {
                  <span class="st-progressIndicator__index">{{ index + 1 }}</span>
                }
              }
            </span>
            @if (!isLast) {
              <span class="st-progressIndicator__connector"></span>
            }
          </span>
          <span class="st-progressIndicator__text">
            <span class="st-progressIndicator__label">{{ item.label }}</span>
            @if (item.description) {
              <span class="st-progressIndicator__description">{{ item.description }}</span>
            }
          </span>
        </li>
      }
    </ol>
  `,
                }]
        }], propDecorators: { items: [{
                type: NgInput
            }], orientation: [{
                type: NgInput
            }], vertical: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ProgressIndicator.js.map