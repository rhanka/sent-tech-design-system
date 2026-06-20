import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ContentSwitcherSize = "sm" | "md" | "lg";

export type ContentSwitcherItem = {
  id?: string;
  value?: string;
  label: unknown;
  disabled?: boolean;
};

// In addition to the Vue-native `@change` emit (which already routes to an
// `onChange` listener), an `onchange` callback prop (Svelte-canonical,
// lowercase) is accepted and fired on change.
export type ContentSwitcherProps = {
  items: ContentSwitcherItem[];
  value?: string;
  activeId?: string;
  size?: ContentSwitcherSize;
  onchange?: (value: string) => void;
  class?: string;
};

@Component({
  selector: "st-content-switcher",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="group">
      @for (item of items ?? []; track itemKey(item, $index)) {
        <button
          type="button"
          [class]="buttonClass(item, $index)"
          [disabled]="item.disabled ?? false"
          [attr.aria-pressed]="isActive(item, $index)"
          (click)="select(item, $index)"
        >{{ item.label }}</button>
      }
      <ng-content></ng-content>
    </div>
  `,
})
export class ContentSwitcher {
  static readonly stComponentName = "ContentSwitcher";
  readonly componentName = "ContentSwitcher";
  @NgInput() items!: ContentSwitcherItem[];
  @NgInput() value?: string;
  @NgInput() activeId?: string;
  @NgInput() size?: ContentSwitcherSize;
  @NgInput() onchange?: (value: string) => void;
  @NgInput("class") classInput?: string;

  private localValue?: string;

  get hostClass(): string {
    return classNames("st-contentSwitcher", this.size && `st-contentSwitcher--${this.size}`, this.classInput);
  }

  itemKey(item: ContentSwitcherItem, index: number): string {
    return item.id ?? item.value ?? String(index);
  }

  isActive(item: ContentSwitcherItem, index: number): boolean {
    const active = this.value ?? this.localValue ?? this.activeId;
    if (!active) return index === 0;
    return item.value === active || item.id === active;
  }

  buttonClass(item: ContentSwitcherItem, index: number): string {
    return classNames(
      "st-contentSwitcher__button",
      this.isActive(item, index) && "st-contentSwitcher__button--active",
    );
  }

  select(item: ContentSwitcherItem, index: number): void {
    const key = item.value ?? item.id ?? String(index);
    this.localValue = key;
    this.onchange?.(key);
  }
}
