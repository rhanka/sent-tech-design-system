import * as i0 from "@angular/core";
export type MasterDetailNavItem = {
    label: string;
    href?: string;
    active?: boolean;
};
export type MasterDetailItem = {
    id: string;
    title: string;
    subtitle?: string;
};
export type MasterDetailField = {
    label: string;
    value: string | number;
};
export type MasterDetailProps = {
    listTitle?: string;
    detailTitle?: string;
    listItems?: MasterDetailItem[];
    detailFields?: MasterDetailField[];
    detailActions?: string[];
    class?: string;
};
export declare class MasterDetail {
    static readonly stComponentName = "MasterDetail";
    readonly componentName = "MasterDetail";
    listTitle: string;
    detailTitle: string;
    listItems: MasterDetailItem[];
    detailFields: MasterDetailField[];
    detailActions: string[];
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MasterDetail, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MasterDetail, "st-master-detail", never, { "listTitle": { "alias": "listTitle"; "required": false; }; "detailTitle": { "alias": "detailTitle"; "required": false; }; "listItems": { "alias": "listItems"; "required": false; }; "detailFields": { "alias": "detailFields"; "required": false; }; "detailActions": { "alias": "detailActions"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=MasterDetail.d.ts.map