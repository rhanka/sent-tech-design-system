import * as i0 from "@angular/core";
export type NavShellVariant = "rail" | "drawer";
export type NavShellSide = "left" | "right" | "bottom";
export type NavShellProps = {
    variant?: NavShellVariant;
    title?: string;
    subtitle?: string;
    label?: string;
    open?: boolean;
    side?: NavShellSide;
    class?: string;
};
export declare class NavShell {
    static readonly stComponentName = "NavShell";
    readonly componentName = "NavShell";
    variant: NavShellVariant;
    title?: string;
    subtitle?: string;
    label?: string;
    open?: boolean;
    side: NavShellSide;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<NavShell, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NavShell, "st-nav-shell", never, { "variant": { "alias": "variant"; "required": false; }; "title": { "alias": "title"; "required": false; }; "subtitle": { "alias": "subtitle"; "required": false; }; "label": { "alias": "label"; "required": false; }; "open": { "alias": "open"; "required": false; }; "side": { "alias": "side"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=NavShell.d.ts.map