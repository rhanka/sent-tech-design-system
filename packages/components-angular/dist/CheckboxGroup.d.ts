import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export interface CheckboxGroupOption {
    label: string;
    value: string;
    disabled?: boolean;
    helperText?: string;
}
export type CheckboxGroupProps = {
    legend?: string;
    label?: string;
    value?: string[];
    onChange?: (value: string[]) => void;
    orientation?: "vertical" | "horizontal";
    name?: string;
    options?: CheckboxGroupOption[];
    helperText?: string;
    disabled?: boolean;
    class?: string;
};
export declare class CheckboxGroup {
    static readonly stComponentName = "CheckboxGroup";
    readonly componentName = "CheckboxGroup";
    label?: string;
    legend?: string;
    value: string[];
    onChange?: (value: string[]) => void;
    orientation?: "vertical" | "horizontal";
    name?: string;
    options?: CheckboxGroupOption[];
    helperText?: string;
    disabled?: boolean;
    classInput?: string;
    readonly valueChange: EventEmitter<string[]>;
    get resolvedLegend(): string | undefined;
    get hostClass(): string;
    isChecked(v: string): boolean;
    toggle(v: string, e: Event): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CheckboxGroup, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CheckboxGroup, "st-checkbox-group", never, { "label": { "alias": "label"; "required": false; }; "legend": { "alias": "legend"; "required": false; }; "value": { "alias": "value"; "required": false; }; "onChange": { "alias": "onChange"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "name": { "alias": "name"; "required": false; }; "options": { "alias": "options"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "valueChange": "valueChange"; }, never, ["*"], true, never>;
}
//# sourceMappingURL=CheckboxGroup.d.ts.map