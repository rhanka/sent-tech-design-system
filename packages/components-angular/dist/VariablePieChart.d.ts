import * as i0 from "@angular/core";
export type VariablePieChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type VariablePieChartDatum = {
    label: string;
    value: number;
    z: number;
    tone?: VariablePieChartTone;
};
export type VariablePieChartProps = {
    data: VariablePieChartDatum[];
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
type Sector = {
    datum: VariablePieChartDatum;
    value: number;
    z: number;
    tone: VariablePieChartTone;
    radius: number;
    start: number;
    end: number;
    path: string;
    labelX: number;
    labelY: number;
    showLabel: boolean;
};
export declare class VariablePieChart {
    static readonly stComponentName = "VariablePieChart";
    readonly componentName = "VariablePieChart";
    hoveredIndex: number | null;
    data: VariablePieChartDatum[];
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get sectors(): Sector[];
    get dataValueItems(): string[];
    sectorClass(i: number): string;
    contrastText(tone: VariablePieChartTone): string;
    formatNumber(value: number): string;
    get tooltipLeft(): number;
    get tooltipTop(): number;
    handleVisualPointerMove(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<VariablePieChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<VariablePieChart, "st-variable-pie-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=VariablePieChart.d.ts.map