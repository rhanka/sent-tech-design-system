import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type ToggleSize = "sm" | "md";
export type ToggleProps = {
    label: unknown;
    labelOn?: string;
    labelOff?: string;
    helperText?: unknown;
    size?: ToggleSize;
    modelValue?: boolean;
    checked?: boolean;
    disabled?: boolean;
    name?: string;
    value?: string;
    class?: string;
};
export declare class Toggle {
    static readonly stComponentName = "Toggle";
    readonly componentName = "Toggle";
    label: unknown;
    labelOn: string;
    labelOff: string;
    helperText?: unknown;
    size?: ToggleSize;
    modelValue?: boolean;
    checked?: boolean;
    disabled?: boolean;
    name?: string;
    value?: string;
    classInput?: string;
    readonly checkedChange: EventEmitter<boolean>;
    readonly modelValueChange: EventEmitter<boolean>;
    get isChecked(): boolean;
    get hostClass(): string;
    onChange(e: Event): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Toggle, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Toggle, "st-toggle", never, { "label": { "alias": "label"; "required": false; }; "labelOn": { "alias": "labelOn"; "required": false; }; "labelOff": { "alias": "labelOff"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "size": { "alias": "size"; "required": false; }; "modelValue": { "alias": "modelValue"; "required": false; }; "checked": { "alias": "checked"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "name": { "alias": "name"; "required": false; }; "value": { "alias": "value"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "checkedChange": "checkedChange"; "modelValueChange": "modelValueChange"; }, never, never, true, never>;
}
//# sourceMappingURL=Toggle.d.ts.map