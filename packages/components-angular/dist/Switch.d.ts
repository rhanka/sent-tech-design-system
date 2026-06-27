import * as i0 from "@angular/core";
export type SwitchProps = {
    label: unknown;
    helperText?: unknown;
    modelValue?: boolean;
    checked?: boolean;
    disabled?: boolean;
    name?: string;
    value?: string;
    class?: string;
};
export declare class Switch {
    static readonly stComponentName = "Switch";
    readonly componentName = "Switch";
    label: unknown;
    helperText?: unknown;
    modelValue?: boolean;
    checked?: boolean;
    disabled?: boolean;
    name?: string;
    value?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Switch, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Switch, "st-switch", never, { "label": { "alias": "label"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "modelValue": { "alias": "modelValue"; "required": false; }; "checked": { "alias": "checked"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "name": { "alias": "name"; "required": false; }; "value": { "alias": "value"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=Switch.d.ts.map