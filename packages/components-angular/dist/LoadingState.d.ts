import * as i0 from "@angular/core";
export type LoadingStateVariant = "spinner" | "skeleton";
export type LoadingStateProps = {
    label?: string;
    variant?: LoadingStateVariant;
    class?: string;
};
export declare class LoadingState {
    static readonly stComponentName = "LoadingState";
    readonly componentName = "LoadingState";
    label: string;
    variant?: LoadingStateVariant;
    classInput?: string;
    get resolvedVariant(): LoadingStateVariant;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<LoadingState, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<LoadingState, "st-loading-state", never, { "label": { "alias": "label"; "required": false; }; "variant": { "alias": "variant"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=LoadingState.d.ts.map