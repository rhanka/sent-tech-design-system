import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type LinkVariant = "inline" | "standalone" | "muted";

export type LinkProps = {
  href?: string;
  /** Style du lien ; API canonique (alignée sur le canon Svelte). */
  variant?: LinkVariant;
  /** @deprecated Raccourci pour variant="standalone". Utilisez `variant`. */
  standalone?: boolean;
  /** @deprecated Raccourci pour variant="muted". Utilisez `variant`. */
  muted?: boolean;
  disabled?: boolean;
  /** Lien externe : pose target="_blank" rel="noreferrer" (sauf target/rel explicites). */
  external?: boolean;
  target?: string;
  rel?: string;
  class?: string;
};

@Component({
  selector: "st-link",
  standalone: true,
  template: `
    <a
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.href]="disabled ? null : href"
      [attr.target]="effectiveTarget"
      [attr.rel]="effectiveRel"
      [attr.aria-disabled]="disabled ? 'true' : null"
      (click)="handleClick($event)"
    >
      <ng-content></ng-content>
    </a>
  `,
})
export class Link {
  static readonly stComponentName = "Link";
  readonly componentName = "Link";
  @NgInput() href?: string;
  @NgInput() variant: LinkVariant = "inline";
  @NgInput() standalone = false;
  @NgInput() muted = false;
  @NgInput() disabled = false;
  @NgInput() external = false;
  @NgInput() target?: string;
  @NgInput() rel?: string;
  @NgInput("class") classInput?: string;

  get effectiveVariant(): LinkVariant {
    if (this.variant !== "inline") return this.variant;
    if (this.standalone) return "standalone";
    if (this.muted) return "muted";
    return "inline";
  }

  get effectiveTarget(): string | null {
    return this.target ?? (this.external ? "_blank" : null);
  }

  get effectiveRel(): string | null {
    return this.rel ?? (this.external ? "noreferrer" : null);
  }

  get hostClass(): string {
    return classNames(
      "st-link",
      `st-link--${this.effectiveVariant}`,
      this.disabled && "st-link--disabled",
      this.classInput,
    );
  }

  handleClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
    }
  }
}
