import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type InlineLoadingStatus = "active" | "inactive" | "success" | "error";

export type InlineLoadingProps = {
  label?: unknown;
  status?: InlineLoadingStatus;
  locale?: string;
  class?: string;
};

@Component({
  selector: "st-inline-loading",
  standalone: true,
  template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.role]="role"
      [attr.aria-label]="accessibleLabel"
      aria-live="polite"
    >
      <span class="st-inlineLoading__icon" aria-hidden="true">
        @if (resolvedStatus === 'active') {
          <span class="st-inlineLoading__spinner">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" opacity="0.25"/>
              <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
        } @else if (resolvedStatus === 'success') {
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        } @else if (resolvedStatus === 'error') {
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        }
      </span>
      @if (label) { <span class="st-inlineLoading__label">{{ label }}</span> }
    </div>
  `,
})
export class InlineLoading {
  static readonly stComponentName = "InlineLoading";
  readonly componentName = "InlineLoading";
  @NgInput() label?: unknown;
  @NgInput() status?: InlineLoadingStatus;
  @NgInput() locale = "fr-FR";
  @NgInput("class") classInput?: string;

  get resolvedStatus(): InlineLoadingStatus {
    return this.status ?? "active";
  }

  get hostClass(): string {
    return classNames(
      "st-inlineLoading",
      `st-inlineLoading--${this.resolvedStatus}`,
      this.classInput,
    );
  }

  get role(): string {
    return this.resolvedStatus === "error" ? "alert" : "status";
  }

  private get isFr(): boolean {
    return this.locale.toLowerCase().startsWith("fr");
  }

  private get fallbackLabel(): string {
    const labels: Record<InlineLoadingStatus, string> = this.isFr
      ? { active: "Chargement", success: "Terminé", error: "Erreur", inactive: "Inactif" }
      : { active: "Loading", success: "Completed", error: "Error", inactive: "Inactive" };
    return labels[this.resolvedStatus];
  }

  get accessibleLabel(): string | null {
    return this.label ? null : this.fallbackLabel;
  }
}
