import * as i0 from "@angular/core";
export interface RadioGroupOption {
    label: string;
    value: string;
    disabled?: boolean;
    helperText?: string;
}
export type RadioGroupProps = {
    legend: string;
    /** Valeur sélectionnée (contrôlée). */
    value?: string;
    onChange?: (value: string) => void;
    orientation?: "vertical" | "horizontal";
    /** Nom partagé garantissant l'exclusivité radio. Requis. */
    name: string;
    options?: RadioGroupOption[];
    helperText?: string;
    /** Désactive le groupe entier. */
    disabled?: boolean;
    class?: string;
};
export declare class RadioGroup {
    static readonly stComponentName = "RadioGroup";
    readonly componentName = "RadioGroup";
    legend: string;
    value?: string;
    onChange?: (value: string) => void;
    orientation?: "vertical" | "horizontal";
    name: string;
    options?: RadioGroupOption[];
    helperText?: string;
    disabled?: boolean;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<RadioGroup, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<RadioGroup, "st-radio-group", never, { "legend": { "alias": "legend"; "required": false; }; "value": { "alias": "value"; "required": false; }; "onChange": { "alias": "onChange"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "name": { "alias": "name"; "required": false; }; "options": { "alias": "options"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=RadioGroup.d.ts.map