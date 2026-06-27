import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type HeaderNavItem = { label: unknown; href: string };

export type HeaderAccount = { name?: string; email?: string; avatarUrl?: string };

export type HeaderProps = {
  brand?: unknown;
  title?: unknown;
  navigation?: HeaderNavItem[];
  navItems?: HeaderNavItem[];
  account?: HeaderAccount;
  sticky?: boolean;
  label?: string;
  compact?: boolean;
  class?: string;
};

export function deriveInitials(name?: string): string {
  return (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

@Component({
  selector: "st-header",
  standalone: true,
  // Structure alignée byte-pour-byte sur React (catalog.tsx) et Vue (Header.ts) :
  // zone "leading" (logo/brand + title), navigation (liens), et zone compte.
  // L'ancienne version ne rendait QUE des <ng-content>, donc les props title /
  // navItems / account (passées par les démos docs) n'apparaissaient jamais.
  template: `
    <header [attr.data-st-component]="componentName" [class]="hostClass" [attr.aria-label]="label">
      <div class="st-header__leading">
        @if (brand) {
          <a class="st-header__logo" href="/">{{ brand }}</a>
        }
        @if (title) {
          <span class="st-header__title">{{ title }}</span>
        }
      </div>
      <nav class="st-header__navigation">
        @for (link of links; track link.href) {
          <a [attr.href]="link.href">{{ link.label }}</a>
        }
      </nav>
      @if (account) {
        <div class="st-header__account">
          <span class="st-header__avatar st-header__avatar--initials">{{ accountInitials }}</span>
          <span class="st-header__account-name">{{ account.name }}</span>
          @if (account.email) {
            <span class="st-header__account-email">{{ account.email }}</span>
          }
        </div>
      }
    </header>
  `,
})
export class Header {
  static readonly stComponentName = "Header";
  readonly componentName = "Header";
  @NgInput() brand?: unknown;
  @NgInput() title?: unknown;
  @NgInput() navigation?: HeaderNavItem[];
  @NgInput() navItems?: HeaderNavItem[];
  @NgInput() account?: HeaderAccount;
  @NgInput() sticky?: boolean;
  @NgInput() label?: string;
  @NgInput() compact = false;
  @NgInput("class") classInput?: string;

  /** Liens de navigation : `navigation` prime, sinon `navItems` (parité React/Vue). */
  get links(): HeaderNavItem[] {
    return this.navigation ?? this.navItems ?? [];
  }

  /** Initiales dérivées du nom du compte connecté (mêmes règles que React/Vue). */
  get accountInitials(): string {
    return deriveInitials(this.account?.name);
  }

  get hostClass(): string {
    return classNames("st-header", this.sticky && "st-header--sticky", this.classInput);
  }
}
