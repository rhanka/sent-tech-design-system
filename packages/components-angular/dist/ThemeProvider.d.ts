import type { OnChanges, OnDestroy, OnInit } from "@angular/core";
import { type TenantTheme } from "@sentropic/design-system-themes";
import * as i0 from "@angular/core";
export type ThemeProviderProps = {
    theme?: TenantTheme;
    namespace?: string;
};
export declare class ThemeProvider implements OnInit, OnChanges, OnDestroy {
    static readonly stComponentName = "ThemeProvider";
    readonly componentName = "ThemeProvider";
    theme: TenantTheme;
    namespace: string;
    /** Reference to the injected <style> element so it can be updated/removed. */
    private styleEl;
    ngOnInit(): void;
    ngOnChanges(): void;
    ngOnDestroy(): void;
    /** Compile the theme tokens to CSS and inject them into a <style> element. */
    private applyTheme;
    static ɵfac: i0.ɵɵFactoryDeclaration<ThemeProvider, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ThemeProvider, "st-theme-provider", never, { "theme": { "alias": "theme"; "required": false; }; "namespace": { "alias": "namespace"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ThemeProvider.d.ts.map