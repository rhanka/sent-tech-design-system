import * as i0 from "@angular/core";
export type MenuTriggerButtonSize = "sm" | "md" | "lg";
export type MenuTriggerButtonVariant = "ghost" | "secondary";
export type MenuTriggerButtonProps = {
    open?: boolean;
    expanded?: boolean;
    size?: MenuTriggerButtonSize;
    variant?: MenuTriggerButtonVariant;
    disabled?: boolean;
    class?: string;
};
export declare class MenuTriggerButton {
    static readonly stComponentName = "MenuTriggerButton";
    readonly componentName = "MenuTriggerButton";
    open?: boolean;
    expanded?: boolean;
    size?: MenuTriggerButtonSize;
    variant?: MenuTriggerButtonVariant;
    disabled?: boolean;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MenuTriggerButton, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MenuTriggerButton, "st-menu-trigger-button", never, { "open": { "alias": "open"; "required": false; }; "expanded": { "alias": "expanded"; "required": false; }; "size": { "alias": "size"; "required": false; }; "variant": { "alias": "variant"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=MenuTriggerButton.d.ts.map