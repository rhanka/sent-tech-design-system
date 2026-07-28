import {
  Component,
  ElementRef,
  EventEmitter,
  Input as NgInput,
  Output,
  ViewChild,
} from "@angular/core";
import type { AfterViewInit, OnChanges, OnDestroy, SimpleChanges } from "@angular/core";

import { classNames } from "./classNames.js";

import { Menu } from "./Menu.js";

import type { MenuItem } from "./Menu.js";

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
  height: number;
  scrollX: number;
  scrollY: number;
};

export type MenuPopoverPosition = {
  top: number;
  left: number;
  maxHeight: number;
  alignEnd: boolean;
  alignCenter: boolean;
};

/**
 * Pure position solver — mirrors Svelte's `computePosition()` / React's
 * `computePosition` callback so it can be unit-tested without a real
 * `window`/DOM (this package's tests run in a Node environment, no jsdom).
 */
export function computeMenuPopoverPosition(
  rect: MenuPopoverRect,
  placement: MenuPopoverPlacement,
  align: MenuPopoverAlign | undefined,
  viewport: MenuPopoverViewport,
): MenuPopoverPosition {
  const verticalUp = placement === "top-start" || placement === "top-end";
  const horizontalEnd = placement === "bottom-end" || placement === "top-end";
  const resolvedAlign: MenuPopoverAlign = align ?? (horizontalEnd ? "end" : "start");
  const alignEnd = resolvedAlign === "end";
  const alignCenter = resolvedAlign === "center";

  let top: number;
  let maxHeight: number;
  if (verticalUp) {
    // Panel bottom edge sits above the trigger (transform handles the flip);
    // available space is what's ABOVE the trigger.
    top = rect.top + viewport.scrollY - GAP;
    maxHeight = Math.max(rect.top - GAP - VIEWPORT_MARGIN, MIN_HEIGHT);
  } else {
    top = rect.bottom + viewport.scrollY + GAP;
    // Space actually available BELOW the trigger — `max-height: 100vh` alone
    // ignores the panel's offset and overflows past the bottom edge.
    maxHeight = Math.max(viewport.height - rect.bottom - GAP - VIEWPORT_MARGIN, MIN_HEIGHT);
  }

  let left: number;
  if (resolvedAlign === "end") {
    left = rect.right + viewport.scrollX;
  } else if (resolvedAlign === "center") {
    left = rect.left + viewport.scrollX + rect.width / 2;
  } else {
    left = rect.left + viewport.scrollX;
  }

  return { top, left, maxHeight, alignEnd, alignCenter };
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
};

@Component({
  selector: "st-menu-popover",
  standalone: true,
  imports: [Menu],
  styles: [":host { display: contents; }"],
  template: `
    @if (open) {
      <div
        #panel
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        role="dialog"
        [attr.aria-label]="label"
        [style]="panelStyle"
      >
        @if (items && items.length) {
          <st-menu [items]="items" role="presentation"></st-menu>
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

  @Output() readonly openChange = new EventEmitter<boolean>();

  @ViewChild("panel") panel?: ElementRef<HTMLDivElement>;

  top = 0;
  left = 0;
  maxHeight = 0;
  alignEnd = false;
  alignCenter = false;

  private listenersActive = false;
  private readonly onScroll = () => this.computePosition();
  private readonly onResize = () => this.computePosition();
  private readonly onPointerDown = (event: PointerEvent) => {
    if (!this.open || !this.closeOnOutside) return;
    if (menuPopoverIsWithin(event, this.panel?.nativeElement)) return;
    if (menuPopoverIsWithin(event, this.trigger)) return;
    this.close();
  };
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (!this.open || !this.closeOnEscape) return;
    if (event.key === "Escape") {
      event.preventDefault();
      this.close();
    }
  };

  get hostClass(): string {
    return classNames(
      "st-menuPopover",
      `st-menuPopover--${this.placement}`,
      this.alignEnd ? "st-menuPopover--alignEnd" : null,
      this.alignCenter ? "st-menuPopover--alignCenter" : null,
      this.classInput,
    );
  }

  get panelStyle(): string {
    return `top: ${this.top}px; left: ${this.left}px;${this.maxHeight ? ` max-height: ${this.maxHeight}px;` : ""}`;
  }

  ngAfterViewInit(): void {
    this.registerWindowListeners();
    if (this.open) this.computePosition();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (typeof window === "undefined") return;
    if (!this.open) return;
    if (changes["open"] || changes["trigger"] || changes["placement"] || changes["align"]) {
      // Recompute after Angular renders the panel for the new state.
      queueMicrotask(() => {
        if (this.open) this.computePosition();
      });
    }
  }

  ngOnDestroy(): void {
    this.unregisterWindowListeners();
  }

  computePosition(): void {
    if (!this.trigger) return;
    if (typeof window === "undefined") return;
    const rect = this.trigger.getBoundingClientRect();
    const pos = computeMenuPopoverPosition(
      { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width },
      this.placement,
      this.align,
      { height: window.innerHeight, scrollX: window.scrollX, scrollY: window.scrollY },
    );
    this.top = pos.top;
    this.left = pos.left;
    this.maxHeight = pos.maxHeight;
    this.alignEnd = pos.alignEnd;
    this.alignCenter = pos.alignCenter;
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
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
