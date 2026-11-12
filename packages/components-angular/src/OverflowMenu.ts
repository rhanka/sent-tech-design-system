import {
  ChangeDetectorRef,
  inject,
  Component,
  ElementRef,
  EventEmitter,
  Input as NgInput,
  Output,
  ViewChild,
} from "@angular/core";
import type { AfterViewInit, OnDestroy } from "@angular/core";

import { classNames } from "./classNames.js";

import { injectMenuDependency, MENU_HOST, MENU_HOST_CONTEXT } from "./menu-host.js";
import type { MenuHost } from "./menu-host.js";
import { Menu } from "./Menu.js";

import type { MenuActionItem, MenuItem, MenuSelectPath } from "./Menu.js";
import type { SubMenuSide } from "./menu-cascade.js";
import { menuPopoverIsWithin } from "./MenuPopover.js";

export type OverflowMenuPlacement = "top-start" | "top-end" | "bottom-start" | "bottom-end";

export type OverflowMenuProps = {
  items: MenuItem[];
  label?: string;
  open?: boolean;
  dense?: boolean;
  placement?: OverflowMenuPlacement;
  class?: string;
  submenuSide?: SubMenuSide;
};

export type { MenuItem as OverflowMenuItem };

function overflowItemKind(item: MenuItem): string | undefined {
  const tagged = item as { type?: string; kind?: string };
  return tagged.type ?? tagged.kind;
}

function overflowIsAction(item: MenuItem): item is MenuActionItem {
  const kind = overflowItemKind(item);
  return kind === undefined || kind === "item";
}

@Component({
  selector: "st-overflow-menu",
  standalone: true,
  imports: [Menu],
  providers: [{ provide: MENU_HOST, useFactory: () => inject(OverflowMenu)[MENU_HOST_CONTEXT] }],
  template: `
    <div
      #host
      [attr.data-st-component]="componentName"
      [class]="hostClass"
    >
      <button
        #trigger
        type="button"
        class="st-overflowMenu__trigger"
        aria-haspopup="menu"
        [attr.aria-expanded]="localOpen"
        [attr.aria-controls]="localOpen ? rootMenuId : null"
        [attr.aria-label]="label || 'More'"
        (click)="localOpen = !localOpen"
      >&#8943;</button>
      @if (localOpen) {
        <div [class]="listClass">
          <st-menu
            [items]="items"
            [id]="rootMenuId"
            [dense]="dense"
            [submenuSide]="submenuSide"
            (select)="onMenuSelect($event)"
            (selectPath)="onMenuSelectPath($event)"
          ></st-menu>
        </div>
      }
    </div>
  `,
})
export class OverflowMenu implements AfterViewInit, OnDestroy {
  static readonly stComponentName = "OverflowMenu";
  readonly componentName = "OverflowMenu";

  private readonly changeDetector = injectMenuDependency(ChangeDetectorRef);

  private static nextInstanceId = 0;
  readonly rootMenuId = `st-overflowmenu-${++OverflowMenu.nextInstanceId}`;
  readonly [MENU_HOST_CONTEXT]: MenuHost = {
    rootMenuId: this.rootMenuId,
    select: (keyboard, cascade) => {
      if (!cascade) return;
      this.localOpen = false;
      this.changeDetector?.markForCheck();
      if (keyboard && cascade) this.triggerRef?.nativeElement.focus();
    },
  };

  @NgInput() items: MenuItem[] = [];
  @NgInput() label?: string;
  @NgInput() open?: boolean;
  @NgInput() dense?: boolean;
  @NgInput() placement?: OverflowMenuPlacement;
  @NgInput("class") classInput?: string;
  @NgInput() submenuSide: SubMenuSide = "auto";

  @Output() readonly select = new EventEmitter<MenuItem>();
  @Output() readonly selectPath = new EventEmitter<MenuSelectPath>();

  localOpen = false;

  @ViewChild("host") hostRef?: ElementRef<HTMLElement>;
  @ViewChild("trigger") triggerRef?: ElementRef<HTMLElement>;

  private listenersActive = false;
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if ((event as { defaultPrevented?: boolean }).defaultPrevented) return;
    if (!this.localOpen) return;
    // Cascade-only close (§3.6) : flat menus keep their previous behaviour
    // (Angular OverflowMenu never had a window close — AC-01).
    if (!this.treeHasCascade(this.items)) return;
    if (event.key === "Escape") {
      event.preventDefault();
      this.localOpen = false;
      this.changeDetector?.markForCheck();
      try {
        this.triggerRef?.nativeElement?.focus?.();
      } catch {
        // No DOM in Node tests.
      }
    } else if (event.key === "Tab") {
      this.localOpen = false;
      this.changeDetector?.markForCheck();
    }
  };
  private readonly onPointerDown = (event: PointerEvent) => {
    if ((event as { defaultPrevented?: boolean }).defaultPrevented) return;
    if (!this.localOpen) return;
    if (!this.treeHasCascade(this.items)) return;
    const host = this.hostRef?.nativeElement ?? null;
    if (menuPopoverIsWithin(event, host)) return;
    this.localOpen = false;
    this.changeDetector?.markForCheck();
  };

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

  treeHasCascade(list: MenuItem[] | undefined): boolean {
    if (!list) return false;
    for (const item of list) {
      if (!overflowIsAction(item)) continue;
      const children = (item as MenuActionItem).children;
      if (Array.isArray(children) && children.length > 0) return true;
      if (Array.isArray(children) && this.treeHasCascade(children)) return true;
    }
    return false;
  }

  onMenuSelect(item: MenuItem): void {
    this.localOpen = false;
    this.changeDetector?.markForCheck();
    this.select.emit(item);
  }

  onMenuSelectPath(payload: MenuSelectPath): void {
    this.localOpen = false;
    this.changeDetector?.markForCheck();
    this.selectPath.emit(payload);
  }

  ngAfterViewInit(): void {
    this.registerWindowListeners();
  }

  ngOnDestroy(): void {
    this.unregisterWindowListeners();
  }

  private registerWindowListeners(): void {
    if (this.listenersActive) return;
    if (typeof window === "undefined") return;
    if (typeof window.addEventListener !== "function") return;
    this.listenersActive = true;
    window.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("keydown", this.onKeyDown);
  }

  private unregisterWindowListeners(): void {
    if (!this.listenersActive) return;
    this.listenersActive = false;
    if (typeof window === "undefined") return;
    if (typeof window.removeEventListener !== "function") return;
    window.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("keydown", this.onKeyDown);
  }
}
