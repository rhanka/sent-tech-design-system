import * as i0 from "@angular/core";
export type ContextPanelProps = {
    title?: string;
    subtitle?: string;
    label?: string;
    class?: string;
};
export declare class ContextPanel {
    static readonly stComponentName = "ContextPanel";
    readonly componentName = "ContextPanel";
    title?: string;
    subtitle?: string;
    label?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ContextPanel, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ContextPanel, "st-context-panel", never, { "title": { "alias": "title"; "required": false; }; "subtitle": { "alias": "subtitle"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ContextPanel.d.ts.map