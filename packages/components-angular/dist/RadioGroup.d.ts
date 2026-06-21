import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export interface RadioGroupOption {
    label: string;
    value: string;
    disabled?: boolean;
    helperText?: string;
}
export type RadioGroupProps = {
    legend?: string;
    label?: string;
    value?: string;
    onChange?: (value: string) => void;
    orientation?: "vertical" | "horizontal";
    name?: string;
    options?: RadioGroupOption[];
    helperText?: string;
    disabled?: boolean;
    class?: string;
};
export declare class RadioGroup {
    static readonly stComponentName = "RadioGroup";
    readonly componentName = "RadioGroup";
    label?: string;
    legend?: string;
    value?: string;
    onChange?: (value: string) => void;
    orientation?: "vertical" | "horizontal";
    name?: string;
    options?: RadioGroupOption[];
    helperText?: string;
    disabled?: boolean;
    classInput?: string;
    readonly valueChange: EventEmitter<string>;
    get hostClass(): string;
    onChangeHandler(v: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<RadioGroup, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<RadioGroup, "st-radio-group", never, { "label": { "alias": "label"; "required": false; }; "legend": { "alias": "legend"; "required": false; }; "value": { "alias": "value"; "required": false; }; "onChange": { "alias": "onChange"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "name": { "alias": "name"; "required": false; }; "options": { "alias": "options"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "valueChange": "valueChange"; }, never, never, true, never>;
}
//# sourceMappingURL=RadioGroup.d.ts.map