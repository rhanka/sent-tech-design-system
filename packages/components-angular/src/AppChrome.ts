import { Component, HostListener, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export interface AppChromeNavItem {
  label: string;
  href: string;
  /** Marqué actif (souligné, aria-current=page). */
  active?: boolean;
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
  themes?: AppChromeThemeOption[];
  theme?: string;
  onThemeChange?: (id: string) => void;
  themeLabel?: string;
  colorMode?: AppChromeColorMode;
  onColorModeChange?: (mode: AppChromeColorMode) => void;
  colorModeLabels?: { light: string; dark: string; auto: string };
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

// Compteur module pour générer un id de tiroir stable, déterministe et
// SSR-safe (pas de crypto). Aligné sur le pattern des autres frameworks.
let appChromeIdCounter = 0;

@Component({
  selector: "st-app-chrome",
  standalone: true,
  styles: [":host { display: contents; }"],
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <header class="st-appHeader st-appChrome__header">
        <div class="st-appHeader__bar">
          <!-- ── Marque (logo SENT à GAUCHE + sous-titre) ───────────────── -->
          <div class="st-appHeader__logo">
            <a class="st-appChrome__brand" [href]="brandHref" [attr.aria-label]="resolvedBrandLabel">
              @if (logoSrc) {
                <img
                  class="st-appChrome__brandMark"
                  [src]="logoSrc"
                  [alt]="logoAlt"
                  [attr.aria-hidden]="logoAlt ? null : 'true'"
                />
              }
              @if (brandName || productName) {
                <span class="st-appChrome__brandCopy">
                  @if (brandName) {
                    <span class="st-appChrome__brandName">{{ brandName }}</span>
                  }
                  @if (productName) {
                    <span class="st-appChrome__brandProduct">{{ productName }}</span>
                  }
                </span>
              }
            </a>
          </div>

          <!-- ── Nav principale ─────────────────────────────────────────── -->
          <nav class="st-appHeader__nav" aria-label="Primary">
            @for (item of nav; track item.href) {
              <a
                class="st-appChrome__navLink st-appHeader__navLink"
                [href]="item.href"
                [attr.aria-current]="item.active ? 'page' : null"
              >{{ item.label }}</a>
            }
          </nav>

          <!-- ── Actions (zone utilitaire + burger) ─────────────────────── -->
          <div class="st-appHeader__actions">
            <div class="st-appChrome__utilityNav">
              <!-- Sélecteur de thème -->
              @if (showThemeSelector) {
                <div class="st-appChrome__themeWrap st-appChrome__menuWrap">
                  <button
                    type="button"
                    class="st-appChrome__control st-appHeader__control"
                    (click)="toggleTheme()"
                    [attr.aria-expanded]="isThemeOpen"
                    aria-haspopup="true"
                    [attr.aria-label]="themeLabel"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                      <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.6z" />
                      <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
                      <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
                      <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
                      <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
                    </svg>
                    <span>{{ activeTheme?.label }}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" [attr.class]="chevronClass(isThemeOpen)">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  @if (isThemeOpen) {
                    <div class="st-appChrome__menu" role="menu">
                      @for (option of themes; track option.id) {
                        <button
                          type="button"
                          class="st-appChrome__menuItem"
                          [class.is-active]="theme === option.id"
                          role="menuitem"
                          (click)="pickTheme(option.id)"
                        >
                          <span class="st-appChrome__check" aria-hidden="true">@if (theme === option.id) {✓}</span>
                          <span>{{ option.label }}</span>
                        </button>
                      }
                    </div>
                  }
                </div>
              }

              <!-- Toggle mode couleur -->
              @if (showColorMode) {
                <button
                  type="button"
                  class="st-appChrome__control st-appChrome__iconControl st-appHeader__control"
                  (click)="cycleColorMode()"
                  [attr.aria-label]="colorModeAriaLabel"
                >
                  @if (colorMode === 'dark') {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9" />
                    </svg>
                  } @else if (colorMode === 'light') {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                    </svg>
                  } @else {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="opacity:0.65">
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                    </svg>
                  }
                </button>
              }

              <!-- Sélecteur de langue -->
              @if (showLocaleSelector) {
                <div class="st-appChrome__localeWrap st-appChrome__menuWrap">
                  <button
                    type="button"
                    class="st-appChrome__control st-appHeader__control"
                    (click)="toggleLocale()"
                    [attr.aria-expanded]="isLocaleOpen"
                    aria-haspopup="true"
                    [attr.aria-label]="localeLabel"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                      <path d="M2 12h20" />
                    </svg>
                    <span>{{ locale?.toUpperCase() }}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" [attr.class]="chevronClass(isLocaleOpen)">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  @if (isLocaleOpen) {
                    <div class="st-appChrome__menu" role="menu">
                      @for (value of localeOptions; track value) {
                        <button
                          type="button"
                          class="st-appChrome__menuItem"
                          [class.is-active]="locale === value"
                          role="menuitem"
                          (click)="pickLocale(value)"
                        >
                          <span class="st-appChrome__check" aria-hidden="true">@if (locale === value) {✓}</span>
                          <span>{{ value === 'fr' ? 'Français' : 'English' }}</span>
                        </button>
                      }
                    </div>
                  }
                </div>
              }

              <!-- Lien GitHub -->
              @if (showGithub) {
                <a
                  class="st-appChrome__control st-appChrome__iconControl st-appHeader__control"
                  [href]="githubHref"
                  rel="noreferrer"
                  target="_blank"
                  [attr.aria-label]="githubLabel"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 4 5 4 5 4c-.3 1.15-.3 2.35 0 3.5a5.4 5.4 0 0 0-1 3.5c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                </a>
              }
            </div>

            <!-- Burger mobile -->
            <button
              type="button"
              class="st-appChrome__burgerTrigger"
              (click)="toggleMobileMenu()"
              [attr.aria-expanded]="mobileMenuOpen"
              [attr.aria-controls]="drawerId"
              [attr.aria-label]="menuLabel"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- ── Tiroir mobile ──────────────────────────────────────────────── -->
      @if (mobileMenuOpen) {
        <nav [id]="drawerId" class="st-appChrome__drawer" [attr.aria-label]="navLabel">
          <div class="st-appChrome__drawerSection">
            @for (item of nav; track item.href) {
              <a
                class="st-appChrome__drawerLink"
                [href]="item.href"
                [attr.aria-current]="item.active ? 'page' : null"
                (click)="toggleMobileMenu()"
              >{{ item.label }}</a>
            }
          </div>

          @if (showThemeSelector) {
            <div class="st-appChrome__drawerSection">
              <span class="st-appChrome__drawerLabel">{{ themeLabel }}</span>
              <div class="st-appChrome__drawerSwitcher">
                @for (option of themes; track option.id) {
                  <button
                    type="button"
                    class="st-appChrome__drawerBtn"
                    [class.is-active]="theme === option.id"
                    (click)="pickThemeFromDrawer(option.id)"
                  >{{ option.label }}</button>
                }
              </div>
            </div>
          }

          @if (showColorMode) {
            <div class="st-appChrome__drawerSection">
              <span class="st-appChrome__drawerLabel">{{ colorModeLabels.light }} / {{ colorModeLabels.dark }}</span>
              <div class="st-appChrome__drawerSwitcher">
                @for (mode of colorModeOptions; track mode) {
                  <button
                    type="button"
                    class="st-appChrome__drawerBtn"
                    [class.is-active]="colorMode === mode"
                    (click)="selectColorMode(mode)"
                  >{{ mode === 'light' ? colorModeLabels.light : mode === 'dark' ? colorModeLabels.dark : colorModeLabels.auto }}</button>
                }
              </div>
            </div>
          }

          @if (showLocaleSelector) {
            <div class="st-appChrome__drawerSection">
              <span class="st-appChrome__drawerLabel">{{ localeLabel }}</span>
              <div class="st-appChrome__drawerSwitcher">
                @for (value of localeOptions; track value) {
                  <button
                    type="button"
                    class="st-appChrome__drawerBtn"
                    [class.is-active]="locale === value"
                    (click)="pickLocaleFromDrawer(value)"
                  >{{ value === 'fr' ? 'Français' : 'English' }}</button>
                }
              </div>
            </div>
          }

          @if (showGithub) {
            <div class="st-appChrome__drawerSection">
              <a class="st-appChrome__drawerLink" [href]="githubHref" rel="noreferrer" target="_blank">{{ githubLabel }}</a>
            </div>
          }
        </nav>
      }
    </div>
  `,
})
export class AppChrome {
  static readonly stComponentName = "AppChrome";
  readonly componentName = "AppChrome";
  @NgInput() brandName?: string = "Sentropic";
  @NgInput() productName?: string;
  @NgInput() logoSrc?: string;
  @NgInput() logoAlt?: string = "";
  @NgInput() brandHref?: string = "/";
  @NgInput() brandLabel?: string;
  @NgInput() nav: AppChromeNavItem[] = [];
  @NgInput() navLabel?: string = "Primary";
  @NgInput() themes: AppChromeThemeOption[] = [];
  @NgInput() theme?: string;
  @NgInput() onThemeChange?: (id: string) => void;
  @NgInput() themeLabel?: string = "Change theme";
  @NgInput() colorMode?: AppChromeColorMode;
  @NgInput() onColorModeChange?: (mode: AppChromeColorMode) => void;
  @NgInput() colorModeLabels: { light: string; dark: string; auto: string } = {
    light: "Light mode",
    dark: "Dark mode",
    auto: "Auto mode",
  };
  @NgInput() locale?: AppChromeLocale;
  @NgInput() onLocaleChange?: (locale: AppChromeLocale) => void;
  @NgInput() localeLabel?: string = "Change language";
  @NgInput() githubHref?: string;
  @NgInput() githubLabel?: string = "GitHub";
  @NgInput() mobileMenuOpen = false;
  @NgInput() onMobileMenuToggle?: () => void;
  @NgInput() menuLabel?: string = "Menu";
  @NgInput("class") classInput?: string;

  /** Id du tiroir, stable et partagé entre `aria-controls` (burger) et `id` (drawer). */
  readonly drawerId = `st-appChrome-drawer-${++appChromeIdCounter}`;
  readonly localeOptions: AppChromeLocale[] = ["fr", "en"];
  readonly colorModeOptions: AppChromeColorMode[] = ["light", "dark", "auto"];

  isThemeOpen = false;
  isLocaleOpen = false;

  get hostClass(): string {
    return classNames("st-appChrome", this.classInput);
  }

  get resolvedBrandLabel(): string | null {
    if (this.brandLabel != null) return this.brandLabel;
    const joined = [this.brandName, this.productName].filter(Boolean).join(" ");
    return joined || null;
  }

  get activeTheme(): AppChromeThemeOption | undefined {
    return this.themes.find((t) => t.id === this.theme) ?? this.themes[0];
  }

  get showThemeSelector(): boolean {
    return this.themes.length > 0;
  }

  get showColorMode(): boolean {
    return this.colorMode !== undefined;
  }

  get showLocaleSelector(): boolean {
    return this.locale !== undefined;
  }

  get showGithub(): boolean {
    return Boolean(this.githubHref);
  }

  get colorModeAriaLabel(): string {
    if (this.colorMode === "light") return this.colorModeLabels.dark;
    if (this.colorMode === "dark") return this.colorModeLabels.auto;
    return this.colorModeLabels.light;
  }

  chevronClass(open: boolean): string {
    return classNames("st-appChrome__chevron", open ? "is-rotated" : undefined);
  }

  toggleTheme(): void {
    this.isThemeOpen = !this.isThemeOpen;
  }

  toggleLocale(): void {
    this.isLocaleOpen = !this.isLocaleOpen;
  }

  pickTheme(id: string): void {
    this.onThemeChange?.(id);
    this.isThemeOpen = false;
  }

  pickLocale(value: AppChromeLocale): void {
    this.onLocaleChange?.(value);
    this.isLocaleOpen = false;
  }

  cycleColorMode(): void {
    const next: AppChromeColorMode =
      this.colorMode === "light" ? "dark" : this.colorMode === "dark" ? "auto" : "light";
    this.onColorModeChange?.(next);
  }

  toggleMobileMenu(): void {
    this.onMobileMenuToggle?.();
  }

  pickThemeFromDrawer(id: string): void {
    this.onThemeChange?.(id);
    this.onMobileMenuToggle?.();
  }

  pickLocaleFromDrawer(value: AppChromeLocale): void {
    this.onLocaleChange?.(value);
    this.onMobileMenuToggle?.();
  }

  selectColorMode(mode: AppChromeColorMode): void {
    this.onColorModeChange?.(mode);
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(e: MouseEvent): void {
    const target = e.target as Element | null;
    if (this.isThemeOpen && target && !target.closest(".st-appChrome__themeWrap")) this.isThemeOpen = false;
    if (this.isLocaleOpen && target && !target.closest(".st-appChrome__localeWrap")) this.isLocaleOpen = false;
  }

  @HostListener("document:keydown", ["$event"])
  onDocumentKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      this.isThemeOpen = false;
      this.isLocaleOpen = false;
    }
  }
}
