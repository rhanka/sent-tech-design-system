import * as i0 from "@angular/core";
export type TooltipPlacement = "top" | "bottom";
export type TooltipProps = {
    content: unknown;
    placement?: TooltipPlacement;
    class?: string;
};
export declare class Tooltip {
    static readonly stComponentName = "Tooltip";
    readonly componentName = "Tooltip";
    readonly tooltipId: string;
    content: unknown;
    placement?: TooltipPlacement;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Tooltip, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Tooltip, "st-tooltip", never, { "content": { "alias": "content"; "required": false; }; "placement": { "alias": "placement"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Tooltip.d.ts.map