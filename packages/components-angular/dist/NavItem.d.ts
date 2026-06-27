import * as i0 from "@angular/core";
/** Profondeur dans l'arbre de nav → échelle typographique DÉCROISSANTE.
 * L0 = racine (base/600), chaque palier descend en taille ET en graisse pour
 * que la hiérarchie se LISE sans indentation seule. */
export type NavItemDepth = 0 | 1 | 2 | 3;
/** Ton sémantique de la rangée. `error` est un VRAI état (un « HTTP 403 »
 * devient rouge sémantique), pas une teinte décorative. */
export type NavItemStatus = "neutral" | "info" | "success" | "warning" | "error";
export type NavItemSwatch = {
    /** Couleur arbitraire (hex/rgb/var) → rendue par ColorSwatch. */
    color?: string;
    /** Ton sémantique → rendu par StatusDot (un point). Ignoré si `color`. */
    tone?: "neutral" | "info" | "success" | "warning" | "error";
    /** Forme de la pastille couleur (ColorSwatch). Défaut « square ». */
    shape?: "square" | "circle" | "pill";
};
export type NavItemProps = {
    /** Clé de sélection, passée telle quelle à SelectableRow (data-value). */
    value?: string;
    /** Libellé principal (1ʳᵉ ligne). */
    title: string;
    /** 2ᵉ ligne MUETTE, ellipsée indépendamment du titre. */
    caption?: string;
    /** Profondeur (défaut 0) → échelle typo + indentation de la tête. */
    depth?: NavItemDepth;
    /** Pastille de tête : couleur arbitraire (ColorSwatch) ou ton (StatusDot). */
    swatch?: NavItemSwatch;
    /** Bulle de compte en queue (Badge circle/sm, tabular-nums). */
    count?: number;
    /** Ton sémantique de la rangée. */
    status?: NavItemStatus;
    /** Sélection (honorée en standalone ; la liste prime si encadrée). */
    selected?: boolean;
    /** État actif (alias de selected pour compatibilité). */
    active?: boolean;
    /** Non-interactif. */
    disabled?: boolean;
    /** Rend la rangée comme un lien (ancre) — anatomie identique. */
    href?: string;
    /** Séparateur token-only rendu APRÈS la rangée. */
    divider?: boolean;
    class?: string;
};
export declare class NavItem {
    static readonly stComponentName = "NavItem";
    readonly componentName = "NavItem";
    value?: string;
    title: string;
    caption?: string;
    depth?: NavItemDepth;
    swatch?: NavItemSwatch;
    count?: number;
    status?: NavItemStatus;
    selected?: boolean;
    active?: boolean;
    disabled?: boolean;
    href?: string;
    divider?: boolean;
    classInput?: string;
    get hasCount(): boolean;
    /** Explicit accessible name for the trailing count bubble (« N title »): a bare
     * number is ambiguous for a screen reader (cf. Badge). */
    get countAriaLabel(): string;
    private get safeDepth();
    get hostClass(): string;
    /** Indentation de profondeur : var additive sur le wrapper, héritée par la
     * rangée (.st-selectableRow) via la cascade — miroir du Svelte. */
    get depthStyle(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<NavItem, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NavItem, "st-nav-item", never, { "value": { "alias": "value"; "required": false; }; "title": { "alias": "title"; "required": false; }; "caption": { "alias": "caption"; "required": false; }; "depth": { "alias": "depth"; "required": false; }; "swatch": { "alias": "swatch"; "required": false; }; "count": { "alias": "count"; "required": false; }; "status": { "alias": "status"; "required": false; }; "selected": { "alias": "selected"; "required": false; }; "active": { "alias": "active"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "href": { "alias": "href"; "required": false; }; "divider": { "alias": "divider"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=NavItem.d.ts.map