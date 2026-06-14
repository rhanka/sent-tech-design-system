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
    disabled?: boolean;
    class?: string;
};
export declare class Select {
    static readonly stComponentName = "Select";
    readonly componentName = "Select";
    label?: unknown;
    helperText?: unknown;
    errorText?: unknown;
    invalid?: boolean;
    size?: SelectSize;
    options?: SelectOption[];
    modelValue?: string;
    disabled?: boolean;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Select, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Select, "st-select", never, { "label": { "alias": "label"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "errorText": { "alias": "errorText"; "required": false; }; "invalid": { "alias": "invalid"; "required": false; }; "size": { "alias": "size"; "required": false; }; "options": { "alias": "options"; "required": false; }; "modelValue": { "alias": "modelValue"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Select.d.ts.map