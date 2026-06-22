import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type FilterPillTone = "neutral" | "success" | "warning" | "error" | "info";

export type FilterPillProps = {
  /** Nom du champ/dimension affiché à gauche. */
  field: string;
  /** Résumé de la valeur sélectionnée, ex "France, Italie" ou "> 100". */
  value: string;
  /** Opérateur optionnel affiché entre field et value, ex "=", "in", "entre". */
  operator?: string;
  /** Pilule active (aria-pressed). Défaut true. */
  active?: boolean;
  /** Affiche le bouton ✕. Défaut true. */
  removable?: boolean;
  disabled?: boolean;
  tone?: FilterPillTone;
  onClick?: () => void;
  onRemove?: () => void;
  class?: string;
};

@Component({
  selector: "st-filter-pill",
  standalone: true,
  template: `
    <span
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="group"
      [attr.aria-label]="'Filtre ' + field"
    >
      @if (hasClick) {
        <button
          type="button"
          class="st-filterPill__body"
          [attr.aria-pressed]="active !== false ? 'true' : 'false'"
          [disabled]="disabled || null"
          (click)="handleClick()"
          (keydown)="handleBodyKeydown($event)"
        >
          <span class="st-filterPill__field">{{ field }}</span>
          @if (operator) {
            <span class="st-filterPill__operator" aria-hidden="true">{{ operator }}</span>
          }
          <span class="st-filterPill__value">{{ value }}</span>
        </button>
      } @else {
        <span class="st-filterPill__body st-filterPill__body--static">
          <span class="st-filterPill__field">{{ field }}</span>
          @if (operator) {
            <span class="st-filterPill__operator" aria-hidden="true">{{ operator }}</span>
          }
          <span class="st-filterPill__value">{{ value }}</span>
        </span>
      }
      @if (removable !== false) {
        <button
          type="button"
          class="st-filterPill__remove"
          [attr.aria-label]="'Retirer le filtre ' + field"
          [disabled]="disabled || null"
          (click)="handleRemove()"
        >&#x2715;</button>
      }
    </span>
  `,
})
export class FilterPill {
  static readonly stComponentName = "FilterPill";
  readonly componentName = "FilterPill";

  @NgInput() field!: string;
  @NgInput() value!: string;
  @NgInput() operator?: string;
  @NgInput() active = true;
  @NgInput() removable = true;
  @NgInput() disabled = false;
  @NgInput() tone: FilterPillTone = "neutral";
  @NgInput() onClick?: () => void;
  @NgInput() onRemove?: () => void;
  @NgInput("class") classInput?: string;

  @Output() readonly remove = new EventEmitter<void>();

  get hasClick(): boolean {
    return typeof this.onClick === "function";
  }

  get hostClass(): string {
    return classNames(
      "st-filterPill",
      `st-filterPill--${this.tone}`,
      this.active !== false ? "st-filterPill--active" : undefined,
      this.disabled ? "st-filterPill--disabled" : undefined,
      this.classInput,
    );
  }

  handleClick(): void {
    if (this.disabled) return;
    this.onClick?.();
  }

  handleRemove(): void {
    if (this.disabled) return;
    this.onRemove?.();
    this.remove.emit();
  }

  handleBodyKeydown(event: KeyboardEvent): void {
    if (this.disabled) return;
    if ((event.key === "Delete" || event.key === "Backspace") && this.removable !== false) {
      event.preventDefault();
      this.onRemove?.();
      this.remove.emit();
    }
  }
}
