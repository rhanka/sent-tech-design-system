import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export function identityInitial(user) {
    const source = user?.displayName || user?.email || "U";
    return source.charAt(0).toUpperCase();
}
export class IdentityMenu {
    static stComponentName = "IdentityMenu";
    componentName = "IdentityMenu";
    user;
    isAuthenticated;
    open;
    devicesHref;
    settingsHref;
    loginLabel;
    devicesLabel;
    settingsLabel;
    logoutLabel;
    variant;
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
        return identityInitial(this.user);
    }
    get hostClass() {
        return classNames("st-identityMenu", this.variant === "accordion" ? "st-identityMenu--accordion" : undefined, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: IdentityMenu, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: IdentityMenu, isStandalone: true, selector: "st-identity-menu", inputs: { user: "user", isAuthenticated: "isAuthenticated", open: "open", devicesHref: "devicesHref", settingsHref: "settingsHref", loginLabel: "loginLabel", devicesLabel: "devicesLabel", settingsLabel: "settingsLabel", logoutLabel: "logoutLabel", variant: "variant", extraItems: "extraItems", classInput: ["class", "classInput"] }, outputs: { loginEvent: "loginEvent", logoutEvent: "logoutEvent", openChange: "openChange" }, ngImport: i0, template: `
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
          [attr.aria-label]="'Compte de ' + (user.displayName || user.email || 'User')"
          (click)="toggleOpen()"
        >
          <span class="st-identityMenu__avatar" aria-hidden="true">{{ initial }}</span>
          <span class="st-identityMenu__meta">
            <span class="st-identityMenu__name">{{ user.displayName }}</span>
            @if (variant === 'accordion' && user.email) {
              <span class="st-identityMenu__email">{{ user.email }}</span>
            }
          </span>
        </button>
        @if (localOpen) {
          <div
            class="st-identityMenu__menu"
            role="menu"
            [attr.aria-label]="'Menu de ' + (user.displayName || user.email || 'User')"
          >
            @if (devicesHref) {
              <a
                [href]="devicesHref"
                class="st-identityMenu__item"
                role="menuitem"
                tabindex="-1"
                (click)="select()"
              >{{ devicesLabel || 'Appareils' }}</a>
            }
            @if (settingsHref) {
              <a
                [href]="settingsHref"
                class="st-identityMenu__item"
                role="menuitem"
                tabindex="-1"
                (click)="select()"
              >{{ settingsLabel || 'Paramètres' }}</a>
            }
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
            >{{ logoutLabel || 'Se déconnecter' }}</button>
          </div>
        }
      </div>
    } @else {
      <button
        type="button"
        class="st-identityMenu__login"
        (click)="loginEvent.emit()"
      >{{ loginLabel || 'Se connecter' }}</button>
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
          [attr.aria-label]="'Compte de ' + (user.displayName || user.email || 'User')"
          (click)="toggleOpen()"
        >
          <span class="st-identityMenu__avatar" aria-hidden="true">{{ initial }}</span>
          <span class="st-identityMenu__meta">
            <span class="st-identityMenu__name">{{ user.displayName }}</span>
            @if (variant === 'accordion' && user.email) {
              <span class="st-identityMenu__email">{{ user.email }}</span>
            }
          </span>
        </button>
        @if (localOpen) {
          <div
            class="st-identityMenu__menu"
            role="menu"
            [attr.aria-label]="'Menu de ' + (user.displayName || user.email || 'User')"
          >
            @if (devicesHref) {
              <a
                [href]="devicesHref"
                class="st-identityMenu__item"
                role="menuitem"
                tabindex="-1"
                (click)="select()"
              >{{ devicesLabel || 'Appareils' }}</a>
            }
            @if (settingsHref) {
              <a
                [href]="settingsHref"
                class="st-identityMenu__item"
                role="menuitem"
                tabindex="-1"
                (click)="select()"
              >{{ settingsLabel || 'Paramètres' }}</a>
            }
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
            >{{ logoutLabel || 'Se déconnecter' }}</button>
          </div>
        }
      </div>
    } @else {
      <button
        type="button"
        class="st-identityMenu__login"
        (click)="loginEvent.emit()"
      >{{ loginLabel || 'Se connecter' }}</button>
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