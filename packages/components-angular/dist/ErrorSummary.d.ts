import * as i0 from "@angular/core";
/** A single field error: `href` points to the offending control, `text` is the message. */
export type ErrorSummaryItem = {
    href: string;
    text: string;
};
export type ErrorSummaryProps = {
    heading?: string;
    errors?: ErrorSummaryItem[];
    class?: string;
};
export declare class ErrorSummary {
    static readonly stComponentName = "ErrorSummary";
    readonly componentName = "ErrorSummary";
    heading: string;
    errors: ErrorSummaryItem[];
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ErrorSummary, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ErrorSummary, "st-error-summary", never, { "heading": { "alias": "heading"; "required": false; }; "errors": { "alias": "errors"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ErrorSummary.d.ts.map