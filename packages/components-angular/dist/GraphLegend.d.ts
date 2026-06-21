import { type ForceGraphLegendEntry } from "./ForceGraph.js";
import * as i0 from "@angular/core";
export type { ForceGraphLegendEntry, ForceGraphNodeShape, ForceGraphTone, ForceGraphEdgeDash } from "./ForceGraph.js";
export type GraphLegendProps = {
    entries: ForceGraphLegendEntry[];
    /** Optional heading shown above entries. */
    title?: string;
    class?: string;
};
type ResolvedEntry = {
    entry: ForceGraphLegendEntry;
    swatchPath: string | null;
    swatchTone: string;
    swatchDash: string | null;
};
export declare class GraphLegend {
    static readonly stComponentName = "GraphLegend";
    readonly componentName = "GraphLegend";
    entries: ForceGraphLegendEntry[];
    title?: string;
    classInput?: string;
    get hostClass(): string;
    get resolvedEntries(): ResolvedEntry[];
    edgeClass(entry: ForceGraphLegendEntry): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<GraphLegend, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<GraphLegend, "st-graph-legend", never, { "entries": { "alias": "entries"; "required": false; }; "title": { "alias": "title"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=GraphLegend.d.ts.map