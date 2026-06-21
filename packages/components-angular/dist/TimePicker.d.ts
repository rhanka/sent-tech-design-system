import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type TimePickerFormat = "24" | "12";
export type TimePickerSize = "sm" | "md" | "lg";
export type TimePickerProps = {
    value?: string;
    modelValue?: string;
    onChange?: (value: string) => void;
    step?: number;
    min?: string;
    max?: string;
    format?: TimePickerFormat;
    size?: TimePickerSize;
    disabled?: boolean;
    label?: string;
    placeholder?: string;
    invalid?: boolean;
    errorText?: string;
    class?: string;
    id?: string;
};
export declare class TimePicker {
    static readonly stComponentName = "TimePicker";
    readonly componentName = "TimePicker";
    readonly fieldId: string;
    constructor();
    value?: string;
    modelValue?: string;
    onChange?: (value: string) => void;
    step?: number;
    min?: string;
    max?: string;
    format?: TimePickerFormat;
    size?: TimePickerSize;
    disabled?: boolean;
    label?: string;
    placeholder?: string;
    invalid?: boolean;
    errorText?: string;
    classInput?: string;
    id?: string;
    readonly modelValueChange: EventEmitter<string>;
    get currentValue(): string;
    get hostClass(): string;
    onInput(e: Event): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<TimePicker, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TimePicker, "st-time-picker", never, { "value": { "alias": "value"; "required": false; }; "modelValue": { "alias": "modelValue"; "required": false; }; "onChange": { "alias": "onChange"; "required": false; }; "step": { "alias": "step"; "required": false; }; "min": { "alias": "min"; "required": false; }; "max": { "alias": "max"; "required": false; }; "format": { "alias": "format"; "required": false; }; "size": { "alias": "size"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "label": { "alias": "label"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "invalid": { "alias": "invalid"; "required": false; }; "errorText": { "alias": "errorText"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; "id": { "alias": "id"; "required": false; }; }, { "modelValueChange": "modelValueChange"; }, never, never, true, never>;
}
//# sourceMappingURL=TimePicker.d.ts.map