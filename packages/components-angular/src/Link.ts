import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type LinkProps = {
  href?: string;
  /** Style du lien ; API canonique (alignée sur le canon Svelte). */
  variant?: "inline" | "standalone" | "muted";
  /** @deprecated Raccourci pour variant="standalone". Utilisez `variant`. */
  standalone?: boolean;
  /** @deprecated Raccourci pour variant="muted". Utilisez `variant`. */
  muted?: boolean;
  disabled?: boolean;
  /** Lien externe : pose target="_blank" rel="noreferrer" (sauf target/rel explicites). */
  external?: boolean;
  class?: string;
};

@Component({
  selector: "st-link",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Link {
  static readonly stComponentName = "Link";
  readonly componentName = "Link";
  @NgInput() href?: string;
  @NgInput() variant?: "inline" | "standalone" | "muted";
  @NgInput() standalone?: boolean;
  @NgInput() muted?: boolean;
  @NgInput() disabled?: boolean;
  @NgInput() external?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-link", this.classInput].filter(Boolean).join(" ");
  }
}
