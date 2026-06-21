import type { FlexAlign, FlexJustify } from "./Flex.js";
import * as i0 from "@angular/core";
export type StackProps = {
    /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
    gap?: number;
    align?: FlexAlign;
    justify?: FlexJustify;
    as?: string;
    class?: string;
};
export declare class Stack {
    static readonly stComponentName = "Stack";
    readonly componentName = "Stack";
    gap?: number;
    align?: FlexAlign;
    justify?: FlexJustify;
    as?: string;
    classInput?: string;
    get hostClass(): string;
    get inlineStyles(): Record<string, string | undefined>;
    static ɵfac: i0.ɵɵFactoryDeclaration<Stack, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Stack, "st-stack", never, { "gap": { "alias": "gap"; "required": false; }; "align": { "alias": "align"; "required": false; }; "justify": { "alias": "justify"; "required": false; }; "as": { "alias": "as"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Stack.d.ts.map