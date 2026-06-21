import { EventEmitter } from "@angular/core";
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
    showLabel?: string;
    hideLabel?: string;
    class?: string;
};
export declare class PasswordInput {
    static readonly stComponentName = "PasswordInput";
    readonly componentName = "PasswordInput";
    private readonly autoId;
    showPassword: boolean;
    label?: unknown;
    helperText?: unknown;
    errorText?: unknown;
    size?: PasswordInputSize;
    modelValue?: string;
    value?: string;
    disabled?: boolean;
    placeholder?: string;
    showLabel?: string;
    hideLabel?: string;
    classInput?: string;
    readonly modelValueChange: EventEmitter<string>;
    readonly updateModelValue: EventEmitter<string>;
    readonly input: EventEmitter<Event>;
    readonly change: EventEmitter<Event>;
    get inputId(): string;
    get inputType(): string;
    get currentValue(): string;
    get isInvalid(): boolean;
    get controlWrapClass(): string;
    get hostClass(): string;
    toggleVisibility(): void;
    onInput(event: Event): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PasswordInput, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PasswordInput, "st-password-input", never, { "label": { "alias": "label"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "errorText": { "alias": "errorText"; "required": false; }; "size": { "alias": "size"; "required": false; }; "modelValue": { "alias": "modelValue"; "required": false; }; "value": { "alias": "value"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "showLabel": { "alias": "showLabel"; "required": false; }; "hideLabel": { "alias": "hideLabel"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "modelValueChange": "modelValueChange"; "updateModelValue": "update:modelValue"; "input": "input"; "change": "change"; }, never, never, true, never>;
}
//# sourceMappingURL=PasswordInput.d.ts.map