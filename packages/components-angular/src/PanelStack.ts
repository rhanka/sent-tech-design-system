import { Component, ContentChildren, ElementRef, EventEmitter, Input as NgInput, Output, QueryList } from "@angular/core";
import type { AfterContentInit, AfterViewInit, OnChanges, OnDestroy, OnInit, SimpleChanges } from "@angular/core";
import type { Subscription } from "rxjs";

import { classNames } from "./classNames.js";
import { PanelSection } from "./PanelSection.js";

export type PanelStackShape = "split-primary" | "sticky-item";

/**
 * Bound ratified by the chat consumer lane: beyond 4 sections, stacking
 * collapsible regions in a pane capped at 640px makes scrolling unmanageable
 * and the single-owner rule becomes untenable. Enforced as a dev-time
 * `console.warn` in `register()` (this package's established convention —
 * see NavActionStack/WaterfallChart — is to warn and degrade, never throw or
 * silently truncate); exported here so the bound is also visible through
 * types/docs to a consumer reading `PanelStackProps`. Mirrors
 * `PanelStack.svelte`'s constant of the same name/value 1:1.
 */
export const PANEL_STACK_MAX_SECTIONS = 4;

/**
 * Floor (px) below which the primary must never be squeezed by split-primary
 * auto-collapse. Kept in sync with the CSS token
 * `--st-component-panelStack-primaryMinBlockSize` (10rem @ a 16px root font
 * size) — not read via `getComputedStyle` because this package's Node test
 * environment has no DOM at all, which would make the threshold untestable;
 * a hardcoded, documented, kept-in-sync numeric mirror of the CSS default is
 * this codebase's existing pattern (see MenuPopover's `MIN_HEIGHT`/`GAP`).
 * Mirrors `PanelStack.svelte`'s local `PRIMARY_MIN_BLOCK_SIZE_PX`.
 */
const PRIMARY_MIN_BLOCK_SIZE_PX = 160;

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
   * first EXPANDED section (registration order) when unset or stale, and —
   * if nothing is expanded — to the first registered section, so the stack
   * never degrades to zero scroll owners.
   */
  primary?: string;
  /**
   * At most {@link PANEL_STACK_MAX_SECTIONS} `PanelSection` children are
   * supported — see that constant's doc comment for why.
   */
  class?: string;
};

type PanelStackEntry = { id: string; el: HTMLElement; headerEl: HTMLElement };

/**
 * Pure fallback-chain resolver for split-primary's scroll owner — mirrors
 * `PanelStack.svelte`'s `effectivePrimary` derivation so it is unit-testable
 * without any component/DOM machinery (see MenuPopover's
 * `computeMenuPopoverPosition` for the established pattern).
 *
 * Tier 1: a `designatedPrimary` that matches a currently-registered id always
 * wins. Tier 2: otherwise the first EXPANDED id in `orderedIds` (registration
 * order is the tiebreak, never click order). Tier 3 (last resort): the first
 * registered id, so the stack never degrades to zero scroll owners.
 */
export function resolvePanelStackPrimary(
  designatedPrimary: string | undefined,
  orderedIds: readonly string[],
  openIds: ReadonlySet<string>,
): string | null {
  if (designatedPrimary !== undefined && orderedIds.includes(designatedPrimary)) {
    return designatedPrimary;
  }
  const firstExpanded = orderedIds.find((id) => openIds.has(id));
  if (firstExpanded !== undefined) return firstExpanded;
  return orderedIds[0] ?? null;
}

