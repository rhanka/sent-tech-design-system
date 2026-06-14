import * as i0 from "@angular/core";
export type PackedBubblesChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type PackedBubblesChartDatum = {
    label: string;
    value: number;
    tone?: PackedBubblesChartTone;
};
export type PackedBubblesChartProps = {
    data: PackedBubblesChartDatum[];
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
export declare class PackedBubblesChart {
    static readonly stComponentName = "PackedBubblesChart";
    readonly componentName = "PackedBubblesChart";
    data: PackedBubblesChartDatum[];
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<PackedBubblesChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PackedBubblesChart, "st-packed-bubbles-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=PackedBubblesChart.d.ts.map