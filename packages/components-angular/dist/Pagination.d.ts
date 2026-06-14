import * as i0 from "@angular/core";
export type PaginationProps = {
    page: number;
    pageSize?: number;
    totalItems?: number;
    totalPages?: number;
    pageCount?: number;
    class?: string;
};
export declare class Pagination {
    static readonly stComponentName = "Pagination";
    readonly componentName = "Pagination";
    page: number;
    pageSize?: number;
    totalItems?: number;
    totalPages?: number;
    pageCount?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Pagination, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Pagination, "st-pagination", never, { "page": { "alias": "page"; "required": false; }; "pageSize": { "alias": "pageSize"; "required": false; }; "totalItems": { "alias": "totalItems"; "required": false; }; "totalPages": { "alias": "totalPages"; "required": false; }; "pageCount": { "alias": "pageCount"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Pagination.d.ts.map