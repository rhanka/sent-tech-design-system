import * as i0_1 from "@angular/core";
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
type ArcEntry = {
    id: string;
    tone: ChordDiagramTone;
    value: number;
    span: number;
    path: string;
    labelX: number;
    labelY: number;
    labelAngle: number;
    textColor: string;
};
type RibbonEntry = {
    index: number;
    from: string;
    to: string;
    value: number;
    tone: ChordDiagramTone;
    strokeWidth: number;
    path: string;
    midX: number;
    midY: number;
};
type ChordLayout = {
    cx: number;
    cy: number;
    inner: number;
    outer: number;
    arcs: ArcEntry[];
    ribbons: RibbonEntry[];
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
    hoveredFlowIndex: number | null;
    get widthValue(): number;
    get heightValue(): number;
    get hostClass(): string;
    get viewBox(): string;
    displayLabel(id: string): string;
    get layout(): ChordLayout;
    get hoveredRibbon(): RibbonEntry | undefined;
    get dataValueItems(): string[];
    ribbonClass(ribbon: RibbonEntry): string;
    arcClass(arc: ArcEntry): string;
    handleVisualPointerMove(event: PointerEvent): void;
    handleLeave(): void;
    tooltipLeft(): string;
    tooltipTop(): string;
    tooltipLabel(): string;
    tooltipValue(): number | string;
    static ɵfac: i0_1.ɵɵFactoryDeclaration<ChordDiagram, never>;
    static ɵcmp: i0_1.ɵɵComponentDeclaration<ChordDiagram, "st-chord-diagram", never, { "data": { "alias": "data"; "required": false; }; "labels": { "alias": "labels"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=ChordDiagram.d.ts.map