import * as i0 from "@angular/core";
export interface BreadcrumbItem {
    label: unknown;
    href?: string;
    current?: boolean;
}
export type BreadcrumbProps = {
    items: BreadcrumbItem[];
    label?: string;
    class?: string;
};
export declare class Breadcrumb {
    static readonly stComponentName = "Breadcrumb";
    readonly componentName = "Breadcrumb";
    items: BreadcrumbItem[];
    label?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Breadcrumb, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Breadcrumb, "st-breadcrumb", never, { "items": { "alias": "items"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Breadcrumb.d.ts.map