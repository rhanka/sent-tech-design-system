import {
  Component,
  ElementRef,
  EventEmitter,
  Input as NgInput,
  Output,
  ViewChild,
} from "@angular/core";
import type {
  AfterViewInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";

import { classNames } from "./classNames.js";
import {
  CLOSE_DELAY,
  OPEN_DELAY,
  SUBMENU_DEFAULT_WIDTH,
  VIEWPORT_MARGIN,
  computeSubMenuPosition,
  pointInSafeTriangle,
  resolvePreferredSide,
  toContainingBlockPosition,
} from "./menu-cascade.js";
import type {
  CascadePoint,
  ResolvedSubMenuSide,
  SubMenuSide,
} from "./menu-cascade.js";

// Secrets de composition avec Svelte (spec §1.1, §2) : `value` (Svelte-canonical)
// est accepte comme alias de `id` ; `danger: true` (Svelte-canonical) comme alias
// de `variant: "danger"` ; `kind` comme alias de `type`. Les groupes Svelte sont
// plats (label seul, sans `items` imbriques) ; Angular conserve son
// `MenuGroupItem.items` plat pour compatibilite.
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
  children?: MenuItem[];
  selected?: boolean;
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

export type MenuSubmenuSide = SubMenuSide;

export type MenuSelectPath = {
  item: MenuActionItem;
  path: string[];
};

export type MenuProps = {
  items: MenuItem[];
  dense?: boolean;
  role?: string;
  class?: string;
  submenuSide?: SubMenuSide;
  id?: string;
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

const CHEVRON_RIGHT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>`;
const CHEVRON_LEFT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>`;

export const MENU_CHEVRON_RIGHT_SVG = CHEVRON_RIGHT_SVG;
export const MENU_CHEVRON_LEFT_SVG = CHEVRON_LEFT_SVG;

@Component({
  selector: "st-menu",
  standalone: true,
  template: `
    @if (hasCascade) {
      <div
        #host
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        (pointermove)="onHostPointerMove($event)"
      >
        <div
          class="st-menu__scroll"
          [attr.role]="role || 'menu'"
          [attr.id]="rootMenuId"
          tabindex="-1"
          data-menu-level="0"
          (keydown)="onLevelKeyDown($event, 0)"
        >
          @for (item of items; track $index; let outerIdx = $index) {
            @if (isDivider(item)) {
              <div class="st-menu__divider" role="separator" aria-hidden="true"></div>
            } @else if (isGroup(item)) {
              <div class="st-menu__group" role="presentation" [attr.id]="groupId(0, $index)">{{ asGroup(item).label }}</div>
              @for (child of asGroup(item).items || []; track $index; let innerIdx = $index) {
                <button
                  type="button"
                  role="menuitem"
                  [disabled]="child.disabled"
                  [attr.aria-disabled]="child.disabled ? 'true' : null"
                  [class]="itemClass(child)"
                  [attr.tabindex]="groupChildTabIndex(0, outerIdx, innerIdx, asGroup(item).items || [])"
                  [attr.data-item-index]="outerIdx"
                  [attr.data-menu-level]="0"
                  (click)="onGroupChildClick(0, outerIdx, innerIdx, child)"
                  (keydown)="onItemKeyDown($event, 0, outerIdx, child)"
                  (focus)="onItemFocus(0, outerIdx)"
                >
                  <span class="st-menu__itemLabel">{{ child.label }}</span>
                </button>
              }
            } @else if (isParent(0, $index, asAction(item))) {
                <div
                  class="st-menu__itemWrap"
                  role="presentation"
                  (pointerenter)="onParentPointerEnter(0, $index, asAction(item), $event)"
                  (pointerleave)="onParentPointerLeave(0, $index, asAction(item), $event)"
                >
                  <button
                    type="button"
                    role="menuitem"
                    [id]="parentButtonId(0, $index)"
                    [attr.data-item-index]="outerIdx"
                    [attr.data-menu-level]="0"
                    [attr.aria-haspopup]="'menu'"
                    [attr.aria-expanded]="asAction(item).disabled ? 'false' : (isOpen(0, $index) ? 'true' : 'false')"
                    [attr.aria-controls]="subId(0, $index)"
                    [attr.aria-disabled]="asAction(item).disabled ? 'true' : null"
                    [disabled]="asAction(item).disabled"
                    [attr.tabindex]="asAction(item).disabled ? null : (rovingTarget(0, items) === $index ? '0' : '-1')"
                    [class]="itemClass(asAction(item), 0, $index)"
                    (click)="toggleParent(0, $index)"
                    (keydown)="onItemKeyDown($event, 0, $index, asAction(item))"
                    (focus)="onItemFocus(0, outerIdx)"
                  >
                    @if (chevronSide(0, $index) === "left") {
                      <span class="st-menu__itemChevron st-menu__itemChevron--start" aria-hidden="true" [innerHTML]="MENU_CHEVRON_LEFT_SVG"></span>
                    }
                    @if (isStringIcon(asAction(item).icon)) {
                      <span class="st-menu__itemIcon" aria-hidden="true">{{ asAction(item).icon }}</span>
                    }
                    <span class="st-menu__itemLabel">{{ asAction(item).label }}</span>
                    @if (chevronSide(0, $index) === "right") {
                      <span class="st-menu__itemChevron st-menu__itemChevron--end" aria-hidden="true" [innerHTML]="MENU_CHEVRON_RIGHT_SVG"></span>
                    }
                  </button>
                </div>
            } @else {
              <button
                type="button"
                role="menuitem"
                [attr.data-item-index]="outerIdx"
                [attr.data-menu-level]="0"
                [attr.aria-disabled]="asAction(item).disabled ? 'true' : null"
                [disabled]="asAction(item).disabled"
                [attr.tabindex]="asAction(item).disabled ? null : (rovingTarget(0, items) === $index ? '0' : '-1')"
                [class]="itemClass(asAction(item), 0, $index)"
                (click)="onItemClick(asAction(item), 0, $index)"
                (keydown)="onItemKeyDown($event, 0, $index, asAction(item))"
                (pointerenter)="onLeafPointerEnter(0, $event)"
                (focus)="onItemFocus(0, outerIdx)"
              >
                @if (isStringIcon(asAction(item).icon)) {
                  <span class="st-menu__itemIcon" aria-hidden="true">{{ asAction(item).icon }}</span>
                }
                <span class="st-menu__itemLabel">{{ asAction(item).label }}</span>
              </button>
            }
          }
        </div>
        @if (openPath.length >= 1) {
          <div
            [class]="subMenuClass()"
            role="menu"
            [attr.id]="subId(0, openPath[0])"
            [attr.aria-labelledby]="parentButtonId(0, openPath[0])"
            tabindex="-1"
            data-menu-level="1"
            [style]="panelStyle(0)"
            (keydown)="onLevelKeyDown($event, 1)"
            (pointerenter)="onPanelPointerEnter($event)"
            (pointerleave)="onPanelPointerLeave(0, $event)"
          >
            @for (item of levelItems(1); track $index; let outerIdx = $index) {
              @if (isDivider(item)) {
                <div class="st-menu__divider" role="separator" aria-hidden="true"></div>
              } @else if (isGroup(item)) {
                <div class="st-menu__group" role="presentation" [attr.id]="groupId(1, $index)">{{ asGroup(item).label }}</div>
                @for (child of asGroup(item).items || []; track $index; let innerIdx = $index) {
                  <button
                    type="button"
                    role="menuitem"
                    [disabled]="child.disabled"
                    [attr.aria-disabled]="child.disabled ? 'true' : null"
                    [class]="itemClass(child)"
                    [attr.tabindex]="groupChildTabIndex(1, outerIdx, innerIdx, asGroup(item).items || [])"
                    [attr.data-item-index]="outerIdx"
                    [attr.data-menu-level]="1"
                    (click)="onGroupChildClick(1, outerIdx, innerIdx, child)"
                    (keydown)="onItemKeyDown($event, 1, outerIdx, child)"
                    (focus)="onItemFocus(1, outerIdx)"
                  >
                    <span class="st-menu__itemLabel">{{ child.label }}</span>
                  </button>
                }
              } @else if (isParent(1, $index, asAction(item))) {
                <div
                  class="st-menu__itemWrap"
                  role="presentation"
                  (pointerenter)="onParentPointerEnter(1, $index, asAction(item), $event)"
                  (pointerleave)="onParentPointerLeave(1, $index, asAction(item), $event)"
                >
                  <button
                    type="button"
                    role="menuitem"
                    [id]="parentButtonId(1, $index)"
                    [attr.data-item-index]="outerIdx"
                    [attr.data-menu-level]="1"
                    [attr.aria-haspopup]="'menu'"
                    [attr.aria-expanded]="asAction(item).disabled ? 'false' : (isOpen(1, $index) ? 'true' : 'false')"
                    [attr.aria-controls]="subId(1, $index)"
                    [attr.aria-disabled]="asAction(item).disabled ? 'true' : null"
                    [disabled]="asAction(item).disabled"
                    [attr.tabindex]="asAction(item).disabled ? null : (rovingTarget(1, levelItems(1)) === $index ? '0' : '-1')"
                    [class]="itemClass(asAction(item), 1, $index)"
                    (click)="toggleParent(1, $index)"
                    (keydown)="onItemKeyDown($event, 1, $index, asAction(item))"
                    (focus)="onItemFocus(1, outerIdx)"
                  >
                    @if (chevronSide(1, $index) === "left") {
                      <span class="st-menu__itemChevron st-menu__itemChevron--start" aria-hidden="true" [innerHTML]="MENU_CHEVRON_LEFT_SVG"></span>
                    }
                    @if (isStringIcon(asAction(item).icon)) {
                      <span class="st-menu__itemIcon" aria-hidden="true">{{ asAction(item).icon }}</span>
                    }
                    <span class="st-menu__itemLabel">{{ asAction(item).label }}</span>
                    @if (chevronSide(1, $index) === "right") {
                      <span class="st-menu__itemChevron st-menu__itemChevron--end" aria-hidden="true" [innerHTML]="MENU_CHEVRON_RIGHT_SVG"></span>
                    }
                  </button>
                </div>
              } @else {
                <button
                  type="button"
                  role="menuitem"
                  [attr.data-item-index]="outerIdx"
                  [attr.data-menu-level]="1"
                  [attr.aria-disabled]="asAction(item).disabled ? 'true' : null"
                  [disabled]="asAction(item).disabled"
                  [attr.tabindex]="asAction(item).disabled ? null : (rovingTarget(1, levelItems(1)) === $index ? '0' : '-1')"
                  [class]="itemClass(asAction(item), 1, $index)"
                  (click)="onItemClick(asAction(item), 1, $index)"
                  (keydown)="onItemKeyDown($event, 1, $index, asAction(item))"
                  (pointerenter)="onLeafPointerEnter(1, $event)"
                  (focus)="onItemFocus(1, outerIdx)"
                >
                  @if (isStringIcon(asAction(item).icon)) {
                    <span class="st-menu__itemIcon" aria-hidden="true">{{ asAction(item).icon }}</span>
                  }
                  <span class="st-menu__itemLabel">{{ asAction(item).label }}</span>
                </button>
              }
            }
          </div>
        }
        @if (openPath.length >= 2) {
          <div
            [class]="subMenuClass()"
            role="menu"
            [attr.id]="subId(1, openPath[1])"
            [attr.aria-labelledby]="parentButtonId(1, openPath[1])"
            tabindex="-1"
            data-menu-level="2"
            [style]="panelStyle(1)"
            (keydown)="onLevelKeyDown($event, 2)"
            (pointerenter)="onPanelPointerEnter($event)"
            (pointerleave)="onPanelPointerLeave(1, $event)"
          >
            @for (item of levelItems(2); track $index; let outerIdx = $index) {
              @if (isDivider(item)) {
                <div class="st-menu__divider" role="separator" aria-hidden="true"></div>
              } @else if (isGroup(item)) {
                <div class="st-menu__group" role="presentation" [attr.id]="groupId(2, $index)">{{ asGroup(item).label }}</div>
                @for (child of asGroup(item).items || []; track $index; let innerIdx = $index) {
                  <button
                    type="button"
                    role="menuitem"
                    [disabled]="child.disabled"
                    [attr.aria-disabled]="child.disabled ? 'true' : null"
                    [class]="itemClass(child)"
                    [attr.tabindex]="groupChildTabIndex(2, outerIdx, innerIdx, asGroup(item).items || [])"
                    [attr.data-item-index]="outerIdx"
                    [attr.data-menu-level]="2"
                    (click)="onGroupChildClick(2, outerIdx, innerIdx, child)"
                    (keydown)="onItemKeyDown($event, 2, outerIdx, child)"
                    (focus)="onItemFocus(2, outerIdx)"
                  >
                    <span class="st-menu__itemLabel">{{ child.label }}</span>
                  </button>
                }
              } @else {
                <button
                  type="button"
                  role="menuitem"
                  [attr.data-item-index]="outerIdx"
                  [attr.data-menu-level]="2"
                  [attr.aria-disabled]="asAction(item).disabled ? 'true' : null"
                  [disabled]="asAction(item).disabled"
                  [attr.tabindex]="asAction(item).disabled ? null : (rovingTarget(2, levelItems(2)) === $index ? '0' : '-1')"
                  [class]="itemClass(asAction(item), 2, $index)"
                  (click)="onItemClick(asAction(item), 2, $index)"
                  (keydown)="onItemKeyDown($event, 2, $index, asAction(item))"
                  (pointerenter)="onLeafPointerEnter(2, $event)"
                  (focus)="onItemFocus(2, outerIdx)"
                >
                  @if (isStringIcon(asAction(item).icon)) {
                    <span class="st-menu__itemIcon" aria-hidden="true">{{ asAction(item).icon }}</span>
                  }
                  <span class="st-menu__itemLabel">{{ asAction(item).label }}</span>
                </button>
              }
            }
          </div>
        }
      </div>
    } @else {
      <div
        #host
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        [attr.role]="role || 'menu'"
        [attr.id]="rootMenuId"
        data-menu-level="0"
        (keydown)="onLevelKeyDown($event, 0)"
      >
        @for (item of items; track $index; let outerIdx = $index) {
          @if (isDivider(item)) {
            <div class="st-menu__divider" role="separator" aria-hidden="true"></div>
          } @else if (isGroup(item)) {
            <div class="st-menu__group" role="presentation" [attr.id]="groupId(0, $index)">{{ asGroup(item).label }}</div>
            @for (child of asGroup(item).items || []; track $index; let innerIdx = $index) {
              <button
                type="button"
                role="menuitem"
                [disabled]="child.disabled"
                [attr.aria-disabled]="child.disabled ? 'true' : null"
                [class]="itemClass(child)"
                [attr.tabindex]="groupChildTabIndex(0, outerIdx, innerIdx, asGroup(item).items || [])"
                [attr.data-item-index]="outerIdx"
                [attr.data-menu-level]="0"
                (click)="onGroupChildClick(0, outerIdx, innerIdx, child)"
                (keydown)="onItemKeyDown($event, 0, outerIdx, child)"
                (focus)="onItemFocus(0, outerIdx)"
              >
                <span class="st-menu__itemLabel">{{ child.label }}</span>
              </button>
            }
          } @else {
            <button
              type="button"
              role="menuitem"
              [attr.data-item-index]="outerIdx"
              [attr.data-menu-level]="0"
              [attr.aria-disabled]="asAction(item).disabled ? 'true' : null"
              [disabled]="asAction(item).disabled"
              [attr.tabindex]="asAction(item).disabled ? null : (rovingTarget(0, items) === $index ? '0' : '-1')"
              [class]="itemClass(asAction(item), 0, $index)"
              (click)="onItemClick(asAction(item), 0, $index)"
              (keydown)="onItemKeyDown($event, 0, $index, asAction(item))"
              (focus)="onItemFocus(0, outerIdx)"
            >
              @if (isStringIcon(asAction(item).icon)) {
                <span class="st-menu__itemIcon" aria-hidden="true">{{ asAction(item).icon }}</span>
              }
              <span class="st-menu__itemLabel">{{ asAction(item).label }}</span>
            </button>
          }
        }
      </div>
    }
  `,
})
export class Menu implements AfterViewInit, OnChanges, OnDestroy {
  static readonly stComponentName = "Menu";
  readonly componentName = "Menu";
  readonly MENU_CHEVRON_RIGHT_SVG = CHEVRON_RIGHT_SVG;
  readonly MENU_CHEVRON_LEFT_SVG = CHEVRON_LEFT_SVG;

  private static nextInstanceId = 0;
  private readonly fallbackRootId = `st-menu-${++Menu.nextInstanceId}`;

  @NgInput() items: MenuItem[] = [];
  @NgInput() dense?: boolean;
  @NgInput() role?: string;
  @NgInput("class") classInput?: string;
  @NgInput() submenuSide: SubMenuSide = "auto";
  @NgInput() id?: string;

  @Output() readonly select = new EventEmitter<MenuActionItem>();
  @Output() readonly selectPath = new EventEmitter<MenuSelectPath>();

  @ViewChild("host") hostRef?: ElementRef<HTMLElement>;

  // Internal open state is an index path (never keys), so duplicate sibling
  // keys cannot open or close together (§2.3, D7).
  openPath: number[] = [];
  roving: number[] = [];
  levelSides: ResolvedSubMenuSide[] = [];
  levelPositions: { top: number; left: number; maxHeight?: number; capped: boolean }[] = [];

  private openTimer: ReturnType<typeof setTimeout> | undefined = undefined;
  private closeTimer: ReturnType<typeof setTimeout> | undefined = undefined;
  private closeLevel = -1;
  private safeApex: CascadePoint | null = null;
  private safeLevel = -1;
  private warnedDuplicate = false;
  private readonly warnedDepthKeys = new Set<string>();
  private destroyed = false;
  private rafId: number | undefined = undefined;
  private listenersActive = false;
  private readonly onScroll = () => {
    if (this.openPath.length > 0) this.computeAllPositions();
  };
  private readonly onResize = () => {
    if (this.openPath.length > 0) this.computeAllPositions();
  };

  get rootMenuId(): string {
    return this.id ?? this.fallbackRootId;
  }

  get hostClass(): string {
    return classNames(
      "st-menu",
      this.dense && "st-menu--dense",
      this.hasCascade && "st-menu--hasCascade",
      this.classInput,
    );
  }

  get hasCascade(): boolean {
    return this.treeHasCascade(this.items);
  }

  subMenuClass(): string {
    return classNames("st-menu", "st-menu--submenu", this.dense && "st-menu--dense");
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

  isAction(item: MenuItem): item is MenuActionItem {
    const kind = itemKind(item);
    return kind === undefined || kind === "item";
  }

  hasSubMenu(item: MenuItem): item is MenuActionItem & { children: MenuItem[] } {
    return (
      this.isAction(item) &&
      Array.isArray((item as MenuActionItem).children) &&
      ((item as MenuActionItem).children?.length ?? 0) > 0
    );
  }

  isParent(depth: number, _index: number, item: MenuActionItem): boolean {
    void _index;
    return this.hasSubMenu(item) && depth < 2;
  }

  treeHasCascade(list: MenuItem[]): boolean {
    for (const item of list) {
      if (this.hasSubMenu(item)) return true;
      if (this.isAction(item) && Array.isArray(item.children)) {
        if (this.treeHasCascade(item.children)) return true;
      }
    }
    return false;
  }

  /** Key derivation (§2.3) : `id ?? value`, repli `String(label)`, puis index. */
  keyOf(item: MenuActionItem, index: number): string {
    if (item.id !== undefined && item.id !== null) return item.id;
    if (item.value !== undefined && item.value !== null) return item.value;
    if (item.label !== undefined && item.label !== null) return String(item.label);
    return String(index);
  }

  levelItems(depth: number): MenuItem[] {
    let list = this.items;
    for (let d = 0; d < depth; d += 1) {
      const parent = list[this.openPath[d]];
      if (!parent || !this.isAction(parent) || !Array.isArray(parent.children)) return [];
      list = parent.children;
    }
    return list;
  }

  pathKeys(indexPath: number[]): string[] {
    const keys: string[] = [];
    let list = this.items;
    for (const index of indexPath) {
      const item = list[index];
      if (!item || !this.isAction(item)) break;
      keys.push(this.keyOf(item, index));
      list = Array.isArray(item.children) ? item.children : [];
    }
    return keys;
  }

  isOpen(depth: number, index: number): boolean {
    return this.openPath[depth] === index && this.openPath.length > depth;
  }

  subId(depth: number, index: number): string {
    return `${this.rootMenuId}--sub-${depth}-${index}`;
  }

  parentButtonId(depth: number, index: number): string {
    return `${this.rootMenuId}--parent-${depth}-${index}`;
  }

  groupId(depth: number, index: number): string {
    return `${this.rootMenuId}--group-${depth}-${index}`;
  }

  firstEnabledIndex(list: MenuItem[]): number {
    for (let i = 0; i < list.length; i += 1) {
      const item = list[i];
      if (this.isAction(item) && !(item as MenuActionItem).disabled) return i;
      if (this.isGroup(item) && (item as MenuGroupItem).items?.some((child) => !child.disabled)) return i;
    }
    return -1;
  }

  rovingTarget(depth: number, list: MenuItem[]): number {
    const stored = this.roving[depth];
    if (stored !== undefined) {
      const item = list[stored];
      if (item !== undefined) {
        if (this.isAction(item) && !(item as MenuActionItem).disabled) return stored;
        if (this.isGroup(item) && (item as MenuGroupItem).items?.some((child) => !child.disabled)) return stored;
      }
    }
    return this.firstEnabledIndex(list);
  }

  groupChildTabIndex(
    depth: number,
    groupIndex: number,
    childIndex: number,
    siblings: MenuActionItem[],
  ): string | null {
    const firstEnabled = siblings.findIndex((child) => !child.disabled);
    if (firstEnabled === -1) return null;
    const list = this.levelItems(depth);
    const target = this.rovingTarget(depth, list);
    if (target !== groupIndex) return "-1";
    return childIndex === firstEnabled ? "0" : "-1";
  }

  itemClass(item: MenuActionItem, depth?: number, index?: number): string {
    const parent =
      depth !== undefined && index !== undefined
        ? this.isParent(depth, index, item)
        : this.hasSubMenu(item) && (depth ?? 0) < 2;
    const open = depth !== undefined && index !== undefined ? this.isOpen(depth, index) : false;
    const selected = Boolean(item.selected) || open;
    return classNames(
      "st-menu__item",
      parent && "st-menu__item--hasSubmenu",
      isDangerAction(item) && "st-menu__item--danger",
      selected && "st-menu__item--selected",
    );
  }

  isStringIcon(icon: unknown): icon is string {
    return typeof icon === "string";
  }

  cancelOpenTimer(): void {
    if (this.openTimer !== undefined) {
      clearTimeout(this.openTimer);
      this.openTimer = undefined;
    }
  }

  cancelCloseTimer(): void {
    if (this.closeTimer !== undefined) {
      clearTimeout(this.closeTimer);
      this.closeTimer = undefined;
    }
    this.closeLevel = -1;
  }

  cancelAllTimers(): void {
    this.cancelOpenTimer();
    this.cancelCloseTimer();
    this.safeApex = null;
    this.safeLevel = -1;
  }

  cancelDeferredPositions(): void {
    if (this.rafId !== undefined && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
  }

  ngAfterViewInit(): void {
    this.registerWindowListeners();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["items"] || changes["submenuSide"]) {
      this.cancelAllTimers();
      this.pruneOpenPathAfterItemsChange();
      this.scanTreeWarnings(this.items, 0);
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.cancelAllTimers();
    this.cancelDeferredPositions();
    this.unregisterWindowListeners();
  }

  pruneOpenPathAfterItemsChange(): void {
    const previous = [...this.openPath];
    let list = this.items;
    const kept: number[] = [];
    for (const index of previous) {
      const item = list[index];
      if (!item || !this.hasSubMenu(item) || (item as MenuActionItem).disabled) break;
      kept.push(index);
      list = (item as MenuActionItem).children as MenuItem[];
    }
    if (kept.length !== previous.length) {
      this.openPath = kept;
    }
  }

  private registerWindowListeners(): void {
    if (this.listenersActive) return;
    if (typeof window === "undefined") return;
    // `window` may be stubbed in Node tests without addEventListener.
    if (typeof window.addEventListener !== "function") return;
    this.listenersActive = true;
    window.addEventListener("scroll", this.onScroll, true);
    window.addEventListener("resize", this.onResize);
  }

  private unregisterWindowListeners(): void {
    if (!this.listenersActive) return;
    this.listenersActive = false;
    if (typeof window === "undefined") return;
    if (typeof window.removeEventListener !== "function") return;
    window.removeEventListener("scroll", this.onScroll, true);
    window.removeEventListener("resize", this.onResize);
  }

  private hostEl(): HTMLElement | null {
    const el = this.hostRef?.nativeElement as HTMLElement | undefined;
    return el ?? null;
  }

  levelRootEl(level: number): Element | null {
    const host = this.hostEl();
    if (!host) return null;
    try {
      // The flat root IS its own level 0 element (querySelector skips self).
      if (typeof host.matches === "function" && host.matches(`[data-menu-level="${level}"]`)) {
        return host;
      }
      if (typeof host.querySelector !== "function") return null;
      return host.querySelector(`[data-menu-level="${level}"]`);
    } catch {
      return null;
    }
  }

  levelButtons(level: number): HTMLButtonElement[] {
    const levelRoot = this.levelRootEl(level);
    if (!levelRoot || typeof levelRoot.querySelectorAll !== "function") return [];
    try {
      return Array.from(levelRoot.querySelectorAll('[role="menuitem"]:not(:disabled)'));
    } catch {
      return [];
    }
  }

  rawIndexOf(button: HTMLButtonElement): number {
    try {
      const raw = button.getAttribute("data-item-index");
      return raw === null ? -1 : Number(raw);
    } catch {
      return -1;
    }
  }

  focusButton(level: number, index: number): void {
    const levelRoot = this.levelRootEl(level);
    this.roving[level] = index;
    if (!levelRoot || typeof levelRoot.querySelector !== "function") return;
    try {
      const button = levelRoot.querySelector(`[data-item-index="${index}"]`) as HTMLButtonElement | null;
      button?.focus();
    } catch {
      // No DOM in Node tests: roving state still updates.
    }
  }

  focusFirstEnabled(level: number): boolean {
    const buttons = this.levelButtons(level);
    if (buttons.length === 0) return false;
    this.roving[level] = this.rawIndexOf(buttons[0]);
    buttons[0].focus();
    return true;
  }

  focusLevelIndex(buttons: HTMLButtonElement[], at: number, level: number): void {
    if (buttons.length === 0) return;
    const size = buttons.length;
    const target = ((at % size) + size) % size;
    this.roving[level] = this.rawIndexOf(buttons[target]);
    buttons[target].focus();
  }

  onItemFocus(depth: number, index: number): void {
    this.roving[depth] = index;
  }

  schedulePositions(): void {
    if (this.destroyed) return;
    // Angular has no Svelte `tick()` : the microtask plays that role, then a
    // RAF recompute once the real panel size is known (§3.4 step 6).
    queueMicrotask(() => {
      if (this.destroyed) return;
      this.computeAllPositions();
      if (typeof requestAnimationFrame === "function") {
        this.cancelDeferredPositions();
        this.rafId = requestAnimationFrame(() => {
          this.rafId = undefined;
          if (!this.destroyed) this.computeAllPositions();
        });
      }
    });
  }

  findContainingBlock(element: HTMLElement): HTMLElement | null {
    if (typeof window === "undefined" || typeof window.getComputedStyle !== "function") return null;
    try {
      let node: HTMLElement | null = element.parentElement;
      while (node) {
        const style = window.getComputedStyle(node);
        const transform = style.transform;
        const filter = style.filter;
        const perspective = style.perspective;
        const contain = style.contain;
        const willChange = style.willChange;
        if (
          (transform && transform !== "none") ||
          (filter && filter !== "none") ||
          (perspective && perspective !== "none") ||
          (contain && /layout|paint|strict|content/.test(contain)) ||
          (willChange && /transform|filter|perspective/.test(willChange))
        ) {
          return node;
        }
        node = node.parentElement;
      }
    } catch {
      return null;
    }
    return null;
  }

  computeLevelPosition(level: number): void {
    const host = this.hostEl();
    if (!host || typeof window === "undefined") return;
    const parentIndex = this.openPath[level - 1];
    if (parentIndex === undefined) return;
    const levelRoot = this.levelRootEl(level - 1);
    const panel = this.levelRootEl(level) as HTMLElement | null;
    if (!levelRoot || !panel || typeof levelRoot.querySelector !== "function") return;
    try {
      const button = levelRoot.querySelector(`[data-item-index="${parentIndex}"]`);
      if (!button) return;
      const menuRect = levelRoot.getBoundingClientRect();
      const itemRect = button.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const solved = computeSubMenuPosition({
        parentMenuRect: { left: menuRect.left, right: menuRect.right },
        parentItemRect: { top: itemRect.top },
        panelSize: { width: panelRect.width, height: panelRect.height },
        viewport: { width: vw, height: vh },
        preferredSide: this.submenuSide,
      });
      const block = this.findContainingBlock(panel);
      const converted = toContainingBlockPosition(
        { top: solved.top, left: solved.left },
        block ? block.getBoundingClientRect() : null,
      );
      this.levelSides[level - 1] = solved.side;
      this.levelPositions[level - 1] = {
        top: converted.top,
        left: converted.left,
        maxHeight: solved.maxHeight,
        capped: vw < SUBMENU_DEFAULT_WIDTH + 2 * VIEWPORT_MARGIN,
      };
    } catch {
      // No DOM geometry in Node tests: solver stays the tested unit.
    }
  }

  computeAllPositions(): void {
    if (!this.hostEl() || this.openPath.length === 0) return;
    for (let level = 1; level <= this.openPath.length; level += 1) {
      this.computeLevelPosition(level);
    }
  }

  panelStyle(depth: number): string | undefined {
    const position = this.levelPositions[depth];
    if (!position) return undefined;
    let style = `top: ${position.top}px; left: ${position.left}px;`;
    if (position.maxHeight !== undefined) style += ` max-height: ${position.maxHeight}px;`;
    if (position.capped) style += " min-width: 0; max-width: calc(100vw - 16px);";
    return style;
  }

  chevronSide(depth: number, index: number): ResolvedSubMenuSide {
    const item = this.levelItems(depth)[index];
    if (item && this.isAction(item)) {
      return this.openingSideFor(depth, index, item as MenuActionItem);
    }
    return resolvePreferredSide(this.submenuSide);
  }

  closeDeepestFrom(level: number, focusParent: boolean): void {
    this.cancelAllTimers();
    const parentLevel = level - 1;
    const parentIndex = this.openPath[parentLevel];
    this.openPath = this.openPath.slice(0, parentLevel);
    if (focusParent && parentIndex !== undefined) {
      this.focusButton(parentLevel, parentIndex);
    }
  }

  /** Standalone/root Tab close (§4, AC-32) : clears the sub-menus and lets
   * focus leave (never prevented). Hosted Tab close is owned by the host
   * window handler (cascade only) so the host panel closes without a
   * public request-close channel. */
  closeAll(): void {
    this.cancelAllTimers();
    this.openPath = [];
  }

  indexPathFor(depth: number, index: number): number[] {
    return [...this.openPath.slice(0, depth), index];
  }

  /** Leaf activation (§2.3) : `select` emits the bare leaf item unchanged at
   * any depth (D1) ; additive `selectPath` emits `{item, path}` pour chaque
   * feuille (root leaf -> `path` length 1). */
  selectItem(item: MenuActionItem, fullPath: number[], _modality: "pointer" | "keyboard"): void {
    void _modality;
    if (item.disabled) return;
    // Parent activation never reaches here (toggle/open instead) ; leaf
    // `onClick` still precedes `select` ; parent `onClick` never runs on open.
    item.onClick?.();
    const path = this.pathKeys(fullPath);
    this.select.emit(item);
    this.selectPath.emit({ item, path });
    this.cancelAllTimers();
    this.openPath = [];
  }

  /** Leaf inside a `group` (Angular `MenuGroupItem.items`) : `group` never
   * contributes to `path` (§2.3) ; path = ancestor action keys + leaf key. */
  selectGroupChild(
    child: MenuActionItem,
    depth: number,
    _groupIndex: number,
    childIndex: number,
  ): void {
    if (child.disabled) return;
    child.onClick?.();
    const ancestors = this.pathKeys(this.openPath.slice(0, depth));
    const path = [...ancestors, this.keyOf(child, childIndex)];
    this.select.emit(child);
    this.selectPath.emit({ item: child, path });
    this.cancelAllTimers();
    this.openPath = [];
  }

  onGroupChildClick(
    depth: number,
    groupIndex: number,
    childIndex: number,
    child: MenuActionItem,
  ): void {
    this.selectGroupChild(child, depth, groupIndex, childIndex);
  }

  openParent(depth: number, index: number, focusFirst: boolean): void {
    const list = this.levelItems(depth);
    const item = list[index];
    if (!item || !this.isAction(item) || item.disabled) return;
    if (!this.hasSubMenu(item) || depth >= 2) {
      // A depth-2 item bearing `children` renders as a leaf (no chevron,
      // `children` ignored) — it never opens (§3.5).
      return;
    }
    this.cancelAllTimers();
    this.openPath = [...this.openPath.slice(0, depth), index];
    this.schedulePositions();
    if (focusFirst) {
      queueMicrotask(() => {
        if (this.destroyed) return;
        this.focusFirstEnabled(depth + 1);
      });
    }
  }

  toggleParent(depth: number, index: number): void {
    const list = this.levelItems(depth);
    const item = list[index];
    if (!item || !this.isAction(item) || item.disabled) return;
    if (!this.hasSubMenu(item) || depth >= 2) return;
    this.cancelAllTimers();
    if (this.openPath[depth] === index && this.openPath.length > depth) {
      this.openPath = this.openPath.slice(0, depth);
    } else {
      this.openPath = [...this.openPath.slice(0, depth), index];
      this.schedulePositions();
    }
  }

  private isMouseEvent(event: { pointerType?: string }): boolean {
    return event?.pointerType === "mouse";
  }

  triangleForLevel(level: number): [CascadePoint, CascadePoint, CascadePoint] | null {
    if (!this.hostEl() || this.safeApex === null || this.safeLevel !== level) return null;
    const panel = this.levelRootEl(level + 1) as HTMLElement | null;
    if (!panel || typeof panel.getBoundingClientRect !== "function") return null;
    try {
      const rect = panel.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0 && rect.left === 0 && rect.right === 0) {
        return null;
      }
      const side: ResolvedSubMenuSide = this.levelSides[level] ?? resolvePreferredSide(this.submenuSide);
      const edgeX = side === "right" ? rect.left : rect.right;
      return [
        { x: this.safeApex.x, y: this.safeApex.y },
        { x: edgeX, y: rect.top - 4 },
        { x: edgeX, y: rect.bottom + 4 },
      ];
    } catch {
      return null;
    }
  }

  pointInActiveTriangle(level: number, point: CascadePoint): boolean {
    const triangle = this.triangleForLevel(level);
    if (!triangle) return false;
    return pointInSafeTriangle(point, triangle[0], triangle[1], triangle[2]);
  }

  armClose(level: number): void {
    this.cancelCloseTimer();
    this.closeLevel = level;
    const parentIndex = this.openPath[level];
    this.closeTimer = setTimeout(() => {
      const active =
        typeof document !== "undefined" ? document.activeElement : null;
      const closingRoots =
        this.hostEl() && typeof this.hostEl()?.querySelectorAll === "function"
          ? this.hostEl()?.querySelectorAll(`[data-menu-level="${level + 1}"]`)
          : null;
      this.openPath = this.openPath.slice(0, level);
      this.safeApex = null;
      this.safeLevel = -1;
      if (active && closingRoots) {
        for (const root of Array.from(closingRoots)) {
          try {
            if (root.contains(active)) {
              if (parentIndex !== undefined) this.focusButton(level, parentIndex);
              break;
            }
          } catch {
            break;
          }
        }
      }
      this.closeTimer = undefined;
      this.closeLevel = -1;
    }, CLOSE_DELAY);
  }

  onParentPointerEnter(
    depth: number,
    index: number,
    item: MenuActionItem,
    event: PointerEvent,
  ): void {
    if (!this.isMouseEvent(event) || !this.hasCascade) return;
    if (item.disabled) return;
    // Safe-triangle priority: crossings during the diagonal arm nothing (§3.3).
    if (this.pointInActiveTriangle(depth, { x: event.clientX, y: event.clientY })) return;
    this.cancelCloseTimer();
    this.cancelOpenTimer();
    this.openTimer = setTimeout(() => {
      this.openTimer = undefined;
      if (this.destroyed) return;
      this.openPath = [...this.openPath.slice(0, depth), index];
      this.schedulePositions();
    }, OPEN_DELAY);
  }

  onLeafPointerEnter(depth: number, event: PointerEvent): void {
    if (!this.isMouseEvent(event) || !this.hasCascade) return;
    if (this.pointInActiveTriangle(depth, { x: event.clientX, y: event.clientY })) return;
    this.cancelOpenTimer();
    if (this.openPath.length > depth) {
      this.armClose(depth);
    }
  }

  onParentPointerLeave(
    depth: number,
    index: number,
    _item: MenuActionItem,
    event: PointerEvent,
  ): void {
    void _item;
    if (!this.isMouseEvent(event) || !this.hasCascade) return;
    this.cancelOpenTimer();
    if (this.openPath[depth] !== index) return;
    this.safeApex = { x: event.clientX, y: event.clientY };
    this.safeLevel = depth;
    this.armClose(depth);
  }

  onHostPointerMove(event: PointerEvent): void {
    if (!this.isMouseEvent(event) || !this.hasCascade || this.safeApex === null) return;
    const point = { x: event.clientX, y: event.clientY };
    const triangle = this.triangleForLevel(this.safeLevel);
    if (!triangle) return;
    // Test first, then refresh the apex (D9).
    if (pointInSafeTriangle(point, triangle[0], triangle[1], triangle[2])) {
      this.cancelCloseTimer();
      this.safeApex = point;
      return;
    }
    const target = event.target as Element | null;
    const host = this.hostEl();
    let inOpenPanel = false;
    let inArmedParent = false;
    try {
      inOpenPanel = Boolean(target?.closest?.('[data-menu-level]:not([data-menu-level="0"])'));
      const parentButton = this.levelRootEl(this.safeLevel)?.querySelector(
        `[data-item-index="${this.openPath[this.safeLevel] ?? -1}"]`,
      );
      inArmedParent = Boolean(parentButton?.closest(".st-menu__itemWrap")?.contains(target ?? null));
    } catch {
      inOpenPanel = false;
      inArmedParent = false;
    }
    void host;
    if (!inOpenPanel && !inArmedParent) {
      if (this.closeTimer === undefined || this.closeLevel !== this.safeLevel) {
        this.armClose(this.safeLevel);
      }
    }
  }

  onPanelPointerEnter(event: PointerEvent): void {
    if (!this.isMouseEvent(event) || !this.hasCascade) return;
    this.cancelAllTimers();
  }

  onPanelPointerLeave(depth: number, event: PointerEvent): void {
    if (!this.isMouseEvent(event) || !this.hasCascade) return;
    this.armClose(depth);
  }

  openingArrow(): string {
    const side = resolvePreferredSide(this.submenuSide);
    return side === "right" ? "ArrowRight" : "ArrowLeft";
  }

  resolvedSideFor(depth: number, index: number): ResolvedSubMenuSide {
    if (this.openPath[depth] === index && this.openPath.length > depth && this.levelSides[depth] !== undefined) {
      return this.levelSides[depth];
    }
    return resolvePreferredSide(this.submenuSide);
  }

  /** Opening side for keyboard handling: inside a sub-menu the whole level
   * shares its containing level's resolved side, so a flipped panel keeps
   * one opening arrow for parents and leaves alike (§3.4, AC-06/AC-19). */
  openingSideFor(depth: number, index: number, item: MenuActionItem): ResolvedSubMenuSide {
    if (depth >= 1 && this.levelSides[depth - 1] !== undefined) {
      return this.levelSides[depth - 1];
    }
    if (this.hasSubMenu(item)) return this.resolvedSideFor(depth, index);
    return this.openingArrow() === "ArrowRight" ? "right" : "left";
  }

  onItemKeyDown(
    event: KeyboardEvent,
    depth: number,
    index: number,
    item: MenuActionItem,
  ): void {
    const levelRoot = this.levelRootEl(depth);
    const buttons = levelRoot ? this.levelButtons(depth) : [];
    const currentTarget = event.currentTarget as HTMLButtonElement | undefined;
    const current = currentTarget ? buttons.indexOf(currentTarget) : -1;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.focusLevelIndex(buttons, current + 1, depth);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.focusLevelIndex(buttons, current - 1, depth);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      this.focusLevelIndex(buttons, 0, depth);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      this.focusLevelIndex(buttons, buttons.length - 1, depth);
      return;
    }
    if (item.disabled) return;
    const resolved = this.openingSideFor(depth, index, item);
    const opening = resolved === "right" ? "ArrowRight" : "ArrowLeft";
    const opposite = opening === "ArrowRight" ? "ArrowLeft" : "ArrowRight";
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (this.hasSubMenu(item) && depth < 2) {
        this.openParent(depth, index, true);
      } else {
        this.selectItem(item, this.indexPathFor(depth, index), "keyboard");
      }
      return;
    }
    if (event.key === opening) {
      if (this.hasSubMenu(item) && depth < 2) {
        event.preventDefault();
        if (this.openPath[depth] === index && this.openPath.length > depth) {
          this.focusFirstEnabled(depth + 1);
        } else {
          this.openParent(depth, index, true);
        }
      }
      return;
    }
    if (event.key === opposite) {
      if (depth >= 1) {
        event.preventDefault();
        if (this.openPath.length > 0) this.closeDeepestFrom(this.openPath.length, true);
      } else if (this.hasCascade && this.openPath[0] === index && this.openPath.length > 0) {
        event.preventDefault();
        this.closeDeepestFrom(this.openPath.length, true);
      }
    }
  }

  onLevelKeyDown(event: KeyboardEvent, depth: number): void {
    if (!this.hasCascade) return;
    if (event.key === "Escape") {
      if (depth >= 1) {
        event.preventDefault();
        event.stopPropagation();
        if (this.openPath.length > 0) this.closeDeepestFrom(this.openPath.length, true);
        return;
      }
      if (this.openPath.length > 0) {
        event.preventDefault();
        event.stopPropagation();
        this.cancelAllTimers();
        const parentLevel = this.openPath.length - 1;
        const parentIndex = this.openPath[parentLevel];
        this.openPath = this.openPath.slice(0, parentLevel);
        if (parentIndex !== undefined) this.focusButton(parentLevel, parentIndex);
        return;
      }
      // Root Esc with no sub-menu: bubbles to the host window handler (D4),
      // which owns the full close (+ trigger focus for cascade, §3.6).
      return;
    }
    if (event.key === "Tab") {
      // Closes the sub-menus and lets focus leave (no trap, AC-32).
      this.closeAll();
    }
  }

  scanTreeWarnings(list: MenuItem[], depth: number): void {
    const seen = new Set<string>();
    for (const item of list) {
      if (!this.isAction(item)) continue;
      const key = this.keyOf(item, seen.size);
      if (seen.has(key) && !this.warnedDuplicate) {
        this.warnedDuplicate = true;
        console.warn(`[Menu] duplicate sibling key "${key}": open state follows the index path.`);
      }
      seen.add(key);
      if (depth >= 2 && this.hasSubMenu(item) && !this.warnedDepthKeys.has(key)) {
        this.warnedDepthKeys.add(key);
        console.warn(
          `[Menu] item "${key}" is nested deeper than two sub-menu levels and renders as a leaf.`,
        );
      }
      if (this.isAction(item) && Array.isArray(item.children)) {
        this.scanTreeWarnings(item.children, depth + 1);
      }
    }
  }

  /** Find the index path of a direct action by reference (backward-compat
   * for single-argument `onItemClick` callers). Returns `null` when the item
   * is not a visible direct action (group children use `selectGroupChild`). */
  findIndexPathFor(target: MenuActionItem): number[] | null {
    const rootIndex = this.items.indexOf(target);
    if (rootIndex !== -1) return [rootIndex];
    const search = (list: MenuItem[], prefix: number[]): number[] | null => {
      for (let i = 0; i < list.length; i += 1) {
        const item = list[i];
        if (item === (target as unknown as MenuItem)) return [...prefix, i];
        if (this.isAction(item) && Array.isArray(item.children)) {
          const found = search(item.children, [...prefix, i]);
          if (found) return found;
        }
      }
      return null;
    };
    return search(this.items, []);
  }

  onItemClick(item: MenuActionItem, depth = 0, index?: number): void {
    if (item.disabled) return;
    if (index === undefined) {
      const found = this.findIndexPathFor(item);
      if (found) {
        this.selectItem(item, found, "pointer");
        return;
      }
      // Unknown reference (detached item): emit with a label-derived path of
      // length 1 so `select` still carries the bare item (AC-01 compat).
      item.onClick?.();
      this.select.emit(item);
      this.selectPath.emit({ item, path: [this.keyOf(item, 0)] });
      this.cancelAllTimers();
      this.openPath = [];
      return;
    }
    // Parent `onClick` must never run on open: parents use `toggleParent`
    // from the template, leaves reach `selectItem` here.
    if (this.hasSubMenu(item) && depth < 2) {
      this.toggleParent(depth, index);
      return;
    }
    this.selectItem(item, this.indexPathFor(depth, index), "pointer");
  }
}