export type PanelStackAutoCollapseMeasurements = {
  /** Id of the section currently resolved as primary (never a collapse candidate). */
  primaryId: string;
  /** Latest observed height of the stack container. 0 means "not measured yet". */
  stackHeight: number;
  /** Latest observed height of the primary's own header. */
  primaryHeaderHeight: number;
  /** Ids of every non-primary (secondary) registered section. */
  secondaryIds: readonly string[];
  /** Latest observed ROOT (header + current body) height per registered id. */
  rootHeights: ReadonlyMap<string, number>;
  /** Ids the user explicitly opened (their INTENT, independent of what's actually visible). */
  openSecondary: ReadonlySet<string>;
  /** Ids force-collapsed by this algorithm on an earlier pass. */
  autoCollapsed: ReadonlySet<string>;
  /** MRU order (oldest first) of ids the user explicitly opened — drives
   *  "collapse the least-recently-expanded secondary first". */
  expansionOrder: readonly string[];
};

/**
 * THE auto-collapse decision, factored out as a pure function (per
 * MenuPopover's `computeMenuPopoverPosition` precedent) so it is testable
 * without ResizeObserver/DOM: this package's Node test environment has
 * neither. Mirrors `PanelStack.svelte`'s decision `$effect` body exactly.
 *
 * Returns the id of AT MOST ONE new secondary to auto-collapse this pass, or
 * `null` if nothing needs to (either it already fits, or nothing is left to
 * collapse — the degenerate "pane too small even fully collapsed" case).
 *
 * Convergence / no-avalanche contract: this function is a pure read of the
 * measurements and state PASSED IN — it never reads or writes any component
 * field itself, and it never returns more than one id per call. A caller
 * that re-invokes it once per REAL measurement update (the pattern used by
 * `PanelStack`'s ResizeObserver callback and `toggle()`) therefore collapses
 * at most one NEW secondary per pass, using measurements that are always
 * either accurate (untouched by this pass) or correctly reflect an EARLIER
 * pass once the observer catches up — never a same-tick avalanche. Calling
 * it again with IDENTICAL inputs (e.g. a duplicate/no-op resize delivery)
 * always returns `null` once the fixed point is reached: `autoCollapsed`
 * already contains every viable candidate, so the `.find()` below yields
 * nothing new — no oscillation.
 */
export function computePanelStackAutoCollapse(
  measurements: PanelStackAutoCollapseMeasurements,
  floorPx: number = PRIMARY_MIN_BLOCK_SIZE_PX,
): string | null {
  const { primaryId, stackHeight, primaryHeaderHeight, secondaryIds, rootHeights, openSecondary, autoCollapsed, expansionOrder } =
    measurements;
  if (stackHeight === 0) return null; // not measured yet — nothing to decide.

  let secondaryTotal = 0;
  for (const id of secondaryIds) {
    secondaryTotal += rootHeights.get(id) ?? 0;
  }
  const available = stackHeight - primaryHeaderHeight - secondaryTotal;
  if (available >= floorPx) return null;

  const candidate = expansionOrder.find((id) => id !== primaryId && openSecondary.has(id) && !autoCollapsed.has(id));
  return candidate ?? null;
}

/**
 * Stacks several `PanelSection` contents inside ONE panel so a docked chat
 * can share a pane with other content. The invariant is the whole point:
 * exactly one section's body has `overflow: auto` at any moment, and the
 * stack itself NEVER scrolls — see `PanelSection.ts` for the single scrolling
 * declaration in this component pair.
 *
 * Faithful Angular port of `PanelStack.svelte`. See that file for the
 * ratified contract this mirrors; the notable Angular-specific departures,
 * all forced by this platform (documented in depth at each site below):
 *
 * - Coordination with `PanelSection` children is NOT Svelte-style context
 *   (`setContext`/`getContext`). Angular constructor DI would be the direct
 *   analog, but it needs `@Optional()`/`@Inject()` PARAMETER decorators,
 *   which this package's tsconfig cannot compile (no `experimentalDecorators`
 *   — the whole package already relies on standard/Ivy decorators for
 *   class/property positions only). Instead `PanelStack` discovers its
 *   sections via `@ContentChildren` and pushes `isPrimary`/`expanded`/
 *   `scrollOwner` directly onto each instance — the SAME "parent owns
 *   projected children's state" idiom `SelectableList` already established
 *   for its `SelectableRow` children in this exact package.
 * - Registration order substitutes for Svelte's DOM-order-via-
 *   `compareDocumentPosition` fallback: `@ContentChildren` (and this
 *   package's Node test environment, which has no DOM at all) both already
 *   hand entries over in call/DOM order, so no separate re-sort is needed.
 * - No `ChangeDetectorRef`/`markForCheck` — matching this package's existing
 *   idiom of relying on zone.js's default full-tree change detection (same
 *   as `MenuPopover`'s window-listener-driven position updates).
 */
