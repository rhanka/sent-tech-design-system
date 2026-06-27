import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type TileVariant = "static" | "clickable" | "selectable";

export type TileProps = {
  title?: unknown;
  description?: unknown;
  variant?: TileVariant;
  /** Pour `clickable` : si fourni, rend un `<a>`, sinon un `<button>`. */
  href?: string;
  /** Pour `selectable` : état coché. */
  selected?: boolean;
  disabled?: boolean;
  class?: string;
};

@Component({
  selector: "st-tile",
  standalone: true,
  template: `
    @if (resolvedVariant === 'clickable' && href) {
      <a
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        [href]="href"
        [attr.aria-disabled]="disabled ? 'true' : null"
      >
        <span class="st-tile__content">
          @if (hasTextContent) {
            @if (title) {
              <span class="st-tile__title">{{ title }}</span>
            }
            @if (description) {
              <span class="st-tile__description">{{ description }}</span>
            }
          } @else {
            <ng-content></ng-content>
          }
        </span>
      </a>
    } @else if (resolvedVariant === 'clickable') {
      <button
        [attr.data-st-component]="componentName"
        type="button"
        [class]="hostClass"
        [disabled]="disabled ?? false"
      >
        <span class="st-tile__content">
          @if (hasTextContent) {
            @if (title) {
              <span class="st-tile__title">{{ title }}</span>
            }
            @if (description) {
              <span class="st-tile__description">{{ description }}</span>
            }
          } @else {
            <ng-content></ng-content>
          }
        </span>
      </button>
    } @else if (resolvedVariant === 'selectable') {
      <label [attr.data-st-component]="componentName" [class]="hostClass">
        <input
          type="checkbox"
          class="st-tile__input"
          [checked]="selected ?? false"
          [disabled]="disabled ?? false"
          (change)="onToggle($event)"
        />
        <span class="st-tile__content">
          @if (hasTextContent) {
            @if (title) {
              <span class="st-tile__title">{{ title }}</span>
            }
            @if (description) {
              <span class="st-tile__description">{{ description }}</span>
            }
          } @else {
            <ng-content></ng-content>
          }
        </span>
      </label>
    } @else {
      <div [attr.data-st-component]="componentName" [class]="hostClass">
        <span class="st-tile__content">
          @if (hasTextContent) {
            @if (title) {
              <span class="st-tile__title">{{ title }}</span>
            }
            @if (description) {
              <span class="st-tile__description">{{ description }}</span>
            }
          } @else {
            <ng-content></ng-content>
          }
        </span>
      </div>
    }
  `,
})
export class Tile {
  static readonly stComponentName = "Tile";
  readonly componentName = "Tile";
  @NgInput() title?: unknown;
  @NgInput() description?: unknown;
  @NgInput() variant?: TileVariant;
  @NgInput() href?: string;
  @NgInput() selected?: boolean;
  @NgInput() disabled?: boolean;
  @NgInput("class") classInput?: string;

  @Output() readonly select = new EventEmitter<boolean>();

  get resolvedVariant(): TileVariant {
    return this.variant ?? "static";
  }

  get hasTextContent(): boolean {
    return Boolean(this.title) || Boolean(this.description);
  }

  get hostClass(): string {
    return classNames(
      "st-tile",
      `st-tile--${this.resolvedVariant}`,
      this.resolvedVariant === "selectable" && this.selected && "st-tile--selected",
      this.disabled && "st-tile--disabled",
      this.classInput,
    );
  }

  onToggle(event: Event): void {
    if (this.disabled) return;
    const checked = (event.target as HTMLInputElement).checked;
    this.select.emit(checked);
  }
}
