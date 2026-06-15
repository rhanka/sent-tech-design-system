import * as i0 from "@angular/core";
/** Hiérarchie ENCODÉE DANS LE TYPE : une seule action `primary` est légitime
 * dans une pile. `secondary` = action secondaire ; `ghost` = action discrète.
 * La couleur sémantique (danger) n'est PAS un `kind` — elle vit dans
 * `dangerZone`, rendue à part. */
export type NavActionKind = "primary" | "secondary" | "ghost";
export interface NavAction {
    label: string;
    onClick?: () => void;
    href?: string;
    kind?: NavActionKind;
    disabled?: boolean;
}
/** Action destructrice, isolée sous un séparateur + un overline « Zone
 * sensible ». Toujours en ton danger, jamais alignée avec les actions
 * normales. Pas de `kind` : c'est une zone, pas une catégorie de couleur. */
export interface NavActionDangerZone {
    label: string;
    onClick?: () => void;
    href?: string;
}
export type NavActionStackOrientation = "vertical" | "horizontal";
export type NavActionStackProps = {
    actions?: NavAction[];
    dangerZone?: NavActionDangerZone;
    /** Libellé de l'overline de la zone sensible. Défaut « Zone sensible ». */
    dangerLabel?: string;
    orientation?: NavActionStackOrientation;
    /** Étiquette a11y du groupe d'actions. */
    label?: string;
    class?: string;
};
export declare class NavActionStack {
    static readonly stComponentName = "NavActionStack";
    readonly componentName = "NavActionStack";
    actions?: NavAction[];
    dangerZone?: NavActionDangerZone;
    dangerLabel?: string;
    orientation?: NavActionStackOrientation;
    label?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<NavActionStack, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NavActionStack, "st-nav-action-stack", never, { "actions": { "alias": "actions"; "required": false; }; "dangerZone": { "alias": "dangerZone"; "required": false; }; "dangerLabel": { "alias": "dangerLabel"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=NavActionStack.d.ts.map