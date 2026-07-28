<script lang="ts" module>
  import type { Snippet } from "svelte";

  export type PanelStackShape = "split-primary" | "sticky-item";

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
    /** split-primary: id of the section that owns the scroll. */
    primary?: string;
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
     * Register a section's root element, in mount/DOM order; returns an
     * unregister callback. NOT just bookkeeping — the stack falls back to the
     * first registered section as the scroll owner whenever nothing else
     * designates one (unset/stale `expanded` or `primary`), so the invariant
     * "exactly one scroll owner whenever the stack has ≥1 section" holds even
     * for a misconfigured or dynamically-changing stack.
     */
    register: (id: string, el: HTMLElement) => () => void;
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
  type Entry = { id: string; el: HTMLElement };
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

  function register(id: string, el: HTMLElement): () => void {
    untrack(() => {
      entries = [...entries.filter((e) => e.el !== el), { id, el }];
    });
    return () => {
      untrack(() => {
        entries = entries.filter((e) => e.el !== el);
        // Drop any stale open/closed record for a section that no longer
        // exists, so a LATER section re-registered under the same id doesn't
        // silently inherit a dead instance's state.
        if (openSecondary.has(id)) {
          const next = new Set(openSecondary);
          next.delete(id);
          openSecondary = next;
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
  // starts closed (header only) until the user opens it.
  let openSecondary = $state<Set<string>>(new Set());

  // split-primary: the section matching `primary`, or — if `primary` is unset
  // or matches no registered section (a misconfiguration) — the first
  // registered section, so the stack degrades to "usable" (one scroll owner)
  // rather than to zero.
  const effectivePrimary = $derived.by((): string | null => {
    if (shape !== "split-primary") return null;
    if (primary !== undefined && entries.some((e) => e.id === primary)) return primary;
    return firstId;
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
      return openSecondary.has(id);
    }
    return id === effectiveExpandedId;
  }

  function isScrollOwner(id: string): boolean {
    return shape === "split-primary" ? id === effectivePrimary : id === effectiveExpandedId;
  }

  function toggle(id: string) {
    if (shape === "split-primary") {
      if (id === effectivePrimary) return; // primary has no disclosure button; guard anyway.
      const next = new Set(openSecondary);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      openSecondary = next;
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

<div class={classes} role="group" aria-label={label}>
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
