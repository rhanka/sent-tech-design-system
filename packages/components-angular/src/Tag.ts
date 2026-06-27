import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type TagTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

export type TagSize = "sm" | "md";

export type TagProps = {
  tone?: TagTone;
  size?: TagSize;
  disabled?: boolean;
  dismissible?: boolean;
  dismissLabel?: string;
  /** Svelte/React-canonical callback; fires alongside the `dismiss` emit. */
  onDismiss?: (event: MouseEvent) => void;
  class?: string;
};

@Component({
  selector: "st-tag",
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
      <span class="st-tag__label"><ng-content></ng-content></span>
      @if (dismissible) {
        <button
          type="button"
          class="st-tag__dismiss"
          [attr.aria-label]="dismissLabel ?? 'Dismiss'"
          [disabled]="disabled ?? false"
          (click)="handleDismiss($event)"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      }
    </span>
  `,
})
export class Tag {
  static readonly stComponentName = "Tag";
  readonly componentName = "Tag";
  @NgInput() tone?: TagTone;
  @NgInput() size?: TagSize;
  @NgInput() disabled?: boolean;
  @NgInput() dismissible?: boolean;
  @NgInput() dismissLabel?: string;
  @NgInput() onDismiss?: (event: MouseEvent) => void;
  @NgInput("class") classInput?: string;

  @Output() readonly dismiss = new EventEmitter<MouseEvent>();

  get hostClass(): string {
    return classNames(
      "st-tag",
      `st-tag--${this.tone ?? "neutral"}`,
      `st-tag--${this.size ?? "md"}`,
      this.disabled && "st-tag--disabled",
      this.classInput,
    );
  }

  handleDismiss(event: MouseEvent): void {
    if (this.disabled) return;
    this.onDismiss?.(event);
    this.dismiss.emit(event);
  }
}
