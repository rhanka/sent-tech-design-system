import * as i0 from "@angular/core";
export type PointAndFigureChartMark = "x" | "o";
export type PointAndFigureChartDatum = {
    date: number;
    close: number;
};
export type PointAndFigureChartProps = {
    data: PointAndFigureChartDatum[];
    boxSize?: number;
    reversal?: number;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
export declare class PointAndFigureChart {
    static readonly stComponentName = "PointAndFigureChart";
    readonly componentName = "PointAndFigureChart";
    data: PointAndFigureChartDatum[];
    boxSize?: number;
    reversal?: number;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<PointAndFigureChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PointAndFigureChart, "st-point-and-figure-chart", never, { "data": { "alias": "data"; "required": false; }; "boxSize": { "alias": "boxSize"; "required": false; }; "reversal": { "alias": "reversal"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=PointAndFigureChart.d.ts.map