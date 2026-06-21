import * as i0 from "@angular/core";
export type ColSpan = number | "auto";
export type ColProps = {
    /** Number of 12-grid columns to span, or "auto" to size to content. */
    span?: ColSpan;
    /** Columns to offset (0..11) via margin-inline-start. */
    offset?: number;
    /** Responsive overrides applied at and above the breakpoint. */
    sm?: ColSpan;
    md?: ColSpan;
    lg?: ColSpan;
    as?: string;
    class?: string;
};
export declare function spanBasis(span: ColSpan | undefined): string | undefined;
export declare function offsetMargin(offset: number | undefined): string | undefined;
export declare class Col {
    static readonly stComponentName = "Col";
    readonly componentName = "Col";
    span?: ColSpan;
    offset?: number;
    sm?: ColSpan;
    md?: ColSpan;
    lg?: ColSpan;
    as?: string;
    classInput?: string;
    get hostClass(): string;
    get inlineStyles(): Record<string, string | undefined>;
    static ɵfac: i0.ɵɵFactoryDeclaration<Col, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Col, "st-col", never, { "span": { "alias": "span"; "required": false; }; "offset": { "alias": "offset"; "required": false; }; "sm": { "alias": "sm"; "required": false; }; "md": { "alias": "md"; "required": false; }; "lg": { "alias": "lg"; "required": false; }; "as": { "alias": "as"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Col.d.ts.map