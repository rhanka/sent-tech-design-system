import * as i0 from "@angular/core";
export type HeaderNavItem = {
    label: unknown;
    href: string;
};
export type HeaderAccount = {
    name?: string;
    email?: string;
    avatarUrl?: string;
};
export type HeaderProps = {
    brand?: unknown;
    title?: unknown;
    navigation?: HeaderNavItem[];
    navItems?: HeaderNavItem[];
    account?: HeaderAccount;
    sticky?: boolean;
    label?: string;
    compact?: boolean;
    class?: string;
};
export declare function deriveInitials(name?: string): string;
export declare class Header {
    static readonly stComponentName = "Header";
    readonly componentName = "Header";
    brand?: unknown;
    title?: unknown;
    navigation?: HeaderNavItem[];
    navItems?: HeaderNavItem[];
    account?: HeaderAccount;
    sticky?: boolean;
    label?: string;
    compact: boolean;
    classInput?: string;
    /** Liens de navigation : `navigation` prime, sinon `navItems` (parité React/Vue). */
    get links(): HeaderNavItem[];
    /** Initiales dérivées du nom du compte connecté (mêmes règles que React/Vue). */
    get accountInitials(): string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Header, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Header, "st-header", never, { "brand": { "alias": "brand"; "required": false; }; "title": { "alias": "title"; "required": false; }; "navigation": { "alias": "navigation"; "required": false; }; "navItems": { "alias": "navItems"; "required": false; }; "account": { "alias": "account"; "required": false; }; "sticky": { "alias": "sticky"; "required": false; }; "label": { "alias": "label"; "required": false; }; "compact": { "alias": "compact"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=Header.d.ts.map