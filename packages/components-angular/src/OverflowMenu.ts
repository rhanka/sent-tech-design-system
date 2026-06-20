import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

import { Menu } from "./Menu.js";

import type { MenuItem } from "./Menu.js";

export type OverflowMenuPlacement = "top-start" | "top-end" | "bottom-start" | "bottom-end";

export type OverflowMenuProps = {
  items: MenuItem[];
  label?: string;
  open?: boolean;
  dense?: boolean;
  placement?: OverflowMenuPlacement;
  class?: string;
};

export type { MenuItem as OverflowMenuItem };

@Component({
  selector: "st-overflow-menu",
  standalone: true,
  imports: [Menu],
  template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
    >
      <button
        type="button"
        class="st-overflowMenu__trigger"
        aria-haspopup="menu"
        [attr.aria-expanded]="localOpen"
        [attr.aria-label]="label || 'More'"
        (click)="localOpen = !localOpen"
      >&#8943;</button>
      @if (localOpen) {
        <div [class]="listClass">
          <st-menu [items]="items" [dense]="dense" (select)="onMenuSelect($event)"></st-menu>
        </div>
      }
    </div>
  `,
})
export class OverflowMenu {
  static readonly stComponentName = "OverflowMenu";
  readonly componentName = "OverflowMenu";

  @NgInput() items: MenuItem[] = [];
  @NgInput() label?: string;
  @NgInput() open?: boolean;
  @NgInput() dense?: boolean;
  @NgInput() placement?: OverflowMenuPlacement;
  @NgInput("class") classInput?: string;

  @Output() readonly select = new EventEmitter<MenuItem>();

  localOpen = false;

  get hostClass(): string {
    return classNames(
      "st-overflowMenu",
      this.dense && "st-overflowMenu--dense",
      this.classInput,
    );
  }

  get listClass(): string {
    return classNames(
      "st-overflowMenu__list",
      `st-overflowMenu__list--${this.placement ?? "bottom-start"}`,
    );
  }

  onMenuSelect(item: MenuItem): void {
    this.localOpen = false;
    this.select.emit(item);
  }
}
