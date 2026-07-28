<script lang="ts" module>
  import type { Snippet } from "svelte";

  export type PanelStackShape = "split-primary" | "sticky-item";

  /**
   * Bound ratified by the chat consumer lane: beyond 4 sections, stacking
   * collapsible regions in a pane capped at 640px makes scrolling unmanageable
   * and the single-owner rule becomes untenable. Enforced as a dev-time
   * `console.warn` in `register()` (this package's established convention —
   * see NavActionStack/WaterfallChart — is to warn and degrade, never throw
   * or silently truncate); exported here so the bound is also visible through
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
    /**
     * At most {@link PANEL_STACK_MAX_SECTIONS} `PanelSection` children are
     * supported — see that constant's doc comment for why.
     */
    children?: Snippet;
    class?: string;
  };

  /**
   * Context contract shared with PanelSection. Every shape-dependent branch
   * (sticky-item vs split-primary) is decided HERE and only here — PanelSection
   * never reads `shape`, it only calls these four functions/callback. If the
   * consumer-lane contract for these two shapes changes, this is the one place
   * to touch.
   */
  export const PANEL_STACK_KEY = Symbol("st-panel-stack");

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
</script>

<script lang="ts">
  import { setContext, untrack } from "svelte";

  let {
    shape = "sticky-item",
    label,
    expanded,
    defaultExpanded = null,
    onExpandedChange,
    primary,
    children,
    class: className
  }: PanelStackProps = $props();

  // --- Mount-order registry -------------------------------------------------
  // Both fallbacks below ("the first registered section becomes the de-facto
  // scroll owner") need to know which section is first, in DOM order — not
  // effect-run order, which isn't guaranteed to match visual order once
  // sections are reordered or conditionally rendered. Same registration
  // technique as SelectableList/SelectableRow: a section registers its root
  // element in an effect on mount and unregisters on destroy; the ordered view
  // is derived lazily via `compareDocumentPosition` rather than sorted eagerly
  // on every register.
  type Entry = { id: string; el: HTMLElement; headerEl: HTMLElement };
  let entries = $state<Entry[]>([]);

  function sortByDom(list: Entry[]): Entry[] {
    return [...list].sort((a, b) => {
      const pos = a.el.compareDocumentPosition(b.el);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
  }

  const orderedEntries = $derived.by(() => sortByDom(entries));
  const firstId = $derived(orderedEntries[0]?.id ?? null);

  function register(id: string, el: HTMLElement, headerEl: HTMLElement): () => void {
    untrack(() => {
      entries = [...entries.filter((e) => e.el !== el), { id, el, headerEl }];
      // Dev-time visibility only — see PANEL_STACK_MAX_SECTIONS' doc comment.
      // Never truncated/hidden: every registered section still renders and
      // participates normally, this is a nudge, not an enforcement mechanism.
      if (entries.length > PANEL_STACK_MAX_SECTIONS) {
        console.warn(
          `[PanelStack] ${entries.length} sections registered — the stack is designed for at most ${PANEL_STACK_MAX_SECTIONS}. Beyond that, stacked collapsible regions in a capped pane become unmanageable to scroll and the single-scroll-owner contract gets hard to reason about. Consider splitting into multiple panes.`
        );
      }
    });
    const observer = ensureResizeObserver();
    observer?.observe(el);
    return () => {
      observer?.unobserve(el);
      untrack(() => {
        entries = entries.filter((e) => e.el !== el);
        // Drop any stale open/closed/measurement record for a section that no
        // longer exists, so a LATER section re-registered under the same id
        // doesn't silently inherit a dead instance's state.
        if (openSecondary.has(id)) {
          const next = new Set(openSecondary);
          next.delete(id);
          openSecondary = next;
        }
        if (autoCollapsed.has(id)) {
          const next = new Set(autoCollapsed);
          next.delete(id);
          autoCollapsed = next;
        }
        if (expansionOrder.includes(id)) {
          expansionOrder = expansionOrder.filter((x) => x !== id);
        }
        if (rootHeights.has(id)) {
          const next = new Map(rootHeights);
          next.delete(id);
          rootHeights = next;
        }
      });
    };
  }

  // Controlled vs uncontrolled `expanded` — same dual-prop idiom as
  // SelectableList's `value`/`internal` (controlled whenever the prop is
  // passed at all, including explicit `null`). `internalExpanded` is the raw
  // seed / last explicit choice; `effectiveExpandedId` is what actually
  // renders and is the one place the "never zero scroll owners" fallback
  // lives: it resolves to the first registered section whenever
  // `internalExpanded` is unset OR points at a section that no longer exists
  // (e.g. the previously-expanded section just unmounted).
  const controlled = $derived(expanded !== undefined);
  // `untrack`: this is a one-time SEED, not a live binding to `defaultExpanded`
  // — same idiom as RangeSlider's `defaultValue`.
  let internalExpanded = $state<string | null>(untrack(() => defaultExpanded));

  const effectiveExpandedId = $derived.by((): string | null => {
    if (controlled) return expanded ?? null;
    if (internalExpanded !== null && entries.some((e) => e.id === internalExpanded)) {
      return internalExpanded;
    }
    return firstId;
  });

  // Independent open/closed state for split-primary's NON-primary sections.
  // Always uncontrolled — the API exposes no prop for it, only `primary` is
  // stable for that shape. Several sections may be open at once; a section
  // starts closed (header only) until the user opens it. This is the user's
  // INTENT, separate from `autoCollapsed` below (what's actually visible).
  let openSecondary = $state<Set<string>>(new Set());

  // split-primary: the section matching `primary`, or — if `primary` is unset
  // or matches no registered section (a misconfiguration) — the first
  // EXPANDED section in DOM order (ratified answer: "always the expanded one"
  // is unambiguous only until two are expanded, hence DOM order as the
  // tiebreak), or — if nothing is expanded either — the first registered
  // section, so the stack still never degrades to zero scroll owners.
  const effectivePrimary = $derived.by((): string | null => {
    if (shape !== "split-primary") return null;
    if (primary !== undefined && entries.some((e) => e.id === primary)) return primary;
    const firstExpandedId = orderedEntries.find((e) => openSecondary.has(e.id))?.id;
    if (firstExpandedId !== undefined) return firstExpandedId;
    return firstId;
  });

  // --- Auto-collapse (split-primary only): secondaries yield to the primary's
  // floor -------------------------------------------------------------------
  // Ratified contract: the pane NEVER scrolls, and the primary NEVER shrinks
  // below a usable minimum (CSS `min-block-size` on the scroll-owner body,
  // token below). Since secondaries render `flex: 0 0 auto` (they never
  // shrink under pressure — only the primary, `flex: 1 1 0`, does) their
  // rendered ROOT height is always an accurate read of "how much space this
  // section currently occupies", whether collapsed (header only) or expanded
  // (header + natural body) — no separate body/header split needed for THEM.
  // The primary's own header needs its own measurement (it never collapses,
  // so there's no "collapsed" snapshot to read a header-only height from the
  // way a secondary's initial closed state gives one "for free").
  let stackEl: HTMLElement | null = $state(null);
  let stackHeight = $state(0);
  let primaryHeaderHeight = $state(0);
  /** Latest observed ROOT (header+current body) height per registered id. */
  let rootHeights = $state<Map<string, number>>(new Map());
  /** Secondaries force-collapsed by the algorithm despite `openSecondary`
   *  wanting them open — distinct from the user's own intent so an explicit
   *  re-open (toggle) can always clear it. */
  let autoCollapsed = $state<Set<string>>(new Set());
  /** MRU order (oldest first) of ids the user explicitly opened. Drives
   *  "collapse the LEAST recently expanded secondary first" — the algorithm
   *  never touches this list itself, only `toggle()` does, so a user re-open
   *  always makes that section the last one considered for collapse again. */
  let expansionOrder = $state<string[]>([]);

  // Kept in sync with the CSS fallback for
  // --st-component-panelStack-primaryMinBlockSize (10rem @ a 16px root font
  // size) below. Not read via getComputedStyle: this package's test
  // environment (jsdom) does not reliably resolve CSS custom properties/rem
  // units in computed style, which would make the threshold untestable; a
  // hardcoded, documented, kept-in-sync constant is this codebase's existing
  // pattern for a JS-side numeric mirror of a CSS default (see
  // ChatComposer.svelte's hardcoded line-height multiples).
  const PRIMARY_MIN_BLOCK_SIZE_PX = 160;

  let resizeObserver: ResizeObserver | null = null;
  let observedPrimaryHeaderEl: HTMLElement | null = null;

  function ensureResizeObserver(): ResizeObserver | null {
    if (resizeObserver) return resizeObserver;
    // Guard: jsdom (this package's test environment) and some SSR/older
    // environments have no ResizeObserver at all. Auto-collapse simply never
    // engages there — `stackHeight` stays 0, the decision effect below is a
    // permanent no-op — rather than throwing.
    if (typeof ResizeObserver === "undefined") return null;
    resizeObserver = new ResizeObserver((observedEntries) => {
      for (const entry of observedEntries) {
        const height = entry.contentRect.height;
        if (entry.target === stackEl) {
          stackHeight = height;
        } else if (entry.target === observedPrimaryHeaderEl) {
          primaryHeaderHeight = height;
        } else {
          const found = entries.find((e) => e.el === entry.target);
          if (found) {
            const next = new Map(rootHeights);
            next.set(found.id, height);
            rootHeights = next;
          }
        }
      }
    });
    return resizeObserver;
  }

  $effect(() => {
    if (!stackEl) return;
    const observer = ensureResizeObserver();
    if (!observer) return;
    observer.observe(stackEl);
    return () => observer.disconnect();
  });

  // Retarget the header observer whenever the primary changes (designation,
  // fallback resolution, or a section unmounting).
  $effect(() => {
    const primaryId = effectivePrimary;
    const nextHeaderEl = primaryId ? (entries.find((e) => e.id === primaryId)?.headerEl ?? null) : null;
    untrack(() => {
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
    });
  });

  // THE decision. Re-evaluates only when a REAL measurement changes
  // (stackHeight / primaryHeaderHeight / rootHeights / entries) or the primary
  // itself changes — `openSecondary`/`autoCollapsed`/`expansionOrder` are read
  // through `untrack` so that THIS effect's own write to `autoCollapsed` never
  // re-triggers itself with stale (pre-layout) measurements. That is what
  // guarantees convergence: each pass collapses at most one NEW secondary,
  // using measurements that are always either accurate (untouched by this
  // pass) or correctly reflect an EARLIER pass once the observer catches up —
  // never a same-tick avalanche. `autoCollapsed` only ever grows here; it only
  // shrinks via an explicit user `toggle()`, so no id can be added and removed
  // in a loop by this effect alone, and the candidate pool is bounded by the
  // section count (≤ PANEL_STACK_MAX_SECTIONS - 1 secondaries) — so it always
  // reaches a fixed point in a bounded number of measurement-driven passes.
  $effect(() => {
    if (shape !== "split-primary") return;
    const primaryId = effectivePrimary;
    if (primaryId === null) return;
    if (stackHeight === 0) return; // not measured yet — nothing to decide.

    let secondaryTotal = 0;
    for (const e of entries) {
      if (e.id === primaryId) continue;
      secondaryTotal += rootHeights.get(e.id) ?? 0;
    }
    const available = stackHeight - primaryHeaderHeight - secondaryTotal;
    if (available >= PRIMARY_MIN_BLOCK_SIZE_PX) return;

    // Both the candidate search AND the Set construction below must read
    // `autoCollapsed` inside `untrack` — reading it ANYWHERE untracked in
    // this effect (even just to build the next Set) would re-register it as
    // a dependency of this very effect, since assignment doesn't erase a
    // read that already happened. That subtle leak is exactly what causes
    // the same-tick avalanche this design avoids: the effect would then
    // immediately re-run off its own write, before any real (post-collapse)
    // measurement exists.
    const nextAutoCollapsed = untrack(() => {
      const candidate = expansionOrder.find(
        (id) => id !== primaryId && openSecondary.has(id) && !autoCollapsed.has(id)
      );
      if (candidate === undefined) return null; // nothing left to collapse — degenerate case, do no more.
      return new Set(autoCollapsed).add(candidate);
    });
    if (nextAutoCollapsed) autoCollapsed = nextAutoCollapsed;
  });

  function setExpanded(id: string | null) {
    if (!controlled) internalExpanded = id;
    onExpandedChange?.(id);
  }

  function isPrimary(id: string): boolean {
    return shape === "split-primary" && id === effectivePrimary;
  }

  function isExpanded(id: string): boolean {
    if (shape === "split-primary") {
      if (id === effectivePrimary) return true;
      return openSecondary.has(id) && !autoCollapsed.has(id);
    }
    return id === effectiveExpandedId;
  }

  function isScrollOwner(id: string): boolean {
    return shape === "split-primary" ? id === effectivePrimary : id === effectiveExpandedId;
  }

  function toggle(id: string) {
    if (shape === "split-primary") {
      if (id === effectivePrimary) return; // primary has no disclosure button; guard anyway.
      // Toggle acts on what's currently RENDERED (isExpanded), not the raw
      // `openSecondary` flag, so a click on an auto-collapsed (visually
      // closed) section always reads as "open it" to the user, never as a
      // second, confusing "close" of a section they already see as closed.
      if (isExpanded(id)) {
        const next = new Set(openSecondary);
        next.delete(id);
        openSecondary = next;
        expansionOrder = expansionOrder.filter((x) => x !== id);
      } else {
        const next = new Set(openSecondary);
        next.add(id);
        openSecondary = next;
        if (autoCollapsed.has(id)) {
          const nextAuto = new Set(autoCollapsed);
          nextAuto.delete(id);
          autoCollapsed = nextAuto;
        }
        // Move to the most-recently-expanded end — an explicit re-open always
        // makes this section the LAST one the algorithm would collapse again.
        expansionOrder = [...expansionOrder.filter((x) => x !== id), id];
      }
      return;
    }
    // sticky-item: radio semantics — clicking the already-expanded header
    // (including the first-section fallback) is a no-op, there is no
    // "collapse to zero" gesture.
    if (effectiveExpandedId === id) return;
    setExpanded(id);
  }

  setContext<PanelStackContext>(PANEL_STACK_KEY, {
    isPrimary,
    isExpanded,
    isScrollOwner,
    toggle,
    register
  });

  const classes = $derived(["st-panelStack", className].filter(Boolean).join(" "));
</script>

<div class={classes} role="group" aria-label={label} bind:this={stackEl}>
  {@render children?.()}
</div>

<style>
  /* The stack is a plain flex column that clips its own edges — it NEVER
     scrolls itself. Exactly one descendant (a PanelSection body) is ever the
     scroll owner; see PanelSection.svelte for the single scrolling
     declaration in this component pair. */
  .st-panelStack {
    block-size: 100%;
    display: flex;
    flex-direction: column;
    min-block-size: 0;
    overflow: hidden;
  }

  /* Separator between adjacent PanelSection instances. Declared here (the
     parent, whose own root class IS statically present in this template)
     rather than in PanelSection.svelte, where a sibling-combinator against the
     child's own root class would only ever match ACROSS separate component
     instances — something svelte-check cannot verify and flags as an unused
     selector. Mirrors ButtonGroup's `> :global(* + *)` idiom. */
  .st-panelStack > :global(.st-panelSection) + :global(.st-panelSection) {
    border-top: 1px solid var(--st-component-control-border, var(--st-semantic-border-subtle));
  }
</style>
