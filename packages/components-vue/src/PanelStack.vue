<script setup lang="ts">

import {
  computed,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
  type InjectionKey,
  type PropType,
} from 'vue';
import { classNames } from './classNames.js';
import {
  PANEL_STACK_KEY,
  type PanelStackContext,
} from './panel-stack-context.js';
export type PanelStackShape = 'split-primary' | 'sticky-item';
import {
  PANEL_STACK_MAX_SECTIONS,
  PRIMARY_MIN_BLOCK_SIZE_PX,
} from './panel-stack-context.js';
export type PanelStackProps = {
  /** "sticky-item" (default): one section expanded at a time, all headers stay visible.
      "split-primary": the `primary` section is always expanded and owns the scroll;
      the others are content-sized disclosures. */
  shape?: PanelStackShape;
  /** Accessible name for the stack region. */
  label?: string;
  /** sticky-item, controlled: id of the expanded section. */
  expanded?: string | null;
  /** sticky-item, uncontrolled seed. */
  defaultExpanded?: string | null;
  onExpandedChange?: (id: string | null) => void;
  /**
   * split-primary: id of the section that owns the scroll. Falls back to the
   * first EXPANDED section (DOM order) when unset or stale, and — if nothing
   * is expanded — to the first registered section, so the stack never
   * degrades to zero scroll owners.
   */
  primary?: string;
  /** Usable floor for the primary section, in px. While the primary sits above it the
      primary absorbs overflow; once it would drop below, a secondary auto-collapses
      instead of compressing the primary further. Default 160. */
  primaryMinHeight?: number;
  class?: string;
};

type Entry = { id: string; el: HTMLElement; headerEl: HTMLElement };
function sortByDom(list: Entry[]): Entry[] {
  return [...list].sort((a, b) => {
    const pos = a.el.compareDocumentPosition(b.el);
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });
}

defineOptions({ name: 'PanelStack', inheritAttrs: false });
const props = withDefaults(defineProps<PanelStackProps>(), {
  shape: 'sticky-item',
  label: undefined,
  expanded: undefined,
  defaultExpanded: null,
  onExpandedChange: undefined,
  primary: undefined,
  primaryMinHeight: undefined,
  class: undefined,
});
const emit = defineEmits<{ expandedChange: [_id: string | null] }>();

