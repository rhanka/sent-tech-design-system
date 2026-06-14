import * as i0 from "@angular/core";
export type ToggletipPlacement = "top" | "bottom" | "start" | "end";
export type ToggletipProps = {
    label: unknown;
    content?: unknown;
    open?: boolean;
    placement?: ToggletipPlacement;
    class?: string;
};
export declare class Toggletip {
    static readonly stComponentName = "Toggletip";
    readonly componentName = "Toggletip";
    label: unknown;
    content?: unknown;
    open?: boolean;
    placement?: ToggletipPlacement;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Toggletip, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Toggletip, "st-toggletip", never, { "label": { "alias": "label"; "required": false; }; "content": { "alias": "content"; "required": false; }; "open": { "alias": "open"; "required": false; }; "placement": { "alias": "placement"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Toggletip.d.ts.map