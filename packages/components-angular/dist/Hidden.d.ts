import * as i0 from "@angular/core";
export type HiddenBreakpoint = "sm" | "md" | "lg" | "xl";
export type HiddenProps = {
    /** Hide when viewport is narrower than this breakpoint. */
    below?: HiddenBreakpoint;
    /** Hide when viewport is at or wider than this breakpoint. */
    above?: HiddenBreakpoint;
    as?: string;
    class?: string;
};
export declare class Hidden {
    static readonly stComponentName = "Hidden";
    readonly componentName = "Hidden";
    below?: HiddenBreakpoint;
    above?: HiddenBreakpoint;
    as?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Hidden, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Hidden, "st-hidden", never, { "below": { "alias": "below"; "required": false; }; "above": { "alias": "above"; "required": false; }; "as": { "alias": "as"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Hidden.d.ts.map