defineSlots<{ default?: () => unknown }>();
const entries = ref<Entry[]>([]);
const orderedEntries = computed(() => sortByDom(entries.value));
const firstId = computed(() => orderedEntries.value[0]?.id ?? null);
const openSecondary = ref<Set<string>>(new Set());
const stackEl = ref<HTMLElement | null>(null);
const stackHeight = ref(0);
const primaryHeaderHeight = ref(0);
const rootHeights = ref<Map<string, number>>(new Map());
const autoCollapsed = ref<Set<string>>(new Set());
const expansionOrder = ref<string[]>([]);
const effectivePrimaryMinHeight = computed(
  () => props.primaryMinHeight ?? PRIMARY_MIN_BLOCK_SIZE_PX,
);
let resizeObserver: ResizeObserver | null = null;
let observedPrimaryHeaderEl: HTMLElement | null = null;
function ensureResizeObserver(): ResizeObserver | null {
  if (resizeObserver) return resizeObserver;
  // Guard: jsdom (this package's test environment) and some SSR/older
  // environments have no ResizeObserver at all. Auto-collapse simply
  // never engages there — `stackHeight` stays 0, the decision watcher
  // below is a permanent no-op — rather than throwing.
  if (typeof ResizeObserver === 'undefined') return null;
  resizeObserver = new ResizeObserver((observedEntries) => {
    for (const entry of observedEntries) {
      const height = entry.contentRect.height;
      if (entry.target === stackEl.value) {
        stackHeight.value = height;
      } else if (entry.target === observedPrimaryHeaderEl) {
        primaryHeaderHeight.value = height;
      } else {
        const found = entries.value.find((e) => e.el === entry.target);
        if (found) {
          const next = new Map(rootHeights.value);
          next.set(found.id, height);
          rootHeights.value = next;
        }
      }
    }
  });
  return resizeObserver;
}
function register(
  id: string,
  el: HTMLElement,
  headerEl: HTMLElement,
): () => void {
  entries.value = [
    ...entries.value.filter((e) => e.el !== el),
    { id, el, headerEl },
  ];
  // Dev-time visibility only — see PANEL_STACK_MAX_SECTIONS' doc comment.
  // Never truncated/hidden: every registered section still renders and
  // participates normally, this is a nudge, not an enforcement mechanism.
  if (entries.value.length > PANEL_STACK_MAX_SECTIONS) {
    console.warn(
      `[PanelStack] ${entries.value.length} sections registered — the stack is designed for at most ${PANEL_STACK_MAX_SECTIONS}. Beyond that, stacked collapsible regions in a capped pane become unmanageable to scroll and the single-scroll-owner contract gets hard to reason about. Consider splitting into multiple panes.`,
    );
  }
  const observer = ensureResizeObserver();
  observer?.observe(el);
  return () => {
    observer?.unobserve(el);
    entries.value = entries.value.filter((e) => e.el !== el);
    // Drop any stale open/closed/measurement record for a section that no
    // longer exists, so a LATER section re-registered under the same id
    // doesn't silently inherit a dead instance's state.
    if (openSecondary.value.has(id)) {
      const next = new Set(openSecondary.value);
      next.delete(id);
      openSecondary.value = next;
    }
    if (autoCollapsed.value.has(id)) {
      const next = new Set(autoCollapsed.value);
      next.delete(id);
      autoCollapsed.value = next;
    }
    if (expansionOrder.value.includes(id)) {
      expansionOrder.value = expansionOrder.value.filter((x) => x !== id);
    }
    if (rootHeights.value.has(id)) {
      const next = new Map(rootHeights.value);
      next.delete(id);
      rootHeights.value = next;
    }
  };
}
const controlled = computed(() => props.expanded !== undefined);
const internalExpanded = ref<string | null>(props.defaultExpanded ?? null);
const effectiveExpandedId = computed((): string | null => {
  if (controlled.value) return props.expanded ?? null;
  if (
    internalExpanded.value !== null &&
    entries.value.some((e) => e.id === internalExpanded.value)
  ) {
    return internalExpanded.value;
  }
  return firstId.value;
});
const stickyScrollOwnerId = computed((): string | null => {
  const id = effectiveExpandedId.value;
  if (id === null) return null;
  if (entries.value.some((e) => e.id === id)) return id;
  return firstId.value;
});
let hasWarnedInvalidExpanded = false;
watch([() => props.expanded, entries, () => props.shape], () => {
  if (hasWarnedInvalidExpanded) return;
  if (props.shape === 'split-primary') return;
  if (!controlled.value) return;
  const id = props.expanded ?? null;
  if (id === null) return; // deliberate "everything collapsed" — not a misconfiguration.
  if (entries.value.some((e) => e.id === id)) return; // valid — nothing to warn about.
  hasWarnedInvalidExpanded = true;
  console.warn(
    `[PanelStack] expanded="${id}" does not match any registered section. The controlled value is left untouched — it is never overridden — but the stack still needs exactly one scroll owner, so the first registered section is used as a fallback scroll owner. Pass a valid section id, or null, to silence this.`,
  );
});
const effectivePrimary = computed((): string | null => {
  if (props.shape !== 'split-primary') return null;
  if (
    props.primary !== undefined &&
    entries.value.some((e) => e.id === props.primary)
  ) {
    return props.primary;
  }
  const firstExpandedId = orderedEntries.value.find((e) =>
    openSecondary.value.has(e.id),
  )?.id;
  if (firstExpandedId !== undefined) return firstExpandedId;
  return firstId.value;
});
onMounted(() => {
  const observer = ensureResizeObserver();
  if (observer && stackEl.value) observer.observe(stackEl.value);
});
onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});
watch(
  [effectivePrimary, entries],
  () => {
    const primaryId = effectivePrimary.value;
    const nextHeaderEl = primaryId
      ? (entries.value.find((e) => e.id === primaryId)?.headerEl ?? null)
      : null;
    const observer = ensureResizeObserver();
    if (!observer) {
      observedPrimaryHeaderEl = nextHeaderEl;
      return;
    }
    if (observedPrimaryHeaderEl && observedPrimaryHeaderEl !== nextHeaderEl) {
      observer.unobserve(observedPrimaryHeaderEl);
    }
    if (nextHeaderEl && nextHeaderEl !== observedPrimaryHeaderEl) {
      observer.observe(nextHeaderEl);
    }
    observedPrimaryHeaderEl = nextHeaderEl;
  },
  { immediate: true },
);
watch(
  [
    stackHeight,
    primaryHeaderHeight,
    rootHeights,
    entries,
    effectivePrimary,
    () => props.shape,
    effectivePrimaryMinHeight,
  ],
  () => {
    if (props.shape !== 'split-primary') return;
    const primaryId = effectivePrimary.value;
    if (primaryId === null) return;
    if (stackHeight.value === 0) return; // not measured yet — nothing to decide.

    let secondaryTotal = 0;
    for (const e of entries.value) {
      if (e.id === primaryId) continue;
      secondaryTotal += rootHeights.value.get(e.id) ?? 0;
    }
    const available =
      stackHeight.value - primaryHeaderHeight.value - secondaryTotal;
    if (available >= effectivePrimaryMinHeight.value) return;

    const candidate = expansionOrder.value.find(
      (id) =>
        id !== primaryId &&
        openSecondary.value.has(id) &&
        !autoCollapsed.value.has(id),
    );
    if (candidate === undefined) return; // nothing left to collapse — degenerate case, do no more.
    autoCollapsed.value = new Set(autoCollapsed.value).add(candidate);
  },
);
function setExpanded(id: string | null) {
  if (!controlled.value) internalExpanded.value = id;
  // `emit` already routes to the `onExpandedChange` prop/listener — do
  // NOT also call `props.onExpandedChange?.(id)` here, or a consumer
  // wired through the prop would be notified twice.
  emit('expandedChange', id);
}
function isPrimary(id: string): boolean {
  return props.shape === 'split-primary' && id === effectivePrimary.value;
}
function isExpanded(id: string): boolean {
  if (props.shape === 'split-primary') {
    if (id === effectivePrimary.value) return true;
    return openSecondary.value.has(id) && !autoCollapsed.value.has(id);
  }
  // sticky-item: expanded and scroll owner are the same thing by
  // definition — exactly one section is expanded and it owns the
  // scroll — so this MUST resolve from `stickyScrollOwnerId`, not the
  // raw `effectiveExpandedId`. They already coincide in every normal
  // case (uncontrolled, controlled-valid, controlled-null); the only
  // case where they'd diverge is a controlled `expanded` pointing at a
  // non-existent id, and reporting that section's raw (unmatched) value
  // here would render an `aria-expanded="false"` trigger on a body that
  // is visibly, scrollably on screen (`--scrollOwner`) — content a
  // screen reader would announce as collapsed while sighted users see
  // it open. The controlled prop itself is still never written and
  // `expandedChange` still never fires on its own; only what ARIA
  // reports about the section that's ALREADY rendered as scroll owner
  // changes.
  return id === stickyScrollOwnerId.value;
}
function isScrollOwner(id: string): boolean {
  return props.shape === 'split-primary'
    ? id === effectivePrimary.value
    : id === stickyScrollOwnerId.value;
}
function toggle(id: string) {
  if (props.shape === 'split-primary') {
    if (id === effectivePrimary.value) return; // primary has no disclosure button; guard anyway.
    // Toggle acts on what's currently RENDERED (isExpanded), not the raw
    // `openSecondary` flag, so a click on an auto-collapsed (visually
    // closed) section always reads as "open it" to the user, never as a
    // second, confusing "close" of a section they already see as closed.
    if (isExpanded(id)) {
      const next = new Set(openSecondary.value);
      next.delete(id);
      openSecondary.value = next;
      expansionOrder.value = expansionOrder.value.filter((x) => x !== id);
    } else {
      const next = new Set(openSecondary.value);
      next.add(id);
      openSecondary.value = next;
      if (autoCollapsed.value.has(id)) {
        const nextAuto = new Set(autoCollapsed.value);
        nextAuto.delete(id);
        autoCollapsed.value = nextAuto;
      }
      // Move to the most-recently-expanded end — an explicit re-open
      // always makes this section the LAST one the algorithm would
      // collapse again.
      expansionOrder.value = [
        ...expansionOrder.value.filter((x) => x !== id),
        id,
      ];
    }
    return;
  }
  // sticky-item: radio semantics — clicking the already-expanded header
  // (including the first-section fallback) is a no-op, there is no
  // "collapse to zero" gesture.
  if (effectiveExpandedId.value === id) return;
  setExpanded(id);
}
provide<PanelStackContext>(PANEL_STACK_KEY, {
  isPrimary,
  isExpanded,
  isScrollOwner,
  toggle,
  register,
});
</script>

<template>
  <div

    v-bind="{ ...($attrs), style: [({
      '--st-component-panelStack-primaryMinBlockSize': `${effectivePrimaryMinHeight}px`,
    }), $attrs.style], class: (classNames('st-panelStack', props.class)) }"

    :role="'group'"
    :aria-label="props.label"
    ref="stackEl"
  >
    <slot />
  </div>
</template>
