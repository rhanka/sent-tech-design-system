<script lang="ts">
let menuPopoverInstanceCounter = 0;
</script>

<script setup lang="ts">
import type { MenuLabelSlots } from './menu-label-slots.js';
import type { MenuPopoverPlacement, MenuPopoverAlign } from "./MenuPopover.js";
import { useAttrs, nextTick, onUnmounted, provide, ref, watch } from "vue";
import { Menu } from "./Menu.js";
import type { MenuActionItem, MenuItem } from "./Menu.js";
import { MENU_HOST_KEY, type SubMenuSide } from "./menu-cascade.js";

// Anchor spacing between panel and trigger.
const MENU_POPOVER_GAP = 4;
// Anti-overflow margin between the panel and the viewport edge.
const MENU_POPOVER_VIEWPORT_MARGIN = 8;
// Height floor: below this threshold we keep a usable scrollable window
// rather than a crushed menu (rare case of a trigger glued to the edge).
const MENU_POPOVER_MIN_HEIGHT = 160;

function menuPopoverIsWithin(
  event: Event,
  node: Element | null | undefined,
): boolean {
  if (!node) return false;
  const path =
    typeof (event as Event & { composedPath?: () => EventTarget[] })
      .composedPath === "function"
      ? (event as Event & { composedPath: () => EventTarget[] }).composedPath()
      : [];
  if (path.includes(node)) return true;
  const target = event.target as Node | null;
  return target instanceof Node && node.contains(target);
}

function effectivePlacement(
  placement: MenuPopoverPlacement,
  flipped: boolean,
): MenuPopoverPlacement {
  if (!flipped) return placement;
  if (placement === "bottom-start") return "top-start";
  if (placement === "bottom-end") return "top-end";
  if (placement === "top-start") return "bottom-start";
  return "bottom-end";
}

function treeHasCascade(list: MenuItem[]): boolean {
  for (const item of list) {
    const tagged = item as {
      type?: string;
      kind?: string;
      children?: MenuItem[];
      items?: MenuItem[];
    };
    const kind = tagged.type ?? tagged.kind;
    if (Array.isArray(tagged.children) && tagged.children.length > 0)
      return true;
    if (Array.isArray(tagged.children) && treeHasCascade(tagged.children))
      return true;
    if (
      kind === "group" &&
      Array.isArray(tagged.items) &&
      treeHasCascade(tagged.items)
    )
      return true;
  }
  return false;
}

defineSlots<MenuLabelSlots & { default?: () => unknown }>();

defineOptions({ name: "MenuPopover", inheritAttrs: false });
const props = defineProps({
  items: { type: Array as () => MenuItem[], default: () => [] },
  open: { type: Boolean, default: undefined },
  trigger: {
    type: Object as unknown as () => HTMLElement | null,
    default: null,
  },
  placement: {
    type: String as () => MenuPopoverPlacement,
    default: "bottom-start",
  },
  align: {
    type: String as () => MenuPopoverAlign | undefined,
    default: undefined,
  },
  label: { type: String, default: undefined },
  class: { type: String, default: undefined },
  closeOnOutside: { type: Boolean, default: true },
  closeOnEscape: { type: Boolean, default: true },
  submenuSide: { type: String as () => SubMenuSide, default: "auto" },
});
const emit = defineEmits(["update:open", "select"]);
const attrs = useAttrs();

const rootMenuId = `st-menupopover-${++menuPopoverInstanceCounter}`;
const localOpen = ref(props.open ?? false);
const panelRef = ref<HTMLElement | null>(null);
// Reported by the inner Menu via setHasCascade (and reset when items lose
// their cascade): Esc returns focus to the trigger for cascade menus
// only, flat menus keep their previous behaviour (§3.6, AC-01).
const hasCascade = ref(false);

function requestClose(options: { focusTrigger: boolean }) {
  setOpen(false);
  if (options.focusTrigger) {
    props.trigger?.focus();
  }
}

provide(MENU_HOST_KEY, {
  rootMenuId,
  requestClose,
  setHasCascade: (value: boolean) => {
    hasCascade.value = value;
  },
});

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

function handleMenuSelect(item: MenuActionItem, path?: string[]) {
  // Relay: first argument unchanged, path second for cascade leaves.
  // Flat menus keep the legacy single-argument call (AC-01).
  if (path !== undefined) {
    emit("select", item, path);
  } else {
    emit("select", item);
  }
  // Cascade close is owned by the inner Menu via requestClose (focus
  // depends on modality); flat leaves do not auto-close here (parity
  // with the Svelte fixture where the consumer closes).
}

