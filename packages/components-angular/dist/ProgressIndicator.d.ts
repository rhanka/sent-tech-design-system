import * as i0 from "@angular/core";
export type ProgressIndicatorStatus = "complete" | "current" | "upcoming" | "disabled" | "invalid" | "incomplete";
export interface ProgressIndicatorItem {
    id?: string;
    /** Svelte-canonical alias for the React/Vue `id`. */
    value?: string;
    label: unknown;
    description?: unknown;
    status?: ProgressIndicatorStatus;
}
export type ProgressIndicatorOrientation = "horizontal" | "vertical";
export type ProgressIndicatorProps = {
    items: ProgressIndicatorItem[];
    orientation?: ProgressIndicatorOrientation;
    /** Svelte-canonical alias: `vertical` sets `orientation="vertical"`. */
    vertical?: boolean;
    label?: string;
    class?: string;
};
export declare class ProgressIndicator {
    static readonly stComponentName = "ProgressIndicator";
    readonly componentName = "ProgressIndicator";
    items: ProgressIndicatorItem[];
    orientation?: ProgressIndicatorOrientation;
    vertical?: boolean;
    label?: string;
    classInput?: string;
    get resolvedOrientation(): ProgressIndicatorOrientation;
    get hostClass(): string;
    itemKey(item: ProgressIndicatorItem, index: number): string;
    itemClass(item: ProgressIndicatorItem): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ProgressIndicator, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ProgressIndicator, "st-progress-indicator", never, { "items": { "alias": "items"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "vertical": { "alias": "vertical"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ProgressIndicator.d.ts.map