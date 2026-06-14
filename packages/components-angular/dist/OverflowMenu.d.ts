import type { MenuItem } from "./Menu.js";
import * as i0 from "@angular/core";
export type OverflowMenuPlacement = "top-start" | "top-end" | "bottom-start" | "bottom-end";
export type OverflowMenuProps = {
    items: MenuItem[];
    label?: string;
    open?: boolean;
    dense?: boolean;
    placement?: OverflowMenuPlacement;
    class?: string;
};
export declare class OverflowMenu {
    static readonly stComponentName = "OverflowMenu";
    readonly componentName = "OverflowMenu";
    items: MenuItem[];
    label?: string;
    open?: boolean;
    dense?: boolean;
    placement?: OverflowMenuPlacement;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<OverflowMenu, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<OverflowMenu, "st-overflow-menu", never, { "items": { "alias": "items"; "required": false; }; "label": { "alias": "label"; "required": false; }; "open": { "alias": "open"; "required": false; }; "dense": { "alias": "dense"; "required": false; }; "placement": { "alias": "placement"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=OverflowMenu.d.ts.map