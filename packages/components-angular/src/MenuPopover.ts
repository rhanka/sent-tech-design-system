import {
  afterNextRender,
  ChangeDetectorRef,
  ContentChild,
  inject,
  Injector,
  Component,
  ElementRef,
  EventEmitter,
  Input as NgInput,
  Output,
  ViewChild,
} from "@angular/core";
import type { AfterViewInit, OnChanges, OnDestroy, SimpleChanges } from "@angular/core";

import { classNames } from "./classNames.js";

import { injectMenuDependency, MENU_HOST, MENU_HOST_CONTEXT } from "./menu-host.js";
import type { MenuHost } from "./menu-host.js";
import { Menu } from "./Menu.js";

import type { MenuActionItem, MenuItem, MenuSelectPath } from "./Menu.js";
import type { SubMenuSide } from "./menu-cascade.js";

function popoverItemKind(item: MenuItem): string | undefined {
  const tagged = item as { type?: string; kind?: string };
  return tagged.type ?? tagged.kind;
}

function popoverIsAction(item: MenuItem): item is MenuActionItem {
  const kind = popoverItemKind(item);
  return kind === undefined || kind === "item";
}

export type MenuPopoverPlacement = "top-start" | "top-end" | "bottom-start" | "bottom-end";
export type MenuPopoverAlign = "start" | "end" | "center";

// Anchor spacing between panel and trigger.
const GAP = 4;
// Anti-overflow margin between the panel and the viewport edge.
const VIEWPORT_MARGIN = 8;
// Height floor: below this threshold we keep a usable scrollable window rather
// than a crushed menu (rare case of a trigger glued to the edge).
const MIN_HEIGHT = 160;

export type MenuPopoverRect = {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
};

export type MenuPopoverViewport = {
  width: number;
  height: number;
};

export type MenuPopoverPanelSize = {
  width: number;
  height: number;
};

export type MenuPopoverPosition = {
  top: number;
  left: number;
  maxHeight: number;
  alignEnd: boolean;
  alignCenter: boolean;
  /** True once the requested vertical side no longer fits (panel flipped). */
  flipped: boolean;
  /** Placement class to render (mirrors the flip so transforms keep working). */
  effectivePlacement: MenuPopoverPlacement;
};

export function menuPopoverEffectivePlacement(
  placement: MenuPopoverPlacement,
  flipped: boolean,
): MenuPopoverPlacement {
  if (!flipped) return placement;
  if (placement === "bottom-start") return "top-start";
  if (placement === "bottom-end") return "top-end";
  if (placement === "top-start") return "bottom-start";
  return "bottom-end";
}

/**
 * Pure position solver — mirrors Svelte's `computePosition()` / React's
 * `computePosition` callback so it can be unit-tested without a real
 * `window`/DOM (this package's tests run in a Node environment, no jsdom).
 *
 * Viewport coordinates (matching `position: fixed`): no scroll offsets — the
 * old document coordinates were wrong inside any positioned ancestor and the
 * panel was clipped by overflow containers.
 */
