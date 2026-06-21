import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class NavDrawer {
    static stComponentName = "NavDrawer";
    componentName = "NavDrawer";
    title;
    label;
    open = false;
    side = "left";
    navItems;
    classInput;
    closeEvent = new EventEmitter();
    get hostClass() {
        return classNames("st-navDrawer", "st-navShell", "st-navShell--drawer", `st-drawer--${this.side ?? "left"}`, this.classInput);
    }
    onBackdropClick(event) {
        if (event.target === event.currentTarget) {
            this.closeEvent.emit();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavDrawer, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: NavDrawer, isStandalone: true, selector: "st-nav-drawer", inputs: { title: "title", label: "label", open: "open", side: "side", navItems: "navItems", classInput: ["class", "classInput"] }, outputs: { closeEvent: "closeEvent" }, ngImport: i0, template: `
    @if (open) {
      <div
        class="st-drawer__backdrop"
        role="presentation"
        (click)="onBackdropClick($event)"
      >
        <aside
          [attr.data-st-component]="componentName"
          [class]="hostClass"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title || label || 'Navigation'"
        >
          <header class="st-drawer__header">
            <div>
              @if (title || label) {
                <h2 class="st-drawer__title">{{ title || label }}</h2>
              }
            </div>
            <button
              type="button"
              class="st-drawer__close"
              aria-label="Close"
              (click)="closeEvent.emit()"
            ><span aria-hidden="true">&#x2715;</span></button>
          </header>
          <div class="st-drawer__body">
            @if (navItems && navItems.length > 0) {
              <nav>
                <ul class="st-navDrawer__list">
                  @for (item of navItems; track item.label) {
                    <li class="st-navDrawer__item">
                      <a
                        [href]="item.href ?? '#'"
                        class="st-navDrawer__link"
                        [class.st-navDrawer__link--active]="item.active"
                      >{{ item.label }}</a>
                    </li>
                  }
                </ul>
              </nav>
            }
          </div>
        </aside>
      </div>
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavDrawer, decorators: [{
            type: Component,
            args: [{
                    selector: "st-nav-drawer",
                    standalone: true,
                    template: `
    @if (open) {
      <div
        class="st-drawer__backdrop"
        role="presentation"
        (click)="onBackdropClick($event)"
      >
        <aside
          [attr.data-st-component]="componentName"
          [class]="hostClass"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title || label || 'Navigation'"
        >
          <header class="st-drawer__header">
            <div>
              @if (title || label) {
                <h2 class="st-drawer__title">{{ title || label }}</h2>
              }
            </div>
            <button
              type="button"
              class="st-drawer__close"
              aria-label="Close"
              (click)="closeEvent.emit()"
            ><span aria-hidden="true">&#x2715;</span></button>
          </header>
          <div class="st-drawer__body">
            @if (navItems && navItems.length > 0) {
              <nav>
                <ul class="st-navDrawer__list">
                  @for (item of navItems; track item.label) {
                    <li class="st-navDrawer__item">
                      <a
                        [href]="item.href ?? '#'"
                        class="st-navDrawer__link"
                        [class.st-navDrawer__link--active]="item.active"
                      >{{ item.label }}</a>
                    </li>
                  }
                </ul>
              </nav>
            }
          </div>
        </aside>
      </div>
    }
  `,
                }]
        }], propDecorators: { title: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], side: [{
                type: NgInput
            }], navItems: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], closeEvent: [{
                type: Output
            }] } });
//# sourceMappingURL=NavDrawer.js.map