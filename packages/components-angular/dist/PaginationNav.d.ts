import * as i0 from "@angular/core";
export type PaginationNavProps = {
    page?: number;
    pageCount?: number;
    totalPages?: number;
    siblings?: number;
    label?: string;
    previousLabel?: string;
    nextLabel?: string;
    previousHref?: string;
    nextHref?: string;
    class?: string;
};
export declare class PaginationNav {
    static readonly stComponentName = "PaginationNav";
    readonly componentName = "PaginationNav";
    page?: number;
    pageCount?: number;
    totalPages?: number;
    siblings?: number;
    label?: string;
    previousLabel?: string;
    nextLabel?: string;
    previousHref?: string;
    nextHref?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<PaginationNav, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PaginationNav, "st-pagination-nav", never, { "page": { "alias": "page"; "required": false; }; "pageCount": { "alias": "pageCount"; "required": false; }; "totalPages": { "alias": "totalPages"; "required": false; }; "siblings": { "alias": "siblings"; "required": false; }; "label": { "alias": "label"; "required": false; }; "previousLabel": { "alias": "previousLabel"; "required": false; }; "nextLabel": { "alias": "nextLabel"; "required": false; }; "previousHref": { "alias": "previousHref"; "required": false; }; "nextHref": { "alias": "nextHref"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=PaginationNav.d.ts.map