import * as i0 from "@angular/core";
export type ListReportPageNavItem = {
    label: string;
    href?: string;
    active?: boolean;
};
export type ListReportPageColumn = {
    key: string;
    label: string;
    sortable?: boolean;
};
export type ListReportPageRow = Record<string, unknown>;
export type ListReportPageAction = {
    label: string;
    action: string;
};
export type ListReportPageFilter = {
    key: string;
    label: string;
    value?: string;
};
export type ListReportPageProps = {
    appTitle?: string;
    pageTitle?: string;
    columns?: ListReportPageColumn[];
    rows?: ListReportPageRow[];
    navItems?: ListReportPageNavItem[];
    primaryAction?: string;
    secondaryAction?: string;
    searchPlaceholder?: string;
    rowActions?: ListReportPageAction[];
    class?: string;
};
export declare class ListReportPage {
    static readonly stComponentName = "ListReportPage";
    readonly componentName = "ListReportPage";
    appTitle?: string;
    pageTitle: string;
    columns: ListReportPageColumn[];
    rows: ListReportPageRow[];
    navItems: ListReportPageNavItem[];
    primaryAction?: string;
    secondaryAction?: string;
    searchPlaceholder?: string;
    rowActions: ListReportPageAction[];
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ListReportPage, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ListReportPage, "st-list-report-page", never, { "appTitle": { "alias": "appTitle"; "required": false; }; "pageTitle": { "alias": "pageTitle"; "required": false; }; "columns": { "alias": "columns"; "required": false; }; "rows": { "alias": "rows"; "required": false; }; "navItems": { "alias": "navItems"; "required": false; }; "primaryAction": { "alias": "primaryAction"; "required": false; }; "secondaryAction": { "alias": "secondaryAction"; "required": false; }; "searchPlaceholder": { "alias": "searchPlaceholder"; "required": false; }; "rowActions": { "alias": "rowActions"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ListReportPage.d.ts.map