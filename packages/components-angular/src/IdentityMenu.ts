import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type IdentityUser = {
  displayName: string;
  email?: string;
  id?: string;
};

export type IdentityMenuProps = {
  user?: IdentityUser | null;
  isAuthenticated?: boolean;
  /**
   * État ouvert du dropdown (optionnellement contrôlé). Si fourni, le parent
   * contrôle ; sinon le composant gère un état interne. Aligné sur les 3 fw.
   */
  open?: boolean;
  devicesHref?: string;
  settingsHref?: string;
  loginLabel?: string;
  devicesLabel?: string;
  settingsLabel?: string;
  logoutLabel?: string;
  variant?: "dropdown" | "accordion";
  class?: string;
};

export function identityInitial(user: IdentityUser | null | undefined): string {
  const source = user?.displayName || user?.email || "U";
  return source.charAt(0).toUpperCase();
}

@Component({
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
})
export class IdentityMenu {
  static readonly stComponentName = "IdentityMenu";
  readonly componentName = "IdentityMenu";
  @NgInput() user?: IdentityUser | null;
  @NgInput() isAuthenticated?: boolean;
  @NgInput() open?: boolean;
  @NgInput() devicesHref?: string;
  @NgInput() settingsHref?: string;
  @NgInput() loginLabel?: string;
  @NgInput() devicesLabel?: string;
  @NgInput() settingsLabel?: string;
  @NgInput() logoutLabel?: string;
  @NgInput() variant?: "dropdown" | "accordion";
  @NgInput("class") classInput?: string;

  localOpen = false;

  toggleOpen(): void {
    this.localOpen = !this.localOpen;
  }

  get initial(): string {
    return identityInitial(this.user);
  }

  get hostClass(): string {
    return ["st-identityMenu", this.classInput].filter(Boolean).join(" ");
  }
}