@Component({
  selector: "st-panel-stack",
  standalone: true,
  // The host tag itself carries `.st-panelStack` (no inner wrapper div): the
  // shared stylesheet's `.st-panelStack > .st-panelSection + .st-panelSection`
  // separator rule is a direct-child/sibling combinator, which only matches
  // the real DOM tree — `:host{display:contents}` (this package's usual
  // "host + inner wrapper div" pattern, see MenuPopover/Icon) would still
  // leave the projected `<st-panel-section>` elements one level too deep for
  // that selector, since `display:contents` unboxes for LAYOUT, not for
  // selector matching. Binding the class straight onto the host, with no
  // wrapper, sidesteps that entirely and matches `PanelStack.svelte`'s flat
  // (one box) structure even more closely than the wrapper pattern would.
  host: {
    "[attr.data-st-component]": "componentName",
    "[class]": "hostClass",
    role: "group",
    "[attr.aria-label]": "label ?? null",
  },
  template: `<ng-content></ng-content>`,
})
export class PanelStack implements OnInit, AfterContentInit, AfterViewInit, OnChanges, OnDestroy {
  static readonly stComponentName = "PanelStack";
  readonly componentName = "PanelStack";

  @NgInput() shape: PanelStackShape = "sticky-item";
  @NgInput() label?: string;
  /** sticky-item, controlled: id of the expanded section. Presence (including
   *  an explicit `null`) is what makes the stack controlled — same
   *  undefined-vs-set idiom as `AppShell.panelWidths`. */
  @NgInput() expanded?: string | null;
  @NgInput() defaultExpanded: string | null = null;
  /** Svelte-canonical callback. */
  @NgInput() onExpandedChange?: (id: string | null) => void;
  /** Angular-idiom addition (not in the Svelte contract): enables
   *  `[(expanded)]` two-way binding alongside `onExpandedChange`. */
  @Output() readonly expandedChange = new EventEmitter<string | null>();
  @NgInput() primary?: string;
  @NgInput("class") classInput?: string;

  @ContentChildren(PanelSection, { descendants: true }) private sectionsQuery?: QueryList<PanelSection>;

  // --- Registration -----------------------------------------------------
  private entries: PanelStackEntry[] = [];
  private internalExpanded: string | null = null;
  private openSecondary = new Set<string>();
  private autoCollapsed = new Set<string>();
  private expansionOrder: string[] = [];
  private rootHeights = new Map<string, number>();
  private stackHeight = 0;
  private primaryHeaderHeight = 0;
  private resizeObserver: ResizeObserver | null = null;
  private observedPrimaryHeaderEl: HTMLElement | null = null;

