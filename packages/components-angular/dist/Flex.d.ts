import * as i0 from "@angular/core";
export type FlexDirection = "row" | "column" | "row-reverse" | "column-reverse";
export type FlexAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type FlexJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
export type FlexProps = {
    direction?: FlexDirection;
    /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
    gap?: number;
    align?: FlexAlign;
    justify?: FlexJustify;
    wrap?: boolean;
    inline?: boolean;
    as?: string;
    class?: string;
};
export declare function spacingToken(step: number | undefined): string | undefined;
export declare function alignValue(align: FlexAlign | undefined): string | undefined;
export declare function justifyValue(justify: FlexJustify | undefined): string | undefined;
export declare class Flex {
    static readonly stComponentName = "Flex";
    readonly componentName = "Flex";
    direction?: FlexDirection;
    gap?: number;
    align?: FlexAlign;
    justify?: FlexJustify;
    wrap?: boolean;
    inline?: boolean;
    as?: string;
    classInput?: string;
    get hostClass(): string;
    get inlineStyles(): Record<string, string | undefined>;
    static ɵfac: i0.ɵɵFactoryDeclaration<Flex, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Flex, "st-flex", never, { "direction": { "alias": "direction"; "required": false; }; "gap": { "alias": "gap"; "required": false; }; "align": { "alias": "align"; "required": false; }; "justify": { "alias": "justify"; "required": false; }; "wrap": { "alias": "wrap"; "required": false; }; "inline": { "alias": "inline"; "required": false; }; "as": { "alias": "as"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Flex.d.ts.map