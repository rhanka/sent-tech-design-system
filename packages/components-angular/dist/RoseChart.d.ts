import * as i0 from "@angular/core";
export type RoseChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type RoseChartDatum = {
    label: string;
    value: number;
    tone?: RoseChartTone;
};
export type RoseChartProps = {
    data: RoseChartDatum[];
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
type Sector = {
    datum: RoseChartDatum;
    value: number;
    tone: RoseChartTone;
    radius: number;
    path: string;
    labelX: number;
    labelY: number;
    showLabel: boolean;
};
export declare class RoseChart {
    static readonly stComponentName = "RoseChart";
    readonly componentName = "RoseChart";
    hoveredIndex: number | null;
    data: RoseChartDatum[];
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    private safeValue;
    formatNumber(value: number): string;
    private point;
    private sectorPath;
    get sectors(): Sector[];
    get dataValueItems(): string[];
    get tooltipLeft(): number;
    get tooltipTop(): number;
    sectorClass(sector: Sector, i: number): string;
    contrastText(tone: RoseChartTone): string;
    handleVisualPointerMove(event: PointerEvent): void;
    handleLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<RoseChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<RoseChart, "st-rose-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=RoseChart.d.ts.map