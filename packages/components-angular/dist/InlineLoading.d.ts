import * as i0 from "@angular/core";
export type InlineLoadingStatus = "active" | "inactive" | "success" | "error";
export type InlineLoadingProps = {
    label?: unknown;
    status?: InlineLoadingStatus;
    locale?: string;
    class?: string;
};
export declare class InlineLoading {
    static readonly stComponentName = "InlineLoading";
    readonly componentName = "InlineLoading";
    label?: unknown;
    status?: InlineLoadingStatus;
    locale: string;
    classInput?: string;
    get resolvedStatus(): InlineLoadingStatus;
    get hostClass(): string;
    get role(): string;
    private get isFr();
    private get fallbackLabel();
    get accessibleLabel(): string | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<InlineLoading, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<InlineLoading, "st-inline-loading", never, { "label": { "alias": "label"; "required": false; }; "status": { "alias": "status"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=InlineLoading.d.ts.map