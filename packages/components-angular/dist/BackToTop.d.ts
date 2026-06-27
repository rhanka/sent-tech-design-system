import type { OnDestroy, OnInit } from "@angular/core";
import * as i0 from "@angular/core";
export type BackToTopProps = {
    label?: string;
    disabled?: boolean;
    targetId?: string;
    threshold?: number;
    autoHide?: boolean;
    smooth?: boolean;
    class?: string;
};
export declare class BackToTop implements OnInit, OnDestroy {
    static readonly stComponentName = "BackToTop";
    readonly componentName = "BackToTop";
    label?: string;
    disabled?: boolean;
    targetId?: string;
    threshold?: number;
    autoHide?: boolean;
    smooth?: boolean;
    classInput?: string;
    visible: boolean;
    private onScroll?;
    get resolvedLabel(): string;
    get resolvedAutoHide(): boolean;
    get ariaHidden(): boolean;
    ngOnInit(): void;
    ngOnDestroy(): void;
    get hostClass(): string;
    goTop(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<BackToTop, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BackToTop, "st-back-to-top", never, { "label": { "alias": "label"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "targetId": { "alias": "targetId"; "required": false; }; "threshold": { "alias": "threshold"; "required": false; }; "autoHide": { "alias": "autoHide"; "required": false; }; "smooth": { "alias": "smooth"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=BackToTop.d.ts.map