import { Component, Input as NgInput } from "@angular/core";
import { AppHeader } from "./AppHeader.js";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class AppChrome {
    static stComponentName = "AppChrome";
    componentName = "AppChrome";
    brandName;
    productName;
    logoSrc;
    logoAlt;
    brandHref;
    brandLabel;
    nav;
    navLabel;
    themes;
    theme;
    onThemeChange;
    themeLabel;
    colorMode;
    onColorModeChange;
    colorModeLabels;
    locale;
    onLocaleChange;
    localeLabel;
    githubHref;
    githubLabel;
    mobileMenuOpen;
    onMobileMenuToggle;
    menuLabel;
    classInput;
    get hostClass() {
        return ["st-appChrome", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: AppChrome, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: AppChrome, isStandalone: true, selector: "st-app-chrome", inputs: { brandName: "brandName", productName: "productName", logoSrc: "logoSrc", logoAlt: "logoAlt", brandHref: "brandHref", brandLabel: "brandLabel", nav: "nav", navLabel: "navLabel", themes: "themes", theme: "theme", onThemeChange: "onThemeChange", themeLabel: "themeLabel", colorMode: "colorMode", onColorModeChange: "onColorModeChange", colorModeLabels: "colorModeLabels", locale: "locale", onLocaleChange: "onLocaleChange", localeLabel: "localeLabel", githubHref: "githubHref", githubLabel: "githubLabel", mobileMenuOpen: "mobileMenuOpen", onMobileMenuToggle: "onMobileMenuToggle", menuLabel: "menuLabel", classInput: ["class", "classInput"] }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: AppChrome, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { brandName: [{
                type: NgInput
            }], productName: [{
                type: NgInput
            }], logoSrc: [{
                type: NgInput
            }], logoAlt: [{
                type: NgInput
            }], brandHref: [{
                type: NgInput
            }], brandLabel: [{
                type: NgInput
            }], nav: [{
                type: NgInput
            }], navLabel: [{
                type: NgInput
            }], themes: [{
                type: NgInput
            }], theme: [{
                type: NgInput
            }], onThemeChange: [{
                type: NgInput
            }], themeLabel: [{
                type: NgInput
            }], colorMode: [{
                type: NgInput
            }], onColorModeChange: [{
                type: NgInput
            }], colorModeLabels: [{
                type: NgInput
            }], locale: [{
                type: NgInput
            }], onLocaleChange: [{
                type: NgInput
            }], localeLabel: [{
                type: NgInput
            }], githubHref: [{
                type: NgInput
            }], githubLabel: [{
                type: NgInput
            }], mobileMenuOpen: [{
                type: NgInput
            }], onMobileMenuToggle: [{
                type: NgInput
            }], menuLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=AppChrome.js.map