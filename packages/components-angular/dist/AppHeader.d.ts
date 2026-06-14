import * as i0 from "@angular/core";
export type AppHeaderProps = {
    compact?: boolean;
    menuOpen?: boolean;
    menuLabel?: string;
    /**
     * Id du tiroir, partagé entre `aria-controls` (burger) et `id` (drawer).
     * Auto-généré et stable si non fourni.
     */
    drawerId?: string;
    /**
     * Marque structurée (décision actée : logo SENT + sous-titre). Rend le bloc
     * canonique « logo carré + nom + sous-titre produit ». Si le slot `logo` est
     * fourni, il a priorité (contrôle total).
     */
    brandName?: string;
    /** Sous-titre produit affiché sous le nom (ex. « Design System », « dataviz »). */
    productName?: string;
    /** Source de l'image du logo carré (ex. `/SENT-logo-squared.svg`). */
    logoSrc?: string;
    /** Texte alternatif du logo (décoratif par défaut). */
    logoAlt?: string;
    /** Cible du lien de la marque. Défaut : `/`. */
    brandHref?: string;
    /** aria-label du lien de marque (sinon dérivé de `brandName` + `productName`). */
    brandLabel?: string;
    class?: string;
};
export declare class AppHeader {
    static readonly stComponentName = "AppHeader";
    readonly componentName = "AppHeader";
    compact?: boolean;
    menuOpen?: boolean;
    menuLabel?: string;
    drawerId?: string;
    brandName?: string;
    productName?: string;
    logoSrc?: string;
    logoAlt?: string;
    brandHref?: string;
    brandLabel?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<AppHeader, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AppHeader, "st-app-header", never, { "compact": { "alias": "compact"; "required": false; }; "menuOpen": { "alias": "menuOpen"; "required": false; }; "menuLabel": { "alias": "menuLabel"; "required": false; }; "drawerId": { "alias": "drawerId"; "required": false; }; "brandName": { "alias": "brandName"; "required": false; }; "productName": { "alias": "productName"; "required": false; }; "logoSrc": { "alias": "logoSrc"; "required": false; }; "logoAlt": { "alias": "logoAlt"; "required": false; }; "brandHref": { "alias": "brandHref"; "required": false; }; "brandLabel": { "alias": "brandLabel"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=AppHeader.d.ts.map