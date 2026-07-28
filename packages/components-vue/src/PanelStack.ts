import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
  type InjectionKey,
  type PropType,
} from "vue";
import { classNames } from "./classNames.js";

export type PanelStackShape = "split-primary" | "sticky-item";

/**
 * Bound ratified by the chat consumer lane: beyond 4 sections, stacking
 * collapsible regions in a pane capped at 640px makes scrolling unmanageable
 * and the single-owner rule becomes untenable. Enforced as a dev-time
 * `console.warn` in `register()` (this package's established convention —
 * see NavActionStack/WaterfallChart — is to warn and degrade, never throw or
 * silently truncate); exported here so the bound is also visible through
 * types/docs to a consumer reading `PanelStackProps`.
 */
export const PANEL_STACK_MAX_SECTIONS = 4;

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
  class?: string;
};

// At most PANEL_STACK_MAX_SECTIONS `PanelSection` children (default slot)
// are supported — see that constant's doc comment for why.

/**
 * Context contract shared with PanelSection. Every shape-dependent branch
 * (sticky-item vs split-primary) is decided HERE and only here — PanelSection
 * never reads `shape`, it only calls these four functions/callback. If the
 * consumer-lane contract for these two shapes changes, this is the one place
 * to touch.
 */
export const PANEL_STACK_KEY: InjectionKey<PanelStackContext> = Symbol("st-panel-stack");

export type PanelStackContext = {
  /** Is this section the (non-collapsible) primary of a split-primary stack? */
  isPrimary: (id: string) => boolean;
  /** Is this section currently expanded (body visible, content-sized or scrolling)? */
  isExpanded: (id: string) => boolean;
  /** Is this section's body THE single scroll owner right now (flex:1 1 0, overflow:auto)? */
  isScrollOwner: (id: string) => boolean;
  /** Header was activated (click / Space / Enter on the disclosure button). */
  toggle: (id: string) => void;
  /**
   * Register a section's root AND header element, in mount/DOM order;
   * returns an unregister callback. NOT just bookkeeping — the stack falls
   * back to the first registered section as the scroll owner whenever
   * nothing else designates one (unset/stale `expanded` or `primary`), so
   * the invariant "exactly one scroll owner whenever the stack has ≥1
   * section" holds even for a misconfigured or dynamically-changing stack.
   * `headerEl` is used only by split-primary's auto-collapse measurement
   * (the header of whichever section is CURRENTLY primary is observed for
   * its height); sticky-item ignores it.
   */
  register: (id: string, rootEl: HTMLElement, headerEl: HTMLElement) => () => void;
};

type Entry = { id: string; el: HTMLElement; headerEl: HTMLElement };

// Same registration technique as SelectableList/SelectableRow: a section
// registers its root element on mount and unregisters on destroy; the
// ordered view is derived lazily via `compareDocumentPosition` rather than
// sorted eagerly on every register, so "first registered" fallbacks always
// mean "first in DOM order", not "first mounted".
function sortByDom(list: Entry[]): Entry[] {
  return [...list].sort((a, b) => {
    const pos = a.el.compareDocumentPosition(b.el);
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });
}

// Kept in sync with the CSS fallback for
// --st-component-panelStack-primaryMinBlockSize (10rem @ a 16px root font
// size) in styles.css. Not read via getComputedStyle: jsdom (this package's
// test environment) does not reliably resolve CSS custom properties/rem
// units in computed style, which would make the threshold untestable; a
// hardcoded, documented, kept-in-sync constant mirrors PanelStack.svelte.
const PRIMARY_MIN_BLOCK_SIZE_PX = 160;

/**
 * Stacks several PanelSection children inside ONE panel so a docked chat can
 * share a pane with other content. The invariant is the whole point: exactly
 * one element in the stack has `overflow: auto` at any moment, and the stack
 * itself NEVER scrolls — see PanelStack.svelte (the frozen reference this
 * component mirrors) and styles.css's `.st-panelStack` rule.
 */
