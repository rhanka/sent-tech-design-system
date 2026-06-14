<script lang="ts" module>
  import type { Snippet } from "svelte";

  export type SelectableListProps = {
    /** Accessible name for the listbox (required for SR users). */
    label?: string;
    /** References the id of an external visible label (alternative to `label`). */
    labelledby?: string;
    /**
     * Allow more than one selected row. Adds aria-multiselectable and toggles
     * each row independently. Defaults to false (single-select).
     */
    multiple?: boolean;
    /**
     * Selected value(s). Controlled when provided. For single-select pass a
     * string (or null); for multiple pass a string[]. When omitted the list is
     * uncontrolled and keeps its own internal selection.
     */
    value?: string | string[] | null;
    /**
     * Fired with the new selection on every change. Receives a string|null for
     * single-select and a string[] for multiple. Required for the controlled
     * pattern; also fires for uncontrolled lists.
     */
    onchange?: (value: string | string[] | null) => void;
    class?: string;
    children?: Snippet;
  };
</script>

<script lang="ts">
  import { setContext, untrack } from "svelte";
  import {
    SELECTABLE_LIST_KEY,
    type SelectableListContext
  } from "./SelectableRow.svelte";

  let {
    label,
    labelledby,
    multiple = false,
    value,
    onchange,
    class: className,
    children
  }: SelectableListProps = $props();

  // Controlled when the consumer passes `value` (including null). Otherwise the
  // list owns an internal selection set.
  const controlled = $derived(value !== undefined);

  function toSet(v: string | string[] | null | undefined): Set<string> {
    if (v == null) return new Set();
    return new Set(Array.isArray(v) ? v : [v]);
  }

  // Internal selection for the uncontrolled case.
  let internal = $state<Set<string>>(new Set());
  const selectedValues = $derived(controlled ? toSet(value) : internal);

  // --- Row registry. Rows are stored in INSERTION order (registration is O(1));
  //     the DOM-ordered view is computed LAZILY (see `orderedEntries`) and only
  //     when a consumer actually needs visual order (arrow nav / roving tab stop).
  //     Sorting eagerly on every register() was O(n) per mount → O(n²) for the
  //     whole list (issue #26); deferring it makes a large list mount in O(n).
  type Entry = { el: HTMLElement; value: string | undefined; disabled?: boolean };
  let entries = $state<Entry[]>([]);

  // The element that currently holds the roving tab stop (tabindex 0). Null until
  // a row is focused; until then the FIRST enabled row is the default stop.
  let tabStopEl = $state<HTMLElement | null>(null);

  function sortByDom(list: Entry[]): Entry[] {
    return [...list].sort((a, b) => {
      const pos = a.el.compareDocumentPosition(b.el);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
  }

  // DOM-ordered view of the registry. Memoised by `$derived.by` so the O(n log n)
  // `compareDocumentPosition` sort runs at most ONCE per registry change (a batch
  // of mounts in the same tick collapses into a single recompute), not once per
  // register() call. ORDER-dependent readers (`navigate`, `effectiveTabStop`'s
  // "first enabled row") read THIS so visual order is correct regardless of
  // registration timing; order-INDEPENDENT lookups (`valueOf`/`isSelected`,
  // disabled-membership) read the raw `entries`. register() itself stays O(1).
  const orderedEntries = $derived.by(() => sortByDom(entries));

  // register/unregister are called from each row's $effect. They read AND write
  // `entries`, so the read must be untracked — otherwise the calling effect would
  // subscribe to `entries`, and writing it would re-run the effect forever.
  // register() APPENDS in insertion order (O(1)); the DOM sort is deferred to the
  // lazy `orderedEntries`. Disabled rows are registered with disabled:true so
  // navigate() can skip them explicitly, making the skip correct even when the
  // disabled state changes mid-session.
  function register(el: HTMLElement, rowValue: string | undefined, rowDisabled = false): () => void {
    untrack(() => {
      entries = [
        ...entries.filter((e) => e.el !== el),
        { el, value: rowValue, disabled: rowDisabled }
      ];
    });
    return () => {
      untrack(() => {
        entries = entries.filter((e) => e.el !== el);
        if (tabStopEl === el) tabStopEl = null;
      });
    };
  }

  // Default roving stop = first non-disabled DOM-ordered row when none focused,
  // or when the current tabStopEl has become disabled.
  const effectiveTabStop = $derived.by((): HTMLElement | null => {
    if (tabStopEl) {
      const entry = entries.find((e) => e.el === tabStopEl);
      if (entry && !entry.disabled) return tabStopEl;
    }
    // "First enabled row" must be in DOM order, so read the ordered view.
    return orderedEntries.find((e) => !e.disabled)?.el ?? null;
  });

  // Si la row qui détient le focus DOM devient disabled (in-place, sans unmount),
  // transférer le focus vers la nouvelle cible de roving tabindex.
  // Note : le cas du cycle unregister/register est géré dans SelectableRow via
  // l'$effect sur `disabled` qui appelle navigate() AVANT le cleanup.
  $effect(() => {
    const newStop = effectiveTabStop;
    if (!newStop) return;
    if (tabStopEl !== null) {
      const disabledEntry = entries.find((e) => e.el === tabStopEl && e.disabled);
      if (disabledEntry && tabStopEl.contains(document.activeElement ?? null)) {
        newStop.focus();
      }
    }
  });

  function valueOf(el: HTMLElement): string | undefined {
    return entries.find((e) => e.el === el)?.value;
  }

  function isSelected(el: HTMLElement): boolean {
    const v = valueOf(el);
    return v !== undefined && selectedValues.has(v);
  }

  function isTabStop(el: HTMLElement): boolean {
    return el === effectiveTabStop;
  }

  function emit(next: Set<string>) {
    if (!controlled) internal = next;
    if (multiple) onchange?.([...next]);
    else onchange?.(next.size ? [...next][0] : null);
  }

  function activate(el: HTMLElement) {
    const v = valueOf(el);
    if (v === undefined) return;
    const current = selectedValues;
    let next: Set<string>;
    if (multiple) {
      next = new Set(current);
      if (next.has(v)) next.delete(v);
      else next.add(v);
    } else {
      // Single-select toggles off when re-activating the selected row.
      next = current.has(v) && current.size === 1 ? new Set() : new Set([v]);
    }
    emit(next);
  }

  function focusRow(el: HTMLElement) {
    tabStopEl = el;
  }

  function navigate(el: HTMLElement, key: string) {
    // Keyboard navigation walks rows in VISUAL (DOM) order, so read the lazily
    // sorted view here. This is the first point the deferred sort is forced — the
    // O(n²) register-time sort storm is gone, the sort runs once on demand.
    const ordered = orderedEntries;
    if (ordered.length === 0) return;
    const idx = ordered.findIndex((e) => e.el === el);
    if (idx === -1) return;

    let targetIdx: number | null = null;

    if (key === "ArrowDown" || key === "ArrowRight") {
      // Walk forward from current position, find the next non-disabled entry.
      for (let i = idx + 1; i < ordered.length; i++) {
        if (!ordered[i].disabled) { targetIdx = i; break; }
      }
    } else if (key === "ArrowUp" || key === "ArrowLeft") {
      // Walk backward from current position, find the previous non-disabled entry.
      for (let i = idx - 1; i >= 0; i--) {
        if (!ordered[i].disabled) { targetIdx = i; break; }
      }
    } else if (key === "Home") {
      // First non-disabled entry.
      for (let i = 0; i < ordered.length; i++) {
        if (!ordered[i].disabled) { targetIdx = i; break; }
      }
    } else if (key === "End") {
      // Last non-disabled entry.
      for (let i = ordered.length - 1; i >= 0; i--) {
        if (!ordered[i].disabled) { targetIdx = i; break; }
      }
    }

    // If no target found (all remaining are disabled, or already at boundary), stay put.
    if (targetIdx === null) return;

    const target = ordered[targetIdx]?.el;
    if (target) {
      tabStopEl = target;
      target.focus();
    }
  }

  const context: SelectableListContext = {
    managed: true,
    itemRole: "option",
    register,
    isSelected,
    isTabStop,
    activate,
    focusRow,
    navigate
  };
  setContext(SELECTABLE_LIST_KEY, context);

  const classes = $derived(["st-selectableList", className].filter(Boolean).join(" "));
</script>

<div
  class={classes}
  role="listbox"
  aria-label={labelledby ? undefined : label}
  aria-labelledby={labelledby}
  aria-multiselectable={multiple ? "true" : undefined}
>
  {@render children?.()}
</div>

<style>
  .st-selectableList {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-1, 0.25rem);
    width: 100%;
  }
</style>
