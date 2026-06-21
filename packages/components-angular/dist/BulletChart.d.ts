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
type RangeBand = {
    x: number;
    y: number;
    width: number;
    height: number;
    opacity: number;
};
type Bullet = {
    datum: BulletChartDatum;
    index: number;
    barX: number;
    barY: number;
    barW: number;
    barH: number;
    targetX: number;
    targetY: number;
    targetH: number;
    labelX: number;
    labelY: number;
    rangeBands: RangeBand[];
    tooltipX: number;
    tooltipY: number;
};
export declare class BulletChart {
    static readonly stComponentName = "BulletChart";
    readonly componentName = "BulletChart";
    readonly MARGIN_LEFT: 80;
    readonly MARGIN_RIGHT: 24;
    readonly MARGIN_TOP: 12;
    readonly MARGIN_BOTTOM: 36;
    hoveredIndex: number | null;
    data: BulletChartDatum[];
    label: string;
    orientation?: "horizontal" | "vertical";
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    get orientationValue(): "horizontal" | "vertical";
    get isHorizontal(): boolean;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get validData(): BulletChartDatum[];
    get domainBounds(): {
        rawMin: number;
        rawMax: number;
    };
    get ticks(): number[];
    get tickDomainMin(): number;
    get tickDomainMax(): number;
    get baselineX(): number;
    get baselineY(): number;
    tickX(tick: number): number;
    tickY(tick: number): number;
    formatTickLabel(v: number): string;
    get bullets(): Bullet[];
    get dataValueItems(): string[];
    get hoveredBullet(): Bullet | null;
    handleLeave(): void;
    handlePointerMove(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<BulletChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BulletChart, "st-bullet-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=BulletChart.d.ts.map