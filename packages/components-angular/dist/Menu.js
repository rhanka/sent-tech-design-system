import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
function itemKind(item) {
    const tagged = item;
    return tagged.type ?? tagged.kind;
}
function isDivider(item) {
    return itemKind(item) === "divider";
}
function isGroup(item) {
    return itemKind(item) === "group";
}
function isDangerAction(item) {
    return item.variant === "danger" || item.danger === true;
}
export class Menu {
    static stComponentName = "Menu";
    componentName = "Menu";
    items = [];
    dense;
    role;
    classInput;
    select = new EventEmitter();
    get hostClass() {
        return classNames("st-menu", this.dense && "st-menu--dense", this.classInput);
    }
    isDivider(item) {
        return isDivider(item);
    }
    isGroup(item) {
        return isGroup(item);
    }
    asGroup(item) {
        return item;
    }
    asAction(item) {
        return item;
    }
    itemClass(item) {
        return classNames("st-menu__item", isDangerAction(item) && "st-menu__item--danger");
    }
    isStringIcon(icon) {
        return typeof icon === "string";
    }
    onItemClick(item) {
        if (item.disabled)
            return;
        item.onClick?.();
        this.select.emit(item);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Menu, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Menu, isStandalone: true, selector: "st-menu", inputs: { items: "items", dense: "dense", role: "role", classInput: ["class", "classInput"] }, outputs: { select: "select" }, ngImport: i0, template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.role]="role || 'menu'"
    >
      @for (item of items; track $index) {
        @if (isDivider(item)) {
          <div class="st-menu__divider" role="separator" aria-hidden="true"></div>
        } @else if (isGroup(item)) {
          <div class="st-menu__group" role="presentation">{{ asGroup(item).label }}</div>
          @for (child of asGroup(item).items || []; track $index) {
            <button
              type="button"
              role="menuitem"
              [disabled]="child.disabled"
              [attr.aria-disabled]="child.disabled ? 'true' : null"
              [class]="itemClass(child)"
              (click)="onItemClick(child)"
            >
              <span class="st-menu__itemLabel">{{ child.label }}</span>
            </button>
          }
        } @else {
          <button
            type="button"
            role="menuitem"
            [disabled]="asAction(item).disabled"
            [attr.aria-disabled]="asAction(item).disabled ? 'true' : null"
            [class]="itemClass(asAction(item))"
            (click)="onItemClick(asAction(item))"
          >
            @if (isStringIcon(asAction(item).icon)) {
              <span class="st-menu__itemIcon" aria-hidden="true">{{ asAction(item).icon }}</span>
            }
            <span class="st-menu__itemLabel">{{ asAction(item).label }}</span>
          </button>
        }
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Menu, decorators: [{
            type: Component,
            args: [{
                    selector: "st-menu",
                    standalone: true,
                    template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.role]="role || 'menu'"
    >
      @for (item of items; track $index) {
        @if (isDivider(item)) {
          <div class="st-menu__divider" role="separator" aria-hidden="true"></div>
        } @else if (isGroup(item)) {
          <div class="st-menu__group" role="presentation">{{ asGroup(item).label }}</div>
          @for (child of asGroup(item).items || []; track $index) {
            <button
              type="button"
              role="menuitem"
              [disabled]="child.disabled"
              [attr.aria-disabled]="child.disabled ? 'true' : null"
              [class]="itemClass(child)"
              (click)="onItemClick(child)"
            >
              <span class="st-menu__itemLabel">{{ child.label }}</span>
            </button>
          }
        } @else {
          <button
            type="button"
            role="menuitem"
            [disabled]="asAction(item).disabled"
            [attr.aria-disabled]="asAction(item).disabled ? 'true' : null"
            [class]="itemClass(asAction(item))"
            (click)="onItemClick(asAction(item))"
          >
            @if (isStringIcon(asAction(item).icon)) {
              <span class="st-menu__itemIcon" aria-hidden="true">{{ asAction(item).icon }}</span>
            }
            <span class="st-menu__itemLabel">{{ asAction(item).label }}</span>
          </button>
        }
      }
    </div>
  `,
                }]
        }], propDecorators: { items: [{
                type: NgInput
            }], dense: [{
                type: NgInput
            }], role: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], select: [{
                type: Output
            }] } });
//# sourceMappingURL=Menu.js.map