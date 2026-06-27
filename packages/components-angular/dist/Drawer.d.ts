import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type DrawerSide = "left" | "right" | "bottom";
/** @deprecated Use {@link DrawerSide}. Kept for backward compatibility. */
export type DrawerPlacement = DrawerSide;
export type DrawerProps = {
    open?: boolean;
    title?: string;
    description?: string;
    side?: DrawerSide;
    closeLabel?: string;
    class?: string;
};
export declare class Drawer {
    static readonly stComponentName = "Drawer";
    readonly componentName = "Drawer";
    open?: boolean;
    title?: string;
    description?: string;
    side?: DrawerSide;
    closeLabel?: string;
    footer?: unknown;
    classInput?: string;
    readonly close: EventEmitter<void>;
    get hostClass(): string;
    onBackdropClick(event: MouseEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Drawer, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Drawer, "st-drawer", never, { "open": { "alias": "open"; "required": false; }; "title": { "alias": "title"; "required": false; }; "description": { "alias": "description"; "required": false; }; "side": { "alias": "side"; "required": false; }; "closeLabel": { "alias": "closeLabel"; "required": false; }; "footer": { "alias": "footer"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "close": "close"; }, never, ["*", "[slot='footer']"], true, never>;
}
//# sourceMappingURL=Drawer.d.ts.map