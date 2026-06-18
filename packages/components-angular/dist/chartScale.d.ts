export declare const CHART_MARGIN: {
    readonly top: 12;
    readonly right: 16;
    readonly bottom: 32;
    readonly left: 44;
};
export declare function niceTicks(min: number, max: number, target?: number): number[];
export declare function fixedTicks(min: number, max: number, target?: number): number[];
export declare function scaleLinear(value: number, d0: number, d1: number, r0: number, r1: number): number;
export type ChartScale = "linear" | "log";
export declare function smallestPositive(...values: number[]): number;
export declare function logTicks(min: number, max: number): number[];
export declare function fixedLogTicks(min: number, max: number): number[];
export declare function validLinearDomain(domain: [number, number] | undefined): [number, number] | null;
export declare function validLogDomain(domain: [number, number] | undefined): [number, number] | null;
export declare function clampFraction(value: number): number;
export declare function formatTick(value: number): string;
export declare function isNumeric(value: number | string): value is number;
export declare function buildLinearPath(points: {
    x: number;
    y: number;
}[]): string;
export declare function buildSmoothPath(points: {
    x: number;
    y: number;
}[]): string;
export type ForecastRun = {
    start: number;
    end: number;
    forecast: boolean;
};
export declare function forecastRuns(flags: boolean[]): ForecastRun[];
export type ChartOverlayTone = "neutral" | "success" | "warning" | "error" | "info";
export type ChartReferenceLine = {
    value: number;
    label?: string;
    tone?: ChartOverlayTone;
    axis?: "x" | "y";
};
export type ChartBand = {
    from: number;
    to: number;
    label?: string;
    tone?: ChartOverlayTone;
};
export type ChartGoalLine = {
    value: number;
    label?: string;
};
export declare function overlayToneClass(prefix: string, tone: ChartOverlayTone | undefined): string;
export declare function linearRegression(points: ReadonlyArray<{
    x: number;
    y: number;
}>): {
    slope: number;
    intercept: number;
    minX: number;
    maxX: number;
} | null;
export declare function extendValueDomain(min: number, max: number, options: {
    referenceLines?: ReadonlyArray<ChartReferenceLine>;
    referenceAxis?: "x" | "y";
    bands?: ReadonlyArray<ChartBand>;
    goalLine?: ChartGoalLine | null;
    extraValues?: ReadonlyArray<number>;
}): [number, number];
export declare function chartDataList(label: string, items: string[]): string;
export declare function overlayDataListItems(overlays: {
    referenceLines?: ReadonlyArray<ChartReferenceLine>;
    bands?: ReadonlyArray<ChartBand>;
    goalLine?: ChartGoalLine | null;
    trend?: {
        slope: number;
        intercept: number;
    } | null;
}): string[];
export declare function isLightTone(): boolean;
export declare function labelColorForTone(): string;
//# sourceMappingURL=chartScale.d.ts.map