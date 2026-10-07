import { defineComponent, h, nextTick, onUnmounted, ref, watch } from "vue";
import { classNames } from "./classNames.js";
import { Menu } from "./Menu.js";
import type { MenuItem } from "./Menu.js";

export type MenuPopoverPlacement = "top-start" | "top-end" | "bottom-start" | "bottom-end";
export type MenuPopoverAlign = "start" | "end" | "center";

export type MenuPopoverProps = {
  items?: MenuItem[];
  open?: boolean;
  /** Anchor element used for position computation and outside-click exclusion (Svelte-canonical). */
  trigger?: HTMLElement | null;
  placement?: MenuPopoverPlacement;
  align?: MenuPopoverAlign;
  /** Accessible name for the panel (Svelte-canonical: applied as aria-label on role="dialog"). */
  label?: string;
  class?: string;
  closeOnOutside?: boolean;
  closeOnEscape?: boolean;
};

export type { MenuItem };

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

function effectivePlacement(placement: MenuPopoverPlacement, flipped: boolean): MenuPopoverPlacement {
  if (!flipped) return placement;
  if (placement === "bottom-start") return "top-start";
  if (placement === "bottom-end") return "top-end";
  if (placement === "top-start") return "bottom-start";
  return "bottom-end";
}

export const MenuPopover = defineComponent({
  name: "MenuPopover",
  props: {
    items: { type: Array as () => MenuItem[], default: () => [] },
    open: { type: Boolean, default: undefined },
    trigger: { type: Object as unknown as () => HTMLElement | null, default: null },
    placement: { type: String as () => MenuPopoverPlacement, default: "bottom-start" },
    align: { type: String as () => MenuPopoverAlign | undefined, default: undefined },
    label: { type: String, default: undefined },
    class: { type: String, default: undefined },
    closeOnOutside: { type: Boolean, default: true },
    closeOnEscape: { type: Boolean, default: true },
  },
  emits: ["update:open"],
  setup(props, { emit, slots, attrs }) {
    const localOpen = ref(props.open ?? false);
    const panelRef = ref<HTMLElement | null>(null);

    const top = ref(0);
    const left = ref(0);
    const maxHeight = ref(0);
    const alignEnd = ref(false);
    const alignCenter = ref(false);
    // True once the requested vertical side no longer fits and the panel is
    // shown on the opposite side (flip). The placement class follows so the
    // existing translate transforms keep working.
    const flipped = ref(false);

    const isOpen = () => (props.open !== undefined ? props.open : localOpen.value);
    const setOpen = (value: boolean) => {
      if (props.open === undefined) localOpen.value = value;
      emit("update:open", value);
    };

    function computePosition() {
      const trigger = props.trigger;
      if (!trigger) return;
      // Viewport coordinates (getBoundingClientRect) with `position: fixed`:
      // no scroll offsets — the old document coordinates were wrong inside
      // any positioned ancestor and the panel was clipped by overflow
      // containers.
      const rect = trigger.getBoundingClientRect();
      const verticalUp = props.placement === "top-start" || props.placement === "top-end";
      const horizontalEnd = props.placement === "bottom-end" || props.placement === "top-end";
      const resolvedAlign: MenuPopoverAlign = props.align ?? (horizontalEnd ? "end" : "start");

      alignEnd.value = resolvedAlign === "end";
      alignCenter.value = resolvedAlign === "center";

      const panelHeight = panelRef.value?.offsetHeight ?? 0;
      const panelWidth = panelRef.value?.offsetWidth ?? 0;
      const need = panelHeight > 0 ? panelHeight : MENU_POPOVER_MIN_HEIGHT;
      const spaceBelow = window.innerHeight - rect.bottom - MENU_POPOVER_GAP;
      const spaceAbove = rect.top - MENU_POPOVER_GAP;

      // Flip when the requested side cannot fit the panel and the other side
      // offers more room.
      let showUp = verticalUp;
      if (!verticalUp && spaceBelow < need && spaceAbove > spaceBelow) showUp = true;
      else if (verticalUp && spaceAbove < need && spaceBelow > spaceAbove) showUp = false;
      flipped.value = showUp !== verticalUp;

      if (showUp) {
        // Panel bottom edge sits above the trigger (transform handles the
        // flip); available space is what's ABOVE the trigger.
        top.value = rect.top - MENU_POPOVER_GAP;
        maxHeight.value = Math.max(rect.top - MENU_POPOVER_GAP - MENU_POPOVER_VIEWPORT_MARGIN, MENU_POPOVER_MIN_HEIGHT);
      } else {
        top.value = rect.bottom + MENU_POPOVER_GAP;
        // Space actually available BELOW the trigger — `max-height: 100vh`
        // alone ignores the panel's offset and overflows past the bottom edge.
        maxHeight.value = Math.max(
          window.innerHeight - rect.bottom - MENU_POPOVER_GAP - MENU_POPOVER_VIEWPORT_MARGIN,
          MENU_POPOVER_MIN_HEIGHT,
        );
      }

      // Reclamp horizontally so the measured panel stays inside the viewport.
      if (resolvedAlign === "end") {
        left.value = rect.right;
        if (panelWidth > 0) {
          left.value = Math.min(
            Math.max(left.value, panelWidth + MENU_POPOVER_VIEWPORT_MARGIN),
            window.innerWidth - MENU_POPOVER_VIEWPORT_MARGIN,
          );
        }
      } else if (resolvedAlign === "center") {
        left.value = rect.left + rect.width / 2;
        if (panelWidth > 0) {
          left.value = Math.min(
            Math.max(left.value, panelWidth / 2 + MENU_POPOVER_VIEWPORT_MARGIN),
            window.innerWidth - panelWidth / 2 - MENU_POPOVER_VIEWPORT_MARGIN,
          );
        }
      } else {
        left.value = rect.left;
        if (panelWidth > 0) {
          left.value = Math.min(
            Math.max(left.value, MENU_POPOVER_VIEWPORT_MARGIN),
            window.innerWidth - panelWidth - MENU_POPOVER_VIEWPORT_MARGIN,
          );
        }
      }
    }

    // Top layer: the element stays in place in the DOM (no portal to <body>)
    // so it keeps inheriting the theme's `--st-*` custom properties; the
    // Popover API only lifts rendering into the top layer, above overflow
    // clipping. Where the API is missing (jsdom), plain `position: fixed`
    // still applies.
    let popoverShown = false;
    // The node captured while open: the ref may already be unset when the
    // teardown runs (unmount), while this still points at the shown element.
    let shownEl: (HTMLElement & { hidePopover?: () => void }) | null = null;

    function showTopLayer() {
      const el = panelRef.value as (HTMLElement & { showPopover?: () => void }) | null;
      if (!el || popoverShown) return;
      if (typeof el.showPopover !== "function") return;
      // The attribute is set ONLY here (never statically in markup):
      // environments without the API (jsdom) hide every [popover] element
      // via the UA rule, so a static attribute would force display:none.
      el.setAttribute("popover", "manual");
      try {
        el.showPopover();
        popoverShown = true;
        shownEl = el;
      } catch {
        el.removeAttribute("popover");
        // Already open or not ready — fixed positioning still applies.
      }
    }

    function hideTopLayer() {
      const el = shownEl ?? (panelRef.value as (HTMLElement & { hidePopover?: () => void }) | null);
      shownEl = null;
      popoverShown = false;
      if (!el || typeof el.hidePopover !== "function") return;
      try {
        el.hidePopover();
      } catch {
        // Already hidden — nothing to do.
      } finally {
        el.removeAttribute("popover");
      }
    }

    let stopPositionTracking: (() => void) | null = null;
    let stopCloseHandlers: (() => void) | null = null;

    const teardown = () => {
      hideTopLayer();
      stopPositionTracking?.();
      stopPositionTracking = null;
      stopCloseHandlers?.();
      stopCloseHandlers = null;
    };

    watch(
      () => isOpen(),
      (openNow) => {
        teardown();
        if (!openNow) return;

        computePosition();
        // The panel node only exists after render (the immediate watch fires
        // during setup): show + re-measure on the next tick, once laid out.
        nextTick(() => {
          if (!isOpen()) return;
          computePosition();
          showTopLayer();
        });
        // Re-measure once the panel is laid out (size known for flip/clamp).
        if (typeof requestAnimationFrame === "function") {
          requestAnimationFrame(() => {
            if (isOpen()) computePosition();
          });
        }
        const onScroll = () => computePosition();
        const onResize = () => computePosition();
        window.addEventListener("scroll", onScroll, true);
        window.addEventListener("resize", onResize);
        stopPositionTracking = () => {
          window.removeEventListener("scroll", onScroll, true);
          window.removeEventListener("resize", onResize);
        };

        const onPointerDown = (event: PointerEvent) => {
          if (!props.closeOnOutside) return;
          if (menuPopoverIsWithin(event, panelRef.value)) return;
          if (menuPopoverIsWithin(event, props.trigger)) return;
          setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
          if (!props.closeOnEscape) return;
          if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
          }
        };
        window.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("keydown", onKeyDown);
        stopCloseHandlers = () => {
          window.removeEventListener("pointerdown", onPointerDown);
          window.removeEventListener("keydown", onKeyDown);
        };
      },
      { immediate: true },
    );

    onUnmounted(teardown);

    return () => {
      if (!isOpen()) return null;

      const style: Record<string, string> = { top: `${top.value}px`, left: `${left.value}px` };
      if (maxHeight.value) style.maxHeight = `${maxHeight.value}px`;

      return h(
        "div",
        {
          ...attrs,
          ref: panelRef,
          role: "dialog",
          "aria-label": props.label,
          // No static popover attribute: set imperatively by showTopLayer()
          // only where the Popover API exists.
          class: classNames(
            "st-menuPopover",
            `st-menuPopover--${effectivePlacement(props.placement, flipped.value)}`,
            alignEnd.value ? "st-menuPopover--alignEnd" : null,
            alignCenter.value ? "st-menuPopover--alignCenter" : null,
            props.class,
          ),
          style,
        },
        props.items && props.items.length ? h(Menu, { items: props.items, role: "presentation" }) : slots.default?.(),
      );
    };
  },
});
