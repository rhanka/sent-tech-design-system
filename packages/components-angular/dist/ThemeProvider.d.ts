import { type TenantTheme } from "@sentropic/design-system-themes";
import * as i0 from "@angular/core";
export type ThemeProviderProps = {
    theme?: TenantTheme;
    namespace?: string;
};
export declare class ThemeProvider {
    static readonly stComponentName = "ThemeProvider";
    readonly componentName = "ThemeProvider";
    theme?: TenantTheme;
    namespace?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ThemeProvider, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ThemeProvider, "st-theme-provider", never, { "theme": { "alias": "theme"; "required": false; }; "namespace": { "alias": "namespace"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ThemeProvider.d.ts.map