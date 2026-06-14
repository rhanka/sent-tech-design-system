import * as i0 from "@angular/core";
export type BellCurveChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type BellCurveChartProps = {
    data: number[];
    width?: number;
    height?: number;
    tone?: BellCurveChartTone;
    smooth?: boolean;
    intervals?: number;
    label: string;
    class?: string;
};
export declare class BellCurveChart {
    static readonly stComponentName = "BellCurveChart";
    readonly componentName = "BellCurveChart";
    data: number[];
    width?: number;
    height?: number;
    tone?: BellCurveChartTone;
    smooth?: boolean;
    intervals?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<BellCurveChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BellCurveChart, "st-bell-curve-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "smooth": { "alias": "smooth"; "required": false; }; "intervals": { "alias": "intervals"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=BellCurveChart.d.ts.map