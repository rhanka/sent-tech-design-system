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
    role;
    accentBar;
    classInput;
    get hostClass() {
        return ["st-selectableRow", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SelectableRow, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: SelectableRow, isStandalone: true, selector: "st-selectable-row", inputs: { selected: "selected", onSelect: "onSelect", disabled: "disabled", value: "value", role: "role", accentBar: "accentBar", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SelectableRow, decorators: [{
            type: Component,
            args: [{
                    selector: "st-selectable-row",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
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
            }], role: [{
                type: NgInput
            }], accentBar: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=SelectableRow.js.map