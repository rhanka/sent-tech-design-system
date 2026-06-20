import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type BackToTopProps = {
  label?: string;
  disabled?: boolean;
  targetId?: string;
  threshold?: number;
  autoHide?: boolean;
  smooth?: boolean;
  class?: string;
};

@Component({
  selector: "st-back-to-top",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <button type="button" class="st-backToTop__button" [disabled]="disabled" (click)="scrollToTop()" [attr.aria-label]="label || 'Retour en haut'">
        <svg class="st-backToTop__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
        @if (label) { <span class="st-backToTop__label">{{ label }}</span> }
      </button>
    </div>
  `,
})
export class BackToTop {
  static readonly stComponentName = "BackToTop";
  readonly componentName = "BackToTop";
  @NgInput() label?: string;
  @NgInput() disabled?: boolean;
  @NgInput() targetId?: string;
  @NgInput() threshold?: number;
  @NgInput() autoHide?: boolean;
  @NgInput() smooth?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-backToTop", this.classInput);
  }

  scrollToTop(): void {
    if (typeof window !== "undefined") {
      const el = this.targetId ? document.getElementById(this.targetId) : null;
      if (el) {
        el.scrollIntoView({ behavior: this.smooth !== false ? "smooth" : "auto" });
      } else {
        window.scrollTo({ top: 0, behavior: this.smooth !== false ? "smooth" : "auto" });
      }
    }
  }
}
