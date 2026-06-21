import * as i0 from "@angular/core";
export interface NavRailItem {
    id: string;
    label: unknown;
    href?: string;
    active?: boolean;
    disabled?: boolean;
    badge?: unknown;
}
export type NavRailProps = {
    items?: NavRailItem[];
    label?: string;
    activeItemId?: string;
    class?: string;
};
export declare class NavRail {
    static readonly stComponentName = "NavRail";
    readonly componentName = "NavRail";
    items?: NavRailItem[];
    label: string;
    activeItemId?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<NavRail, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NavRail, "st-nav-rail", never, { "items": { "alias": "items"; "required": false; }; "label": { "alias": "label"; "required": false; }; "activeItemId": { "alias": "activeItemId"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=NavRail.d.ts.map