import * as i0 from "@angular/core";
export type IconButtonSize = "sm" | "md" | "lg";
export type IconButtonVariant = "secondary" | "danger" | "ghost";
export type IconButtonProps = {
    size?: IconButtonSize;
    variant?: IconButtonVariant;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    "aria-label"?: string;
    class?: string;
};
export declare class IconButton {
    static readonly stComponentName = "IconButton";
    readonly componentName = "IconButton";
    size: IconButtonSize;
    variant: IconButtonVariant;
    typeInput?: "button" | "submit" | "reset";
    disabled?: boolean;
    ariaLabel?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<IconButton, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IconButton, "st-icon-button", never, { "size": { "alias": "size"; "required": false; }; "variant": { "alias": "variant"; "required": false; }; "typeInput": { "alias": "type"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "ariaLabel": { "alias": "aria-label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=IconButton.d.ts.map