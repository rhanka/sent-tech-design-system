import * as i0 from "@angular/core";
export type ObjectPageBreadcrumbItem = {
    label: string;
    href?: string;
};
export type ObjectPageKpi = {
    label: string;
    value: string | number;
    unit?: string;
};
export type ObjectPageField = {
    label: string;
    value: string | number;
};
export type ObjectPageColumn = {
    key: string;
    label: string;
};
export type ObjectPageRow = Record<string, unknown>;
export type ObjectPageProps = {
    entityTitle?: string;
    primaryAction?: string;
    secondaryAction?: string;
    kpis?: ObjectPageKpi[];
    fields?: ObjectPageField[];
    relatedColumns?: ObjectPageColumn[];
    relatedRows?: ObjectPageRow[];
    class?: string;
};
export declare class ObjectPage {
    static readonly stComponentName = "ObjectPage";
    readonly componentName = "ObjectPage";
    entityTitle: string;
    primaryAction?: string;
    secondaryAction?: string;
    kpis: ObjectPageKpi[];
    fields: ObjectPageField[];
    relatedColumns: ObjectPageColumn[];
    relatedRows: ObjectPageRow[];
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ObjectPage, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ObjectPage, "st-object-page", never, { "entityTitle": { "alias": "entityTitle"; "required": false; }; "primaryAction": { "alias": "primaryAction"; "required": false; }; "secondaryAction": { "alias": "secondaryAction"; "required": false; }; "kpis": { "alias": "kpis"; "required": false; }; "fields": { "alias": "fields"; "required": false; }; "relatedColumns": { "alias": "relatedColumns"; "required": false; }; "relatedRows": { "alias": "relatedRows"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ObjectPage.d.ts.map