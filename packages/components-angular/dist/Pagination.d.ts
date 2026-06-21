import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type PaginationProps = {
    page: number;
    pageSize?: number;
    totalItems?: number;
    totalPages?: number;
    pageCount?: number;
    previousLabel?: string;
    nextLabel?: string;
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
    previousLabel?: string;
    nextLabel?: string;
    classInput?: string;
    readonly pageChange: EventEmitter<number>;
    get totalPageCount(): number;
    get pages(): number[];
    pageClass(p: number): string;
    prev(): void;
    next(): void;
    go(p: number): void;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Pagination, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Pagination, "st-pagination", never, { "page": { "alias": "page"; "required": false; }; "pageSize": { "alias": "pageSize"; "required": false; }; "totalItems": { "alias": "totalItems"; "required": false; }; "totalPages": { "alias": "totalPages"; "required": false; }; "pageCount": { "alias": "pageCount"; "required": false; }; "previousLabel": { "alias": "previousLabel"; "required": false; }; "nextLabel": { "alias": "nextLabel"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "pageChange": "pageChange"; }, never, ["*"], true, never>;
}
//# sourceMappingURL=Pagination.d.ts.map