export function computeMenuPopoverPosition(
  rect: MenuPopoverRect,
  placement: MenuPopoverPlacement,
  align: MenuPopoverAlign | undefined,
  viewport: MenuPopoverViewport,
  panelSize: MenuPopoverPanelSize = { width: 0, height: 0 },
): MenuPopoverPosition {
  const verticalUp = placement === "top-start" || placement === "top-end";
  const horizontalEnd = placement === "bottom-end" || placement === "top-end";
  const resolvedAlign: MenuPopoverAlign = align ?? (horizontalEnd ? "end" : "start");
  const alignEnd = resolvedAlign === "end";
  const alignCenter = resolvedAlign === "center";

  const need = panelSize.height > 0 ? panelSize.height : MIN_HEIGHT;
  const spaceBelow = viewport.height - rect.bottom - GAP;
  const spaceAbove = rect.top - GAP;

  // Flip when the requested side cannot fit the panel and the other side
  // offers more room.
  let showUp = verticalUp;
  if (!verticalUp && spaceBelow < need && spaceAbove > spaceBelow) showUp = true;
  else if (verticalUp && spaceAbove < need && spaceBelow > spaceAbove) showUp = false;
  const flipped = showUp !== verticalUp;

  let top: number;
  let maxHeight: number;
  if (showUp) {
    // Panel bottom edge sits above the trigger (transform handles the flip);
    // available space is what's ABOVE the trigger.
    top = rect.top - GAP;
    maxHeight = Math.max(rect.top - GAP - VIEWPORT_MARGIN, MIN_HEIGHT);
  } else {
    top = rect.bottom + GAP;
    // Space actually available BELOW the trigger — `max-height: 100vh` alone
    // ignores the panel's offset and overflows past the bottom edge.
    maxHeight = Math.max(viewport.height - rect.bottom - GAP - VIEWPORT_MARGIN, MIN_HEIGHT);
  }

  // Reclamp horizontally so the measured panel stays inside the viewport.
  const panelWidth = panelSize.width;
  let left: number;
  if (resolvedAlign === "end") {
    left = rect.right;
    if (panelWidth > 0) {
      left = Math.min(Math.max(left, panelWidth + VIEWPORT_MARGIN), viewport.width - VIEWPORT_MARGIN);
    }
  } else if (resolvedAlign === "center") {
    left = rect.left + rect.width / 2;
    if (panelWidth > 0) {
      left = Math.min(
        Math.max(left, panelWidth / 2 + VIEWPORT_MARGIN),
        viewport.width - panelWidth / 2 - VIEWPORT_MARGIN,
      );
    }
  } else {
    left = rect.left;
    if (panelWidth > 0) {
      left = Math.min(Math.max(left, VIEWPORT_MARGIN), viewport.width - panelWidth - VIEWPORT_MARGIN);
    }
  }

  return { top, left, maxHeight, alignEnd, alignCenter, flipped, effectivePlacement: menuPopoverEffectivePlacement(placement, flipped) };
}

export function menuPopoverIsWithin(
  event: { composedPath?: () => EventTarget[]; target: EventTarget | null },
  node: Element | null | undefined,
): boolean {
  if (!node) return false;
  const path = typeof event.composedPath === "function" ? event.composedPath() : [];
  if (path.includes(node)) return true;
  const target = event.target as Node | null;
  return Boolean(target && node.contains(target));
}

export type MenuPopoverProps = {
  items?: MenuItem[];
  open?: boolean;
  trigger?: HTMLElement | null;
  placement?: MenuPopoverPlacement;
  align?: MenuPopoverAlign;
  label?: string;
  class?: string;
  closeOnOutside?: boolean;
  closeOnEscape?: boolean;
  submenuSide?: SubMenuSide;
};

@Component({
  selector: "st-menu-popover",
  standalone: true,
  imports: [Menu],
  providers: [{ provide: MENU_HOST, useFactory: () => inject(MenuPopover)[MENU_HOST_CONTEXT] }],
  styles: [":host { display: contents; }"],
  template: `
    @if (open) {
      <!-- No static popover attribute: set imperatively by showTopLayer()
           only where the Popover API exists. -->
      <div
        #panel
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        role="dialog"
        [attr.aria-label]="label"
        [style]="panelStyle"
      >
        @if (items && items.length) {
          <st-menu
            [items]="items"
            [submenuSide]="submenuSide"
            [role]="innerRole"
            (select)="onMenuSelect($event)"
            (selectPath)="onMenuSelectPath($event)"
          ></st-menu>
        } @else {
          <ng-content></ng-content>
        }
      </div>
    }
  `,
})
export class MenuPopover implements AfterViewInit, OnChanges, OnDestroy {
  static readonly stComponentName = "MenuPopover";
  readonly componentName = "MenuPopover";

  private readonly changeDetector = injectMenuDependency(ChangeDetectorRef);
  private readonly injector = injectMenuDependency(Injector);
  @ContentChild(Menu, { descendants: true }) private projectedMenu?: Menu;

  get hasCascade(): boolean {
    return this.items?.length ? this.treeHasCascade(this.items) : Boolean(this.projectedMenu?.hasCascade);
  }

  private static nextInstanceId = 0;
  readonly rootMenuId = `st-menupopover-${++MenuPopover.nextInstanceId}`;
  readonly [MENU_HOST_CONTEXT]: MenuHost = {
    rootMenuId: this.rootMenuId,
    label: () => this.label,
    select: (keyboard, cascade) => {
      if (!cascade) return;
      this.close();
      if (keyboard && cascade) this.trigger?.focus();
    },
  };

