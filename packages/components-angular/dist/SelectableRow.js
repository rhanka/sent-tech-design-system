import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
/** Context key for list→row communication (Angular DI / lookup). Mirrors the
 *  Vue InjectionKey symbol so SelectableList can share its managed context. */
export const SELECTABLE_LIST_KEY = Symbol("SELECTABLE_LIST_KEY");
export class SelectableRow {
    static stComponentName = "SelectableRow";
    componentName = "SelectableRow";
    selected;
    onSelect;
    disabled;
    value;
    href;
    role;
    accentBar;
    caption;
    leading;
    trailing;
    classInput;
    get effectiveRole() {
        // Standalone row: a link row is announced as "link", otherwise the declared
        // role (default "button"). Inside a list the role is forced to "option".
        if (this.href)
            return this.role || "link";
        return this.role || "button";
    }
    get contentClass() {
        return classNames("st-selectableRow__content", this.caption && "st-selectableRow__content--stacked");
    }
    get selectedAttr() {
        return this.selected ? "true" : "false";
    }
    get tabindex() {
        return this.disabled ? -1 : 0;
    }
    handleClick(event) {
        if (this.disabled) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        if (this.href) {
            if (typeof window !== "undefined")
                window.location.assign(this.href);
            return;
        }
        this.onSelect?.(!this.selected);
    }
    get hostClass() {
        return classNames("st-selectableRow", this.selected && "st-selectableRow--selected", this.disabled && "st-selectableRow--disabled", this.accentBar && "st-selectableRow--accentBar", this.caption && "st-selectableRow--hasCaption", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SelectableRow, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: SelectableRow, isStandalone: true, selector: "st-selectable-row", inputs: { selected: "selected", onSelect: "onSelect", disabled: "disabled", value: "value", href: "href", role: "role", accentBar: "accentBar", caption: "caption", leading: "leading", trailing: "trailing", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.role]="effectiveRole"
      [attr.aria-selected]="effectiveRole === 'option' ? selectedAttr : null"
      [attr.aria-pressed]="effectiveRole === 'button' ? selectedAttr : null"
      [attr.aria-disabled]="disabled ? 'true' : null"
      [attr.data-value]="value"
      [attr.tabindex]="tabindex"
      (click)="handleClick($event)"
    >
      @if (leading) {
        <span class="st-selectableRow__leading"><ng-content select="[slot='leading']"></ng-content></span>
      }
      <span [class]="contentClass"><ng-content></ng-content><ng-content select="[slot='caption']"></ng-content></span>
      @if (trailing) {
        <span class="st-selectableRow__trailing"><ng-content select="[slot='trailing']"></ng-content></span>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SelectableRow, decorators: [{
            type: Component,
            args: [{
                    selector: "st-selectable-row",
                    standalone: true,
                    template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.role]="effectiveRole"
      [attr.aria-selected]="effectiveRole === 'option' ? selectedAttr : null"
      [attr.aria-pressed]="effectiveRole === 'button' ? selectedAttr : null"
      [attr.aria-disabled]="disabled ? 'true' : null"
      [attr.data-value]="value"
      [attr.tabindex]="tabindex"
      (click)="handleClick($event)"
    >
      @if (leading) {
        <span class="st-selectableRow__leading"><ng-content select="[slot='leading']"></ng-content></span>
      }
      <span [class]="contentClass"><ng-content></ng-content><ng-content select="[slot='caption']"></ng-content></span>
      @if (trailing) {
        <span class="st-selectableRow__trailing"><ng-content select="[slot='trailing']"></ng-content></span>
      }
    </div>
  `,
                }]
        }], propDecorators: { selected: [{
                type: NgInput
            }], onSelect: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], href: [{
                type: NgInput
            }], role: [{
                type: NgInput
            }], accentBar: [{
                type: NgInput
            }], caption: [{
                type: NgInput
            }], leading: [{
                type: NgInput
            }], trailing: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=SelectableRow.js.map