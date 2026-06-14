import * as i0 from "@angular/core";
export type RangeSliderSize = "sm" | "md" | "lg";
export type RangeSliderProps = {
    /** Valeur contrôlée via v-model [poignée basse, poignée haute]. */
    modelValue?: [number, number];
    /** Alias contrôlé sans v-model. */
    value?: [number, number];
    /** Valeur initiale en mode non-contrôlé. Défaut [min, max]. */
    defaultValue?: [number, number];
    min?: number;
    max?: number;
    step?: number;
    size?: RangeSliderSize;
    disabled?: boolean;
    label?: string;
    helperText?: string;
    errorText?: string;
    invalid?: boolean;
    showValue?: boolean;
    valueFormatter?: (value: number) => string;
    ariaLabelMin?: string;
    ariaLabelMax?: string;
    class?: string;
};
export declare class RangeSlider {
    static readonly stComponentName = "RangeSlider";
    readonly componentName = "RangeSlider";
    modelValue?: [number, number];
    value?: [number, number];
    defaultValue?: [number, number];
    min?: number;
    max?: number;
    step?: number;
    size?: RangeSliderSize;
    disabled?: boolean;
    label?: string;
    helperText?: string;
    errorText?: string;
    invalid?: boolean;
    showValue?: boolean;
    valueFormatter?: (value: number) => string;
    ariaLabelMin?: string;
    ariaLabelMax?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<RangeSlider, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<RangeSlider, "st-range-slider", never, { "modelValue": { "alias": "modelValue"; "required": false; }; "value": { "alias": "value"; "required": false; }; "defaultValue": { "alias": "defaultValue"; "required": false; }; "min": { "alias": "min"; "required": false; }; "max": { "alias": "max"; "required": false; }; "step": { "alias": "step"; "required": false; }; "size": { "alias": "size"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "label": { "alias": "label"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "errorText": { "alias": "errorText"; "required": false; }; "invalid": { "alias": "invalid"; "required": false; }; "showValue": { "alias": "showValue"; "required": false; }; "valueFormatter": { "alias": "valueFormatter"; "required": false; }; "ariaLabelMin": { "alias": "ariaLabelMin"; "required": false; }; "ariaLabelMax": { "alias": "ariaLabelMax"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=RangeSlider.d.ts.map