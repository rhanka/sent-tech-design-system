import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type TabItem = {
  id?: string;
  value?: string;
  label: unknown;
  content?: unknown;
  disabled?: boolean;
};

// In addition to the Vue-native `@change` emit (which already routes to an
// `onChange` listener), an `onchange` callback prop (Svelte-canonical,
// lowercase) is accepted and fired on change.
export type TabsProps = {
  items: TabItem[];
  activeValue?: string;
  activeId?: string;
  label?: string;
  onchange?: (value: string) => void;
  class?: string;
};

@Component({
  selector: "st-tabs",
  standalone: true,
  template: `
    <section [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-tabs__list" role="tablist" [attr.aria-label]="label ?? 'Tabs'">
        @for (item of items; track tabId(item, $index)) {
          <button
            type="button"
            role="tab"
            [class]="tabClass(item, $index)"
            [attr.aria-selected]="isActive(item, $index) ? 'true' : 'false'"
            [disabled]="item.disabled"
            (click)="select(item, $index)"
          >{{ item.label }}</button>
        }
      </div>
      <div class="st-tabs__panel" role="tabpanel">{{ activeContent }}<ng-content></ng-content></div>
    </section>
  `,
})
export class Tabs {
  static readonly stComponentName = "Tabs";
  readonly componentName = "Tabs";

  private localCurrent = "";

  @NgInput() items!: TabItem[];
  @NgInput() activeValue?: string;
  @NgInput() activeId?: string;
  @NgInput() label?: string;
  @NgInput() onchange?: (value: string) => void;
  @NgInput("class") classInput?: string;

  @Output() readonly change = new EventEmitter<string>();

  ngOnInit(): void {
    if (!this.localCurrent) {
      const first = this.items?.find((item) => !item.disabled) ?? this.items?.[0];
      if (first) {
        this.localCurrent = this.tabId(first, this.items.indexOf(first));
      }
    }
  }

  tabId(item: TabItem, index: number): string {
    return item.id ?? item.value ?? `tab-${index}`;
  }

  get current(): string {
    return this.activeValue ?? this.activeId ?? this.localCurrent;
  }

  get activeContent(): unknown {
    const idx = Math.max(0, this.items?.findIndex((item, i) => this.tabId(item, i) === this.current) ?? 0);
    return this.items?.[idx]?.content ?? "";
  }

  isActive(item: TabItem, index: number): boolean {
    return this.tabId(item, index) === this.current;
  }

  tabClass(item: TabItem, index: number): string {
    return classNames(
      "st-tabs__tab",
      this.isActive(item, index) && "st-tabs__tab--active",
    );
  }

  select(item: TabItem, index: number): void {
    if (item.disabled) return;
    const val = this.tabId(item, index);
    if (this.activeValue === undefined && this.activeId === undefined) {
      this.localCurrent = val;
    }
    this.change.emit(val);
    this.onchange?.(val);
  }

  get hostClass(): string {
    return classNames("st-tabs", this.classInput);
  }
}
