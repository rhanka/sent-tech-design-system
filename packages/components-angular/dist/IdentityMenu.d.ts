import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type IdentityUser = {
    displayName: string;
    email?: string;
    id?: string;
};
export type IdentityMenuItem = {
    label: string;
    href?: string;
    onClick?: () => void;
};
export type IdentityMenuProps = {
    user?: IdentityUser | null;
    isAuthenticated?: boolean;
    open?: boolean;
    devicesHref?: string;
    settingsHref?: string;
    loginLabel?: string;
    devicesLabel?: string;
    settingsLabel?: string;
    logoutLabel?: string;
    variant?: "dropdown" | "accordion";
    compact?: boolean;
    extraItems?: IdentityMenuItem[];
    class?: string;
};
/** Première lettre du displayName, en majuscule (calque de la source). */
export declare function identityInitial(user: IdentityUser | null | undefined): string;
/** Deux initiales (1re lettre de chaque mot, jusqu'à 2 mots) pour l'avatar. */
export declare function identityInitials(user: IdentityUser | null | undefined): string;
export declare class IdentityMenu {
    static readonly stComponentName = "IdentityMenu";
    readonly componentName = "IdentityMenu";
    user?: IdentityUser | null;
    isAuthenticated?: boolean;
    open?: boolean;
    devicesHref: string;
    settingsHref: string;
    loginLabel: string;
    devicesLabel: string;
    settingsLabel: string;
    logoutLabel: string;
    variant: "dropdown" | "accordion";
    compact: boolean;
    extraItems?: IdentityMenuItem[];
    classInput?: string;
    readonly loginEvent: EventEmitter<void>;
    readonly logoutEvent: EventEmitter<void>;
    readonly openChange: EventEmitter<boolean>;
    localOpen: boolean;
    toggleOpen(): void;
    select(): void;
    handleLogout(): void;
    get initial(): string;
    get displayName(): string;
    get chevronClass(): string;
    get loginClass(): string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<IdentityMenu, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IdentityMenu, "st-identity-menu", never, { "user": { "alias": "user"; "required": false; }; "isAuthenticated": { "alias": "isAuthenticated"; "required": false; }; "open": { "alias": "open"; "required": false; }; "devicesHref": { "alias": "devicesHref"; "required": false; }; "settingsHref": { "alias": "settingsHref"; "required": false; }; "loginLabel": { "alias": "loginLabel"; "required": false; }; "devicesLabel": { "alias": "devicesLabel"; "required": false; }; "settingsLabel": { "alias": "settingsLabel"; "required": false; }; "logoutLabel": { "alias": "logoutLabel"; "required": false; }; "variant": { "alias": "variant"; "required": false; }; "compact": { "alias": "compact"; "required": false; }; "extraItems": { "alias": "extraItems"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "loginEvent": "loginEvent"; "logoutEvent": "logoutEvent"; "openChange": "openChange"; }, never, never, true, never>;
}
//# sourceMappingURL=IdentityMenu.d.ts.map