export const PanelStack = defineComponent({
  name: "PanelStack",
  props: {
    shape: { type: String as PropType<PanelStackShape>, default: "sticky-item" },
    label: { type: String, default: undefined },
    expanded: { type: String as PropType<string | null>, default: undefined },
    defaultExpanded: { type: String as PropType<string | null>, default: null },
    onExpandedChange: {
      type: Function as PropType<(id: string | null) => void>,
      default: undefined,
    },
    primary: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: {
    expandedChange: (_id: string | null) => true,
  },
  setup(props, { slots, attrs, emit }) {
    // --- Mount-order registry -------------------------------------------
    const entries = ref<Entry[]>([]);
    const orderedEntries = computed(() => sortByDom(entries.value));
    const firstId = computed(() => orderedEntries.value[0]?.id ?? null);

    // Independent open/closed state for split-primary's NON-primary
    // sections. Always uncontrolled — the API exposes no prop for it, only
    // `primary` is stable for that shape.
    const openSecondary = ref<Set<string>>(new Set());

    // --- Auto-collapse (split-primary only) bookkeeping ------------------
    const stackEl = ref<HTMLElement | null>(null);
    const stackHeight = ref(0);
    const primaryHeaderHeight = ref(0);
    /** Latest observed ROOT (header+current body) height per registered id. */
    const rootHeights = ref<Map<string, number>>(new Map());
    /** Secondaries force-collapsed by the algorithm despite `openSecondary`
     *  wanting them open — distinct from the user's own intent so an
     *  explicit re-open (toggle) can always clear it. */
    const autoCollapsed = ref<Set<string>>(new Set());
    /** MRU order (oldest first) of ids the user explicitly opened. Drives
     *  "collapse the LEAST recently expanded secondary first" — the
     *  algorithm never touches this list itself, only `toggle()` does, so a
     *  user re-open always makes that section the last one considered for
     *  collapse again. */
    const expansionOrder = ref<string[]>([]);

    let resizeObserver: ResizeObserver | null = null;
    let observedPrimaryHeaderEl: HTMLElement | null = null;

    function ensureResizeObserver(): ResizeObserver | null {
      if (resizeObserver) return resizeObserver;
      // Guard: jsdom (this package's test environment) and some SSR/older
      // environments have no ResizeObserver at all. Auto-collapse simply
      // never engages there — `stackHeight` stays 0, the decision watcher
      // below is a permanent no-op — rather than throwing.
      if (typeof ResizeObserver === "undefined") return null;
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

    function register(id: string, el: HTMLElement, headerEl: HTMLElement): () => void {
      entries.value = [...entries.value.filter((e) => e.el !== el), { id, el, headerEl }];
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

    // Controlled vs uncontrolled `expanded` — same dual-prop idiom as
    // SelectableList's `value`/`internal` (controlled whenever the prop is
    // passed at all, including explicit `null`). `internalExpanded` is the
    // raw seed / last explicit choice, set ONCE from `defaultExpanded` at
    // setup time — same idiom as RangeSlider's `defaultValue`, never re-synced
    // to a later prop change.
    const controlled = computed(() => props.expanded !== undefined);
    const internalExpanded = ref<string | null>(props.defaultExpanded ?? null);

    const effectiveExpandedId = computed((): string | null => {
      if (controlled.value) return props.expanded ?? null;
      if (internalExpanded.value !== null && entries.value.some((e) => e.id === internalExpanded.value)) {
        return internalExpanded.value;
      }
      return firstId.value;
    });

    // split-primary: the section matching `primary`, or — if `primary` is
    // unset or matches no registered section (a misconfiguration) — the
    // first EXPANDED section in DOM order, or — if nothing is expanded
    // either — the first registered section, so the stack still never
    // degrades to zero scroll owners.
    const effectivePrimary = computed((): string | null => {
      if (props.shape !== "split-primary") return null;
      if (props.primary !== undefined && entries.value.some((e) => e.id === props.primary)) {
        return props.primary;
      }
      const firstExpandedId = orderedEntries.value.find((e) => openSecondary.value.has(e.id))?.id;
      if (firstExpandedId !== undefined) return firstExpandedId;
      return firstId.value;
    });

    // Observe the stack root's own block size for the auto-collapse budget.
    onMounted(() => {
      const observer = ensureResizeObserver();
      if (observer && stackEl.value) observer.observe(stackEl.value);
    });
    onBeforeUnmount(() => {
      resizeObserver?.disconnect();
    });

    // Retarget the header observer whenever the primary changes (designation,
    // fallback resolution, or a section unmounting). `watch` with an explicit
    // source list — rather than `watchEffect` — means reads inside the
    // callback body (none here besides the sources themselves) never become
    // extra dependencies; there is nothing reactive written here besides the
    // plain `observedPrimaryHeaderEl` closure variable.
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

    // THE decision. Re-evaluates only when a REAL measurement changes
    // (stackHeight / primaryHeaderHeight / rootHeights / entries) or the
    // primary itself changes — `openSecondary` / `autoCollapsed` /
    // `expansionOrder` are read INSIDE the callback body, never listed as a
    // `watch` source, so this watcher's own write to `autoCollapsed` below
    // can never re-trigger itself with stale (pre-layout) measurements: in
    // Vue, unlike `watchEffect`, a `watch(sources, cb)` callback body is not
    // a tracking scope — only the explicit `sources` array establishes
    // dependencies. That is what guarantees convergence: each pass collapses
    // at most one NEW secondary, using measurements that are always either
    // accurate (untouched by this pass) or correctly reflect an EARLIER pass
    // once the observer catches up — never a same-tick avalanche.
    // `autoCollapsed` only ever grows here; it only shrinks via an explicit
    // user `toggle()`, so no id can be added and removed in a loop by this
    // watcher alone, and the candidate pool is bounded by the section count
    // (≤ PANEL_STACK_MAX_SECTIONS - 1 secondaries) — so it always reaches a
    // fixed point in a bounded number of measurement-driven passes.
    watch(
      [stackHeight, primaryHeaderHeight, rootHeights, entries, effectivePrimary, () => props.shape],
      () => {
        if (props.shape !== "split-primary") return;
        const primaryId = effectivePrimary.value;
        if (primaryId === null) return;
        if (stackHeight.value === 0) return; // not measured yet — nothing to decide.

        let secondaryTotal = 0;
        for (const e of entries.value) {
          if (e.id === primaryId) continue;
          secondaryTotal += rootHeights.value.get(e.id) ?? 0;
        }
        const available = stackHeight.value - primaryHeaderHeight.value - secondaryTotal;
        if (available >= PRIMARY_MIN_BLOCK_SIZE_PX) return;

        const candidate = expansionOrder.value.find(
          (id) => id !== primaryId && openSecondary.value.has(id) && !autoCollapsed.value.has(id),
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
      emit("expandedChange", id);
    }

    function isPrimary(id: string): boolean {
      return props.shape === "split-primary" && id === effectivePrimary.value;
    }

    function isExpanded(id: string): boolean {
      if (props.shape === "split-primary") {
        if (id === effectivePrimary.value) return true;
        return openSecondary.value.has(id) && !autoCollapsed.value.has(id);
      }
      return id === effectiveExpandedId.value;
    }

    function isScrollOwner(id: string): boolean {
      return props.shape === "split-primary" ? id === effectivePrimary.value : id === effectiveExpandedId.value;
    }

    function toggle(id: string) {
      if (props.shape === "split-primary") {
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
          expansionOrder.value = [...expansionOrder.value.filter((x) => x !== id), id];
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

    return () =>
      h(
        "div",
        {
          ...attrs,
          class: classNames("st-panelStack", props.class),
          role: "group",
          "aria-label": props.label,
          ref: stackEl,
        },
        slots.default?.(),
      );
  },
});
