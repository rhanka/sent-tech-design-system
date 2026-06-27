import * as i0 from "@angular/core";
export type CodeSnippetProps = {
    code: string;
    language?: string;
    inline?: boolean;
    copyable?: boolean;
    copyLabel?: string;
    copiedLabel?: string;
    class?: string;
};
export declare class CodeSnippet {
    static readonly stComponentName = "CodeSnippet";
    readonly componentName = "CodeSnippet";
    code: string;
    language?: string;
    inline?: boolean;
    copyable?: boolean;
    copyLabel?: string;
    copiedLabel?: string;
    classInput?: string;
    get resolvedCopyable(): boolean;
    get inlineClass(): string;
    get blockClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<CodeSnippet, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CodeSnippet, "st-code-snippet", never, { "code": { "alias": "code"; "required": false; }; "language": { "alias": "language"; "required": false; }; "inline": { "alias": "inline"; "required": false; }; "copyable": { "alias": "copyable"; "required": false; }; "copyLabel": { "alias": "copyLabel"; "required": false; }; "copiedLabel": { "alias": "copiedLabel"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=CodeSnippet.d.ts.map