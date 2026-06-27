import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

export type AutosaveLabels = {
  idle?: string;
  saving?: string;
  saved?: string;
  error?: string;
};

// In addition to the Vue-native `@retry` emit, an `onRetry` callback prop
// (parity with React/Svelte) is accepted and fired on the retry button.
export type AutosaveProps = {
  status?: AutosaveStatus;
  /** Horodatage de la dernière sauvegarde réussie. */
  lastSaved?: string | Date;
  /** Affiche un bouton « Réessayer » sur le statut `error`. */
  onRetry?: () => void;
  /** Surcharge des libellés par statut. */
  labels?: AutosaveLabels;
  /** Étiquette du bouton de relance. */
  retryLabel?: string;
  locale?: string;
  class?: string;
};

@Component({
  selector: "st-autosave",
  standalone: true,
  template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.role]="role"
      aria-live="polite"
    >
      <span class="st-autosave__icon" aria-hidden="true">
        @if (resolvedStatus === 'saving') {
          <span class="st-autosave__spinner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          </span>
        } @else if (resolvedStatus === 'saved') {
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        } @else if (resolvedStatus === 'error') {
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="8" y2="12"/>
            <line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
        }
      </span>
      <span class="st-autosave__label">{{ statusLabel }}</span>
      @if (showRelative) {
        <span class="st-autosave__time">{{ relativeTime }}</span>
      }
      @if (resolvedStatus === 'error' && onRetry) {
        <button type="button" class="st-autosave__retry" (click)="triggerRetry()">{{ resolvedRetryLabel }}</button>
      }
    </div>
  `,
})
export class Autosave {
  static readonly stComponentName = "Autosave";
  readonly componentName = "Autosave";
  @NgInput() status?: AutosaveStatus;
  @NgInput() lastSaved?: string | Date;
  @NgInput() onRetry?: () => void;
  @NgInput() labels?: AutosaveLabels;
  @NgInput() retryLabel?: string;
  @NgInput() locale?: string;
  @NgInput("class") classInput?: string;

  @Output() readonly retry = new EventEmitter<void>();

  get resolvedStatus(): AutosaveStatus {
    return this.status ?? "idle";
  }

  private get isFr(): boolean {
    return (this.locale ?? "fr-FR").toLowerCase().startsWith("fr");
  }

  private get defaultLabels(): Required<AutosaveLabels> {
    return this.isFr
      ? {
          idle: "Modifications enregistrées",
          saving: "Enregistrement…",
          saved: "Enregistré",
          error: "Échec de l'enregistrement",
        }
      : {
          idle: "All changes saved",
          saving: "Saving…",
          saved: "Saved",
          error: "Failed to save",
        };
  }

  get statusLabel(): string {
    return this.labels?.[this.resolvedStatus] ?? this.defaultLabels[this.resolvedStatus];
  }

  get resolvedRetryLabel(): string {
    return this.retryLabel ?? (this.isFr ? "Réessayer" : "Retry");
  }

  get role(): string {
    return this.resolvedStatus === "error" ? "alert" : "status";
  }

  get relativeTime(): string {
    if (!this.lastSaved) return "";
    const date = this.lastSaved instanceof Date ? this.lastSaved : new Date(this.lastSaved);
    if (Number.isNaN(date.getTime())) return "";
    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const rtf = new Intl.RelativeTimeFormat(this.locale ?? "fr-FR", { numeric: "auto" });
    if (Math.abs(diffSec) < 60) return rtf.format(-diffSec, "second");
    const diffMin = Math.round(diffSec / 60);
    if (Math.abs(diffMin) < 60) return rtf.format(-diffMin, "minute");
    const diffHour = Math.round(diffMin / 60);
    if (Math.abs(diffHour) < 24) return rtf.format(-diffHour, "hour");
    const diffDay = Math.round(diffHour / 24);
    return rtf.format(-diffDay, "day");
  }

  get showRelative(): boolean {
    return (
      (this.resolvedStatus === "saved" || this.resolvedStatus === "idle") &&
      this.relativeTime !== ""
    );
  }

  get hostClass(): string {
    return classNames("st-autosave", `st-autosave--${this.resolvedStatus}`, this.classInput);
  }

  triggerRetry(): void {
    this.retry.emit();
    this.onRetry?.();
  }
}
