import * as i0 from "@angular/core";
export type NumberInputSize = "sm" | "md" | "lg";
export type NumberInputProps = {
    label?: unknown;
    helperText?: unknown;
    errorText?: unknown;
    size?: NumberInputSize;
    modelValue?: number | string;
    /** Svelte/React-canonical alias for `modelValue`. */
    value?: number | string | null;
    disabled?: boolean;
    readonly?: boolean;
    min?: number | string;
    max?: number | string;
    step?: number | string;
    incrementLabel?: string;
    decrementLabel?: string;
    class?: string;
};
export declare class NumberInput {
    static readonly stComponentName = "NumberInput";
    readonly componentName = "NumberInput";
    label?: unknown;
    helperText?: unknown;
    errorText?: unknown;
    size?: NumberInputSize;
    modelValue?: number | string;
    value?: number | string | null;
    disabled?: boolean;
    readonly?: boolean;
    min?: number | string;
    max?: number | string;
    step?: number | string;
    incrementLabel?: string;
    decrementLabel?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<NumberInput, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NumberInput, "st-number-input", never, { "label": { "alias": "label"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "errorText": { "alias": "errorText"; "required": false; }; "size": { "alias": "size"; "required": false; }; "modelValue": { "alias": "modelValue"; "required": false; }; "value": { "alias": "value"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "readonly": { "alias": "readonly"; "required": false; }; "min": { "alias": "min"; "required": false; }; "max": { "alias": "max"; "required": false; }; "step": { "alias": "step"; "required": false; }; "incrementLabel": { "alias": "incrementLabel"; "required": false; }; "decrementLabel": { "alias": "decrementLabel"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=NumberInput.d.ts.map