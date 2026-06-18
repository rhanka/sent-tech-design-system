import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type SearchSize = "sm" | "md" | "lg";
export type SearchProps = {
    label?: unknown;
    size?: SearchSize;
    modelValue?: string;
    /** Svelte/React-canonical alias for `modelValue`. */
    value?: string;
    placeholder?: string;
    clearLabel?: string;
    /** Lift the field max-width cap so it fills a narrow drawer/rail (width 100%). */
    fluid?: boolean;
    disabled?: boolean;
    id?: string;
    name?: string;
    autocomplete?: string;
    required?: boolean;
    readonly?: boolean;
    inputmode?: string;
    "aria-label"?: string;
    "aria-describedby"?: string;
    class?: string;
};
export declare class Search {
    static readonly stComponentName = "Search";
    readonly componentName = "Search";
    private readonly autoId;
    label?: unknown;
    size?: SearchSize;
    modelValue?: string;
    value?: string;
    placeholder?: string;
    clearLabel?: string;
    fluid?: boolean;
    disabled?: boolean;
    id?: string;
    name?: string;
    autocomplete?: string;
    required?: boolean;
    readOnly?: boolean;
    inputMode?: string;
    ariaLabel?: string;
    ariaDescribedBy?: string;
    classInput?: string;
    readonly modelValueChange: EventEmitter<string>;
    readonly updateModelValue: EventEmitter<string>;
    readonly input: EventEmitter<Event>;
    readonly change: EventEmitter<Event>;
    readonly clear: EventEmitter<void>;
    get inputId(): string;
    get currentValue(): string;
    get clearLabelText(): string;
    get hostClass(): string;
    handleInput(event: Event): void;
    handleClear(): void;
    private emitModelValue;
    static ɵfac: i0.ɵɵFactoryDeclaration<Search, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Search, "st-search", never, { "label": { "alias": "label"; "required": false; }; "size": { "alias": "size"; "required": false; }; "modelValue": { "alias": "modelValue"; "required": false; }; "value": { "alias": "value"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "clearLabel": { "alias": "clearLabel"; "required": false; }; "fluid": { "alias": "fluid"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "id": { "alias": "id"; "required": false; }; "name": { "alias": "name"; "required": false; }; "autocomplete": { "alias": "autocomplete"; "required": false; }; "required": { "alias": "required"; "required": false; }; "readOnly": { "alias": "readonly"; "required": false; }; "inputMode": { "alias": "inputmode"; "required": false; }; "ariaLabel": { "alias": "aria-label"; "required": false; }; "ariaDescribedBy": { "alias": "aria-describedby"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "modelValueChange": "modelValueChange"; "updateModelValue": "update:modelValue"; "input": "input"; "change": "change"; "clear": "clear"; }, never, never, true, never>;
}
//# sourceMappingURL=Search.d.ts.map