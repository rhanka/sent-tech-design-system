import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type IdentityUser = {
  displayName: string;
  email?: string;
  id?: string;
};

export type IdentityMenuItem = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export type IdentityMenuProps = {
  user?: IdentityUser | null;
  isAuthenticated?: boolean;
  open?: boolean;
  devicesHref?: string;
  settingsHref?: string;
  loginLabel?: string;
  devicesLabel?: string;
  settingsLabel?: string;
  logoutLabel?: string;
  variant?: "dropdown" | "accordion";
  extraItems?: IdentityMenuItem[];
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
  @NgInput() extraItems?: IdentityMenuItem[];
  @NgInput("class") classInput?: string;

  @Output() readonly loginEvent = new EventEmitter<void>();
  @Output() readonly logoutEvent = new EventEmitter<void>();
  @Output() readonly openChange = new EventEmitter<boolean>();

  localOpen = false;

  toggleOpen(): void {
    if (this.open !== undefined) {
      this.openChange.emit(!this.open);
    } else {
      this.localOpen = !this.localOpen;
    }
  }

  select(): void {
    this.localOpen = false;
  }

  handleLogout(): void {
    this.localOpen = false;
    this.logoutEvent.emit();
  }

  get initial(): string {
    return identityInitial(this.user);
  }

  get hostClass(): string {
    return classNames(
      "st-identityMenu",
      this.variant === "accordion" ? "st-identityMenu--accordion" : undefined,
      this.classInput,
    );
  }
}
