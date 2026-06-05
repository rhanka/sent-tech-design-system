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

  // --- Row registry: ordered by DOM position so arrow nav matches the visual
  //     order regardless of registration timing. -------------------------------
  type Entry = { el: HTMLElement; value: string | undefined };
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

  // register/unregister are called from each row's $effect. They read AND write
  // `entries`, so the read must be untracked — otherwise the calling effect would
  // subscribe to `entries`, and writing it would re-run the effect forever.
  function register(el: HTMLElement, rowValue: string | undefined): () => void {
    untrack(() => {
      entries = sortByDom([...entries.filter((e) => e.el !== el), { el, value: rowValue }]);
    });
    return () => {
      untrack(() => {
        entries = entries.filter((e) => e.el !== el);
        if (tabStopEl === el) tabStopEl = null;
      });
    };
  }

  // Default roving stop = first registered (DOM-ordered) row when none focused.
  const effectiveTabStop = $derived(tabStopEl ?? entries[0]?.el ?? null);

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
    if (entries.length === 0) return;
    const idx = entries.findIndex((e) => e.el === el);
    if (idx === -1) return;
    let targetIdx = idx;
    if (key === "ArrowDown" || key === "ArrowRight") targetIdx = idx + 1;
    else if (key === "ArrowUp" || key === "ArrowLeft") targetIdx = idx - 1;
    else if (key === "Home") targetIdx = 0;
    else if (key === "End") targetIdx = entries.length - 1;
    // Clamp (no wrap) so Home/End and arrows stay within bounds.
    targetIdx = Math.max(0, Math.min(entries.length - 1, targetIdx));
    const target = entries[targetIdx]?.el;
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
