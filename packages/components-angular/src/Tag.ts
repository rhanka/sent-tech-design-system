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
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <span class="st-tag__label"><ng-content></ng-content></span>
      @if (dismissible) {
        <button
          type="button"
          class="st-tag__dismiss"
          [attr.aria-label]="dismissLabel ?? 'Supprimer'"
          [disabled]="disabled ?? false"
          (click)="handleDismiss($event)"
        >&#x2715;</button>
      }
    </div>
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
      this.tone && `st-tag--${this.tone}`,
      this.size && `st-tag--${this.size}`,
      this.disabled && "st-tag--disabled",
      this.dismissible && "st-tag--dismissible",
      this.classInput,
    );
  }

  handleDismiss(event: MouseEvent): void {
    this.onDismiss?.(event);
    this.dismiss.emit(event);
  }
}
