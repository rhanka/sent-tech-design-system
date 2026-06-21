import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import { Menu } from "./Menu.js";
import * as i0 from "@angular/core";
export class OverflowMenu {
    static stComponentName = "OverflowMenu";
    componentName = "OverflowMenu";
    items = [];
    label;
    open;
    dense;
    placement;
    classInput;
    select = new EventEmitter();
    localOpen = false;
    get hostClass() {
        return classNames("st-overflowMenu", this.dense && "st-overflowMenu--dense", this.classInput);
    }
    get listClass() {
        return classNames("st-overflowMenu__list", `st-overflowMenu__list--${this.placement ?? "bottom-start"}`);
    }
    onMenuSelect(item) {
        this.localOpen = false;
        this.select.emit(item);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: OverflowMenu, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: OverflowMenu, isStandalone: true, selector: "st-overflow-menu", inputs: { items: "items", label: "label", open: "open", dense: "dense", placement: "placement", classInput: ["class", "classInput"] }, outputs: { select: "select" }, ngImport: i0, template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
    >
      <button
        type="button"
        class="st-overflowMenu__trigger"
        aria-haspopup="menu"
        [attr.aria-expanded]="localOpen"
        [attr.aria-label]="label || 'More'"
        (click)="localOpen = !localOpen"
      >&#8943;</button>
      @if (localOpen) {
        <div [class]="listClass">
          <st-menu [items]="items" [dense]="dense" (select)="onMenuSelect($event)"></st-menu>
        </div>
      }
    </div>
  `, isInline: true, dependencies: [{ kind: "component", type: Menu, selector: "st-menu", inputs: ["items", "dense", "role", "class"], outputs: ["select"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: OverflowMenu, decorators: [{
            type: Component,
            args: [{
                    selector: "st-overflow-menu",
                    standalone: true,
                    imports: [Menu],
                    template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
    >
      <button
        type="button"
        class="st-overflowMenu__trigger"
        aria-haspopup="menu"
        [attr.aria-expanded]="localOpen"
        [attr.aria-label]="label || 'More'"
        (click)="localOpen = !localOpen"
      >&#8943;</button>
      @if (localOpen) {
        <div [class]="listClass">
          <st-menu [items]="items" [dense]="dense" (select)="onMenuSelect($event)"></st-menu>
        </div>
      }
    </div>
  `,
                }]
        }], propDecorators: { items: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], dense: [{
                type: NgInput
            }], placement: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], select: [{
                type: Output
            }] } });
//# sourceMappingURL=OverflowMenu.js.map