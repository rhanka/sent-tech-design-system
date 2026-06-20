import { Component, Input as NgInput } from "@angular/core";

import { AppHeader } from "./AppHeader.js";

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

@Component({
  selector: "st-app-chrome",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <header class="st-appChrome__header">
        <a class="st-appChrome__brand" [href]="brandHref ?? '/'" [attr.aria-label]="brandLabel ?? brandName ?? 'Accueil'">
          @if (logoSrc) {
            <img class="st-appChrome__logo" [src]="logoSrc" [alt]="logoAlt ?? brandName ?? ''" />
          }
          @if (brandName) {
            <span class="st-appChrome__brandName">{{ brandName }}</span>
          }
          @if (productName) {
            <span class="st-appChrome__productName">{{ productName }}</span>
          }
        </a>
        @if (nav && nav.length > 0) {
          <nav class="st-appChrome__nav" [attr.aria-label]="navLabel ?? 'Navigation principale'">
            @for (item of nav; track item.href) {
              <a
                [href]="item.href"
                class="st-appChrome__navLink"
                [class.st-appChrome__navLink--active]="item.active"
                [attr.aria-current]="item.active ? 'page' : null"
              >{{ item.label }}</a>
            }
          </nav>
        }
      </header>
      <main class="st-appChrome__main">
        <ng-content></ng-content>
      </main>
    </div>
  `,
})
export class AppChrome {
  static readonly stComponentName = "AppChrome";
  readonly componentName = "AppChrome";
  @NgInput() brandName?: string;
  @NgInput() productName?: string;
  @NgInput() logoSrc?: string;
  @NgInput() logoAlt?: string;
  @NgInput() brandHref?: string;
  @NgInput() brandLabel?: string;
  @NgInput() nav?: AppChromeNavItem[];
  @NgInput() navLabel?: string;
  @NgInput() themes?: AppChromeThemeOption[];
  @NgInput() theme?: string;
  @NgInput() onThemeChange?: (id: string) => void;
  @NgInput() themeLabel?: string;
  @NgInput() colorMode?: AppChromeColorMode;
  @NgInput() onColorModeChange?: (mode: AppChromeColorMode) => void;
  @NgInput() colorModeLabels?: { light: string; dark: string; auto: string };
  @NgInput() locale?: AppChromeLocale;
  @NgInput() onLocaleChange?: (locale: AppChromeLocale) => void;
  @NgInput() localeLabel?: string;
  @NgInput() githubHref?: string;
  @NgInput() githubLabel?: string;
  @NgInput() mobileMenuOpen?: boolean;
  @NgInput() onMobileMenuToggle?: () => void;
  @NgInput() menuLabel?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-appChrome", this.classInput].filter(Boolean).join(" ");
  }
}
