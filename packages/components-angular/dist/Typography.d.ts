import * as i0 from "@angular/core";
export type TypographyVariant = "display" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "body-sm" | "caption" | "overline";
export type TypographyWeight = "regular" | "medium" | "semibold" | "bold";
export type TypographyTone = "primary" | "secondary" | "muted" | "inverse" | "link";
export type TypographyAlign = "start" | "center" | "end" | "justify";
export type TypographyProps = {
    variant?: TypographyVariant;
    /** Surcharge la balise déduite de la variante. */
    as?: string;
    weight?: TypographyWeight;
    tone?: TypographyTone;
    align?: TypographyAlign;
    /** Tronque sur une ligne avec ellipsis. */
    truncate?: boolean;
    class?: string;
};
export declare class Typography {
    static readonly stComponentName = "Typography";
    readonly componentName = "Typography";
    variant?: TypographyVariant;
    as?: string;
    weight?: TypographyWeight;
    tone?: TypographyTone;
    align?: TypographyAlign;
    truncate?: boolean;
    classInput?: string;
    get tag(): string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Typography, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Typography, "st-typography", never, { "variant": { "alias": "variant"; "required": false; }; "as": { "alias": "as"; "required": false; }; "weight": { "alias": "weight"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "align": { "alias": "align"; "required": false; }; "truncate": { "alias": "truncate"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Typography.d.ts.map