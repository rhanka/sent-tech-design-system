import * as i0 from "@angular/core";
export type SideNavItem = {
    label: unknown;
    href: string;
    active?: boolean;
    children?: SideNavItem[];
};
export type SideNavProps = {
    items: SideNavItem[];
    label?: string;
    class?: string;
};
export declare class SideNav {
    static readonly stComponentName = "SideNav";
    readonly componentName = "SideNav";
    items: SideNavItem[];
    label?: string;
    classInput?: string;
    linkClass(item: SideNavItem): string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<SideNav, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SideNav, "st-side-nav", never, { "items": { "alias": "items"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=SideNav.d.ts.map