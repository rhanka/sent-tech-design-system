import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type SelectSize = "sm" | "md" | "lg";
export type SelectOption = {
    value: string;
    label: unknown;
    disabled?: boolean;
};
export type SelectProps = {
    label?: unknown;
    helperText?: unknown;
    errorText?: unknown;
    invalid?: boolean;
    size?: SelectSize;
    options?: SelectOption[];
    modelValue?: string;
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    class?: string;
};
export declare class Select {
    static readonly stComponentName = "Select";
    readonly componentName = "Select";
    readonly selectId: string;
    constructor();
    label?: unknown;
    helperText?: unknown;
    errorText?: unknown;
    invalid?: boolean;
    size?: SelectSize;
    options?: SelectOption[];
    modelValue?: string;
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    classInput?: string;
    readonly modelValueChange: EventEmitter<string>;
    get currentValue(): string;
    get hostClass(): string;
    onChange(e: Event): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Select, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Select, "st-select", never, { "label": { "alias": "label"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "errorText": { "alias": "errorText"; "required": false; }; "invalid": { "alias": "invalid"; "required": false; }; "size": { "alias": "size"; "required": false; }; "options": { "alias": "options"; "required": false; }; "modelValue": { "alias": "modelValue"; "required": false; }; "value": { "alias": "value"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "modelValueChange": "modelValueChange"; }, never, never, true, never>;
}
//# sourceMappingURL=Select.d.ts.map