import type { CSSProperties, HTMLAttributes } from "preact";
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import { useControlled } from "./internal.js";
import { Menu, treeHasCascade, type MenuActionItem, type MenuItem, type MenuSubmenuSide } from "./Menu.js";
import { MenuHostContext, type MenuHostCloseOptions, type MenuHostContextValue } from "./menu-cascade.js";
import type { ComponentChildren } from "./runtime.js";
import { unwrap, useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type MenuPopoverPlacement = "top-start" | "top-end" | "bottom-start" | "bottom-end";
export type MenuPopoverAlign = "start" | "end" | "center";

// Anchor spacing between panel and trigger.
const MENU_POPOVER_GAP = 4;
// Anti-overflow margin between the panel and the viewport edge.
const MENU_POPOVER_VIEWPORT_MARGIN = 8;
// Height floor: below this threshold we keep a usable scrollable window
// rather than a crushed menu (rare case of a trigger glued to the edge).
const MENU_POPOVER_MIN_HEIGHT = 160;

function menuPopoverIsWithin(event: Event, node: Element | null | undefined): boolean {
  if (!node) return false;
  const path =
    typeof (event as Event & { composedPath?: () => EventTarget[] }).composedPath === "function"
      ? (event as Event & { composedPath: () => EventTarget[] }).composedPath()
      : [];
  if (path.includes(node)) return true;
  const target = event.target as Node | null;
  return Boolean(target && node.contains(target));
}

export type MenuPopoverProps = Omit<HTMLAttributes<HTMLDivElement>, "className" | "onSelect"> & {
  /** Bindable in Svelte; controlled here via `open`+`onOpenChange`, uncontrolled via `defaultOpen`. */
  open?: MaybeSignal<boolean>;
  defaultOpen?: MaybeSignal<boolean>;
  onOpenChange?: (open: boolean) => void;
  /** Anchor element used for position computation and outside-click exclusion (Svelte-canonical). */
  trigger?: HTMLElement | null;
  placement?: MenuPopoverPlacement;
  align?: MenuPopoverAlign;
  /** Accessible name for the panel (Svelte-canonical: applied as aria-label on role="dialog"). */
  label?: string;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
  closeOnOutside?: MaybeSignal<boolean>;
  closeOnEscape?: MaybeSignal<boolean>;
  /** Convenience (not in the Svelte contract): renders a <Menu> from `items` instead of `children`. */
  items?: MenuItem[];
  /** Leaf relay for the `items` mode (host relay, §2.3): first argument
   * unchanged, `path` second; flat menus call with a single argument. */
  onSelect?: (item: MenuActionItem, path?: string[]) => void;
  /** Forwarded to the inner `Menu` in `items` mode. */
  submenuSide?: MenuSubmenuSide;
};

function menuPopoverEffectivePlacement(
  placement: MenuPopoverPlacement,
  flipped: boolean
): MenuPopoverPlacement {
  if (!flipped) return placement;
  if (placement === "bottom-start") return "top-start";
  if (placement === "bottom-end") return "top-end";
  if (placement === "top-start") return "bottom-start";
  return "bottom-end";
}

let menuPopoverInstanceCounter = 0;

export function MenuPopover({
  open: openInput,
  defaultOpen: defaultOpenInput = false,
  onOpenChange,
  trigger = null,
  placement = "bottom-start",
  align,
  label,
  className,
  closeOnOutside: closeOnOutsideInput = true,
  closeOnEscape: closeOnEscapeInput = true,
  items = [],
  onSelect,
  submenuSide,
  children,
  ...rest
}: MenuPopoverProps) {
  const defaultOpen = unwrap(defaultOpenInput) ?? false;
  const closeOnOutside = useValue(closeOnOutsideInput) ?? true;
  const closeOnEscape = useValue(closeOnEscapeInput) ?? true;
  const [open, setOpen] = useControlled(useValue(openInput), defaultOpen, onOpenChange);
  const rootMenuIdRef = useRef("");
  if (rootMenuIdRef.current === "") {
    menuPopoverInstanceCounter += 1;
    rootMenuIdRef.current = `st-menupopover-${menuPopoverInstanceCounter}`;
  }
  const rootMenuId = rootMenuIdRef.current;
  // Reported by an inner `Menu` in `children` mode via the host context and
  // reset when items lose their cascade: Esc returns focus to the trigger
  // for cascade menus only, flat menus keep their previous behaviour (§3.6).
  const [reportedCascade, setReportedCascade] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, maxHeight: 0, alignEnd: false, alignCenter: false, flipped: false });
  const popoverShownRef = useRef(false);

  const itemsCascade = items.length > 0 ? treeHasCascade(items) : false;
  const cascade = itemsCascade || reportedCascade;

  const requestClose = useCallback(
    (options: MenuHostCloseOptions) => {
      setOpen(false);
      if (options.focusTrigger) trigger?.focus();
    },
    [trigger, setOpen]
  );

  const hostContext = useMemo<MenuHostContextValue>(
    () => ({ rootMenuId, requestClose, setHasCascade: setReportedCascade }),
    [rootMenuId, requestClose]
  );

  // The host generates the root menu id and sets `aria-controls` on its
  // trigger, including an external trigger element passed as prop (§2.2, D10).
  useEffect(() => {
    if (!open || !trigger) return;
    trigger.setAttribute("aria-controls", rootMenuId);
    const owned = trigger;
    return () => {
      owned.removeAttribute("aria-controls");
    }
  }, [open, trigger, rootMenuId]);

  function handleMenuSelect(item: MenuActionItem, path?: string[]) {
    // Menu invokes the leaf callback before relaying selection.
    if (cascade) onSelect?.(item, path);
    else onSelect?.(item);
    // Cascade selection closes through Menu.requestClose, which also handles
    // keyboard focus return. Flat menus keep the legacy host close path.
    if (!cascade) setOpen(false);
  }

  const computePosition = useCallback(() => {
    if (!trigger) return;
    // Viewport coordinates (getBoundingClientRect) with `position: fixed`:
    // no scroll offsets — the old document coordinates were wrong inside any
    // positioned ancestor and the panel was clipped by overflow containers.
    const rect = trigger.getBoundingClientRect();
    const verticalUp = placement === "top-start" || placement === "top-end";
    const horizontalEnd = placement === "bottom-end" || placement === "top-end";
    const resolvedAlign: MenuPopoverAlign = align ?? (horizontalEnd ? "end" : "start");
    const alignEnd = resolvedAlign === "end";
    const alignCenter = resolvedAlign === "center";

    const panelHeight = panelRef.current?.offsetHeight ?? 0;
    const panelWidth = panelRef.current?.offsetWidth ?? 0;
    const need = panelHeight > 0 ? panelHeight : MENU_POPOVER_MIN_HEIGHT;
    const spaceBelow = window.innerHeight - rect.bottom - MENU_POPOVER_GAP;
    const spaceAbove = rect.top - MENU_POPOVER_GAP;

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
      top = rect.top - MENU_POPOVER_GAP;
      maxHeight = Math.max(rect.top - MENU_POPOVER_GAP - MENU_POPOVER_VIEWPORT_MARGIN, MENU_POPOVER_MIN_HEIGHT);
    } else {
      top = rect.bottom + MENU_POPOVER_GAP;
      // Space actually available BELOW the trigger — `max-height: 100vh` alone
      // ignores the panel's offset and overflows past the bottom edge.
      maxHeight = Math.max(
        window.innerHeight - rect.bottom - MENU_POPOVER_GAP - MENU_POPOVER_VIEWPORT_MARGIN,
        MENU_POPOVER_MIN_HEIGHT
      );
    }

    // Reclamp horizontally so the measured panel stays inside the viewport.
    let left: number;
    if (resolvedAlign === "end") {
      left = rect.right;
      if (panelWidth > 0) left = Math.min(Math.max(left, panelWidth + MENU_POPOVER_VIEWPORT_MARGIN), window.innerWidth - MENU_POPOVER_VIEWPORT_MARGIN);
    } else if (resolvedAlign === "center") {
      left = rect.left + rect.width / 2;
      if (panelWidth > 0) {
        left = Math.min(
          Math.max(left, panelWidth / 2 + MENU_POPOVER_VIEWPORT_MARGIN),
          window.innerWidth - panelWidth / 2 - MENU_POPOVER_VIEWPORT_MARGIN
        );
      }
    } else {
      left = rect.left;
      if (panelWidth > 0) left = Math.min(Math.max(left, MENU_POPOVER_VIEWPORT_MARGIN), window.innerWidth - panelWidth - MENU_POPOVER_VIEWPORT_MARGIN);
    }

    setPos({ top, left, maxHeight, alignEnd, alignCenter, flipped });
  }, [trigger, placement, align]);

  // Top layer: the element stays in place in the DOM (no portal to <body>)
  // so it keeps inheriting the theme's `--st-*` custom properties; the
  // Popover API only lifts rendering into the top layer, above overflow
  // clipping. Where the API is missing (jsdom), plain `position: fixed`
  // still applies.
  const showTopLayer = useCallback(() => {
    const el = panelRef.current as (HTMLDivElement & { showPopover?: () => void }) | null;
    if (!el || popoverShownRef.current) return;
    if (typeof el.showPopover !== "function") return;
    // The attribute is set ONLY here (never statically in markup):
    // environments without the API (jsdom) hide every [popover] element via
    // the UA rule, so a static attribute would force display:none under test.
    el.setAttribute("popover", "manual");
    try {
      el.showPopover();
      popoverShownRef.current = true;
    } catch {
      el.removeAttribute("popover");
      // Already open or not ready — fixed positioning still applies.
    }
  }, []);

  const hideTopLayer = useCallback(
    (elOverride?: (HTMLDivElement & { hidePopover?: () => void }) | null) => {
      // The ref may already be detached when the cleanup runs (unmount or
      // close re-render): callers pass the element captured while open.
      const el = (elOverride ?? panelRef.current) as
        | (HTMLDivElement & { hidePopover?: () => void })
        | null;
      popoverShownRef.current = false;
      if (!el || typeof el.hidePopover !== "function") return;
      try {
        el.hidePopover();
      } catch {
        // Already hidden — nothing to do.
      } finally {
        el.removeAttribute("popover");
      }
    },
    []
  );

  useEffect(() => {
    if (!open) return;
    computePosition();
    showTopLayer();
    // Capture the node while the ref is set: by cleanup time React may have
    // detached it already.
    const shownEl = panelRef.current;
    // Re-measure once the panel is laid out (size known for flip/clamp).
    let raf = 0;
    if (typeof requestAnimationFrame === "function") {
      raf = requestAnimationFrame(() => computePosition());
    }
    const onScroll = () => computePosition();
    const onResize = () => computePosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      hideTopLayer(shownEl);
    }
  }, [open, computePosition, showTopLayer, hideTopLayer]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      // A nested menu level already consumed this event (D4).
      if (event.defaultPrevented) return;
      if (!closeOnOutside) return;
      if (menuPopoverIsWithin(event, panelRef.current)) return;
      if (menuPopoverIsWithin(event, trigger)) return;
      setOpen(false);
    }
    const onKeyDown = (event: KeyboardEvent) => {
      // A nested menu level already consumed this key (D4).
      if (event.defaultPrevented) return;
      if (!closeOnEscape) return;
      if (event.key === "Escape") {
        event.preventDefault();
        // Keyboard closes return focus to the trigger for cascade menus
        // only (the inner Menu reports and resets `hasCascade`, §3.6).
        requestClose({ focusTrigger: cascade });
      }
    }
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    }
  }, [open, closeOnOutside, closeOnEscape, trigger, setOpen, requestClose, cascade]);

  if (!open) return null;

  const style: CSSProperties = { top: `${pos.top}px`, left: `${pos.left}px` }
  if (pos.maxHeight) style.maxHeight = `${pos.maxHeight}px`;

  return (
    <div
      {...rest}
      ref={panelRef}
      className={classNames(
        "st-menuPopover",
        cascade && "st-menuPopover--hasCascade",
        `st-menuPopover--${menuPopoverEffectivePlacement(placement, pos.flipped)}`,
        pos.alignEnd ? "st-menuPopover--alignEnd" : null,
        pos.alignCenter ? "st-menuPopover--alignCenter" : null,
        className
      )}
      role="dialog"
      aria-label={label}
      // No static popover attribute: set imperatively by showTopLayer() only
      // where the Popover API exists.
      style={style}
    >
      <MenuHostContext.Provider value={hostContext}>
        {items.length ? (
          // D-A1: the items-mode inner menu is `role="presentation"` for flat
          // menus and `role="menu"` when `children` are present.
          <Menu
            items={items}
            aria-label={label}
            role={itemsCascade ? "menu" : "presentation"}
            onSelect={handleMenuSelect}
            submenuSide={submenuSide}
          />
        ) : (
          children
        )}
      </MenuHostContext.Provider>
    </div>
  );
}
