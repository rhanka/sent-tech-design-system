import { EventEmitter } from "@angular/core";
import type { NavShellSide } from "./NavShell.js";
import * as i0 from "@angular/core";
export type NavDrawerProps = {
    title?: string;
    label?: string;
    open?: boolean;
    side?: NavShellSide;
    class?: string;
    navItems?: Array<{
        label: string;
        href?: string;
        active?: boolean;
    }>;
};
export declare class NavDrawer {
    static readonly stComponentName = "NavDrawer";
    readonly componentName = "NavDrawer";
    title?: string;
    label?: string;
    open: boolean;
    side: NavShellSide;
    navItems?: Array<{
        label: string;
        href?: string;
        active?: boolean;
    }>;
    classInput?: string;
    readonly closeEvent: EventEmitter<void>;
    get hostClass(): string;
    onBackdropClick(event: MouseEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NavDrawer, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NavDrawer, "st-nav-drawer", never, { "title": { "alias": "title"; "required": false; }; "label": { "alias": "label"; "required": false; }; "open": { "alias": "open"; "required": false; }; "side": { "alias": "side"; "required": false; }; "navItems": { "alias": "navItems"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "closeEvent": "closeEvent"; }, never, never, true, never>;
}
//# sourceMappingURL=NavDrawer.d.ts.map