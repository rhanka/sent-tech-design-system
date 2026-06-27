import * as i0 from "@angular/core";
export type LinkVariant = "inline" | "standalone" | "muted";
export type LinkProps = {
    href?: string;
    /** Style du lien ; API canonique (alignée sur le canon Svelte). */
    variant?: LinkVariant;
    /** @deprecated Raccourci pour variant="standalone". Utilisez `variant`. */
    standalone?: boolean;
    /** @deprecated Raccourci pour variant="muted". Utilisez `variant`. */
    muted?: boolean;
    disabled?: boolean;
    /** Lien externe : pose target="_blank" rel="noreferrer" (sauf target/rel explicites). */
    external?: boolean;
    target?: string;
    rel?: string;
    class?: string;
};
export declare class Link {
    static readonly stComponentName = "Link";
    readonly componentName = "Link";
    href?: string;
    variant: LinkVariant;
    standalone: boolean;
    muted: boolean;
    disabled: boolean;
    external: boolean;
    target?: string;
    rel?: string;
    classInput?: string;
    get effectiveVariant(): LinkVariant;
    get effectiveTarget(): string | null;
    get effectiveRel(): string | null;
    get hostClass(): string;
    handleClick(event: MouseEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Link, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Link, "st-link", never, { "href": { "alias": "href"; "required": false; }; "variant": { "alias": "variant"; "required": false; }; "standalone": { "alias": "standalone"; "required": false; }; "muted": { "alias": "muted"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "external": { "alias": "external"; "required": false; }; "target": { "alias": "target"; "required": false; }; "rel": { "alias": "rel"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Link.d.ts.map