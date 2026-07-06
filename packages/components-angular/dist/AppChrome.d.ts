import * as i0 from "@angular/core";
export interface AppChromeNavItem {
    label: string;
    href: string;
    /** Marqué actif (souligné, aria-current=page). */
    active?: boolean;
    /** Roles autorisés à voir l'item. Vide/undefined = visible par tous. */
    roles?: string[];
    /** Alias pratique pour un seul rôle autorisé. */
    role?: string;
    /** Coupe la navigation tout en gardant l'item visible/annoncé. */
    disabled?: boolean;
    ariaLabel?: string;
    target?: string;
    rel?: string;
    onClick?: (event: MouseEvent) => void;
}
export interface AppChromeThemeOption {
    id: string;
    label: string;
}
export type AppChromeColorMode = "light" | "dark" | "auto";
export type AppChromeLocale = "fr" | "en";
export type AppChromeProps = {
    brandName?: string;
    productName?: string;
    logoSrc?: string;
    logoAlt?: string;
    brandHref?: string;
    brandLabel?: string;
    nav?: AppChromeNavItem[];
    navLabel?: string;
    /** Roles de l'utilisateur courant pour filtrer les nav items gatés par rôle. */
    userRoles?: string[];
    themes?: AppChromeThemeOption[];
    theme?: string;
    onThemeChange?: (id: string) => void;
    themeLabel?: string;
    colorMode?: AppChromeColorMode;
    onColorModeChange?: (mode: AppChromeColorMode) => void;
    colorModeLabels?: {
        light: string;
        dark: string;
        auto: string;
    };
    locale?: AppChromeLocale;
    onLocaleChange?: (locale: AppChromeLocale) => void;
    localeLabel?: string;
    githubHref?: string;
    githubLabel?: string;
    mobileMenuOpen?: boolean;
    onMobileMenuToggle?: () => void;
    menuLabel?: string;
    class?: string;
};
export declare class AppChrome {
    static readonly stComponentName = "AppChrome";
    readonly componentName = "AppChrome";
    brandName?: string;
    productName?: string;
    logoSrc?: string;
    logoAlt?: string;
    brandHref?: string;
    brandLabel?: string;
    nav: AppChromeNavItem[];
    navLabel?: string;
    userRoles: string[];
    themes: AppChromeThemeOption[];
    theme?: string;
    onThemeChange?: (id: string) => void;
    themeLabel?: string;
    colorMode?: AppChromeColorMode;
    onColorModeChange?: (mode: AppChromeColorMode) => void;
    colorModeLabels: {
        light: string;
        dark: string;
        auto: string;
    };
    locale?: AppChromeLocale;
    onLocaleChange?: (locale: AppChromeLocale) => void;
    localeLabel?: string;
    githubHref?: string;
    githubLabel?: string;
    mobileMenuOpen: boolean;
    onMobileMenuToggle?: () => void;
    menuLabel?: string;
    classInput?: string;
    /** Id du tiroir, stable et partagé entre `aria-controls` (burger) et `id` (drawer). */
    readonly drawerId: string;
    readonly localeOptions: AppChromeLocale[];
    readonly colorModeOptions: AppChromeColorMode[];
    isThemeOpen: boolean;
    isLocaleOpen: boolean;
    get hostClass(): string;
    get resolvedBrandLabel(): string | null;
    get activeTheme(): AppChromeThemeOption | undefined;
    get showThemeSelector(): boolean;
    get showColorMode(): boolean;
    get showLocaleSelector(): boolean;
    get showGithub(): boolean;
    get colorModeAriaLabel(): string;
    chevronClass(open: boolean): string;
    canShowNavItem(item: AppChromeNavItem): boolean;
    navRel(item: AppChromeNavItem): string | undefined;
    navLinkClass(item: AppChromeNavItem, base: string): string;
    handleNavClick(event: MouseEvent, item: AppChromeNavItem, closeDrawer?: boolean): void;
    toggleTheme(): void;
    toggleLocale(): void;
    pickTheme(id: string): void;
    pickLocale(value: AppChromeLocale): void;
    cycleColorMode(): void;
    toggleMobileMenu(): void;
    pickThemeFromDrawer(id: string): void;
    pickLocaleFromDrawer(value: AppChromeLocale): void;
    selectColorMode(mode: AppChromeColorMode): void;
    onDocumentClick(e: MouseEvent): void;
    onDocumentKeydown(e: KeyboardEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<AppChrome, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AppChrome, "st-app-chrome", never, { "brandName": { "alias": "brandName"; "required": false; }; "productName": { "alias": "productName"; "required": false; }; "logoSrc": { "alias": "logoSrc"; "required": false; }; "logoAlt": { "alias": "logoAlt"; "required": false; }; "brandHref": { "alias": "brandHref"; "required": false; }; "brandLabel": { "alias": "brandLabel"; "required": false; }; "nav": { "alias": "nav"; "required": false; }; "navLabel": { "alias": "navLabel"; "required": false; }; "userRoles": { "alias": "userRoles"; "required": false; }; "themes": { "alias": "themes"; "required": false; }; "theme": { "alias": "theme"; "required": false; }; "onThemeChange": { "alias": "onThemeChange"; "required": false; }; "themeLabel": { "alias": "themeLabel"; "required": false; }; "colorMode": { "alias": "colorMode"; "required": false; }; "onColorModeChange": { "alias": "onColorModeChange"; "required": false; }; "colorModeLabels": { "alias": "colorModeLabels"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; "onLocaleChange": { "alias": "onLocaleChange"; "required": false; }; "localeLabel": { "alias": "localeLabel"; "required": false; }; "githubHref": { "alias": "githubHref"; "required": false; }; "githubLabel": { "alias": "githubLabel"; "required": false; }; "mobileMenuOpen": { "alias": "mobileMenuOpen"; "required": false; }; "onMobileMenuToggle": { "alias": "onMobileMenuToggle"; "required": false; }; "menuLabel": { "alias": "menuLabel"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=AppChrome.d.ts.map