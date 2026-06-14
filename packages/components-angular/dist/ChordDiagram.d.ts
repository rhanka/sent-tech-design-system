import * as i0 from "@angular/core";
export type ChordDiagramTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type ChordDiagramFlow = {
    from: string;
    to: string;
    value: number;
};
export type ChordDiagramProps = {
    data: ChordDiagramFlow[];
    labels?: Record<string, string>;
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
export declare class ChordDiagram {
    static readonly stComponentName = "ChordDiagram";
    readonly componentName = "ChordDiagram";
    data: ChordDiagramFlow[];
    labels?: Record<string, string>;
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ChordDiagram, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ChordDiagram, "st-chord-diagram", never, { "data": { "alias": "data"; "required": false; }; "labels": { "alias": "labels"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ChordDiagram.d.ts.map