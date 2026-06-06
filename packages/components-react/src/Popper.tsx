import React from "react";
import { classNames } from "./classNames.js";
import { Portal } from "./Portal.js";

export type PopperStrategy = "absolute" | "fixed";

export type PopperPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "left-start"
  | "left-end"
  | "right-start"
  | "right-end";

export type PopperSide = "top" | "bottom" | "left" | "right";
export type PopperAlign = "start" | "center" | "end";

export type PopperProps = {
  /** Reference element the panel is positioned against. */
  anchor: HTMLElement | null;
  /** Controlled open state. When false (or no anchor) nothing renders. */
  open?: boolean;
  /** Wanted placement of the panel relative to the anchor. */
  placement?: PopperPlacement;
  /** Main-axis distance (px) between the anchor and the panel. */
  offset?: number;
  /** Flip to the opposite side when the panel would overflow the viewport. */
  flip?: boolean;
  /** Shift along the cross axis to keep the panel within the viewport. */
  shift?: boolean;
  /** Expose a positioned arrow element. */
  arrow?: boolean;
  /** CSS positioning strategy. */
  strategy?: PopperStrategy;
  /** Render the panel into `document.body` via a Portal. */
  portal?: boolean;
  /** Optional class applied to the floating panel. */
  className?: string;
  /** Notified whenever the resolved placement changes (after flip). */
  onPlacementChange?: (placement: PopperPlacement) => void;
  /**
   * (a11y, opt-in) When true, traps keyboard focus inside the panel while it
   * is open (Tab cycles through focusable children; Shift+Tab cycles backward).
   * Intended for modal overlays built on top of Popper. Non-modal usage (menus,
   * tooltips) should leave this false (default) to keep the natural tab order.
   */
  trapFocus?: boolean;
  /**
   * (a11y) When true (default when open), pressing Escape calls `onClose` so
   * the consumer can set `open = false`. Set to false to suppress this behavior.
   */
  closeOnEscape?: boolean;
  /**
   * Called when the panel requests closing (Escape key).
   * The consumer is responsible for updating `open` in response.
   */
  onClose?: () => void;
  children?: React.ReactNode;
};

/** Split a placement into its side and (optional) alignment. */
export function splitPlacement(placement: PopperPlacement): {
  side: PopperSide;
  align: PopperAlign;
} {
  const [side, align] = placement.split("-") as [PopperSide, PopperAlign?];
  return { side, align: align ?? "center" };
}

/** Recompose a side + alignment into a placement string. */
export function joinPlacement(side: PopperSide, align: PopperAlign): PopperPlacement {
  return (align === "center" ? side : `${side}-${align}`) as PopperPlacement;
}

const OPPOSITE: Record<PopperSide, PopperSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

export type Rect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

/**
 * Pure geometry: compute the panel coordinates (in the chosen strategy's
 * coordinate space) given the anchor rect, the panel size, and options.
 * Returns the resolved placement (after flip) and the top/left coordinates,
 * plus the arrow offset along the main edge.
 *
 * Coordinates are viewport-relative; callers add scroll offsets for the
 * `absolute` strategy. No DOM access here — safe to unit test.
 */
export function computePosition(
  anchorRect: Rect,
  panelWidth: number,
  panelHeight: number,
  options: {
    placement: PopperPlacement;
    offset: number;
    flip: boolean;
    shift: boolean;
    viewportWidth: number;
    viewportHeight: number;
  },
): { placement: PopperPlacement; top: number; left: number } {
  const { offset, flip, shift, viewportWidth, viewportHeight } = options;
  let { side, align } = splitPlacement(options.placement);

  const place = (s: PopperSide, a: PopperAlign) => {
    let top = 0;
    let left = 0;
    if (s === "top" || s === "bottom") {
      top = s === "top" ? anchorRect.top - panelHeight - offset : anchorRect.bottom + offset;
      if (a === "start") left = anchorRect.left;
      else if (a === "end") left = anchorRect.right - panelWidth;
      else left = anchorRect.left + anchorRect.width / 2 - panelWidth / 2;
    } else {
      left = s === "left" ? anchorRect.left - panelWidth - offset : anchorRect.right + offset;
      if (a === "start") top = anchorRect.top;
      else if (a === "end") top = anchorRect.bottom - panelHeight;
      else top = anchorRect.top + anchorRect.height / 2 - panelHeight / 2;
    }
    return { top, left };
  };

  // Flip: if the panel overflows on the chosen side, try the opposite side.
  if (flip) {
    const candidate = place(side, align);
    const overflows =
      (side === "top" && candidate.top < 0) ||
      (side === "bottom" && candidate.top + panelHeight > viewportHeight) ||
      (side === "left" && candidate.left < 0) ||
      (side === "right" && candidate.left + panelWidth > viewportWidth);
    if (overflows) {
      const flipped = OPPOSITE[side];
      const flippedPos = place(flipped, align);
      const flippedOverflows =
        (flipped === "top" && flippedPos.top < 0) ||
        (flipped === "bottom" && flippedPos.top + panelHeight > viewportHeight) ||
        (flipped === "left" && flippedPos.left < 0) ||
        (flipped === "right" && flippedPos.left + panelWidth > viewportWidth);
      // Only flip if the opposite side fits better.
      if (!flippedOverflows) side = flipped;
    }
  }

  let { top, left } = place(side, align);

  // Shift: clamp along the cross axis so the panel stays in the viewport.
  if (shift) {
    if (side === "top" || side === "bottom") {
      const max = Math.max(0, viewportWidth - panelWidth);
      left = Math.min(Math.max(0, left), max);
    } else {
      const max = Math.max(0, viewportHeight - panelHeight);
      top = Math.min(Math.max(0, top), max);
    }
  }

  return { placement: joinPlacement(side, align), top, left };
}

