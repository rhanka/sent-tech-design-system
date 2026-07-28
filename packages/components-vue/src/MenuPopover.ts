import { defineComponent, h, onUnmounted, ref, watch } from "vue";
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

    const isOpen = () => (props.open !== undefined ? props.open : localOpen.value);
    const setOpen = (value: boolean) => {
      if (props.open === undefined) localOpen.value = value;
      emit("update:open", value);
    };

    function computePosition() {
      const trigger = props.trigger;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const verticalUp = props.placement === "top-start" || props.placement === "top-end";
      const horizontalEnd = props.placement === "bottom-end" || props.placement === "top-end";
      const resolvedAlign: MenuPopoverAlign = props.align ?? (horizontalEnd ? "end" : "start");

      alignEnd.value = resolvedAlign === "end";
      alignCenter.value = resolvedAlign === "center";

      if (verticalUp) {
        // Panel bottom edge sits above the trigger (transform handles the
        // flip); available space is what's ABOVE the trigger.
        top.value = rect.top + window.scrollY - MENU_POPOVER_GAP;
        maxHeight.value = Math.max(rect.top - MENU_POPOVER_GAP - MENU_POPOVER_VIEWPORT_MARGIN, MENU_POPOVER_MIN_HEIGHT);
      } else {
        top.value = rect.bottom + window.scrollY + MENU_POPOVER_GAP;
        // Space actually available BELOW the trigger — `max-height: 100vh`
        // alone ignores the panel's offset and overflows past the bottom edge.
        maxHeight.value = Math.max(
          window.innerHeight - rect.bottom - MENU_POPOVER_GAP - MENU_POPOVER_VIEWPORT_MARGIN,
          MENU_POPOVER_MIN_HEIGHT,
        );
      }

      if (resolvedAlign === "end") {
        left.value = rect.right + window.scrollX;
      } else if (resolvedAlign === "center") {
        left.value = rect.left + window.scrollX + rect.width / 2;
      } else {
        left.value = rect.left + window.scrollX;
      }
    }

    let stopPositionTracking: (() => void) | null = null;
    let stopCloseHandlers: (() => void) | null = null;

    const teardown = () => {
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
          class: classNames(
            "st-menuPopover",
            `st-menuPopover--${props.placement}`,
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
