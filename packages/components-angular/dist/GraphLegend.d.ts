import { type ForceGraphLegendEntry } from "./ForceGraph.js";
import * as i0 from "@angular/core";
export type GraphLegendProps = {
    entries: ForceGraphLegendEntry[];
    /** Optional heading shown above entries. */
    title?: string;
    class?: string;
};
export declare class GraphLegend {
    static readonly stComponentName = "GraphLegend";
    readonly componentName = "GraphLegend";
    entries: ForceGraphLegendEntry[];
    title?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<GraphLegend, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<GraphLegend, "st-graph-legend", never, { "entries": { "alias": "entries"; "required": false; }; "title": { "alias": "title"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=GraphLegend.d.ts.map