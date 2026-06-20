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

  get effectiveVariant(): string {
    if (this.variant && this.variant !== "inline") return this.variant;
    if (this.standalone) return "standalone";
    if (this.muted) return "muted";
    return this.variant ?? "inline";
  }

  get hostClass(): string {
    return classNames(
      "st-link",
      `st-link--${this.effectiveVariant}`,
      this.disabled && "st-link--disabled",
      this.classInput,
    );
  }
}
