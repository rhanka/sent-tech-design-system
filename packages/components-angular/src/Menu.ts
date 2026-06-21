import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

// `value` (Svelte-canonical) is accepted as an alias of `id`; `danger: true`
// (Svelte-canonical) as an alias of `variant: "danger"`; `kind` as an alias of
// `type`. Svelte groups are flat (label-only, no nested `items`).
export type MenuActionItem = {
  id?: string;
  value?: string;
  label: unknown;
  disabled?: boolean;
  variant?: "default" | "danger";
  danger?: boolean;
  /** Optional leading icon component (rendered in `.st-menu__itemIcon`). */
  icon?: unknown;
  onClick?: () => void;
};

export type MenuDividerItem = { type?: "divider"; kind?: "divider"; id?: string };

export type MenuGroupItem = {
  type?: "group";
  kind?: "group";
  id?: string;
  label: unknown;
  items?: MenuActionItem[];
};

export type MenuItem = MenuActionItem | MenuDividerItem | MenuGroupItem;

export type MenuProps = {
  items: MenuItem[];
  dense?: boolean;
  role?: string;
  class?: string;
};

function itemKind(item: MenuItem): string | undefined {
  const tagged = item as { type?: string; kind?: string };
  return tagged.type ?? tagged.kind;
}

function isDivider(item: MenuItem): item is MenuDividerItem {
  return itemKind(item) === "divider";
}

function isGroup(item: MenuItem): item is MenuGroupItem {
  return itemKind(item) === "group";
}

function isDangerAction(item: MenuActionItem): boolean {
  return item.variant === "danger" || item.danger === true;
}

@Component({
  selector: "st-menu",
  standalone: true,
  template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.role]="role || 'menu'"
    >
      @for (item of items; track $index) {
        @if (isDivider(item)) {
          <div class="st-menu__divider" role="separator" aria-hidden="true"></div>
        } @else if (isGroup(item)) {
          <div class="st-menu__group" role="presentation">{{ asGroup(item).label }}</div>
          @for (child of asGroup(item).items || []; track $index) {
            <button
              type="button"
              role="menuitem"
              [disabled]="child.disabled"
              [attr.aria-disabled]="child.disabled ? 'true' : null"
              [class]="itemClass(child)"
              (click)="onItemClick(child)"
            >
              <span class="st-menu__itemLabel">{{ child.label }}</span>
            </button>
          }
        } @else {
          <button
            type="button"
            role="menuitem"
            [disabled]="asAction(item).disabled"
            [attr.aria-disabled]="asAction(item).disabled ? 'true' : null"
            [class]="itemClass(asAction(item))"
            (click)="onItemClick(asAction(item))"
          >
            @if (isStringIcon(asAction(item).icon)) {
              <span class="st-menu__itemIcon" aria-hidden="true">{{ asAction(item).icon }}</span>
            }
            <span class="st-menu__itemLabel">{{ asAction(item).label }}</span>
          </button>
        }
      }
    </div>
  `,
})
export class Menu {
  static readonly stComponentName = "Menu";
  readonly componentName = "Menu";

  @NgInput() items: MenuItem[] = [];
  @NgInput() dense?: boolean;
  @NgInput() role?: string;
  @NgInput("class") classInput?: string;

  @Output() readonly select = new EventEmitter<MenuItem>();

  get hostClass(): string {
    return classNames("st-menu", this.dense && "st-menu--dense", this.classInput);
  }

  isDivider(item: MenuItem): boolean {
    return isDivider(item);
  }

  isGroup(item: MenuItem): boolean {
    return isGroup(item);
  }

  asGroup(item: MenuItem): MenuGroupItem {
    return item as MenuGroupItem;
  }

  asAction(item: MenuItem): MenuActionItem {
    return item as MenuActionItem;
  }

  itemClass(item: MenuActionItem): string {
    return classNames(
      "st-menu__item",
      isDangerAction(item) && "st-menu__item--danger",
    );
  }

  isStringIcon(icon: unknown): icon is string {
    return typeof icon === "string";
  }

  onItemClick(item: MenuActionItem): void {
    if (item.disabled) return;
    item.onClick?.();
    this.select.emit(item);
  }
}
