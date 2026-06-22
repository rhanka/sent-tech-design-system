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
  compact?: boolean;
  extraItems?: IdentityMenuItem[];
  class?: string;
};

/** Première lettre du displayName, en majuscule (calque de la source). */
export function identityInitial(user: IdentityUser | null | undefined): string {
  const source = user?.displayName || user?.email || "U";
  return source.charAt(0).toUpperCase();
}

/** Deux initiales (1re lettre de chaque mot, jusqu'à 2 mots) pour l'avatar. */
export function identityInitials(user: IdentityUser | null | undefined): string {
  const source = user?.displayName || user?.email || "U";
  return source
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
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
})
export class IdentityMenu {
  static readonly stComponentName = "IdentityMenu";
  readonly componentName = "IdentityMenu";

  @NgInput() user?: IdentityUser | null = null;
  @NgInput() isAuthenticated?: boolean = false;
  @NgInput() open?: boolean;
  @NgInput() devicesHref = "#";
  @NgInput() settingsHref = "#";
  @NgInput() loginLabel = "Se connecter";
  @NgInput() devicesLabel = "Appareils";
  @NgInput() settingsLabel = "Paramètres";
  @NgInput() logoutLabel = "Se déconnecter";
  @NgInput() variant: "dropdown" | "accordion" = "dropdown";
  @NgInput() compact = false;
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
    return identityInitials(this.user);
  }

  get displayName(): string {
    return this.user?.displayName || this.user?.email || "User";
  }

  get chevronClass(): string {
    return classNames(
      "st-identityMenu__chevron",
      this.localOpen ? "st-identityMenu__chevron--open" : undefined,
    );
  }

  get loginClass(): string {
    return classNames(
      "st-identityMenu__login",
      this.variant === "accordion" ? "st-identityMenu__login--accordion" : undefined,
    );
  }

  get hostClass(): string {
    return classNames(
      "st-identityMenu",
      this.compact ? "st-identityMenu--compact" : undefined,
      this.variant === "accordion" ? "st-identityMenu--accordion" : undefined,
      this.classInput,
    );
  }
}
