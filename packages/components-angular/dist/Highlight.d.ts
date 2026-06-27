import * as i0 from "@angular/core";
export type HighlightTone = "neutral" | "info" | "success" | "warning" | "error";
export type HighlightProps = {
    tone?: HighlightTone;
    title?: unknown;
    class?: string;
};
export declare class Highlight {
    static readonly stComponentName = "Highlight";
    readonly componentName = "Highlight";
    tone: HighlightTone;
    title?: unknown;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Highlight, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Highlight, "st-highlight", never, { "tone": { "alias": "tone"; "required": false; }; "title": { "alias": "title"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Highlight.d.ts.map