const FOCUSABLE_POPPER_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(",");

function getFocusablePopper(container: HTMLElement): HTMLElement[] {
  if (typeof window === "undefined") return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_POPPER_SELECTOR),
  ).filter((el) => !el.closest("[disabled]"));
}

/**
 * Float a panel next to an anchor element. Positioning is recomputed on open,
 * scroll, and resize via `computePosition` (pure geometry shared across
 * frameworks). Renders nothing unless `open` and an `anchor` are provided.
 * SSR-safe: all DOM access happens inside effects.
 */
export function Popper({
  anchor,
  open = false,
  placement = "bottom",
  offset = 8,
  flip = true,
  shift = true,
  arrow = false,
  strategy = "absolute",
  portal = true,
  className,
  onPlacementChange,
  trapFocus = false,
  closeOnEscape = true,
  onClose,
  children,
}: PopperProps): React.ReactElement | null {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = React.useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  // Placement actually applied (may differ from the requested `placement`
  // after a flip). Defaults to the requested placement.
  const [resolvedPlacement, setResolvedPlacement] =
    React.useState<PopperPlacement>(placement);

  // Keep latest callbacks without re-registering listeners.
  const onPlacementChangeRef = React.useRef(onPlacementChange);
  onPlacementChangeRef.current = onPlacementChange;
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!open || !anchor) return;

    const reposition = () => {
      const panel = panelRef.current;
      if (!panel) return;

      const anchorRect = anchor.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();

      const result = computePosition(
        {
          top: anchorRect.top,
          left: anchorRect.left,
          right: anchorRect.right,
          bottom: anchorRect.bottom,
          width: anchorRect.width,
          height: anchorRect.height,
        },
        panelRect.width,
        panelRect.height,
        {
          placement,
          offset,
          flip,
          shift,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
        },
      );

      // `absolute` is positioned relative to the document, so add scroll
      // offsets. `fixed` is viewport-relative, so coordinates are used as-is.
      if (strategy === "absolute") {
        setCoords({ top: result.top + window.scrollY, left: result.left + window.scrollX });
      } else {
        setCoords({ top: result.top, left: result.left });
      }

      setResolvedPlacement((prev) => {
        if (result.placement !== prev) {
          onPlacementChangeRef.current?.(result.placement);
        }
        return result.placement;
      });
    };

    reposition();

    const onScroll = () => reposition();
    const onResize = () => reposition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [anchor, open, placement, offset, flip, shift, strategy]);

  // ─── a11y: capture pre-focus element + restore on close (trapFocus only) ───
  // Use a ref (not state) so writes inside effects don't cause re-runs.
  const preFocusElRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (open && anchor) {
      if (trapFocus) {
        preFocusElRef.current = document.activeElement as HTMLElement | null;
      }
    } else {
      // Panel just closed: restore focus only if trapFocus was active.
      if (
        trapFocus &&
        preFocusElRef.current &&
        typeof preFocusElRef.current.focus === "function" &&
        document.contains(preFocusElRef.current)
      ) {
        preFocusElRef.current.focus();
      }
      preFocusElRef.current = null;
    }
  }, [open, anchor, trapFocus]);

  // ─── a11y: move focus into the panel on open (trapFocus only) ─────────────
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!open || !trapFocus) return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = getFocusablePopper(panel);
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      panel.focus();
    }
  }, [open, trapFocus]);

  // ─── a11y: recapture focus that escapes the trap (focusin on document) ─────
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!open || !trapFocus) return;

    function handleFocusIn(e: FocusEvent) {
      const panel = panelRef.current;
      if (!panel) return;
      const target = e.target as Node | null;
      if (target && !panel.contains(target)) {
        const focusable = getFocusablePopper(panel);
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          panel.focus();
        }
      }
    }

    document.addEventListener("focusin", handleFocusIn);
    return () => document.removeEventListener("focusin", handleFocusIn);
  }, [open, trapFocus]);

  // ─── a11y: Escape on document (closeOnEscape) ─────────────────────────────
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!open || !closeOnEscape) return;

    function handleDocKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current?.();
      }
    }

    document.addEventListener("keydown", handleDocKeydown);
    return () => document.removeEventListener("keydown", handleDocKeydown);
  }, [open, closeOnEscape]);

  /** Keyboard handler attached to the panel for Tab-trap cycling. */
  function handlePanelKeydown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (typeof window === "undefined") return;
    if (e.key !== "Tab" || !trapFocus) return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = getFocusablePopper(panel);
    if (focusable.length === 0) { e.preventDefault(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  if (!open || !anchor) return null;

  const side = splitPlacement(resolvedPlacement).side;
  const panelStyle: React.CSSProperties = {
    position: strategy,
    top: `${coords.top}px`,
    left: `${coords.left}px`,
  };

  const floating = (
    <div
      ref={panelRef}
      className={classNames("st-popper", className)}
      data-popper-placement={resolvedPlacement}
      style={panelStyle}
      tabIndex={trapFocus ? -1 : undefined}
      onKeyDown={trapFocus ? handlePanelKeydown : undefined}
    >
      {children}
      {arrow ? (
        <span className="st-popper__arrow" data-popper-side={side} aria-hidden="true" />
      ) : null}
    </div>
  );

  if (portal) {
    return <Portal target="body">{floating}</Portal>;
  }

  return floating;
}

Popper.displayName = "Popper";
