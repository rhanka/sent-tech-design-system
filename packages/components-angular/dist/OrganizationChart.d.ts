import * as i0 from "@angular/core";
export type OrganizationChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type OrganizationChartNode = {
    id: string;
    parentId?: string | null;
    label: string;
    tone?: OrganizationChartTone;
};
export type OrganizationChartProps = {
    data: OrganizationChartNode[];
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
export declare class OrganizationChart {
    static readonly stComponentName = "OrganizationChart";
    readonly componentName = "OrganizationChart";
    data: OrganizationChartNode[];
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<OrganizationChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<OrganizationChart, "st-organization-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=OrganizationChart.d.ts.map