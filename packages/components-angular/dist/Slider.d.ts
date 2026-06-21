import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type SliderSize = "sm" | "md" | "lg";
export type SliderProps = {
    label?: string;
    size?: SliderSize;
    value?: number;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    modelValue?: number;
    helperText?: string;
    errorText?: string;
    invalid?: boolean;
    showValue?: boolean;
    disabled?: boolean;
    valueFormatter?: (value: number) => string;
    class?: string;
};
export declare class Slider {
    static readonly stComponentName = "Slider";
    readonly componentName = "Slider";
    label?: string;
    size?: SliderSize;
    value?: number;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    modelValue?: number;
    helperText?: string;
    errorText?: string;
    invalid?: boolean;
    showValue?: boolean;
    disabled?: boolean;
    valueFormatter?: (value: number) => string;
    classInput?: string;
    readonly modelValueChange: EventEmitter<number>;
    get currentValue(): number;
    get hostClass(): string;
    onInput(e: Event): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Slider, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Slider, "st-slider", never, { "label": { "alias": "label"; "required": false; }; "size": { "alias": "size"; "required": false; }; "value": { "alias": "value"; "required": false; }; "defaultValue": { "alias": "defaultValue"; "required": false; }; "min": { "alias": "min"; "required": false; }; "max": { "alias": "max"; "required": false; }; "step": { "alias": "step"; "required": false; }; "modelValue": { "alias": "modelValue"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "errorText": { "alias": "errorText"; "required": false; }; "invalid": { "alias": "invalid"; "required": false; }; "showValue": { "alias": "showValue"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "valueFormatter": { "alias": "valueFormatter"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "modelValueChange": "modelValueChange"; }, never, never, true, never>;
}
//# sourceMappingURL=Slider.d.ts.map