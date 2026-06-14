import { type ChartAnnotation } from "./chartAnnotations.js";
import { type DataLabelsProp } from "./chartDataLabels.js";
import * as i0 from "@angular/core";
export type AreaChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type AreaChartDatum = {
    x: number | string;
    y: number;
};
export type AreaChartProps = {
    data: (number | AreaChartDatum)[];
    width?: number;
    height?: number;
    tone?: AreaChartTone;
    smooth?: boolean;
    label: string;
    /**
     * Annotation overlay in DATA space (points, labels, axis lines, regions,
     * polygons), resolved to pixels via the chart scales. Regions render behind
     * the area, every other kind above it. Additive: absent ⇒ unchanged.
     */
    annotations?: ChartAnnotation[];
    /**
     * Per-point value labels. `false`/absent (default) → none. `true` → each
     * point's value with the chart's numeric formatter. Object → `format(value)`
     * and/or a `position` override. Default position is `top` (above the point).
     * Labels are `aria-hidden` — the values already live in the accessible
     * ChartDataList.
     */
    dataLabels?: DataLabelsProp;
    /**
     * CONTROLLED synchronised hover key (FR-3). A datum's key is `String(x)`. When
     * provided (string or null), the crosshair + tooltip track this key instead of
     * the chart's internal pointer hover (null ⇒ nothing shown), letting a parent
     * share one hover channel across several aligned charts. Absent (`undefined`)
     * keeps the legacy uncontrolled behaviour.
     */
    hoverKey?: string | null;
    /**
     * Emitted when the user hovers a datum (its key) or leaves the plot (`null`).
     * Always fired on pointer move/leave — even while CONTROLLED — so dataviz can
     * keep the shared hover channel in sync.
     */
    onHoverKeyChange?: (key: string | null) => void;
    /**
     * FR-5 — keyboard navigation of the data points (roving tabindex). When `true`
     * (or implied by wiring `onSelectKey`), a thin focusable overlay is rendered
     * over the points: the chart owns ONE tab stop, ←/↑/→/↓ move the focus between
     * points (data order), Home/End jump to the first/last, Enter/Space select the
     * focused point (`onSelectKey`), Escape leaves the navigation. Each focused
     * point announces its `x` + value. Absent ⇒ no overlay, rendering unchanged.
     */
    keyboardNav?: boolean;
    /**
     * Emitted when the user selects the focused point via Enter/Space (its key,
     * `String(x)`), or `null` when the navigation is left via Escape. Wiring it
     * also turns the keyboard navigation on.
     */
    onSelectKey?: (key: string | null) => void;
    class?: string;
};
export declare class AreaChart {
    static readonly stComponentName = "AreaChart";
    readonly componentName = "AreaChart";
    data: (number | AreaChartDatum)[];
    width?: number;
    height?: number;
    tone?: AreaChartTone;
    smooth?: boolean;
    label: string;
    annotations?: ChartAnnotation[];
    dataLabels?: DataLabelsProp;
    hoverKey?: string | null;
    onHoverKeyChange?: (key: string | null) => void;
    keyboardNav?: boolean;
    onSelectKey?: (key: string | null) => void;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<AreaChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AreaChart, "st-area-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "smooth": { "alias": "smooth"; "required": false; }; "label": { "alias": "label"; "required": false; }; "annotations": { "alias": "annotations"; "required": false; }; "dataLabels": { "alias": "dataLabels"; "required": false; }; "hoverKey": { "alias": "hoverKey"; "required": false; }; "onHoverKeyChange": { "alias": "onHoverKeyChange"; "required": false; }; "keyboardNav": { "alias": "keyboardNav"; "required": false; }; "onSelectKey": { "alias": "onSelectKey"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=AreaChart.d.ts.map