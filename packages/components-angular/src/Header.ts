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
  template: `
    <header [attr.data-st-component]="componentName" [class]="hostClass" [attr.aria-label]="label">
      <div class="st-header__body">
        <ng-content select="[slot=logo]"></ng-content>
        <ng-content select="[slot=navigation]"></ng-content>
        <ng-content select="[slot=actions]"></ng-content>
        <ng-content></ng-content>
      </div>
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

  get hostClass(): string {
    return classNames("st-header", this.compact && "st-header--compact", this.sticky && "st-header--sticky", this.classInput);
  }
}
