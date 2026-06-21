import * as i0 from "@angular/core";
export type GridProps = {
    /** Number of equal columns: `repeat(columns, minmax(0, 1fr))`. */
    columns?: number;
    /**
     * Responsive auto mode: `repeat(auto-fill, minmax(minItemWidth, 1fr))`.
     * Takes priority over `columns` when provided.
     */
    minItemWidth?: string;
    /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
    gap?: number;
    as?: string;
    class?: string;
};
export declare function gridTemplateColumns(columns: number | undefined, minItemWidth: string | undefined): string | undefined;
export declare class Grid {
    static readonly stComponentName = "Grid";
    readonly componentName = "Grid";
    columns?: number;
    minItemWidth?: string;
    gap?: number;
    as?: string;
    classInput?: string;
    get hostClass(): string;
    get inlineStyles(): Record<string, string | undefined>;
    static ɵfac: i0.ɵɵFactoryDeclaration<Grid, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Grid, "st-grid", never, { "columns": { "alias": "columns"; "required": false; }; "minItemWidth": { "alias": "minItemWidth"; "required": false; }; "gap": { "alias": "gap"; "required": false; }; "as": { "alias": "as"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Grid.d.ts.map