  /** Convenience (not in the Svelte contract): renders a <st-menu> from `items` instead of projected content. */
  @NgInput() items?: MenuItem[];
  @NgInput() open = false;
  /** Anchor element used for position computation and outside-click exclusion (Svelte-canonical). */
  @NgInput() trigger: HTMLElement | null = null;
  @NgInput() placement: MenuPopoverPlacement = "bottom-start";
  @NgInput() align?: MenuPopoverAlign;
  /** Accessible name for the panel (Svelte-canonical: applied as aria-label on role="dialog"). */
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;
  @NgInput() closeOnOutside = true;
  @NgInput() closeOnEscape = true;
  @NgInput() submenuSide: SubMenuSide = "auto";

  @Output() readonly openChange = new EventEmitter<boolean>();
  @Output() readonly select = new EventEmitter<MenuItem>();
  @Output() readonly selectPath = new EventEmitter<MenuSelectPath>();

  @ViewChild("panel") panel?: ElementRef<HTMLDivElement>;

  top = 0;
  left = 0;
  maxHeight = 0;
  alignEnd = false;
  alignCenter = false;
  flipped = false;

  private listenersActive = false;
  private prevTriggerForAria: HTMLElement | null = null;
  private readonly onScroll = () => this.computePosition();
  private readonly onResize = () => this.computePosition();
  private readonly onPointerDown = (event: PointerEvent) => {
    if ((event as { defaultPrevented?: boolean }).defaultPrevented) return;
    if (!this.open || !this.closeOnOutside) return;
    if (menuPopoverIsWithin(event, this.panel?.nativeElement)) return;
    if (menuPopoverIsWithin(event, this.trigger)) return;
    this.close();
  };
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if ((event as { defaultPrevented?: boolean }).defaultPrevented) return;
    if (!this.open) return;
    if (event.key === "Escape" && this.closeOnEscape) {
      event.preventDefault();
      const focus = this.hasCascade;
      this.close();
      if (focus) {
        try {
          this.trigger?.focus?.();
        } catch {
          // No DOM in Node tests.
        }
      }
      return;
    }
    if (event.key === "Tab" && this.hasCascade) {
      // No preventDefault: focus leaves the menu (no trap, AC-32).
      this.close();
    }
  };

  treeHasCascade(list: MenuItem[] | undefined): boolean {
    if (!list) return false;
    for (const item of list) {
      if (!popoverIsAction(item)) continue;
      const children = (item as MenuActionItem).children;
      if (Array.isArray(children) && children.length > 0) return true;
      if (Array.isArray(children) && this.treeHasCascade(children)) return true;
    }
    return false;
  }

  get innerRole(): string {
    return this.items && this.treeHasCascade(this.items) ? "menu" : "presentation";
  }

  onMenuSelect(item: MenuItem): void {
    this.close();
    this.select.emit(item);
  }

  onMenuSelectPath(payload: MenuSelectPath): void {
    this.close();
    this.selectPath.emit(payload);
  }

  syncTriggerAriaControls(): void {
    const trigger = this.trigger as (HTMLElement & { setAttribute?: (name: string, value: string) => void; removeAttribute?: (name: string) => void }) | null;
    const prev = this.prevTriggerForAria as (HTMLElement & { removeAttribute?: (name: string) => void }) | null;
    if (prev && prev !== this.trigger) {
      try {
        prev.removeAttribute?.("aria-controls");
      } catch {
        // No DOM in Node tests.
      }
    }
    if (!this.open || !trigger) {
      if (trigger && prev === trigger) {
        try {
          trigger.removeAttribute?.("aria-controls");
        } catch {
          // No DOM in Node tests.
        }
      }
      this.prevTriggerForAria = this.trigger ?? null;
      return;
    }
    try {
      trigger.setAttribute?.("aria-controls", this.rootMenuId);
    } catch {
      // No DOM in Node tests (trigger fakes without setAttribute).
    }
    this.prevTriggerForAria = this.trigger;
  }

  get hostClass(): string {
    return classNames(
      "st-menuPopover",
      this.hasCascade && "st-menuPopover--hasCascade",
      `st-menuPopover--${menuPopoverEffectivePlacement(this.placement, this.flipped)}`,
      this.alignEnd ? "st-menuPopover--alignEnd" : null,
      this.alignCenter ? "st-menuPopover--alignCenter" : null,
      this.classInput,
    );
  }

  get panelStyle(): string {
    return `top: ${this.top}px; left: ${this.left}px;${this.hasCascade && this.maxHeight ? ` --st-menu-root-maxHeight: ${this.maxHeight}px;` : ""}${this.maxHeight ? ` max-height: ${this.maxHeight}px;` : ""}`;
  }

  ngAfterViewInit(): void {
    this.registerWindowListeners();
    this.syncTriggerAriaControls();
    if (this.open) {
      this.computePosition();
      this.showTopLayer();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Root-id ownership (§2.2, D10): set `aria-controls` on the external
    // trigger while open, remove on close. Runs in Node tests too (trigger
    // fakes without setAttribute are guarded).
    this.syncTriggerAriaControls();
    if (!this.open && changes["open"]) {
      // Projected components survive the conditional insertion point.
      this.projectedMenu?.closeAll();
      this.hideTopLayer();
    }
    if (typeof window === "undefined") return;
    if (!this.open) return;
    if (changes["open"] || changes["trigger"] || changes["placement"] || changes["align"]) {
      // Recompute after Angular renders the panel for the new state.
      const render = () => {
        if (this.open) {
          this.computePosition();
          this.showTopLayer();
          this.changeDetector?.markForCheck();
        }
      };
      if (this.injector) afterNextRender(render, { injector: this.injector });
      else queueMicrotask(render);
    }
  }

  ngOnDestroy(): void {
    this.unregisterWindowListeners();
    // Release the external trigger attribute on teardown.
    try {
      const trigger = this.trigger as (HTMLElement & { removeAttribute?: (name: string) => void }) | null;
      trigger?.removeAttribute?.("aria-controls");
    } catch {
      // No DOM in Node tests.
    }
    this.prevTriggerForAria = null;
  }

  computePosition(): void {
    if (!this.trigger) return;
    if (typeof window === "undefined") return;
    const rect = this.trigger.getBoundingClientRect();
    const panelEl = this.panel?.nativeElement as
      | (HTMLDivElement & { showPopover?: () => void })
      | undefined;
    const pos = computeMenuPopoverPosition(
      { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width },
      this.placement,
      this.align,
      { width: window.innerWidth, height: window.innerHeight },
      { width: panelEl?.offsetWidth ?? 0, height: panelEl?.offsetHeight ?? 0 },
    );
    this.top = pos.top;
    this.left = pos.left;
    this.maxHeight = pos.maxHeight;
    this.alignEnd = pos.alignEnd;
    this.alignCenter = pos.alignCenter;
    this.flipped = pos.flipped;
    this.changeDetector?.markForCheck();
  }

  /**
   * Top layer: the element stays in place in the DOM (no portal to
   * `<body>`) so it keeps inheriting the theme's `--st-*` custom properties;
   * the Popover API only lifts rendering into the top layer, above overflow
   * clipping. Where the API is missing, plain `position: fixed` applies.
   */
  private popoverShown = false;

  showTopLayer(): void {
    const el = this.panel?.nativeElement as
      | (HTMLDivElement & { showPopover?: () => void })
      | undefined;
    if (!el || this.popoverShown) return;
    if (typeof el.showPopover !== "function") return;
    // The attribute is set ONLY here (never statically in the template):
    // environments without the API hide every [popover] element via the UA
    // rule, so a static attribute would force display:none.
    el.setAttribute("popover", "manual");
    try {
      el.showPopover();
      this.popoverShown = true;
    } catch {
      el.removeAttribute("popover");
      // Already open or not ready — fixed positioning still applies.
    }
  }

  hideTopLayer(): void {
    const el = this.panel?.nativeElement as
      | (HTMLDivElement & { hidePopover?: () => void })
      | undefined;
    this.popoverShown = false;
    if (!el || typeof el.hidePopover !== "function") return;
    try {
      el.hidePopover();
    } catch {
      // Already hidden — nothing to do.
    } finally {
      el.removeAttribute("popover");
    }
  }

  close(): void {
    this.projectedMenu?.closeAll();
    if (!this.open) return;
    this.hideTopLayer();
    this.open = false;
    this.changeDetector?.markForCheck();
    this.syncTriggerAriaControls();
    this.openChange.emit(false);
  }

  private registerWindowListeners(): void {
    if (this.listenersActive) return;
    if (typeof window === "undefined") return;
    this.listenersActive = true;
    window.addEventListener("scroll", this.onScroll, true);
    window.addEventListener("resize", this.onResize);
    window.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("keydown", this.onKeyDown);
  }

  private unregisterWindowListeners(): void {
    if (!this.listenersActive) return;
    this.listenersActive = false;
    if (typeof window === "undefined") return;
    window.removeEventListener("scroll", this.onScroll, true);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("keydown", this.onKeyDown);
  }
}
