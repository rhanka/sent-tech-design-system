import type { MenuItem } from "./Menu.js";
import * as i0 from "@angular/core";
export type MenuPopoverPlacement = "top-start" | "top-end" | "bottom-start" | "bottom-end";
export type MenuPopoverProps = {
    items?: MenuItem[];
    open?: boolean;
    placement?: MenuPopoverPlacement;
    class?: string;
};
export declare class MenuPopover {
    static readonly stComponentName = "MenuPopover";
    readonly componentName = "MenuPopover";
    items?: MenuItem[];
    open?: boolean;
    placement?: MenuPopoverPlacement;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MenuPopover, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MenuPopover, "st-menu-popover", never, { "items": { "alias": "items"; "required": false; }; "open": { "alias": "open"; "required": false; }; "placement": { "alias": "placement"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=MenuPopover.d.ts.map