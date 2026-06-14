import * as i0 from "@angular/core";
export type InputSize = "sm" | "md" | "lg";
export type InputProps = {
    label?: string;
    helperText?: string;
    errorText?: string;
    invalid?: boolean;
    size?: InputSize;
    id?: string;
    class?: string;
    modelValue?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
};
export declare class Input {
    static readonly stComponentName = "Input";
    readonly componentName = "Input";
    label?: string;
    helperText?: string;
    errorText?: string;
    invalid?: boolean;
    size?: InputSize;
    id?: string;
    classInput?: string;
    modelValue?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Input, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Input, "st-input", never, { "label": { "alias": "label"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "errorText": { "alias": "errorText"; "required": false; }; "invalid": { "alias": "invalid"; "required": false; }; "size": { "alias": "size"; "required": false; }; "id": { "alias": "id"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; "modelValue": { "alias": "modelValue"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "readonly": { "alias": "readonly"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Input.d.ts.map