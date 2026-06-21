import * as i0 from "@angular/core";
export type AppShellVariant = "site" | "workspace";
export type AppShellUtilityMode = "reserve" | "overlay" | "floating";
export type AppShellUtilitySide = "left" | "right" | "bottom";
export type AppShellProps = {
    variant?: AppShellVariant;
    mainId?: string;
    navigationLabel?: string;
    contextLabel?: string;
    utilityLabel?: string;
    utilityMode?: AppShellUtilityMode;
    utilitySide?: AppShellUtilitySide;
    class?: string;
};
export declare class AppShell {
    static readonly stComponentName = "AppShell";
    readonly componentName = "AppShell";
    variant: AppShellVariant;
    mainId: string;
    navigationLabel: string;
    contextLabel: string;
    utilityLabel: string;
    utilityMode: AppShellUtilityMode;
    utilitySide: AppShellUtilitySide;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<AppShell, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AppShell, "st-app-shell", never, { "variant": { "alias": "variant"; "required": false; }; "mainId": { "alias": "mainId"; "required": false; }; "navigationLabel": { "alias": "navigationLabel"; "required": false; }; "contextLabel": { "alias": "contextLabel"; "required": false; }; "utilityLabel": { "alias": "utilityLabel"; "required": false; }; "utilityMode": { "alias": "utilityMode"; "required": false; }; "utilitySide": { "alias": "utilitySide"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=AppShell.d.ts.map