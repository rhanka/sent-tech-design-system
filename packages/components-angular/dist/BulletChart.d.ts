import * as i0 from "@angular/core";
export type BulletChartDatum = {
    label: string;
    value: number;
    target: number;
    ranges?: number[];
};
export type BulletChartProps = {
    data: BulletChartDatum[];
    label: string;
    orientation?: "horizontal" | "vertical";
    width?: number;
    height?: number;
    class?: string;
};
export declare class BulletChart {
    static readonly stComponentName = "BulletChart";
    readonly componentName = "BulletChart";
    data: BulletChartDatum[];
    label: string;
    orientation?: "horizontal" | "vertical";
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<BulletChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BulletChart, "st-bullet-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=BulletChart.d.ts.map