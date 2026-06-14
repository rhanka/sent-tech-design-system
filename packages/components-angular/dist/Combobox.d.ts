import * as i0 from "@angular/core";
export type ComboboxOption = {
    value: string;
    label: unknown;
    disabled?: boolean;
};
export type ComboboxSize = "sm" | "md" | "lg";
export type ComboboxProps = {
    label?: unknown;
    helperText?: string;
    errorText?: string;
    invalid?: boolean;
    options: ComboboxOption[];
    value?: string;
    size?: ComboboxSize;
    placeholder?: string;
    disabled?: boolean;
    open?: boolean;
    allowCustomValue?: boolean;
    noResultsLabel?: unknown;
    listLabel?: string;
    class?: string;
};
export declare class Combobox {
    static readonly stComponentName = "Combobox";
    readonly componentName = "Combobox";
    label?: unknown;
    helperText?: string;
    errorText?: string;
    invalid?: boolean;
    options: ComboboxOption[];
    value?: string;
    size?: ComboboxSize;
    placeholder?: string;
    disabled?: boolean;
    open?: boolean;
    allowCustomValue?: boolean;
    noResultsLabel?: unknown;
    listLabel?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Combobox, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Combobox, "st-combobox", never, { "label": { "alias": "label"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "errorText": { "alias": "errorText"; "required": false; }; "invalid": { "alias": "invalid"; "required": false; }; "options": { "alias": "options"; "required": false; }; "value": { "alias": "value"; "required": false; }; "size": { "alias": "size"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "open": { "alias": "open"; "required": false; }; "allowCustomValue": { "alias": "allowCustomValue"; "required": false; }; "noResultsLabel": { "alias": "noResultsLabel"; "required": false; }; "listLabel": { "alias": "listLabel"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Combobox.d.ts.map