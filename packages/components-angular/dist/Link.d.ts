import * as i0 from "@angular/core";
export type LinkProps = {
    href?: string;
    /** Style du lien ; API canonique (alignée sur le canon Svelte). */
    variant?: "inline" | "standalone" | "muted";
    /** @deprecated Raccourci pour variant="standalone". Utilisez `variant`. */
    standalone?: boolean;
    /** @deprecated Raccourci pour variant="muted". Utilisez `variant`. */
    muted?: boolean;
    disabled?: boolean;
    /** Lien externe : pose target="_blank" rel="noreferrer" (sauf target/rel explicites). */
    external?: boolean;
    class?: string;
};
export declare class Link {
    static readonly stComponentName = "Link";
    readonly componentName = "Link";
    href?: string;
    variant?: "inline" | "standalone" | "muted";
    standalone?: boolean;
    muted?: boolean;
    disabled?: boolean;
    external?: boolean;
    classInput?: string;
    get effectiveVariant(): string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Link, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Link, "st-link", never, { "href": { "alias": "href"; "required": false; }; "variant": { "alias": "variant"; "required": false; }; "standalone": { "alias": "standalone"; "required": false; }; "muted": { "alias": "muted"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "external": { "alias": "external"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Link.d.ts.map