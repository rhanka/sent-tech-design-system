import * as i0 from "@angular/core";
export type CheckboxProps = {
    label: string;
    helperText?: string;
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
    label: string;
    helperText?: string;
    invalid?: boolean;
    modelValue?: boolean;
    checked?: boolean;
    disabled?: boolean;
    name?: string;
    value?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Checkbox, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Checkbox, "st-checkbox", never, { "label": { "alias": "label"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "invalid": { "alias": "invalid"; "required": false; }; "modelValue": { "alias": "modelValue"; "required": false; }; "checked": { "alias": "checked"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "name": { "alias": "name"; "required": false; }; "value": { "alias": "value"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Checkbox.d.ts.map