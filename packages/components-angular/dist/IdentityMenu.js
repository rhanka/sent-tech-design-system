import { Component, Input as NgInput } from "@angular/core";
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
    classInput;
    localOpen = false;
    toggleOpen() {
        this.localOpen = !this.localOpen;
    }
    get initial() {
        return identityInitial(this.user);
    }
    get hostClass() {
        return ["st-identityMenu", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: IdentityMenu, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: IdentityMenu, isStandalone: true, selector: "st-identity-menu", inputs: { user: "user", isAuthenticated: "isAuthenticated", open: "open", devicesHref: "devicesHref", settingsHref: "settingsHref", loginLabel: "loginLabel", devicesLabel: "devicesLabel", settingsLabel: "settingsLabel", logoutLabel: "logoutLabel", variant: "variant", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (isAuthenticated && user) {
        <button type="button" class="st-identityMenu__trigger" (click)="toggleOpen()">
          <span class="st-identityMenu__initial">{{ initial }}</span>
          <span class="st-identityMenu__name">{{ user.displayName }}</span>
        </button>
        @if (localOpen) {
          <div class="st-identityMenu__panel">
            @if (user.email) { <p class="st-identityMenu__email">{{ user.email }}</p> }
            @if (settingsHref) {
              <a [href]="settingsHref" class="st-identityMenu__item">{{ settingsLabel || 'Paramètres' }}</a>
            }
            @if (devicesHref) {
              <a [href]="devicesHref" class="st-identityMenu__item">{{ devicesLabel || 'Appareils' }}</a>
            }
            <ng-content></ng-content>
          </div>
        }
      } @else {
        <ng-content></ng-content>
        @if (!isAuthenticated) {
          <a href="#" class="st-identityMenu__login">{{ loginLabel || 'Connexion' }}</a>
        }
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: IdentityMenu, decorators: [{
            type: Component,
            args: [{
                    selector: "st-identity-menu",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (isAuthenticated && user) {
        <button type="button" class="st-identityMenu__trigger" (click)="toggleOpen()">
          <span class="st-identityMenu__initial">{{ initial }}</span>
          <span class="st-identityMenu__name">{{ user.displayName }}</span>
        </button>
        @if (localOpen) {
          <div class="st-identityMenu__panel">
            @if (user.email) { <p class="st-identityMenu__email">{{ user.email }}</p> }
            @if (settingsHref) {
              <a [href]="settingsHref" class="st-identityMenu__item">{{ settingsLabel || 'Paramètres' }}</a>
            }
            @if (devicesHref) {
              <a [href]="devicesHref" class="st-identityMenu__item">{{ devicesLabel || 'Appareils' }}</a>
            }
            <ng-content></ng-content>
          </div>
        }
      } @else {
        <ng-content></ng-content>
        @if (!isAuthenticated) {
          <a href="#" class="st-identityMenu__login">{{ loginLabel || 'Connexion' }}</a>
        }
      }
    </div>
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
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=IdentityMenu.js.map