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
type LayoutBox = {
    id: string;
    label: string;
    tone: OrganizationChartTone;
    depth: number;
    x: number;
    y: number;
    parentId: string | null;
};
type LayoutLink = {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};
type Layout = {
    boxes: LayoutBox[];
    links: LayoutLink[];
    boxW: number;
};
export declare class OrganizationChart {
    static readonly stComponentName = "OrganizationChart";
    readonly componentName = "OrganizationChart";
    readonly BOX_H = 36;
    data: OrganizationChartNode[];
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get layout(): Layout;
    get fontSize(): number;
    get maxChars(): number;
    get dataValueItems(): string[];
    clip(s: string, n: number): string;
    boxClass(box: LayoutBox): string;
    linkPath(link: LayoutLink): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<OrganizationChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<OrganizationChart, "st-organization-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=OrganizationChart.d.ts.map