import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ProgressIndicatorStatus =
  | "complete"
  | "current"
  | "upcoming"
  | "disabled"
  | "invalid"
  | "incomplete";

export interface ProgressIndicatorItem {
  id?: string;
  /** Svelte-canonical alias for the React/Vue `id`. */
  value?: string;
  label: unknown;
  description?: unknown;
  status?: ProgressIndicatorStatus;
}

export type ProgressIndicatorOrientation = "horizontal" | "vertical";

export type ProgressIndicatorProps = {
  items: ProgressIndicatorItem[];
  orientation?: ProgressIndicatorOrientation;
  /** Svelte-canonical alias: `vertical` sets `orientation="vertical"`. */
  vertical?: boolean;
  label?: string;
  class?: string;
};

@Component({
  selector: "st-progress-indicator",
  standalone: true,
  template: `
    <ol
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-label]="label ?? 'Progression'"
    >
      @for (item of items ?? []; track itemKey(item, $index)) {
        <li [class]="itemClass(item)" [attr.aria-current]="item.status === 'current' ? 'step' : null">
          <span class="st-progressIndicator__indicator">
            <span class="st-progressIndicator__circle">
              @if (item.status === 'complete') {
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              }
            </span>
          </span>
          <span class="st-progressIndicator__content">
            <span class="st-progressIndicator__label">{{ item.label }}</span>
            @if (item.description) {
              <span class="st-progressIndicator__description">{{ item.description }}</span>
            }
          </span>
        </li>
      }
      <ng-content></ng-content>
    </ol>
  `,
})
export class ProgressIndicator {
  static readonly stComponentName = "ProgressIndicator";
  readonly componentName = "ProgressIndicator";
  @NgInput() items!: ProgressIndicatorItem[];
  @NgInput() orientation?: ProgressIndicatorOrientation;
  @NgInput() vertical?: boolean;
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  get resolvedOrientation(): ProgressIndicatorOrientation {
    return this.vertical ? "vertical" : (this.orientation ?? "horizontal");
  }

  get hostClass(): string {
    return classNames(
      "st-progressIndicator",
      `st-progressIndicator--${this.resolvedOrientation}`,
      this.classInput,
    );
  }

  itemKey(item: ProgressIndicatorItem, index: number): string {
    return item.id ?? item.value ?? String(index);
  }

  itemClass(item: ProgressIndicatorItem): string {
    return classNames(
      "st-progressIndicator__item",
      item.status && `st-progressIndicator__item--${item.status}`,
    );
  }
}
