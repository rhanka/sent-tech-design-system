import * as i0 from "@angular/core";
export type DashboardNavItem = {
    label: string;
    href?: string;
    active?: boolean;
};
export type DashboardKpi = {
    label: string;
    value: string | number;
    unit?: string;
    trend?: number;
};
export type DashboardProps = {
    appTitle?: string;
    pageTitle?: string;
    navItems?: DashboardNavItem[];
    kpis?: DashboardKpi[];
    class?: string;
};
export declare class Dashboard {
    static readonly stComponentName = "Dashboard";
    readonly componentName = "Dashboard";
    appTitle?: string;
    pageTitle: string;
    navItems: DashboardNavItem[];
    kpis: DashboardKpi[];
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Dashboard, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Dashboard, "st-dashboard", never, { "appTitle": { "alias": "appTitle"; "required": false; }; "pageTitle": { "alias": "pageTitle"; "required": false; }; "navItems": { "alias": "navItems"; "required": false; }; "kpis": { "alias": "kpis"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Dashboard.d.ts.map