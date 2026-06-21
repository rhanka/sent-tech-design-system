import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type TextareaProps = {
    label?: unknown;
    helperText?: unknown;
    errorText?: unknown;
    invalid?: boolean;
    modelValue?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    rows?: number;
    class?: string;
};
export declare class Textarea {
    static readonly stComponentName = "Textarea";
    readonly componentName = "Textarea";
    private readonly autoId;
    label?: unknown;
    helperText?: unknown;
    errorText?: unknown;
    invalid?: boolean;
    modelValue?: string;
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    rows?: number;
    classInput?: string;
    readonly modelValueChange: EventEmitter<string>;
    readonly updateModelValue: EventEmitter<string>;
    readonly input: EventEmitter<Event>;
    readonly change: EventEmitter<Event>;
    get inputId(): string;
    get currentValue(): string;
    get isInvalid(): boolean;
    get hostClass(): string;
    onInput(event: Event): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Textarea, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Textarea, "st-textarea", never, { "label": { "alias": "label"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "errorText": { "alias": "errorText"; "required": false; }; "invalid": { "alias": "invalid"; "required": false; }; "modelValue": { "alias": "modelValue"; "required": false; }; "value": { "alias": "value"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "readonly": { "alias": "readonly"; "required": false; }; "rows": { "alias": "rows"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "modelValueChange": "modelValueChange"; "updateModelValue": "update:modelValue"; "input": "input"; "change": "change"; }, never, never, true, never>;
}
//# sourceMappingURL=Textarea.d.ts.map