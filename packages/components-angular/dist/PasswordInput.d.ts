import * as i0 from "@angular/core";
export type PasswordInputSize = "sm" | "md" | "lg";
export type PasswordInputProps = {
    label?: unknown;
    helperText?: unknown;
    errorText?: unknown;
    size?: PasswordInputSize;
    modelValue?: string;
    disabled?: boolean;
    placeholder?: string;
    class?: string;
};
export declare class PasswordInput {
    static readonly stComponentName = "PasswordInput";
    readonly componentName = "PasswordInput";
    label?: unknown;
    helperText?: unknown;
    errorText?: unknown;
    size?: PasswordInputSize;
    modelValue?: string;
    disabled?: boolean;
    placeholder?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<PasswordInput, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PasswordInput, "st-password-input", never, { "label": { "alias": "label"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "errorText": { "alias": "errorText"; "required": false; }; "size": { "alias": "size"; "required": false; }; "modelValue": { "alias": "modelValue"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=PasswordInput.d.ts.map