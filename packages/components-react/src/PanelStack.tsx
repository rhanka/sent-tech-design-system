import React from "react";
import { classNames } from "./classNames.js";

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
  children?: React.ReactNode;
  className?: string;
};

/**
 * Context contract shared with PanelSection. Every shape-dependent branch
 * (sticky-item vs split-primary) is decided HERE and only here — PanelSection
 * never reads `shape`, it only calls these four functions/callback. If the
 * consumer-lane contract for these two shapes changes, this is the one place
 * to touch.
 */
export type PanelStackContextValue = {
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

export const PanelStackContext = React.createContext<PanelStackContextValue | null>(null);

/**
 * Changing version counter, bumped whenever any derived state a PanelSection
 * reads (entries, expansion, auto-collapse) changes. Kept SEPARATE from
 * {@link PanelStackContext} so the actions context stays identity-stable — a
 * section's registration effect (keyed on `[stack, id]`) must never re-run in
 * a loop just because the stack's internal state changed. Same split as
 * SelectableList/SelectableRow's context + version-context pair.
 */
export const PanelStackVersionContext = React.createContext(0);

type Entry = { id: string; el: HTMLElement; headerEl: HTMLElement };

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
// size) in styles.css. Not read via getComputedStyle: this package's test
// environment (jsdom) does not reliably resolve CSS custom properties/rem
// units in computed style, which would make the threshold untestable; a
// hardcoded, documented, kept-in-sync constant is this codebase's existing
// pattern for a JS-side numeric mirror of a CSS default.
const PRIMARY_MIN_BLOCK_SIZE_PX = 160;

/**
 * PanelStack — stacks several PanelSection contents inside ONE panel so a
 * docked chat can share a pane with other content. The invariant is the
 * whole point: exactly one descendant has `overflow: auto` at any moment,
 * and the stack itself NEVER scrolls (see styles.css `.st-panelStack`).
 *
 * Mutable bookkeeping (registered sections, expansion, auto-collapse,
 * measurements) lives in refs owned by this component. Every render
 * recreates the plain helper functions below (`isExpanded`, `toggle`,
 * `register`, …) — cheap closures that freely read the CURRENT render's
 * props — but the object handed to consumers through {@link PanelStackContext}
 * is a single trampoline object created ONCE (`contextRef`) whose methods
 * forward to whichever closures were built on the most recent render (via
 * `latestRef`). That keeps the context's IDENTITY stable forever, which is
 * what stops a PanelSection's registration effect (`useEffect(..., [stack,
 * id])`) from re-running in a loop, while every method still executes with
 * fresh state. A separate `version` counter, bumped on every write, is
 * provided through {@link PanelStackVersionContext} so every PanelSection
 * re-renders and recomputes its own derived attributes.
 *
 * Auto-collapse (split-primary only) is driven EXCLUSIVELY by imperative
 * calls from concrete triggers — a real ResizeObserver delivery, a
 * register/unregister, or a toggle that changes who the primary is — never
 * by a reactive subscription keyed on the state the decision itself writes
 * (`autoCollapsed`) or on the `version` counter it bumps. That is what
 * prevents a same-tick avalanche / oscillation: `runDecision` can only ever
 * be re-entered from a NEW real trigger, never from its own write.
 */
export function PanelStack({
  shape = "sticky-item",
  label,
  expanded,
  defaultExpanded = null,
  onExpandedChange,
  primary,
  children,
  className,
}: PanelStackProps) {
  const stackElRef = React.useRef<HTMLDivElement | null>(null);

  // --- Mount-order registry --------------------------------------------
  // Both fallbacks below ("the first registered section becomes the de-facto
  // scroll owner") need to know which section is first, in DOM order — not
  // effect-run order, which isn't guaranteed to match visual order once
  // sections are reordered or conditionally rendered. A section registers
  // its root + header element on mount and unregisters on unmount; the
  // ordered view is derived lazily via `compareDocumentPosition` rather than
  // sorted eagerly on every register.
  const entriesRef = React.useRef<Entry[]>([]);

  // `internalExpanded` is the raw seed / last explicit choice (sticky-item,
  // uncontrolled). The `useRef(defaultExpanded)` initializer runs once —
  // this is NOT a live binding to `defaultExpanded`, same idiom as
  // RangeSlider's `defaultValue`.
  const internalExpandedRef = React.useRef<string | null>(defaultExpanded);

  // Independent open/closed state for split-primary's NON-primary sections.
  // Always uncontrolled — the API exposes no prop for it, only `primary` is
  // stable for that shape. Several sections may be open at once; a section
  // starts closed (header only) until the user opens it. This is the user's
  // INTENT, separate from `autoCollapsed` below (what's actually visible).
  const openSecondaryRef = React.useRef<Set<string>>(new Set());

  // --- Auto-collapse (split-primary only): secondaries yield to the
  // primary's floor ------------------------------------------------------
  // Ratified contract: the pane NEVER scrolls, and the primary NEVER shrinks
  // below a usable minimum (CSS `min-block-size` on the scroll-owner body,
  // token below). Since secondaries render `flex: 0 0 auto` (they never
  // shrink under pressure — only the primary, `flex: 1 1 0`, does) their
  // rendered ROOT height is always an accurate read of "how much space this
  // section currently occupies", whether collapsed (header only) or expanded
  // (header + natural body) — no separate body/header split needed for
  // THEM. The primary's own header needs its own measurement (it never
  // collapses, so there's no "collapsed" snapshot to read a header-only
  // height from the way a secondary's initial closed state gives one "for
  // free").
  const stackHeightRef = React.useRef(0);
  const primaryHeaderHeightRef = React.useRef(0);
  /** Latest observed ROOT (header+current body) height per registered id. */
  const rootHeightsRef = React.useRef<Map<string, number>>(new Map());
  /** Secondaries force-collapsed by the algorithm despite `openSecondary`
   *  wanting them open — distinct from the user's own intent so an explicit
   *  re-open (toggle) can always clear it. */
  const autoCollapsedRef = React.useRef<Set<string>>(new Set());
  /** MRU order (oldest first) of ids the user explicitly opened. Drives
   *  "collapse the LEAST recently expanded secondary first" — the algorithm
   *  never touches this list itself, only `toggle()` does, so a user re-open
   *  always makes that section the last one considered for collapse again. */
  const expansionOrderRef = React.useRef<string[]>([]);

  const resizeObserverRef = React.useRef<ResizeObserver | null>(null);
  const observedPrimaryHeaderElRef = React.useRef<HTMLElement | null>(null);
  /** Last resolved primary id — used only to detect whether a toggle (or the
   *  `primary`/`shape` prop) actually changed WHICH section is primary,
   *  which is the only case that should re-run the auto-collapse decision
   *  outside of a real measurement; see `toggle` below. */
  const lastPrimaryIdRef = React.useRef<string | null>(null);

  const [version, forceRender] = React.useReducer((n: number) => n + 1, 0);

  const controlled = expanded !== undefined;

  function getOrderedEntries(): Entry[] {
    return sortByDom(entriesRef.current);
  }

  function getFirstId(): string | null {
    return getOrderedEntries()[0]?.id ?? null;
  }

  // The one place the "never zero scroll owners" fallback lives for
  // sticky-item: resolves to the first registered section whenever
  // `internalExpanded` is unset OR points at a section that no longer
  // exists (e.g. the previously-expanded section just unmounted).
  function computeEffectiveExpandedId(): string | null {
    if (controlled) return expanded ?? null;
    if (internalExpandedRef.current !== null && entriesRef.current.some((e) => e.id === internalExpandedRef.current)) {
      return internalExpandedRef.current;
    }
    return getFirstId();
  }

  // split-primary: the section matching `primary`, or — if `primary` is
  // unset or matches no registered section (a misconfiguration) — the first
  // EXPANDED section in DOM order (ratified answer: "always the expanded
  // one" is unambiguous only until two are expanded, hence DOM order as the
  // tiebreak), or — if nothing is expanded either — the first registered
  // section, so the stack still never degrades to zero scroll owners.
  function computeEffectivePrimary(): string | null {
    if (shape !== "split-primary") return null;
    if (primary !== undefined && entriesRef.current.some((e) => e.id === primary)) return primary;
    const firstExpandedId = getOrderedEntries().find((e) => openSecondaryRef.current.has(e.id))?.id;
    if (firstExpandedId !== undefined) return firstExpandedId;
    return getFirstId();
  }

  function isPrimary(id: string): boolean {
    return shape === "split-primary" && id === computeEffectivePrimary();
  }

  function isExpanded(id: string): boolean {
    if (shape === "split-primary") {
      if (id === computeEffectivePrimary()) return true;
      return openSecondaryRef.current.has(id) && !autoCollapsedRef.current.has(id);
    }
    return id === computeEffectiveExpandedId();
  }

  function isScrollOwner(id: string): boolean {
    return shape === "split-primary" ? id === computeEffectivePrimary() : id === computeEffectiveExpandedId();
  }

  function ensureResizeObserver(): ResizeObserver | null {
    if (resizeObserverRef.current) return resizeObserverRef.current;
    // Guard: jsdom (this package's test environment) and some SSR/older
    // environments have no ResizeObserver at all. Auto-collapse simply
    // never engages there — `stackHeight` stays 0, `runDecision` below is a
    // permanent no-op — rather than throwing.
    if (typeof ResizeObserver === "undefined") return null;
    const observer = new ResizeObserver((observedEntries) => {
      for (const entry of observedEntries) {
        const height = entry.contentRect.height;
        if (entry.target === stackElRef.current) {
          stackHeightRef.current = height;
        } else if (entry.target === observedPrimaryHeaderElRef.current) {
          primaryHeaderHeightRef.current = height;
        } else {
          const found = entriesRef.current.find((e) => e.el === entry.target);
          if (found) {
            const next = new Map(rootHeightsRef.current);
            next.set(found.id, height);
            rootHeightsRef.current = next;
          }
        }
      }
      // A real measurement landed — this is the ONLY kind of trigger allowed
      // to drive the decision; see the component doc comment.
      runDecision();
      forceRender();
    });
    resizeObserverRef.current = observer;
    return observer;
  }

  // Retarget the header observer to whichever section is CURRENTLY primary.
  // Returns whether the resolved primary id actually changed, so callers
  // (toggle, the primary/shape-prop effect) can decide whether the
  // auto-collapse decision needs to be re-run — register/unregister always
  // re-run it unconditionally below (mirrors the Svelte reference tracking
  // `entries` directly, not just through `effectivePrimary`).
  function syncPrimary(): boolean {
    const newPrimaryId = computeEffectivePrimary();
    const changed = newPrimaryId !== lastPrimaryIdRef.current;
    const nextHeaderEl = newPrimaryId
      ? (entriesRef.current.find((e) => e.id === newPrimaryId)?.headerEl ?? null)
      : null;
    const observer = ensureResizeObserver();
    if (!observer) {
      observedPrimaryHeaderElRef.current = nextHeaderEl;
      lastPrimaryIdRef.current = newPrimaryId;
      return changed;
    }
    if (observedPrimaryHeaderElRef.current && observedPrimaryHeaderElRef.current !== nextHeaderEl) {
      observer.unobserve(observedPrimaryHeaderElRef.current);
    }
    if (nextHeaderEl && nextHeaderEl !== observedPrimaryHeaderElRef.current) {
      observer.observe(nextHeaderEl);
    }
    observedPrimaryHeaderElRef.current = nextHeaderEl;
    lastPrimaryIdRef.current = newPrimaryId;
    return changed;
  }

  // THE decision. Called only from `ensureResizeObserver`'s callback (a REAL
  // measurement), or explicitly after entries/primary change — NEVER from a
  // reactive subscription on `autoCollapsed`/`version`, which is what this
  // function itself writes/triggers. That is what guarantees convergence:
  // each call collapses at most one NEW secondary, using measurements that
  // are always either accurate (untouched by this call) or correctly
  // reflect an EARLIER call once the observer catches up — never a
  // same-tick avalanche. `autoCollapsed` only ever grows here; it only
  // shrinks via an explicit user `toggle()`, so no id can be added and
  // removed in a loop by this function alone, and the candidate pool is
  // bounded by the section count (≤ PANEL_STACK_MAX_SECTIONS - 1
  // secondaries) — so it always reaches a fixed point in a bounded number of
  // measurement-driven calls.
  function runDecision(): void {
    if (shape !== "split-primary") return;
    const primaryId = computeEffectivePrimary();
    if (primaryId === null) return;
    if (stackHeightRef.current === 0) return; // not measured yet — nothing to decide.

    let secondaryTotal = 0;
    for (const e of entriesRef.current) {
      if (e.id === primaryId) continue;
      secondaryTotal += rootHeightsRef.current.get(e.id) ?? 0;
    }
    const available = stackHeightRef.current - primaryHeaderHeightRef.current - secondaryTotal;
    if (available >= PRIMARY_MIN_BLOCK_SIZE_PX) return;

    const candidate = expansionOrderRef.current.find(
      (id) => id !== primaryId && openSecondaryRef.current.has(id) && !autoCollapsedRef.current.has(id),
    );
    if (candidate === undefined) return; // nothing left to collapse — degenerate case, do no more.
    autoCollapsedRef.current = new Set(autoCollapsedRef.current).add(candidate);
  }

  function setExpandedValue(id: string | null) {
    if (!controlled) internalExpandedRef.current = id;
    onExpandedChange?.(id);
  }

  function toggle(id: string) {
    if (shape === "split-primary") {
      if (id === computeEffectivePrimary()) return; // primary has no disclosure button; guard anyway.
      // Toggle acts on what's currently RENDERED (isExpanded), not the raw
      // `openSecondary` flag, so a click on an auto-collapsed (visually
      // closed) section always reads as "open it" to the user, never as a
      // second, confusing "close" of a section they already see as closed.
      if (isExpanded(id)) {
        const next = new Set(openSecondaryRef.current);
        next.delete(id);
        openSecondaryRef.current = next;
        expansionOrderRef.current = expansionOrderRef.current.filter((x) => x !== id);
      } else {
        const next = new Set(openSecondaryRef.current);
        next.add(id);
        openSecondaryRef.current = next;
        if (autoCollapsedRef.current.has(id)) {
          const nextAuto = new Set(autoCollapsedRef.current);
          nextAuto.delete(id);
          autoCollapsedRef.current = nextAuto;
        }
        // Move to the most-recently-expanded end — an explicit re-open
        // always makes this section the LAST one the algorithm would
        // collapse again.
        expansionOrderRef.current = [...expansionOrderRef.current.filter((x) => x !== id), id];
      }
      // Re-run the decision ONLY if this toggle changed who the primary is
      // (tier-2 resolution) — mirrors the Svelte reference, where the
      // decision effect is tracked on `effectivePrimary`'s VALUE, not on
      // raw `openSecondary` writes. A plain open/close of an ordinary
      // secondary must NOT re-trigger the decision on its own; it waits for
      // the next real measurement.
      if (syncPrimary()) runDecision();
      forceRender();
      return;
    }
    // sticky-item: radio semantics — clicking the already-expanded header
    // (including the first-section fallback) is a no-op, there is no
    // "collapse to zero" gesture.
    if (computeEffectiveExpandedId() === id) return;
    setExpandedValue(id);
    forceRender();
  }

  function register(id: string, el: HTMLElement, headerEl: HTMLElement): () => void {
    entriesRef.current = [...entriesRef.current.filter((e) => e.el !== el), { id, el, headerEl }];
    // Dev-time visibility only — see PANEL_STACK_MAX_SECTIONS' doc comment.
    // Never truncated/hidden: every registered section still renders and
    // participates normally, this is a nudge, not an enforcement mechanism.
    if (entriesRef.current.length > PANEL_STACK_MAX_SECTIONS) {
      console.warn(
        `[PanelStack] ${entriesRef.current.length} sections registered — the stack is designed for at most ${PANEL_STACK_MAX_SECTIONS}. Beyond that, stacked collapsible regions in a capped pane become unmanageable to scroll and the single-scroll-owner contract gets hard to reason about. Consider splitting into multiple panes.`,
      );
    }
    const observer = ensureResizeObserver();
    observer?.observe(el);
    // Entries changed — always re-sync + re-run the decision (mirrors the
    // Svelte reference tracking `entries` directly).
    syncPrimary();
    runDecision();
    forceRender();
    return () => {
      observer?.unobserve(el);
      entriesRef.current = entriesRef.current.filter((e) => e.el !== el);
      // Drop any stale open/closed/measurement record for a section that no
      // longer exists, so a LATER section re-registered under the same id
      // doesn't silently inherit a dead instance's state.
      if (openSecondaryRef.current.has(id)) {
        const next = new Set(openSecondaryRef.current);
        next.delete(id);
        openSecondaryRef.current = next;
      }
      if (autoCollapsedRef.current.has(id)) {
        const next = new Set(autoCollapsedRef.current);
        next.delete(id);
        autoCollapsedRef.current = next;
      }
      if (expansionOrderRef.current.includes(id)) {
        expansionOrderRef.current = expansionOrderRef.current.filter((x) => x !== id);
      }
      if (rootHeightsRef.current.has(id)) {
        const next = new Map(rootHeightsRef.current);
        next.delete(id);
        rootHeightsRef.current = next;
      }
      syncPrimary();
      runDecision();
      forceRender();
    };
  }

  // Stable trampoline object passed via context: its IDENTITY never changes,
  // so a PanelSection's registration effect (deps `[stack, id]`) never
  // re-runs in a loop merely because the stack re-rendered. Each method
  // forwards to whichever plain closures (above) were built on the MOST
  // RECENT render, via `latestRef` — those closures are cheap to recreate
  // every render and freely read the current render's props directly, no
  // prop-mirroring refs needed.
  const latestRef = React.useRef<PanelStackContextValue>({ isPrimary, isExpanded, isScrollOwner, toggle, register });
  latestRef.current = { isPrimary, isExpanded, isScrollOwner, toggle, register };

  const contextObjRef = React.useRef<PanelStackContextValue | null>(null);
  if (!contextObjRef.current) {
    contextObjRef.current = {
      isPrimary: (id) => latestRef.current.isPrimary(id),
      isExpanded: (id) => latestRef.current.isExpanded(id),
      isScrollOwner: (id) => latestRef.current.isScrollOwner(id),
      toggle: (id) => latestRef.current.toggle(id),
      register: (id, el, headerEl) => latestRef.current.register(id, el, headerEl),
    };
  }

  // Mount-only: observe the stack root itself for its own height. Mirrors
  // the Svelte reference's `$effect` on `stackEl`, which also effectively
  // runs once (bound once on mount) and disconnects the WHOLE observer on
  // cleanup (the component instance owns exactly one ResizeObserver).
  React.useEffect(() => {
    const el = stackElRef.current;
    if (!el) return;
    const observer = ensureResizeObserver();
    if (!observer) return;
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever the `primary` (or `shape`) prop changes WITHOUT any
  // register/toggle activity — a controlled consumer re-rendering with a new
  // designation — resync the header observer and re-run the decision if the
  // resolved primary actually changed. Depends ONLY on external props, never
  // on state this module writes itself, so it cannot loop.
  React.useEffect(() => {
    if (syncPrimary()) runDecision();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primary, shape]);

  const classes = classNames("st-panelStack", className);

  return (
    <div className={classes} role="group" aria-label={label} ref={stackElRef}>
      <PanelStackContext.Provider value={contextObjRef.current}>
        <PanelStackVersionContext.Provider value={version}>{children}</PanelStackVersionContext.Provider>
      </PanelStackContext.Provider>
    </div>
  );
}

PanelStack.displayName = "PanelStack";
