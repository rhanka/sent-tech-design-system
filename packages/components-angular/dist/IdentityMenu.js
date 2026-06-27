import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
/** Première lettre du displayName, en majuscule (calque de la source). */
export function identityInitial(user) {
    const source = user?.displayName || user?.email || "U";
    return source.charAt(0).toUpperCase();
}
/** Deux initiales (1re lettre de chaque mot, jusqu'à 2 mots) pour l'avatar. */
export function identityInitials(user) {
    const source = user?.displayName || user?.email || "U";
    return source
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}
export class IdentityMenu {
    static stComponentName = "IdentityMenu";
    componentName = "IdentityMenu";
    user = null;
    isAuthenticated = false;
    open;
    devicesHref = "#";
    settingsHref = "#";
    loginLabel = "Se connecter";
    devicesLabel = "Appareils";
    settingsLabel = "Paramètres";
    logoutLabel = "Se déconnecter";
    variant = "dropdown";
    compact = false;
    extraItems;
    classInput;
    loginEvent = new EventEmitter();
    logoutEvent = new EventEmitter();
    openChange = new EventEmitter();
    localOpen = false;
    toggleOpen() {
        if (this.open !== undefined) {
            this.openChange.emit(!this.open);
        }
        else {
            this.localOpen = !this.localOpen;
        }
    }
    select() {
        this.localOpen = false;
    }
    handleLogout() {
        this.localOpen = false;
        this.logoutEvent.emit();
    }
    get initial() {
        return identityInitials(this.user);
    }
    get displayName() {
        return this.user?.displayName || this.user?.email || "User";
    }
    get chevronClass() {
        return classNames("st-identityMenu__chevron", this.localOpen ? "st-identityMenu__chevron--open" : undefined);
    }
    get loginClass() {
        return classNames("st-identityMenu__login", this.variant === "accordion" ? "st-identityMenu__login--accordion" : undefined);
    }
    get hostClass() {
        return classNames("st-identityMenu", this.compact ? "st-identityMenu--compact" : undefined, this.variant === "accordion" ? "st-identityMenu--accordion" : undefined, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: IdentityMenu, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: IdentityMenu, isStandalone: true, selector: "st-identity-menu", inputs: { user: "user", isAuthenticated: "isAuthenticated", open: "open", devicesHref: "devicesHref", settingsHref: "settingsHref", loginLabel: "loginLabel", devicesLabel: "devicesLabel", settingsLabel: "settingsLabel", logoutLabel: "logoutLabel", variant: "variant", compact: "compact", extraItems: "extraItems", classInput: ["class", "classInput"] }, outputs: { loginEvent: "loginEvent", logoutEvent: "logoutEvent", openChange: "openChange" }, ngImport: i0, template: `
    @if (isAuthenticated && user) {
      <div
        [attr.data-st-component]="componentName"
        [class]="hostClass"
      >
        <button
          type="button"
          class="st-identityMenu__trigger"
          aria-haspopup="menu"
          [attr.aria-expanded]="localOpen"
          [attr.aria-label]="'Compte de ' + displayName"
          (click)="toggleOpen()"
        >
          <span class="st-identityMenu__avatar" aria-hidden="true">{{ initial }}</span>
          @if (!compact) {
            <span class="st-identityMenu__meta">
              <span class="st-identityMenu__name">{{ displayName }}</span>
              @if (variant === 'accordion' && user.email) {
                <span class="st-identityMenu__email">{{ user.email }}</span>
              }
            </span>
            <svg
              [class]="chevronClass"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          }
        </button>
        @if (localOpen) {
          <div
            class="st-identityMenu__menu"
            role="menu"
            tabindex="-1"
            [attr.aria-label]="'Menu de ' + displayName"
          >
            <a
              [href]="devicesHref"
              class="st-identityMenu__item"
              role="menuitem"
              tabindex="-1"
              (click)="select()"
            >{{ devicesLabel }}</a>
            <a
              [href]="settingsHref"
              class="st-identityMenu__item"
              role="menuitem"
              tabindex="-1"
              (click)="select()"
            >{{ settingsLabel }}</a>
            @for (item of extraItems ?? []; track item.label) {
              <a
                [href]="item.href ?? '#'"
                class="st-identityMenu__item"
                role="menuitem"
                tabindex="-1"
                (click)="item.onClick && item.onClick(); select()"
              >{{ item.label }}</a>
            }
            <div class="st-identityMenu__divider" role="separator" aria-hidden="true"></div>
            <button
              type="button"
              class="st-identityMenu__item st-identityMenu__item--danger"
              role="menuitem"
              tabindex="-1"
              (click)="handleLogout()"
            >{{ logoutLabel }}</button>
          </div>
        }
      </div>
    } @else if (compact) {
      <button
        type="button"
        class="st-identityMenu__loginCompact"
        [attr.aria-label]="loginLabel"
        (click)="loginEvent.emit()"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      </button>
    } @else {
      <button
        type="button"
        [class]="loginClass"
        (click)="loginEvent.emit()"
      >{{ loginLabel }}</button>
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: IdentityMenu, decorators: [{
            type: Component,
            args: [{
                    selector: "st-identity-menu",
                    standalone: true,
                    template: `
    @if (isAuthenticated && user) {
      <div
        [attr.data-st-component]="componentName"
        [class]="hostClass"
      >
        <button
          type="button"
          class="st-identityMenu__trigger"
          aria-haspopup="menu"
          [attr.aria-expanded]="localOpen"
          [attr.aria-label]="'Compte de ' + displayName"
          (click)="toggleOpen()"
        >
          <span class="st-identityMenu__avatar" aria-hidden="true">{{ initial }}</span>
          @if (!compact) {
            <span class="st-identityMenu__meta">
              <span class="st-identityMenu__name">{{ displayName }}</span>
              @if (variant === 'accordion' && user.email) {
                <span class="st-identityMenu__email">{{ user.email }}</span>
              }
            </span>
            <svg
              [class]="chevronClass"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          }
        </button>
        @if (localOpen) {
          <div
            class="st-identityMenu__menu"
            role="menu"
            tabindex="-1"
            [attr.aria-label]="'Menu de ' + displayName"
          >
            <a
              [href]="devicesHref"
              class="st-identityMenu__item"
              role="menuitem"
              tabindex="-1"
              (click)="select()"
            >{{ devicesLabel }}</a>
            <a
              [href]="settingsHref"
              class="st-identityMenu__item"
              role="menuitem"
              tabindex="-1"
              (click)="select()"
            >{{ settingsLabel }}</a>
            @for (item of extraItems ?? []; track item.label) {
              <a
                [href]="item.href ?? '#'"
                class="st-identityMenu__item"
                role="menuitem"
                tabindex="-1"
                (click)="item.onClick && item.onClick(); select()"
              >{{ item.label }}</a>
            }
            <div class="st-identityMenu__divider" role="separator" aria-hidden="true"></div>
            <button
              type="button"
              class="st-identityMenu__item st-identityMenu__item--danger"
              role="menuitem"
              tabindex="-1"
              (click)="handleLogout()"
            >{{ logoutLabel }}</button>
          </div>
        }
      </div>
    } @else if (compact) {
      <button
        type="button"
        class="st-identityMenu__loginCompact"
        [attr.aria-label]="loginLabel"
        (click)="loginEvent.emit()"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      </button>
    } @else {
      <button
        type="button"
        [class]="loginClass"
        (click)="loginEvent.emit()"
      >{{ loginLabel }}</button>
    }
  `,
                }]
        }], propDecorators: { user: [{
                type: NgInput
            }], isAuthenticated: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], devicesHref: [{
                type: NgInput
            }], settingsHref: [{
                type: NgInput
            }], loginLabel: [{
                type: NgInput
            }], devicesLabel: [{
                type: NgInput
            }], settingsLabel: [{
                type: NgInput
            }], logoutLabel: [{
                type: NgInput
            }], variant: [{
                type: NgInput
            }], compact: [{
                type: NgInput
            }], extraItems: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], loginEvent: [{
                type: Output
            }], logoutEvent: [{
                type: Output
            }], openChange: [{
                type: Output
            }] } });
//# sourceMappingURL=IdentityMenu.js.map