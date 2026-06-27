import * as i0 from "@angular/core";
export type SkeletonTextProps = {
    lines?: number;
    width?: string;
    heading?: boolean;
    paragraph?: boolean;
    locale?: string;
    loadingLabel?: string;
    class?: string;
};
export declare class SkeletonText {
    static readonly stComponentName = "SkeletonText";
    readonly componentName = "SkeletonText";
    lines?: number;
    width?: string;
    heading?: boolean;
    paragraph?: boolean;
    locale?: string;
    loadingLabel?: string;
    classInput?: string;
    get isFr(): boolean;
    get resolvedLoadingLabel(): string;
    get lineCount(): number;
    get linesArray(): number[];
    get lineClass(): string;
    lineWidth(index: number, total: number): string | undefined;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<SkeletonText, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SkeletonText, "st-skeleton-text", never, { "lines": { "alias": "lines"; "required": false; }; "width": { "alias": "width"; "required": false; }; "heading": { "alias": "heading"; "required": false; }; "paragraph": { "alias": "paragraph"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; "loadingLabel": { "alias": "loadingLabel"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=SkeletonText.d.ts.map