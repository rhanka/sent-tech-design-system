import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  Teleport,
  type PropType,
} from "vue";
import { classNames } from "./classNames.js";

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
  /** Render the panel into `document.body` via a Teleport. */
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

/** Returns all keyboard-focusable children of `container`. */
function getFocusable(container: HTMLElement): HTMLElement[] {
  if (typeof window === "undefined") return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),' +
      'textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[contenteditable="true"]',
    ),
  ).filter((el) => !el.closest("[disabled]"));
}

/**
 * Float a panel next to an anchor element. Positioning is recomputed on open,
 * scroll, and resize via `computePosition` (pure geometry shared across
 * frameworks). Renders nothing unless `open` and an `anchor` are provided.
 * SSR-safe: all DOM access happens inside `onMounted` / watchers.
 *
 * A11y: optional `trapFocus` traps keyboard focus inside the panel (Tab/Shift+Tab
 * cycle, Escape calls `onClose`, focus restored to the pre-open element on close).
 */
export const Popper = defineComponent({
  name: "Popper",
  props: {
    anchor: {
      type: Object as PropType<HTMLElement | null>,
      default: null,
    },
    open: { type: Boolean, default: false },
    placement: { type: String as PropType<PopperPlacement>, default: "bottom" },
    offset: { type: Number, default: 8 },
    flip: { type: Boolean, default: true },
    shift: { type: Boolean, default: true },
    arrow: { type: Boolean, default: false },
    strategy: { type: String as PropType<PopperStrategy>, default: "absolute" },
    portal: { type: Boolean, default: true },
    class: { type: String, default: undefined },
    onPlacementChange: {
      type: Function as PropType<(placement: PopperPlacement) => void>,
      default: undefined,
    },
    trapFocus: { type: Boolean, default: false },
    closeOnEscape: { type: Boolean, default: true },
    onClose: {
      type: Function as PropType<() => void>,
      default: undefined,
    },
  },
  emits: {
    placementChange: (_placement: PopperPlacement) => true,
  },
  setup(props, { emit, slots }) {
    const panel = ref<HTMLElement | null>(null);
    const top = ref(0);
    const left = ref(0);
    // Placement actually applied (may differ from the requested `placement`
    // after a flip). Defaults to the requested placement.
    const resolvedPlacement = ref<PopperPlacement>(props.placement);

    // SSR-safe: capture the element that had focus before the panel opened.
    // Plain variable (not ref) so writes inside watch don't trigger re-runs.
    let preFocusEl: HTMLElement | null = null;

    function reposition() {
      if (typeof window === "undefined") return;
      if (!props.open || !props.anchor || !panel.value) return;

      const anchorRect = props.anchor.getBoundingClientRect();
      const panelRect = panel.value.getBoundingClientRect();

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
          placement: props.placement,
          offset: props.offset,
          flip: props.flip,
          shift: props.shift,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
        },
      );

      // `absolute` is positioned relative to the document, so add scroll
      // offsets. `fixed` is viewport-relative, so coordinates are used as-is.
      if (props.strategy === "absolute") {
        top.value = result.top + window.scrollY;
        left.value = result.left + window.scrollX;
      } else {
        top.value = result.top;
        left.value = result.left;
      }

      if (result.placement !== resolvedPlacement.value) {
        resolvedPlacement.value = result.placement;
        emit("placementChange", result.placement);
        props.onPlacementChange?.(result.placement);
      }
    }

    const onScroll = () => reposition();
    const onResize = () => reposition();
    let listening = false;

    function start() {
      if (typeof window === "undefined") return;
      if (!props.open || !props.anchor) return;
      resolvedPlacement.value = props.placement;
      reposition();
      if (!listening) {
        window.addEventListener("scroll", onScroll, true);
        window.addEventListener("resize", onResize);
        listening = true;
      }
    }

    function stop() {
      if (typeof window === "undefined") return;
      if (listening) {
        window.removeEventListener("scroll", onScroll, true);
        window.removeEventListener("resize", onResize);
        listening = false;
      }
    }

    // ─── a11y: focus management ──────────────────────────────────────────────
    // Escape sur document (closeOnEscape).
    let escapeCleanup: (() => void) | null = null;
    // focusin recapture (trapFocus).
    let focusinCleanup: (() => void) | null = null;

    function stopA11y() {
      escapeCleanup?.();
      escapeCleanup = null;
      focusinCleanup?.();
      focusinCleanup = null;
    }

    function startA11y() {
      if (typeof window === "undefined") return;
      if (!props.open) return;

      // Snapshot pre-focus element (trapFocus only).
      if (props.trapFocus) {
        preFocusEl = document.activeElement as HTMLElement | null;
        // Move focus into the panel after render.
        setTimeout(() => {
          if (!panel.value) return;
          const focusable = getFocusable(panel.value);
          if (focusable.length > 0) focusable[0].focus();
          else panel.value.focus();
        }, 0);
      }

      // Escape on document.
      if (props.closeOnEscape) {
        const handler = (e: KeyboardEvent) => {
          if (e.key === "Escape") {
            e.preventDefault();
            props.onClose?.();
          }
        };
        document.addEventListener("keydown", handler);
        escapeCleanup = () => document.removeEventListener("keydown", handler);
      }

      // focusin recapture (trapFocus only).
      if (props.trapFocus) {
        const handleFocusIn = (e: FocusEvent) => {
          if (!panel.value) return;
          const target = e.target as Node | null;
          if (target && !panel.value.contains(target)) {
            const focusable = getFocusable(panel.value);
            if (focusable.length > 0) focusable[0].focus();
            else panel.value.focus();
          }
        };
        document.addEventListener("focusin", handleFocusIn);
        focusinCleanup = () => document.removeEventListener("focusin", handleFocusIn);
      }
    }

    function stopFocusTrap() {
      stopA11y();
      // Restore focus only if trapFocus was active and element is still in DOM.
      if (
        props.trapFocus &&
        preFocusEl &&
        typeof preFocusEl.focus === "function" &&
        document.contains(preFocusEl)
      ) {
        preFocusEl.focus();
      }
      preFocusEl = null;
    }

    onMounted(start);

    watch(
      () => [props.open, props.anchor] as const,
      ([open]) => {
        stop();
        stopA11y();
        if (open) {
          start();
          startA11y();
        } else {
          stopFocusTrap();
        }
      },
    );

    watch(
      () => [props.placement, props.offset, props.flip, props.shift, props.strategy] as const,
      () => reposition(),
    );

    onBeforeUnmount(() => {
      stop();
      stopA11y();
      preFocusEl = null;
    });

    /** Keyboard handler attached to the panel for Tab-trap cycling. */
    function handlePanelKeydown(e: KeyboardEvent) {
      if (!props.trapFocus || !panel.value) return;
      if (e.key !== "Tab") return;
      const focusable = getFocusable(panel.value);
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

    return () => {
      if (!props.open || !props.anchor) return null;

      const side = splitPlacement(resolvedPlacement.value).side;
      const floating = h(
        "div",
        {
          ref: panel,
          class: classNames("st-popper", props.class),
          "data-popper-placement": resolvedPlacement.value,
          style: `position: ${props.strategy}; top: ${top.value}px; left: ${left.value}px;`,
          tabindex: props.trapFocus ? -1 : undefined,
          onKeydown: props.trapFocus ? handlePanelKeydown : undefined,
        },
        [
          slots.default?.(),
          props.arrow
            ? h("span", {
                class: "st-popper__arrow",
                "data-popper-side": side,
                "aria-hidden": "true",
              })
            : null,
        ],
      );

      if (props.portal) {
        return h(Teleport, { to: "body" }, floating);
      }
      return floating;
    };
  },
});
