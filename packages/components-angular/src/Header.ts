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
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
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
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-header", this.classInput].filter(Boolean).join(" ");
  }
}
