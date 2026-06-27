import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type SelectionChipTone = "neutral" | "success" | "warning" | "error" | "info";

export type SelectionChipProps = {
  /** Libellé de la dimension sélectionnée. */
  label: string;
  /** Nombre d'éléments sélectionnés — affiché "(N)" si fourni et Number.isFinite. */
  count?: number;
  tone?: SelectionChipTone;
  /** Callback effacement — affiche le bouton ✕ si fourni. */
  onClear?: () => void;
  disabled?: boolean;
  class?: string;
};

@Component({
  selector: "st-selection-chip",
  standalone: true,
  // Host transparent (parité React/Vue/Svelte qui n'ont pas d'élément hôte) :
  // sans cela l'élément <st-*> (display:inline par défaut) s'intercale dans le
  // layout (line-box autour du contenu, ou SVG width:100% qui collapse) et
  // désaligne le rendu. display:contents efface la boîte de l'hôte.
  styles: [":host { display: contents; }"],
  template: `
    <span
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-disabled]="disabled ? 'true' : null"
    >
      <span class="st-selectionChip__label">{{ label }}</span>
      @if (showCount) {
        <span class="st-selectionChip__count" [attr.aria-label]="'(' + count + ')'">
          ({{ count }})
        </span>
      }
      @if (hasClear) {
        <button
          type="button"
          class="st-selectionChip__clear"
          [attr.aria-label]="'Effacer ' + label"
          [disabled]="disabled"
          (click)="handleClear($event)"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12"></path>
          </svg>
        </button>
      }
    </span>
  `,
})
export class SelectionChip {
  static readonly stComponentName = "SelectionChip";
  readonly componentName = "SelectionChip";

  @NgInput() label!: string;
  @NgInput() count?: number;
  @NgInput() tone?: SelectionChipTone;
  @NgInput() onClear?: () => void;
  @NgInput() disabled?: boolean;
  @NgInput("class") classInput?: string;

  @Output() readonly clear = new EventEmitter<void>();

  get showCount(): boolean {
    return this.count !== undefined && Number.isFinite(this.count);
  }

  get hasClear(): boolean {
    return typeof this.onClear === "function";
  }

  get hostClass(): string {
    return classNames(
      "st-selectionChip",
      `st-selectionChip--${this.tone ?? "neutral"}`,
      this.disabled ? "st-selectionChip--disabled" : undefined,
      this.classInput,
    );
  }

  handleClear(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled) return;
    this.onClear?.();
    this.clear.emit();
  }
}
