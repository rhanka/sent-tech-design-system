<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { classNames } from './classNames.js';
import { computePosition, splitPlacement } from './popper-position.js';
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


export type Rect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};
defineOptions({ name: 'Popper' });
const props = withDefaults(defineProps<Omit<PopperProps, 'anchor'> & { anchor?: HTMLElement | null }>(), { anchor: null, open: false, placement: 'bottom', offset: 8, flip: true, shift: true, arrow: false, strategy: 'absolute', portal: true, class: undefined, onPlacementChange: undefined, trapFocus: false, closeOnEscape: true, onClose: undefined });
defineSlots<{ default?: () => unknown }>();
const emit = defineEmits<{ placementChange: [placement: PopperPlacement] }>();
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

onMounted(() => {
  start();
  startA11y();
});

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

const side = computed(() => splitPlacement(resolvedPlacement.value).side);

</script>

<template>

  <Teleport v-if="props.open && props.anchor" to="body" :disabled="!props.portal">
    <div ref="panel" :class="classNames('st-popper', props.class)" :data-popper-placement="resolvedPlacement"
      :style="`position: ${props.strategy}; top: ${top}px; left: ${left}px;`"
      :tabindex="props.trapFocus ? -1 : undefined" @keydown="props.trapFocus ? handlePanelKeydown($event) : undefined">
      <slot />
      <span v-if="props.arrow" class="st-popper__arrow" :data-popper-side="side" aria-hidden="true" />
    </div>
  </Teleport>

</template>
