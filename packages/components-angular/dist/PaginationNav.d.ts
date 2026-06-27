import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
type Slot = number | "ellipsis-start" | "ellipsis-end";
export type PaginationNavProps = {
    page?: number;
    pageCount?: number;
    totalPages?: number;
    siblings?: number;
    label?: string;
    previousLabel?: string;
    nextLabel?: string;
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
    classInput?: string;
    readonly pageChange: EventEmitter<number>;
    get currentPage(): number;
    get totalPageCount(): number;
    get slots(): Slot[];
    slotKey(slot: Slot, index: number): string;
    asPage(slot: Slot): number;
    go(target: number): void;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<PaginationNav, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PaginationNav, "st-pagination-nav", never, { "page": { "alias": "page"; "required": false; }; "pageCount": { "alias": "pageCount"; "required": false; }; "totalPages": { "alias": "totalPages"; "required": false; }; "siblings": { "alias": "siblings"; "required": false; }; "label": { "alias": "label"; "required": false; }; "previousLabel": { "alias": "previousLabel"; "required": false; }; "nextLabel": { "alias": "nextLabel"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "pageChange": "pageChange"; }, never, never, true, never>;
}
export {};
//# sourceMappingURL=PaginationNav.d.ts.map