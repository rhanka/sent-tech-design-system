import * as i0 from "@angular/core";
export type ButtonGroupOrientation = "horizontal" | "vertical";
export type ButtonGroupSize = "sm" | "md" | "lg";
export type ButtonGroupProps = {
    orientation?: ButtonGroupOrientation;
    /** Look segmenté joint (boutons collés, coins arrondis seulement aux extrémités). */
    attached?: boolean;
    /** Espacement entre boutons (échelle spacing), ignoré quand `attached`. */
    gap?: number;
    /** Taille indicative (transmise via data-attr pour styliser les enfants si besoin). */
    size?: ButtonGroupSize;
    /** Étiquette a11y du groupe. */
    label?: string;
    class?: string;
};
export declare class ButtonGroup {
    static readonly stComponentName = "ButtonGroup";
    readonly componentName = "ButtonGroup";
    orientation?: ButtonGroupOrientation;
    attached?: boolean;
    gap?: number;
    size?: ButtonGroupSize;
    label?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ButtonGroup, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ButtonGroup, "st-button-group", never, { "orientation": { "alias": "orientation"; "required": false; }; "attached": { "alias": "attached"; "required": false; }; "gap": { "alias": "gap"; "required": false; }; "size": { "alias": "size"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ButtonGroup.d.ts.map