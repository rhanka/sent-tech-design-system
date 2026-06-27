import * as i0 from "@angular/core";
export interface TableOfContentsItem {
    id: string;
    label: string;
    level?: number;
}
/** Alias compatible avec la spec TocItem */
export type TocItem = TableOfContentsItem;
export type TableOfContentsProps = {
    title?: string;
    items: TableOfContentsItem[];
    activeId?: string;
    class?: string;
};
export declare class TableOfContents {
    static readonly stComponentName = "TableOfContents";
    readonly componentName = "TableOfContents";
    title?: string;
    items: TableOfContentsItem[];
    activeId?: string;
    classInput?: string;
    get normalizedActive(): string;
    get normalizedItems(): Array<TableOfContentsItem & {
        level: number;
    }>;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TableOfContents, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TableOfContents, "st-table-of-contents", never, { "title": { "alias": "title"; "required": false; }; "items": { "alias": "items"; "required": false; }; "activeId": { "alias": "activeId"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=TableOfContents.d.ts.map