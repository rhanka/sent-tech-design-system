import * as i0 from "@angular/core";
export interface CheckboxGroupOption {
    label: string;
    value: string;
    disabled?: boolean;
    helperText?: string;
}
export type CheckboxGroupProps = {
    legend: string;
    /** Valeurs cochées (liste contrôlée). */
    value?: string[];
    onChange?: (value: string[]) => void;
    orientation?: "vertical" | "horizontal";
    /** Nom partagé par les cases (utile pour la soumission de formulaire). */
    name?: string;
    options?: CheckboxGroupOption[];
    /** Description optionnelle affichée sous la légende. */
    helperText?: string;
    /** Désactive le groupe entier. */
    disabled?: boolean;
    class?: string;
};
export declare class CheckboxGroup {
    static readonly stComponentName = "CheckboxGroup";
    readonly componentName = "CheckboxGroup";
    legend: string;
    value?: string[];
    onChange?: (value: string[]) => void;
    orientation?: "vertical" | "horizontal";
    name?: string;
    options?: CheckboxGroupOption[];
    helperText?: string;
    disabled?: boolean;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<CheckboxGroup, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CheckboxGroup, "st-checkbox-group", never, { "legend": { "alias": "legend"; "required": false; }; "value": { "alias": "value"; "required": false; }; "onChange": { "alias": "onChange"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "name": { "alias": "name"; "required": false; }; "options": { "alias": "options"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=CheckboxGroup.d.ts.map