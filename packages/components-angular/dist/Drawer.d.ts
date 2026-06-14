import * as i0 from "@angular/core";
export type DrawerPlacement = "left" | "right";
export type DrawerProps = {
    open?: boolean;
    title?: string;
    description?: string;
    placement?: DrawerPlacement;
    class?: string;
};
export declare class Drawer {
    static readonly stComponentName = "Drawer";
    readonly componentName = "Drawer";
    open?: boolean;
    title?: string;
    description?: string;
    placement?: DrawerPlacement;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Drawer, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Drawer, "st-drawer", never, { "open": { "alias": "open"; "required": false; }; "title": { "alias": "title"; "required": false; }; "description": { "alias": "description"; "required": false; }; "placement": { "alias": "placement"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Drawer.d.ts.map