import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type DrawerPlacement = "left" | "right" | "bottom";
export type DrawerProps = {
    open?: boolean;
    title?: string;
    description?: string;
    placement?: DrawerPlacement;
    class?: string;
    closeLabel?: string;
};
export declare class Drawer {
    static readonly stComponentName = "Drawer";
    readonly componentName = "Drawer";
    open?: boolean;
    title?: string;
    description?: string;
    placement?: DrawerPlacement;
    closeLabel?: string;
    classInput?: string;
    readonly close: EventEmitter<void>;
    get hostClass(): string;
    onBackdropClick(event: MouseEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Drawer, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Drawer, "st-drawer", never, { "open": { "alias": "open"; "required": false; }; "title": { "alias": "title"; "required": false; }; "description": { "alias": "description"; "required": false; }; "placement": { "alias": "placement"; "required": false; }; "closeLabel": { "alias": "closeLabel"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "close": "close"; }, never, ["*"], true, never>;
}
//# sourceMappingURL=Drawer.d.ts.map