<script lang="ts" module>
  import type { Snippet } from "svelte";
  import Portal from "./Portal.svelte";

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
    class?: string;
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
     * Called when the panel requests closing (Escape key, or future outside-click).
     * The consumer is responsible for updating `open` in response.
     */
    onClose?: () => void;
    children?: Snippet;
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
    right: "left"
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
    }
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
</script>

<script lang="ts">
  import { untrack } from "svelte";

  let {
    anchor,
    open = false,
    placement = "bottom",
    offset = 8,
    flip = true,
    shift = true,
    arrow = false,
    strategy = "absolute",
    portal = true,
    class: className,
    onPlacementChange,
    trapFocus = false,
    closeOnEscape = true,
    onClose,
    children
  }: PopperProps = $props();

  let panel = $state<HTMLDivElement | undefined>();
  let top = $state(0);
  let left = $state(0);
  // Placement actually applied (may differ from the requested `placement`
  // after a flip). Initialised lazily; defaults to the requested placement.
  let flippedPlacement = $state<PopperPlacement | undefined>();
  const resolvedPlacement = $derived(flippedPlacement ?? placement);

  function reposition() {
    if (typeof window === "undefined") return;
    if (!open || !anchor || !panel) return;

    const anchorRect = anchor.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();

    const result = computePosition(
      {
        top: anchorRect.top,
        left: anchorRect.left,
        right: anchorRect.right,
        bottom: anchorRect.bottom,
        width: anchorRect.width,
        height: anchorRect.height
      },
      panelRect.width,
      panelRect.height,
      {
        placement,
        offset,
        flip,
        shift,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      }
    );

    // `absolute` is positioned relative to the document, so add scroll offsets.
    // `fixed` is viewport-relative, so coordinates are used as-is.
    if (strategy === "absolute") {
      top = result.top + window.scrollY;
      left = result.left + window.scrollX;
    } else {
      top = result.top;
      left = result.left;
    }

    if (result.placement !== resolvedPlacement) {
      flippedPlacement = result.placement;
      onPlacementChange?.(result.placement);
    }
  }

  $effect(() => {
    // Client-only: register listeners and compute the position once mounted.
    if (typeof window === "undefined") return;
    if (!open || !anchor || !panel) return;

    reposition();

    const onScroll = () => reposition();
    const onResize = () => reposition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  });

  // ─── a11y: focus management ────────────────────────────────────────────────
  // Capture the element that had focus before the panel opened so we can
  // restore it when the panel closes (only when trapFocus is active).
  // SSR-safe (guarded by typeof window).
  // Use a plain variable (not $state) so reads inside the effect are not
  // tracked and don't cause the effect to re-run on every preFocusEl write.
  let preFocusEl: HTMLElement | null = null;

  $effect(() => {
    if (typeof window === "undefined") return;
    if (open && anchor) {
      untrack(() => {
        // Snapshot the active element at open time only when trapFocus is active,
        // so restoreFocus doesn't steal focus on non-modal usage.
        if (trapFocus) {
          preFocusEl = document.activeElement as HTMLElement | null;
        }
      });
    } else {
      // Panel just closed: restore focus only if trapFocus was active and the
      // original element is still connected to the DOM.
      untrack(() => {
        if (
          trapFocus &&
          preFocusEl &&
          typeof preFocusEl.focus === "function" &&
          document.contains(preFocusEl)
        ) {
          preFocusEl.focus();
        }
        preFocusEl = null;
      });
    }
  });

  /** Returns all keyboard-focusable children of `container`. */
  function getFocusable(container: HTMLElement): HTMLElement[] {
    if (typeof window === "undefined") return [];
    return Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),' +
        'textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[contenteditable="true"]'
      )
    ).filter((el) => !el.closest("[disabled]"));
  }

  // ─── a11y: move focus into the panel on open (trapFocus only) ─────────────
  $effect(() => {
    if (typeof window === "undefined") return;
    if (!open || !trapFocus || !panel) return;
    // Wait for the panel to be mounted before moving focus.
    untrack(() => {
      const focusable = getFocusable(panel!);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        // If no focusable children, focus the panel itself so Escape works.
        panel!.focus();
      }
    });
  });

  // ─── a11y: recapture focus that escapes the trap (focusin on document) ─────
  $effect(() => {
    if (typeof window === "undefined") return;
    if (!open || !trapFocus) return;

    function handleFocusIn(e: FocusEvent) {
      if (!panel) return;
      const target = e.target as Node | null;
      // If focus landed outside the panel, bring it back to the first focusable.
      if (target && !panel.contains(target)) {
        const focusable = getFocusable(panel);
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          panel.focus();
        }
      }
    }

    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
    };
  });

  // ─── a11y: Escape on document (closeOnEscape) ─────────────────────────────
  // Listen on document so the Escape shortcut works even when focus is outside
  // the panel (e.g. before the first Tab, or in an edge case where focus escaped).
  $effect(() => {
    if (typeof window === "undefined") return;
    if (!open || !closeOnEscape) return;

    function handleDocKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      }
    }

    document.addEventListener("keydown", handleDocKeydown);
    return () => {
      document.removeEventListener("keydown", handleDocKeydown);
    };
  });

  /** Keyboard handler attached to the panel for Tab-trap cycling. */
  function handlePanelKeydown(e: KeyboardEvent) {
    if (typeof window === "undefined") return;

    // Tab trap: cycle focus within the panel.
    if (e.key === "Tab" && trapFocus && panel) {
      const focusable = getFocusable(panel);
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
  }

  const panelStyle = () =>
    `position: ${strategy}; top: ${top}px; left: ${left}px;`;
  const panelSide = () => splitPlacement(resolvedPlacement).side;
</script>

{#snippet floating()}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    bind:this={panel}
    class={className ? `st-popper ${className}` : "st-popper"}
    data-popper-placement={resolvedPlacement}
    style={panelStyle()}
    tabindex={trapFocus ? -1 : undefined}
    onkeydown={trapFocus ? handlePanelKeydown : undefined}
  >
    {@render children?.()}
    {#if arrow}
      <span
        class="st-popper__arrow"
        data-popper-side={panelSide()}
        aria-hidden="true"
      ></span>
    {/if}
  </div>
{/snippet}

{#if open && anchor}
  {#if portal}
    <Portal target="body">
      {@render floating()}
    </Portal>
  {:else}
    {@render floating()}
  {/if}
{/if}

<style>
  .st-popper {
    z-index: var(--st-component-popover-zIndex, 80);
  }

  .st-popper__arrow {
    position: absolute;
    width: 0.5rem;
    height: 0.5rem;
    background: inherit;
    border: inherit;
    transform: rotate(45deg);
    pointer-events: none;
  }

  .st-popper__arrow[data-popper-side="bottom"] {
    top: -0.25rem;
    left: 50%;
    margin-left: -0.25rem;
  }

  .st-popper__arrow[data-popper-side="top"] {
    bottom: -0.25rem;
    left: 50%;
    margin-left: -0.25rem;
  }

  .st-popper__arrow[data-popper-side="right"] {
    left: -0.25rem;
    top: 50%;
    margin-top: -0.25rem;
  }

  .st-popper__arrow[data-popper-side="left"] {
    right: -0.25rem;
    top: 50%;
    margin-top: -0.25rem;
  }
</style>
