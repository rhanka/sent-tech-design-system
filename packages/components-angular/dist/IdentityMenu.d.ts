import * as i0 from "@angular/core";
export type IdentityUser = {
    displayName: string;
    email?: string;
    id?: string;
};
export type IdentityMenuProps = {
    user?: IdentityUser | null;
    isAuthenticated?: boolean;
    /**
     * État ouvert du dropdown (optionnellement contrôlé). Si fourni, le parent
     * contrôle ; sinon le composant gère un état interne. Aligné sur les 3 fw.
     */
    open?: boolean;
    devicesHref?: string;
    settingsHref?: string;
    loginLabel?: string;
    devicesLabel?: string;
    settingsLabel?: string;
    logoutLabel?: string;
    variant?: "dropdown" | "accordion";
    class?: string;
};
export declare function identityInitial(user: IdentityUser | null | undefined): string;
export declare class IdentityMenu {
    static readonly stComponentName = "IdentityMenu";
    readonly componentName = "IdentityMenu";
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
    classInput?: string;
    localOpen: boolean;
    toggleOpen(): void;
    get initial(): string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<IdentityMenu, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IdentityMenu, "st-identity-menu", never, { "user": { "alias": "user"; "required": false; }; "isAuthenticated": { "alias": "isAuthenticated"; "required": false; }; "open": { "alias": "open"; "required": false; }; "devicesHref": { "alias": "devicesHref"; "required": false; }; "settingsHref": { "alias": "settingsHref"; "required": false; }; "loginLabel": { "alias": "loginLabel"; "required": false; }; "devicesLabel": { "alias": "devicesLabel"; "required": false; }; "settingsLabel": { "alias": "settingsLabel"; "required": false; }; "logoutLabel": { "alias": "logoutLabel"; "required": false; }; "variant": { "alias": "variant"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*", "*"], true, never>;
}
//# sourceMappingURL=IdentityMenu.d.ts.map