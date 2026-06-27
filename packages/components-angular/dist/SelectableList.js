import { Component, ElementRef, Input as NgInput, } from "@angular/core";
import { classNames } from "./classNames.js";
import { SELECTABLE_LIST_KEY, } from "./SelectableRow.js";
import * as i0 from "@angular/core";
export class SelectableList {
    host;
    static stComponentName = "SelectableList";
    componentName = "SelectableList";
    label;
    labelledby;
    multiple;
    value;
    onChange;
    classInput;
    constructor(host) {
        this.host = host;
    }
    ngAfterViewInit() {
        this.syncSelection();
        // Safety re-apply after the current render flush settles (projected rows may
        // finish rendering their inner element just after this hook in the zoneless
        // island). Idempotent.
        queueMicrotask(() => this.syncSelection());
    }
    ngOnChanges() {
        this.syncSelection();
    }
    /**
     * The list OWNS selection: it drives the `--selected` styling of its
     * {@link SelectableRow} children from its own `value`, mirroring the
     * provide/inject contract of the React/Svelte/Vue references. Angular projects
     * pre-instantiated rows as plain DOM (no shared injector), so the list reads
     * each row's `data-value` and toggles the modifier directly. The rows' own
     * `[class]` binding only manages the tokens it emits (never `--selected` for a
     * managed row), so the patch is not clobbered on re-render.
     */
    syncSelection() {
        const root = this.host?.nativeElement;
        if (!root)
            return;
        const selected = new Set();
        const value = this.value;
        if (Array.isArray(value)) {
            for (const entry of value)
                if (entry != null)
                    selected.add(String(entry));
        }
        else if (value != null) {
            selected.add(String(value));
        }
        const rows = root.querySelectorAll(".st-selectableRow[data-value]");
        rows.forEach((row) => {
            const rowValue = row.getAttribute("data-value");
            const isSelected = rowValue != null && selected.has(rowValue);
            row.classList.toggle("st-selectableRow--selected", isSelected);
            row.setAttribute("aria-selected", isSelected ? "true" : "false");
        });
    }
    get hostClass() {
        return classNames("st-selectableList", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SelectableList, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: SelectableList, isStandalone: true, selector: "st-selectable-list", inputs: { label: "label", labelledby: "labelledby", multiple: "multiple", value: "value", onChange: "onChange", classInput: ["class", "classInput"] }, usesOnChanges: true, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass"
      role="listbox"
      [attr.aria-label]="labelledby ? null : label"
      [attr.aria-labelledby]="labelledby"
      [attr.aria-multiselectable]="multiple ? 'true' : null">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SelectableList, decorators: [{
            type: Component,
            args: [{
                    selector: "st-selectable-list",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass"
      role="listbox"
      [attr.aria-label]="labelledby ? null : label"
      [attr.aria-labelledby]="labelledby"
      [attr.aria-multiselectable]="multiple ? 'true' : null">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }], propDecorators: { label: [{
                type: NgInput
            }], labelledby: [{
                type: NgInput
            }], multiple: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], onChange: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=SelectableList.js.map