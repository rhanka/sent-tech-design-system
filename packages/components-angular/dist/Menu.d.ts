import * as i0 from "@angular/core";
export type MenuActionItem = {
    id?: string;
    value?: string;
    label: unknown;
    disabled?: boolean;
    variant?: "default" | "danger";
    danger?: boolean;
    /** Optional leading icon component (rendered in `.st-menu__itemIcon`). */
    icon?: unknown;
    onClick?: () => void;
};
export type MenuDividerItem = {
    type?: "divider";
    kind?: "divider";
    id?: string;
};
export type MenuGroupItem = {
    type?: "group";
    kind?: "group";
    id?: string;
    label: unknown;
    items?: MenuActionItem[];
};
export type MenuItem = MenuActionItem | MenuDividerItem | MenuGroupItem;
export type MenuProps = {
    items: MenuItem[];
    dense?: boolean;
    role?: string;
    class?: string;
};
export declare class Menu {
    static readonly stComponentName = "Menu";
    readonly componentName = "Menu";
    items: MenuItem[];
    dense?: boolean;
    role?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Menu, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Menu, "st-menu", never, { "items": { "alias": "items"; "required": false; }; "dense": { "alias": "dense"; "required": false; }; "role": { "alias": "role"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Menu.d.ts.map