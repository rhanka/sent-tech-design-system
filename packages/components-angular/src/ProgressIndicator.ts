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
      [attr.aria-label]="label ?? 'Progress'"
    >
      @for (item of items ?? []; track itemKey(item, $index); let index = $index, isLast = $last) {
        <li
          [class]="itemClass(item)"
          [attr.aria-current]="resolvedStatus(item) === 'current' ? 'step' : null"
        >
          <span
            class="st-progressIndicator__indicator"
            role="img"
            [attr.aria-label]="indicatorLabel(item)"
          >
            <span class="st-progressIndicator__circle">
              @switch (resolvedStatus(item)) {
                @case ('complete') {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
                }
                @case ('invalid') {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                }
                @case ('current') {
                  <span class="st-progressIndicator__dot"></span>
                }
                @default {
                  <span class="st-progressIndicator__index">{{ index + 1 }}</span>
                }
              }
            </span>
            @if (!isLast) {
              <span class="st-progressIndicator__connector"></span>
            }
          </span>
          <span class="st-progressIndicator__text">
            <span class="st-progressIndicator__label">{{ item.label }}</span>
            @if (item.description) {
              <span class="st-progressIndicator__description">{{ item.description }}</span>
            }
          </span>
        </li>
      }
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

  private readonly statusLabels: Record<string, string> = {
    complete: "Complete",
    current: "Current",
    upcoming: "Upcoming",
    invalid: "Invalid",
    disabled: "Disabled",
  };

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

  resolvedStatus(item: ProgressIndicatorItem): ProgressIndicatorStatus {
    return item.status ?? "upcoming";
  }

  indicatorLabel(item: ProgressIndicatorItem): string {
    const status = this.resolvedStatus(item);
    return `${this.statusLabels[status] ?? status}: ${item.label}`;
  }

  itemKey(item: ProgressIndicatorItem, index: number): string {
    return item.id ?? item.value ?? String(index);
  }

  itemClass(item: ProgressIndicatorItem): string {
    return classNames(
      "st-progressIndicator__step",
      `st-progressIndicator__step--${this.resolvedStatus(item)}`,
    );
  }
}