function computePosition() {
  const trigger = props.trigger;
  if (!trigger) return;
  // Viewport coordinates (getBoundingClientRect) with `position: fixed`:
  // no scroll offsets — the old document coordinates were wrong inside
  // any positioned ancestor and the panel was clipped by overflow
  // containers.
  const rect = trigger.getBoundingClientRect();
  const verticalUp =
    props.placement === "top-start" || props.placement === "top-end";
  const horizontalEnd =
    props.placement === "bottom-end" || props.placement === "top-end";
  const resolvedAlign: MenuPopoverAlign =
    props.align ?? (horizontalEnd ? "end" : "start");

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
  if (!verticalUp && spaceBelow < need && spaceAbove > spaceBelow)
    showUp = true;
  else if (verticalUp && spaceAbove < need && spaceBelow > spaceAbove)
    showUp = false;
  flipped.value = showUp !== verticalUp;

  if (showUp) {
    // Panel bottom edge sits above the trigger (transform handles the
    // flip); available space is what's ABOVE the trigger.
    top.value = rect.top - MENU_POPOVER_GAP;
    maxHeight.value = Math.max(
      rect.top - MENU_POPOVER_GAP - MENU_POPOVER_VIEWPORT_MARGIN,
      MENU_POPOVER_MIN_HEIGHT,
    );
  } else {
    top.value = rect.bottom + MENU_POPOVER_GAP;
    // Space actually available BELOW the trigger — `max-height: 100vh`
    // alone ignores the panel's offset and overflows past the bottom edge.
    maxHeight.value = Math.max(
      window.innerHeight -
        rect.bottom -
        MENU_POPOVER_GAP -
        MENU_POPOVER_VIEWPORT_MARGIN,
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
  const el = panelRef.value as
    (HTMLElement & { showPopover?: () => void }) | null;
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
  const el =
    shownEl ??
    (panelRef.value as (HTMLElement & { hidePopover?: () => void }) | null);
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

// The host generates the root menu id and sets `aria-controls` on its
// trigger, including an external trigger element passed as prop (§2.2, D10).
watch(
  [() => isOpen(), () => props.trigger],
  ([openNow], _previous, onCleanup) => {
    const trigger = props.trigger;
    if (!trigger) return;
    if (!openNow) {
      trigger.removeAttribute("aria-controls");
      return;
    }
    trigger.setAttribute("aria-controls", rootMenuId);
    const owned = trigger;
    onCleanup(() => owned.removeAttribute("aria-controls"));
  },
  { immediate: true },
);

// When items change while open, the cascade flag must stay fresh so
// Esc focus-return follows the current tree (AC-01/M5 parity).
watch(
  () => props.items,
  (items) => {
    // If items lose/gain cascade externally (slot mode without inner
    // Menu reporting yet), keep a host-side fallback fresh. The inner
    // Menu reports via setHasCascade when it is present; this fallback
    // covers the transition before that report and keeps the flag
    // non-stale when the inner Menu unmounts.
    if (items && items.length > 0) {
      // Only overwrite when the inner Menu has not reported recently:
      // the inner Menu's immediate watch runs first, so this runs after.
      // We keep the reported value if it disagrees with a stale tree by
      // preferring the fresh computation here (same tree, same result).
      hasCascade.value = treeHasCascade(items);
    } else {
      hasCascade.value = false;
    }
  },
);

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
      // Detached instances (tests mounting without attachTo) never
      // own the global close and must not block attached hosts.
      if (panelRef.value && !panelRef.value.isConnected) return;
      // A nested menu level already consumed this event (D4).
      if (event.defaultPrevented) return;
      if (!props.closeOnOutside) return;
      if (menuPopoverIsWithin(event, panelRef.value)) return;
      if (menuPopoverIsWithin(event, props.trigger)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (panelRef.value && !panelRef.value.isConnected) return;
      // A nested menu level already consumed this key (D4).
      if (event.defaultPrevented) return;
      if (!props.closeOnEscape) return;
      if (event.key === "Escape") {
        event.preventDefault();
        // Keyboard closes return focus to the trigger for cascade menus
        // only, flat menus keep their previous behaviour (§3.6, AC-01).
        requestClose({ focusTrigger: hasCascade.value });
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
</script>
<template>
  <div
    v-if="isOpen()"
    v-bind="attrs"
    ref="panelRef"
    role="dialog"
    :aria-label="props.label"
    :class="[
      'st-menuPopover',
      'st-menuPopover--' + effectivePlacement(props.placement, flipped),
      {
        'st-menuPopover--hasCascade': hasCascade,
        'st-menuPopover--alignEnd': alignEnd,
        'st-menuPopover--alignCenter': alignCenter,
      },
      props.class,
    ]"
    :style="{
      top: top + 'px',
      left: left + 'px',
      maxHeight: maxHeight ? maxHeight + 'px' : undefined,
    }"
  >
    <Menu
      v-if="props.items?.length"
      :items="props.items"
      :role="treeHasCascade(props.items) ? 'menu' : 'presentation'"
      :aria-label="props.label"
      :submenu-side="props.submenuSide"
      @select="handleMenuSelect"
    >
      <template v-if="$slots['item-label']" #item-label="scope"><slot name="item-label" v-bind="scope" /></template>
      <template v-if="$slots['group-label']" #group-label="scope"><slot name="group-label" v-bind="scope" /></template>
    </Menu>
    <slot v-else />
  </div>
</template>
