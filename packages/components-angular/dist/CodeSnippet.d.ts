import * as i0 from "@angular/core";
export type CodeSnippetProps = {
    code: string;
    inline?: boolean;
    class?: string;
};
export declare class CodeSnippet {
    static readonly stComponentName = "CodeSnippet";
    readonly componentName = "CodeSnippet";
    code: string;
    inline?: boolean;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<CodeSnippet, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CodeSnippet, "st-code-snippet", never, { "code": { "alias": "code"; "required": false; }; "inline": { "alias": "inline"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=CodeSnippet.d.ts.map