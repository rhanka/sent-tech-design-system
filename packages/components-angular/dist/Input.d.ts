import { EventEmitter } from "@angular/core";
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
    private readonly autoId;
    label?: string;
    helperText?: string;
    errorText?: string;
    invalid?: boolean;
    size?: InputSize;
    id?: string;
    modelValue?: string;
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    name?: string;
    type: string;
    classInput?: string;
    readonly modelValueChange: EventEmitter<string>;
    readonly updateModelValue: EventEmitter<string>;
    readonly input: EventEmitter<Event>;
    readonly change: EventEmitter<Event>;
    get inputId(): string;
    get currentValue(): string;
    get isInvalid(): boolean;
    get controlClass(): string;
    get hostClass(): string;
    onInput(event: Event): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Input, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Input, "st-input", never, { "label": { "alias": "label"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "errorText": { "alias": "errorText"; "required": false; }; "invalid": { "alias": "invalid"; "required": false; }; "size": { "alias": "size"; "required": false; }; "id": { "alias": "id"; "required": false; }; "modelValue": { "alias": "modelValue"; "required": false; }; "value": { "alias": "value"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "readonly": { "alias": "readonly"; "required": false; }; "required": { "alias": "required"; "required": false; }; "name": { "alias": "name"; "required": false; }; "type": { "alias": "type"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "modelValueChange": "modelValueChange"; "updateModelValue": "update:modelValue"; "input": "input"; "change": "change"; }, never, never, true, never>;
}
//# sourceMappingURL=Input.d.ts.map