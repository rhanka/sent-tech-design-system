import { type ChartAnnotation } from "./chartAnnotations.js";
import { type DataLabelsProp } from "./chartDataLabels.js";
import * as i0 from "@angular/core";
export type ScatterPlotTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type ScatterPlotDatum = {
    x: number;
    y: number;
    label?: string;
    tone?: ScatterPlotTone;
    /**
     * Per-datum radius, clamped to a sane maximum (32). Non-finite or
     * negative ⇒ falls back to the global `radius`.
     */
    r?: number;
};
/** Cluster centroid marker (ring + cross), drawn above the data points. */
export type ScatterPlotCentroid = {
    x: number;
    y: number;
    tone?: ScatterPlotTone;
    label?: string;
};
export type ScatterPlotProps = {
    data: ScatterPlotDatum[];
    width?: number;
    height?: number;
    xLabel?: string;
    yLabel?: string;
    radius?: number;
    /**
     * Cluster centroid markers (ring + cross), drawn above the points. Their
     * coordinates are folded into the axis domain. Non-finite x/y are skipped.
     */
    centroids?: ScatterPlotCentroid[];
    /**
     * Annotation overlay in DATA space (points, labels, axis lines, regions,
     * polygons). Both axes are continuous (linear). Additive: absent ⇒ unchanged.
     */
    annotations?: ChartAnnotation[];
    /**
     * Per-point value labels. `false`/absent (default) → none. `true` → each
     * point's value (the datum `label` wins when present). Object → `format` /
     * `position`. Default position is `top`. Labels are `aria-hidden`.
     */
    dataLabels?: DataLabelsProp;
    /**
     * CONTROLLED synchronised hover key (FR-3). A point's key is its `label` when
     * present, otherwise `"x,y"`. Absent (`undefined`) keeps the uncontrolled
     * behaviour.
     */
    hoverKey?: string | null;
    /** Emitted on hover (the key) / leave (`null`); fired even while controlled. */
    onHoverKeyChange?: (key: string | null) => void;
    /** FR-5 — roving-tabindex keyboard navigation of the data points. */
    keyboardNav?: boolean;
    /** Emitted on Enter/Space select (the key) / Escape (`null`); enables nav. */
    onSelectKey?: (key: string | null) => void;
    label: string;
    class?: string;
};
export declare class ScatterPlot {
    static readonly stComponentName = "ScatterPlot";
    readonly componentName = "ScatterPlot";
    data: ScatterPlotDatum[];
    width?: number;
    height?: number;
    xLabel?: string;
    yLabel?: string;
    radius?: number;
    centroids?: ScatterPlotCentroid[];
    annotations?: ChartAnnotation[];
    dataLabels?: DataLabelsProp;
    hoverKey?: string | null;
    onHoverKeyChange?: (key: string | null) => void;
    keyboardNav?: boolean;
    onSelectKey?: (key: string | null) => void;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ScatterPlot, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ScatterPlot, "st-scatter-plot", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "xLabel": { "alias": "xLabel"; "required": false; }; "yLabel": { "alias": "yLabel"; "required": false; }; "radius": { "alias": "radius"; "required": false; }; "centroids": { "alias": "centroids"; "required": false; }; "annotations": { "alias": "annotations"; "required": false; }; "dataLabels": { "alias": "dataLabels"; "required": false; }; "hoverKey": { "alias": "hoverKey"; "required": false; }; "onHoverKeyChange": { "alias": "onHoverKeyChange"; "required": false; }; "keyboardNav": { "alias": "keyboardNav"; "required": false; }; "onSelectKey": { "alias": "onSelectKey"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ScatterPlot.d.ts.map