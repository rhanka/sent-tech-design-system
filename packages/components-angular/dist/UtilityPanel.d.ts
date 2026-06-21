import * as i0 from "@angular/core";
export type UtilityPanelMode = "reserve" | "overlay" | "floating";
export type UtilityPanelSide = "left" | "right" | "bottom";
export type UtilityPanelProps = {
    mode?: UtilityPanelMode;
    side?: UtilityPanelSide;
    title?: string;
    label?: string;
    collapsed?: boolean;
    class?: string;
};
export declare class UtilityPanel {
    static readonly stComponentName = "UtilityPanel";
    readonly componentName = "UtilityPanel";
    mode: UtilityPanelMode;
    side: UtilityPanelSide;
    title?: string;
    label?: string;
    collapsed?: boolean;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<UtilityPanel, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<UtilityPanel, "st-utility-panel", never, { "mode": { "alias": "mode"; "required": false; }; "side": { "alias": "side"; "required": false; }; "title": { "alias": "title"; "required": false; }; "label": { "alias": "label"; "required": false; }; "collapsed": { "alias": "collapsed"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=UtilityPanel.d.ts.map