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
export declare class BackToTop {
    static readonly stComponentName = "BackToTop";
    readonly componentName = "BackToTop";
    label?: string;
    disabled?: boolean;
    targetId?: string;
    threshold?: number;
    autoHide?: boolean;
    smooth?: boolean;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<BackToTop, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BackToTop, "st-back-to-top", never, { "label": { "alias": "label"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "targetId": { "alias": "targetId"; "required": false; }; "threshold": { "alias": "threshold"; "required": false; }; "autoHide": { "alias": "autoHide"; "required": false; }; "smooth": { "alias": "smooth"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=BackToTop.d.ts.map