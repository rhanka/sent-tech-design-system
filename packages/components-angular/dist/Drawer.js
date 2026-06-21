import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Drawer {
    static stComponentName = "Drawer";
    componentName = "Drawer";
    open;
    title;
    description;
    placement;
    closeLabel;
    classInput;
    close = new EventEmitter();
    get hostClass() {
        return classNames("st-drawer", `st-drawer--${this.placement ?? "right"}`, this.classInput);
    }
    onBackdropClick(event) {
        if (event.target === event.currentTarget) {
            this.close.emit();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Drawer, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Drawer, isStandalone: true, selector: "st-drawer", inputs: { open: "open", title: "title", description: "description", placement: "placement", closeLabel: "closeLabel", classInput: ["class", "classInput"] }, outputs: { close: "close" }, ngImport: i0, template: `
    @if (open) {
      <div
        class="st-drawer__backdrop"
        data-testid="st-drawer-backdrop"
        role="presentation"
        (click)="onBackdropClick($event)"
      >
        <aside
          [attr.data-st-component]="componentName"
          [class]="hostClass"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title || 'Drawer'"
        >
          <div class="st-drawer__header">
            @if (title) {
              <h2 class="st-drawer__title">{{ title }}</h2>
            }
            <button
              type="button"
              class="st-drawer__close"
              [attr.aria-label]="closeLabel || 'Close'"
              (click)="close.emit()"
            >&#x2715;</button>
          </div>
          @if (description) {
            <p class="st-drawer__description">{{ description }}</p>
          }
          <div class="st-drawer__body">
            <ng-content></ng-content>
          </div>
        </aside>
      </div>
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Drawer, decorators: [{
            type: Component,
            args: [{
                    selector: "st-drawer",
                    standalone: true,
                    template: `
    @if (open) {
      <div
        class="st-drawer__backdrop"
        data-testid="st-drawer-backdrop"
        role="presentation"
        (click)="onBackdropClick($event)"
      >
        <aside
          [attr.data-st-component]="componentName"
          [class]="hostClass"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title || 'Drawer'"
        >
          <div class="st-drawer__header">
            @if (title) {
              <h2 class="st-drawer__title">{{ title }}</h2>
            }
            <button
              type="button"
              class="st-drawer__close"
              [attr.aria-label]="closeLabel || 'Close'"
              (click)="close.emit()"
            >&#x2715;</button>
          </div>
          @if (description) {
            <p class="st-drawer__description">{{ description }}</p>
          }
          <div class="st-drawer__body">
            <ng-content></ng-content>
          </div>
        </aside>
      </div>
    }
  `,
                }]
        }], propDecorators: { open: [{
                type: NgInput
            }], title: [{
                type: NgInput
            }], description: [{
                type: NgInput
            }], placement: [{
                type: NgInput
            }], closeLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], close: [{
                type: Output
            }] } });
//# sourceMappingURL=Drawer.js.map