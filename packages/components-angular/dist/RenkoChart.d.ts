import * as i0 from "@angular/core";
export type RenkoChartDirection = "up" | "down";
export type RenkoChartDatum = {
    date: number;
    close: number;
};
export type RenkoChartProps = {
    data: RenkoChartDatum[];
    boxSize?: number;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
export declare class RenkoChart {
    static readonly stComponentName = "RenkoChart";
    readonly componentName = "RenkoChart";
    data: RenkoChartDatum[];
    boxSize?: number;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<RenkoChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<RenkoChart, "st-renko-chart", never, { "data": { "alias": "data"; "required": false; }; "boxSize": { "alias": "boxSize"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=RenkoChart.d.ts.map