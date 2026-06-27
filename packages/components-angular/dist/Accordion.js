import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
let _accordionCounter = 0;
export class Accordion {
    static stComponentName = "Accordion";
    componentName = "Accordion";
    instancePrefix = `accordion-${++_accordionCounter}`;
    localOpenIds = [];
    items;
    openIds;
    defaultOpenIds;
    allowMultiple;
    open;
    multiple;
    align;
    size;
    classInput;
    change = new EventEmitter();
    ngOnInit() {
        this.localOpenIds = this.defaultOpenIds ?? this.open ?? [];
    }
    get resolvedAlign() {
        return this.align ?? "end";
    }
    get resolvedAllowMultiple() {
        return this.allowMultiple ?? this.multiple ?? false;
    }
    get effectiveOpenIds() {
        return this.openIds ?? this.localOpenIds;
    }
    itemId(item, index) {
        return item.id ?? `${this.instancePrefix}-${index}`;
    }
    isOpen(item, index) {
        return this.effectiveOpenIds.includes(this.itemId(item, index));
    }
    itemClass(item, index) {
        return classNames("st-accordion__item", this.isOpen(item, index) && "st-accordion__item--open");
    }
    toggle(item, index) {
        const id = this.itemId(item, index);
        const current = this.effectiveOpenIds;
        const next = current.includes(id)
            ? current.filter((v) => v !== id)
            : this.resolvedAllowMultiple
                ? [...current, id]
                : [id];
        if (this.openIds === undefined) {
            this.localOpenIds = next;
        }
        this.change.emit(next);
    }
    resolveContent(item) {
        return typeof item.content === "function" ? String(item.content()) : item.content;
    }
    get hostClass() {
        return classNames("st-accordion", `st-accordion--${this.size ?? "md"}`, `st-accordion--align-${this.resolvedAlign}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Accordion, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Accordion, isStandalone: true, selector: "st-accordion", inputs: { items: "items", openIds: "openIds", defaultOpenIds: "defaultOpenIds", allowMultiple: "allowMultiple", open: "open", multiple: "multiple", align: "align", size: "size", classInput: ["class", "classInput"] }, outputs: { change: "change" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @for (item of items; track itemId(item, $index)) {
        <div [class]="itemClass(item, $index)">
          <h3 class="st-accordion__heading">
            <button
              type="button"
              class="st-accordion__trigger"
              [disabled]="item.disabled"
              [attr.aria-expanded]="isOpen(item, $index) ? 'true' : 'false'"
              [attr.aria-controls]="'st-accordion-panel-' + itemId(item, $index)"
              [id]="'st-accordion-trigger-' + itemId(item, $index)"
              (click)="toggle(item, $index)"
            >
              @if (resolvedAlign === 'start') {
                <span class="st-accordion__icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              }
              <span class="st-accordion__title">{{ item.title }}</span>
              @if (resolvedAlign !== 'start') {
                <span class="st-accordion__icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              }
            </button>
          </h3>
          @if (isOpen(item, $index)) {
            <div
              class="st-accordion__panel"
              role="region"
              [id]="'st-accordion-panel-' + itemId(item, $index)"
              [attr.aria-labelledby]="'st-accordion-trigger-' + itemId(item, $index)"
            >
              {{ resolveContent(item) }}
            </div>
          }
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Accordion, decorators: [{
            type: Component,
            args: [{
                    selector: "st-accordion",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @for (item of items; track itemId(item, $index)) {
        <div [class]="itemClass(item, $index)">
          <h3 class="st-accordion__heading">
            <button
              type="button"
              class="st-accordion__trigger"
              [disabled]="item.disabled"
              [attr.aria-expanded]="isOpen(item, $index) ? 'true' : 'false'"
              [attr.aria-controls]="'st-accordion-panel-' + itemId(item, $index)"
              [id]="'st-accordion-trigger-' + itemId(item, $index)"
              (click)="toggle(item, $index)"
            >
              @if (resolvedAlign === 'start') {
                <span class="st-accordion__icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              }
              <span class="st-accordion__title">{{ item.title }}</span>
              @if (resolvedAlign !== 'start') {
                <span class="st-accordion__icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              }
            </button>
          </h3>
          @if (isOpen(item, $index)) {
            <div
              class="st-accordion__panel"
              role="region"
              [id]="'st-accordion-panel-' + itemId(item, $index)"
              [attr.aria-labelledby]="'st-accordion-trigger-' + itemId(item, $index)"
            >
              {{ resolveContent(item) }}
            </div>
          }
        </div>
      }
    </div>
  `,
                }]
        }], propDecorators: { items: [{
                type: NgInput
            }], openIds: [{
                type: NgInput
            }], defaultOpenIds: [{
                type: NgInput
            }], allowMultiple: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], multiple: [{
                type: NgInput
            }], align: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], change: [{
                type: Output
            }] } });
//# sourceMappingURL=Accordion.js.map