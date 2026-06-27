import * as i0 from "@angular/core";
export type FooterLink = {
    label: unknown;
    href: string;
};
export type FooterColumn = {
    title?: unknown;
    links: FooterLink[];
};
export type FooterProps = {
    brand?: unknown;
    columns?: FooterColumn[];
    links?: FooterLink[];
    legalLinks?: FooterLink[];
    copyright?: unknown;
    legalNavLabel?: string;
    label?: string;
    class?: string;
};
export declare class Footer {
    static readonly stComponentName = "Footer";
    readonly componentName = "Footer";
    brand?: unknown;
    columns?: FooterColumn[];
    links?: FooterLink[];
    legalLinks?: FooterLink[];
    copyright?: unknown;
    legalNavLabel?: string;
    label?: string;
    classInput?: string;
    get groups(): FooterColumn[];
    get hasTop(): boolean;
    get hasBottom(): boolean;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Footer, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Footer, "st-footer", never, { "brand": { "alias": "brand"; "required": false; }; "columns": { "alias": "columns"; "required": false; }; "links": { "alias": "links"; "required": false; }; "legalLinks": { "alias": "legalLinks"; "required": false; }; "copyright": { "alias": "copyright"; "required": false; }; "legalNavLabel": { "alias": "legalNavLabel"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=Footer.d.ts.map