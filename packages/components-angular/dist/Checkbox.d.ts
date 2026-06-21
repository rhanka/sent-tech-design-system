import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type CheckboxProps = {
    label: string;
    helperText?: string;
    /** Secondary muted description line under the label (e.g. a filter hint). */
    description?: string;
    /** Trailing slot pushed to the row end (e.g. a count Badge). */
    trailing?: unknown;
    invalid?: boolean;
    modelValue?: boolean;
    checked?: boolean;
    disabled?: boolean;
    name?: string;
    value?: string;
    class?: string;
};
export declare class Checkbox {
    static readonly stComponentName = "Checkbox";
    readonly componentName = "Checkbox";
    private readonly autoId;
    label: string;
    helperText?: string;
    description?: string;
    trailing?: unknown;
    invalid?: boolean;
    modelValue?: boolean;
    checked?: boolean;
    disabled?: boolean;
    name?: string;
    value?: string;
    classInput?: string;
    readonly modelValueChange: EventEmitter<boolean>;
    readonly updateModelValue: EventEmitter<boolean>;
    readonly change: EventEmitter<Event>;
    get descriptionId(): string;
    get currentChecked(): boolean;
    get hostClass(): string;
    onCheck(event: Event): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Checkbox, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Checkbox, "st-checkbox", never, { "label": { "alias": "label"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "description": { "alias": "description"; "required": false; }; "trailing": { "alias": "trailing"; "required": false; }; "invalid": { "alias": "invalid"; "required": false; }; "modelValue": { "alias": "modelValue"; "required": false; }; "checked": { "alias": "checked"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "name": { "alias": "name"; "required": false; }; "value": { "alias": "value"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "modelValueChange": "modelValueChange"; "updateModelValue": "update:modelValue"; "change": "change"; }, never, never, true, never>;
}
//# sourceMappingURL=Checkbox.d.ts.map