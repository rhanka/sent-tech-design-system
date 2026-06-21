import type { FlexAlign, FlexJustify } from "./Flex.js";
import * as i0 from "@angular/core";
export type InlineProps = {
    /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
    gap?: number;
    align?: FlexAlign;
    justify?: FlexJustify;
    wrap?: boolean;
    as?: string;
    class?: string;
};
export declare class Inline {
    static readonly stComponentName = "Inline";
    readonly componentName = "Inline";
    gap?: number;
    align?: FlexAlign;
    justify?: FlexJustify;
    wrap?: boolean;
    as?: string;
    classInput?: string;
    get hostClass(): string;
    get inlineStyles(): Record<string, string | undefined>;
    static ɵfac: i0.ɵɵFactoryDeclaration<Inline, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Inline, "st-inline", never, { "gap": { "alias": "gap"; "required": false; }; "align": { "alias": "align"; "required": false; }; "justify": { "alias": "justify"; "required": false; }; "wrap": { "alias": "wrap"; "required": false; }; "as": { "alias": "as"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Inline.d.ts.map