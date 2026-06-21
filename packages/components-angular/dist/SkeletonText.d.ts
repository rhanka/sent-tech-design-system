import * as i0 from "@angular/core";
export type SkeletonTextProps = {
    lines?: number;
    width?: string;
    heading?: boolean;
    paragraph?: boolean;
    class?: string;
};
export declare class SkeletonText {
    static readonly stComponentName = "SkeletonText";
    readonly componentName = "SkeletonText";
    lines?: number;
    width?: string;
    heading?: boolean;
    paragraph?: boolean;
    classInput?: string;
    get linesArray(): number[];
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<SkeletonText, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SkeletonText, "st-skeleton-text", never, { "lines": { "alias": "lines"; "required": false; }; "width": { "alias": "width"; "required": false; }; "heading": { "alias": "heading"; "required": false; }; "paragraph": { "alias": "paragraph"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=SkeletonText.d.ts.map