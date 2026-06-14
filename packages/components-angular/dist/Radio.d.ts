import * as i0 from "@angular/core";
export type RadioProps = {
    label: string;
    helperText?: string;
    invalid?: boolean;
    modelValue?: string;
    checked?: boolean;
    disabled?: boolean;
    name?: string;
    value?: string;
    class?: string;
};
export declare class Radio {
    static readonly stComponentName = "Radio";
    readonly componentName = "Radio";
    label: string;
    helperText?: string;
    invalid?: boolean;
    modelValue?: string;
    checked?: boolean;
    disabled?: boolean;
    name?: string;
    value?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Radio, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Radio, "st-radio", never, { "label": { "alias": "label"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "invalid": { "alias": "invalid"; "required": false; }; "modelValue": { "alias": "modelValue"; "required": false; }; "checked": { "alias": "checked"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "name": { "alias": "name"; "required": false; }; "value": { "alias": "value"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Radio.d.ts.map