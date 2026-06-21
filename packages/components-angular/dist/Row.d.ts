import type { FlexAlign, FlexJustify } from "./Flex.js";
import * as i0 from "@angular/core";
export type RowProps = {
    /** Spacing scale step (0..12) used for the column gutter. */
    gutter?: number;
    align?: FlexAlign;
    justify?: FlexJustify;
    wrap?: boolean;
    as?: string;
    class?: string;
};
export declare class Row {
    static readonly stComponentName = "Row";
    readonly componentName = "Row";
    gutter?: number;
    align?: FlexAlign;
    justify?: FlexJustify;
    wrap?: boolean;
    as?: string;
    classInput?: string;
    get hostClass(): string;
    get inlineStyles(): Record<string, string | undefined>;
    static ɵfac: i0.ɵɵFactoryDeclaration<Row, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Row, "st-row", never, { "gutter": { "alias": "gutter"; "required": false; }; "align": { "alias": "align"; "required": false; }; "justify": { "alias": "justify"; "required": false; }; "wrap": { "alias": "wrap"; "required": false; }; "as": { "alias": "as"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Row.d.ts.map