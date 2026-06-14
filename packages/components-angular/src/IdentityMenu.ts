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
      <ng-content></ng-content>
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

  get hostClass(): string {
    return ["st-identityMenu", this.classInput].filter(Boolean).join(" ");
  }
}