  // --- @ContentChildren glue: reconcile the discovered PanelSection
  // instances against `entries`/subscriptions, and push state back onto
  // them. All of THIS is Angular wiring; the actual decisions it calls into
  // (`register`, `toggle`, `isPrimary`, ...) are plain, DOM/Angular-agnostic
  // methods below, directly callable (and tested) on a bare `new PanelStack()`.
  private childUnregister = new Map<PanelSection, () => void>();
  private childToggleSub = new Map<PanelSection, Subscription>();
  private sectionsChangesSub: Subscription | null = null;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    // One-time SEED, not a live binding to `defaultExpanded` — same idiom as
    // RangeSlider's `defaultValue` (Svelte: `untrack(() => defaultExpanded)`).
    this.internalExpanded = this.defaultExpanded;
  }

  ngAfterContentInit(): void {
    this.syncSections();
    this.sectionsChangesSub = this.sectionsQuery?.changes.subscribe(() => this.syncSections()) ?? null;
  }

  ngAfterViewInit(): void {
    const observer = this.ensureResizeObserver();
    observer?.observe(this.host.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["primary"] || changes["shape"]) {
      this.syncPrimaryHeaderObserver();
      this.runAutoCollapseDecision();
    }
    if (changes["primary"] || changes["shape"] || changes["expanded"] || changes["defaultExpanded"]) {
      this.applyStateToChildren();
    }
  }

  ngOnDestroy(): void {
    this.sectionsChangesSub?.unsubscribe();
    this.sectionsChangesSub = null;
    for (const sub of this.childToggleSub.values()) sub.unsubscribe();
    this.childToggleSub.clear();
    for (const unregister of this.childUnregister.values()) unregister();
    this.childUnregister.clear();
    // Release every observation (stack, primary header, every entry) in one
    // shot — a leaked observer is a real bug.
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.observedPrimaryHeaderEl = null;
  }

  get hostClass(): string {
    return classNames("st-panelStack", this.classInput);
  }

  get controlled(): boolean {
    return this.expanded !== undefined;
  }

  get effectiveExpandedId(): string | null {
    if (this.controlled) return this.expanded ?? null;
    if (this.internalExpanded !== null && this.entries.some((e) => e.id === this.internalExpanded)) {
      return this.internalExpanded;
    }
    return this.entries[0]?.id ?? null;
  }

  get effectivePrimary(): string | null {
    if (this.shape !== "split-primary") return null;
    return resolvePanelStackPrimary(
      this.primary,
      this.entries.map((e) => e.id),
      this.openSecondary,
    );
  }

  isPrimary(id: string): boolean {
    return this.shape === "split-primary" && id === this.effectivePrimary;
  }

  isExpanded(id: string): boolean {
    if (this.shape === "split-primary") {
      if (id === this.effectivePrimary) return true;
      return this.openSecondary.has(id) && !this.autoCollapsed.has(id);
    }
    return id === this.effectiveExpandedId;
  }

  isScrollOwner(id: string): boolean {
    return this.shape === "split-primary" ? id === this.effectivePrimary : id === this.effectiveExpandedId;
  }

  toggle(id: string): void {
    if (this.shape === "split-primary") {
      if (id === this.effectivePrimary) return; // primary has no disclosure button; guard anyway.
      const primaryBefore = this.effectivePrimary;
      // Toggle acts on what's currently RENDERED (isExpanded), not the raw
      // openSecondary flag, so a click on an auto-collapsed (visually
      // closed) section always reads as "open it", never a confusing
      // second "close" of a section the user already sees as closed.
      if (this.isExpanded(id)) {
        this.openSecondary.delete(id);
        this.expansionOrder = this.expansionOrder.filter((x) => x !== id);
      } else {
        this.openSecondary.add(id);
        this.autoCollapsed.delete(id);
        // Move to the most-recently-expanded end — an explicit re-open
        // always makes this section the LAST one the algorithm would
        // collapse again.
        this.expansionOrder = [...this.expansionOrder.filter((x) => x !== id), id];
      }
      // Deliberately do NOT re-run the auto-collapse decision unconditionally
      // here: `openSecondary`/`autoCollapsed`/`expansionOrder` are exactly
      // the state this decision WRITES (mirrors PanelStack.svelte's `untrack`
      // of those three inside its decision effect) — re-deciding off them
      // synchronously, before the browser has actually re-laid-out and a
      // real ResizeObserver measurement has landed, would judge the toggle's
      // visual consequence using STALE sizes and could collapse the wrong
      // section. Only re-decide here in the one case a toggle can change a
      // TRACKED dependency: `effectivePrimary` itself shifting (split-primary
      // tier 2/3, `primary` unset — opening/closing a secondary can change
      // which one is "first expanded"). Every other case waits for the next
      // real ResizeObserver delivery, exactly like Svelte's effect does.
      if (this.effectivePrimary !== primaryBefore) {
        this.syncPrimaryHeaderObserver();
        this.runAutoCollapseDecision();
      }
      return;
    }
    // sticky-item: radio semantics — clicking the already-expanded header
    // (including the first-section fallback) is a no-op, there is no
    // "collapse to zero" gesture.
    if (this.effectiveExpandedId === id) return;
    this.setExpanded(id);
  }

  /** Register a section's root AND header element, in registration order;
   *  returns an unregister callback. NOT just bookkeeping — the stack falls
   *  back to the first registered section as the scroll owner whenever
   *  nothing else designates one (unset/stale `expanded` or `primary`), so
   *  the invariant "exactly one scroll owner whenever the stack has >=1
   *  section" holds even for a misconfigured or dynamically-changing stack.
   *  Plain, DOM-agnostic bookkeeping — safe to call directly from tests with
   *  fake element objects (no real DOM required: `el`/`headerEl` are only
   *  ever compared by identity or handed to `ResizeObserver.observe`, which
   *  is itself guarded for absence below). */
  register(id: string, el: HTMLElement, headerEl: HTMLElement): () => void {
    this.entries = [...this.entries.filter((e) => e.el !== el), { id, el, headerEl }];
    // Dev-time visibility only — see PANEL_STACK_MAX_SECTIONS' doc comment.
    // Never truncated/hidden: every registered section still renders and
    // participates normally, this is a nudge, not an enforcement mechanism.
    if (this.entries.length > PANEL_STACK_MAX_SECTIONS) {
      console.warn(
        `[PanelStack] ${this.entries.length} sections registered — the stack is designed for at most ${PANEL_STACK_MAX_SECTIONS}. Beyond that, stacked collapsible regions in a capped pane become unmanageable to scroll and the single-scroll-owner contract gets hard to reason about. Consider splitting into multiple panes.`,
      );
    }
    const observer = this.ensureResizeObserver();
    observer?.observe(el);
    this.syncPrimaryHeaderObserver();
    this.runAutoCollapseDecision();
    return () => {
      observer?.unobserve(el);
      this.entries = this.entries.filter((e) => e.el !== el);
      // Drop any stale open/closed/measurement record for a section that no
      // longer exists, so a LATER section re-registered under the same id
      // doesn't silently inherit a dead instance's state.
      this.openSecondary.delete(id);
      this.autoCollapsed.delete(id);
      this.expansionOrder = this.expansionOrder.filter((x) => x !== id);
      this.rootHeights.delete(id);
      this.syncPrimaryHeaderObserver();
      this.runAutoCollapseDecision();
    };
  }

  private setExpanded(id: string | null): void {
    if (!this.controlled) this.internalExpanded = id;
    this.onExpandedChange?.(id);
    this.expandedChange.emit(id);
    this.applyStateToChildren();
  }

  // --- @ContentChildren reconciliation -----------------------------------

  private syncSections(): void {
    const list = this.sectionsQuery?.toArray() ?? [];
    const live = new Set(list);

    for (const [section, unregister] of [...this.childUnregister]) {
      if (!live.has(section)) {
        unregister();
        this.childUnregister.delete(section);
        this.childToggleSub.get(section)?.unsubscribe();
        this.childToggleSub.delete(section);
      }
    }

    for (const section of list) {
      if (this.childUnregister.has(section)) continue;
      const headerEl = section.headerElement;
      if (!headerEl) continue;
      this.childUnregister.set(section, this.register(section.id, section.rootElement, headerEl));
      this.childToggleSub.set(
        section,
        section.toggleRequested.subscribe((id) => {
          this.toggle(id);
          this.applyStateToChildren();
        }),
      );
    }

    this.applyStateToChildren();
  }

  private applyStateToChildren(): void {
    for (const section of this.sectionsQuery?.toArray() ?? []) {
      section.isPrimary = this.isPrimary(section.id);
      section.expanded = this.isExpanded(section.id);
      section.scrollOwner = this.isScrollOwner(section.id);
    }
  }

  // --- Measurement (split-primary auto-collapse) -------------------------

  private ensureResizeObserver(): ResizeObserver | null {
    if (this.resizeObserver) return this.resizeObserver;
    // Guard: this package's Node test environment (and some SSR/older
    // environments) has no ResizeObserver at all. Auto-collapse simply never
    // engages there — `stackHeight` stays 0, `computePanelStackAutoCollapse`
    // is a permanent no-op — rather than throwing.
    if (typeof ResizeObserver === "undefined") return null;
    this.resizeObserver = new ResizeObserver((observedEntries) => {
      for (const entry of observedEntries) {
        const height = entry.contentRect.height;
        if (entry.target === this.host.nativeElement) {
          this.stackHeight = height;
        } else if (entry.target === this.observedPrimaryHeaderEl) {
          this.primaryHeaderHeight = height;
        } else {
          const found = this.entries.find((e) => e.el === entry.target);
          if (found) this.rootHeights.set(found.id, height);
        }
      }
      // One decision pass per DELIVERY (which may batch several targets),
      // never per-target — matches the pure function's one-collapse-per-call
      // contract and avoids a same-tick avalanche.
      this.runAutoCollapseDecision();
      this.applyStateToChildren();
    });
    return this.resizeObserver;
  }

  /** Retarget the header observer whenever the primary changes (designation,
   *  fallback resolution, or a section registering/unregistering). */
  private syncPrimaryHeaderObserver(): void {
    const primaryId = this.effectivePrimary;
    const nextHeaderEl = primaryId ? (this.entries.find((e) => e.id === primaryId)?.headerEl ?? null) : null;
    const observer = this.ensureResizeObserver();
    if (!observer) {
      this.observedPrimaryHeaderEl = nextHeaderEl;
      return;
    }
    if (this.observedPrimaryHeaderEl && this.observedPrimaryHeaderEl !== nextHeaderEl) {
      observer.unobserve(this.observedPrimaryHeaderEl);
    }
    if (nextHeaderEl && nextHeaderEl !== this.observedPrimaryHeaderEl) {
      observer.observe(nextHeaderEl);
    }
    this.observedPrimaryHeaderEl = nextHeaderEl;
  }

  /** THE decision, driven off whatever measurements are CURRENTLY known.
   *  Called after every event that could change what "fits" means (a fresh
   *  ResizeObserver delivery, a toggle, a register/unregister, a `primary`/
   *  `shape` input change) — safe to over-call: `computePanelStackAutoCollapse`
   *  is a pure, idempotent read that returns `null` once nothing more needs
   *  to collapse, so redundant calls are no-ops. */
  private runAutoCollapseDecision(): void {
    if (this.shape !== "split-primary") return;
    const primaryId = this.effectivePrimary;
    if (primaryId === null) return;
    const secondaryIds = this.entries.filter((e) => e.id !== primaryId).map((e) => e.id);
    const candidate = computePanelStackAutoCollapse(
      {
        primaryId,
        stackHeight: this.stackHeight,
        primaryHeaderHeight: this.primaryHeaderHeight,
        secondaryIds,
        rootHeights: this.rootHeights,
        openSecondary: this.openSecondary,
        autoCollapsed: this.autoCollapsed,
        expansionOrder: this.expansionOrder,
      },
      PRIMARY_MIN_BLOCK_SIZE_PX,
    );
    if (candidate !== null) this.autoCollapsed.add(candidate);
  }
}
