<script lang="ts" module>
  import type { Snippet } from "svelte";

  /**
   * Shared context contract between {@link SelectableList} and its slotted
   * {@link SelectableRow} children. The list owns selection + roving tabindex and
   * exposes reactive getters the rows read to derive their own `role` / `tabindex`
   * / `aria-selected`, plus callbacks for registration and activation. When a row
   * is used STANDALONE (no list) `getContext` returns undefined and the row falls
   * back to its own `role` / `tabindex` / selection state.
   */
  export const SELECTABLE_LIST_KEY = Symbol("st-selectable-list");

  export type SelectableListContext = {
    /** True when the list manages selection/roving for its rows. */
    readonly managed: true;
    /** listbox role for the wrapper → rows are "option". */
    readonly itemRole: "option";
    /** Register a row element; returns an unregister callback. disabled is forwarded so the list can skip it during keyboard navigation. */
    register: (el: HTMLElement, value: string | undefined, disabled?: boolean) => () => void;
    /** Is the row with this element currently selected? */
    isSelected: (el: HTMLElement) => boolean;
    /** Should the row with this element be the roving-tabindex stop (tabindex 0)? */
    isTabStop: (el: HTMLElement) => boolean;
    /** Row was activated (click / Space / Enter). The list toggles selection. */
    activate: (el: HTMLElement) => void;
    /** Row received focus → becomes the roving tab stop. */
    focusRow: (el: HTMLElement) => void;
    /** Arrow / Home / End navigation from a row. */
    navigate: (el: HTMLElement, key: string) => void;
  };

  export type SelectableRowProps = {
    /**
     * Selected state (bindable). Honoured when the row is used STANDALONE; inside
     * a {@link SelectableList} the list is the source of truth and drives the
     * selected styling, so this prop is ignored for managed rows.
     */
    selected?: boolean;
    /** Notified on every toggle with the new selected state (standalone rows). */
    onselect?: (selected: boolean) => void;
    /** Non-interactive when true. */
    disabled?: boolean;
    /** Stable value, surfaced as `data-value` and used by the list for `value`. */
    value?: string;
    /**
     * ARIA role for the standalone row. Defaults to "button" for standalone use —
     * "option" is only valid inside a listbox and would be invalid without one.
     * Inside a SelectableList the role is always forced to "option".
     */
    role?: string;
    /**
     * Opt-in left accent bar on the selected state. Off by default so the
     * selected item is a calm tinted surface + accented text (two signals only).
     */
    accentBar?: boolean;
    /** Leading slot (icon / avatar). */
    leading?: Snippet;
    /** Trailing slot (meta / icon). */
    trailing?: Snippet;
    /** Main content. */
    children?: Snippet;
    /**
     * Optional secondary line (the "legend") rendered MUTED and smaller UNDER
     * `children`. When present the content column stacks vertically (a
     * `--hasCaption` modifier); when absent the row stays single-line and
     * byte-identical. The caption joins the row's accessible name by default (the
     * SR reads "label, caption"); wrap it `aria-hidden` if it is purely
     * decorative. MUST NOT contain interactive controls — a row is a single tab
     * stop.
     */
    caption?: Snippet;
    class?: string;
  };
</script>

<script lang="ts">
  import { getContext } from "svelte";

  let {
    selected = $bindable(false),
    onselect,
    disabled = false,
    value,
    role = "button",
    accentBar = false,
    leading,
    trailing,
    children,
    caption,
    class: className
  }: SelectableRowProps = $props();

  // When rendered inside a SelectableList, the list (via context) owns selection
  // and the roving tabindex. Standalone rows manage their own state.
  const list = getContext<SelectableListContext | undefined>(SELECTABLE_LIST_KEY);

  let el: HTMLElement | null = $state(null);

  // Register with the parent list (if any) so it can order rows for arrow nav
  // and compute the roving tab stop. Disabled rows are registered too so the
  // list can skip them during navigation; the list owns the skip logic.
  $effect(() => {
    if (!list || !el) return;
    return list.register(el, value, disabled);
  });

  // A11y edge-case : quand cette row passe à disabled=true ET qu'elle détient le
  // focus DOM, transférer le focus vers la prochaine row enabled via navigate().
  // On le fait ici (dans SelectableRow) pour avoir accès au focus DOM AVANT que
  // le cycle unregister/register dans SelectableList ne perturbe l'état.
  $effect(() => {
    if (!disabled || !list || !el) return;
    if (!el.contains(document.activeElement ?? null)) return;
    // Déléguer via navigate ArrowDown (cherche prochaine row enabled vers l'avant,
    // puis vers l'arrière si aucune). navigate appelle target.focus() directement.
    list.navigate(el, "ArrowDown");
  });

  // Effective selected state: list-managed rows read the list; standalone rows
  // use their own bindable prop.
  const isSelected = $derived(list && el ? list.isSelected(el) : selected);

  // Effective role: a managed row is always an "option" inside the listbox.
  const effectiveRole = $derived(list ? list.itemRole : role);

  // Roving tabindex: in a list, exactly one enabled row is the tab stop (0), the
  // rest are -1. Standalone enabled rows are always tabbable (0). Disabled = -1.
  const tabindex = $derived(
    disabled ? -1 : list && el ? (list.isTabStop(el) ? 0 : -1) : 0
  );

  const classes = $derived(
    [
      "st-selectableRow",
      isSelected ? "st-selectableRow--selected" : null,
      disabled ? "st-selectableRow--disabled" : null,
      accentBar ? "st-selectableRow--accentBar" : null,
      caption ? "st-selectableRow--hasCaption" : null,
      className
    ]
      .filter(Boolean)
      .join(" ")
  );

  function activate() {
    if (disabled) return;
    if (list && el) {
      list.activate(el);
      return;
    }
    selected = !selected;
    onselect?.(selected);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activate();
      return;
    }
    // Roving navigation is owned by the list; forward the relevant keys.
    if (
      list &&
      el &&
      (e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "Home" ||
        e.key === "End")
    ) {
      e.preventDefault();
      list.navigate(el, e.key);
    }
  }

  function handleFocus() {
    if (disabled) return;
    if (list && el) list.focusRow(el);
  }
</script>

<!-- The row carries an interactive ARIA role (option/listbox item) so a roving
     tabindex is correct; the role is dynamic, which the static a11y check cannot
     verify, hence the targeted ignore. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  bind:this={el}
  class={classes}
  role={effectiveRole}
  aria-selected={effectiveRole === "option" ? isSelected : undefined}
  aria-pressed={effectiveRole === "button" ? isSelected : undefined}
  aria-disabled={disabled ? "true" : undefined}
  data-value={value}
  {tabindex}
  onclick={activate}
  onkeydown={handleKeydown}
  onfocus={handleFocus}
>
  {#if leading}
    <span class="st-selectableRow__leading">{@render leading()}</span>
  {/if}
  {#if caption}
    <!-- Caption present: the content column stacks the primary label over a muted
         second line. Both lines truncate independently (each min-width:0 + ellipsis)
         so a long caption never pushes the row width. -->
    <span class="st-selectableRow__content st-selectableRow__content--stacked">
      <span class="st-selectableRow__label">{@render children?.()}</span>
      <span class="st-selectableRow__caption">{@render caption()}</span>
    </span>
  {:else}
    <span class="st-selectableRow__content">{@render children?.()}</span>
  {/if}
  {#if trailing}
    <span class="st-selectableRow__trailing">{@render trailing()}</span>
  {/if}
</div>

<style>
  /* Compact, full-width selectable list/rail row. By DEFAULT the selected state
     is just two calm signals — a tinted surface + accented text — deliberately
     NOT the off-theme "boudin box" (inset box-shadow + heavy rounded border) it
     replaces, and NOT a reflow-causing font-weight bump. The fine left accent
     bar is OPT-IN via the `accentBar` prop. */
  .st-selectableRow {
    align-items: center;
    background: transparent;
    border-radius: var(--st-radius-sm, 0.25rem);
    box-sizing: border-box;
    color: var(--st-semantic-text-secondary, #475569);
    cursor: pointer;
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    padding: 0.5rem 0.75rem;
    position: relative;
    text-align: left;
    transition:
      background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    user-select: none;
    width: 100%;
  }

  /* Opt-in accent bar: reserve the 2px gutter only when enabled so text never
     shifts on selection. */
  .st-selectableRow--accentBar {
    padding-left: calc(0.75rem - 2px);
    border-left: 2px solid transparent;
  }

  .st-selectableRow:hover:not(.st-selectableRow--disabled):not(.st-selectableRow--selected) {
    background: var(
      --st-component-control-hoverBackground,
      var(--st-semantic-surface-subtle, #f8fafc)
    );
    color: var(--st-semantic-text-primary, #0f172a);
  }

  /* Focus ring as an EXTERNAL offset (not inset) so it reads as a focus
     affordance around the row rather than an inner stroke. */
  .st-selectableRow:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive, var(--st-semantic-action-primary));
    outline-offset: 2px;
  }

  /* Selected: two signals by default — tinted surface + accented (contrast-safe)
     text. The token values carry a flat fallback; the inline color-mix is only a
     last-resort default when the token is unset. */
  .st-selectableRow--selected {
    background: var(
      --st-component-selectableRow-selectedBackground,
      color-mix(in oklch, var(--st-semantic-action-primary, #2563eb) 12%, transparent)
    );
    color: var(
      --st-component-selectableRow-selectedText,
      color-mix(in oklch, var(--st-semantic-action-primary, #2563eb) 78%, black)
    );
  }

  /* The left accent bar paints only when opt-in AND selected. */
  .st-selectableRow--accentBar.st-selectableRow--selected {
    border-left-color: var(
      --st-component-selectableRow-selectedAccent,
      var(--st-semantic-action-primary, #2563eb)
    );
  }

  /* color-mix fallback: engines without color-mix() get a flat tinted surface +
     a solid accent text from the resolved tokens' plain values. */
  @supports not (color: color-mix(in oklch, red, blue)) {
    .st-selectableRow--selected {
      background: var(
        --st-component-selectableRow-selectedBackground,
        var(--st-semantic-surface-subtle, #eef2ff)
      );
      color: var(
        --st-component-selectableRow-selectedText,
        var(--st-semantic-action-primary, #1d4ed8)
      );
    }
  }

  .st-selectableRow--disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .st-selectableRow__leading,
  .st-selectableRow__trailing {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
  }

  .st-selectableRow__content {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Caption variant (additive). Rows WITHOUT a caption keep the single-line
     `.st-selectableRow__content` above byte-identically (no `--stacked` rule
     applies). `--stacked` overlays a vertical column: the primary `__label` keeps
     its own single-line ellipsis, and the muted `__caption` truncates
     independently so a long legend never pushes the row width. Every leaf falls
     back to a base literal so a theme that emits no
     `--st-component-selectableRow-caption*` renders the caption identically. */
  .st-selectableRow__content--stacked {
    display: flex;
    flex-direction: column;
    /* The column stack drops the inline ellipsis/nowrap (each line truncates on
       its own child); keep min-width:0 so the column can shrink and ellipsize. */
    overflow: visible;
    white-space: normal;
    gap: var(--st-component-selectableRow-captionGap, 0.125rem);
  }

  .st-selectableRow__label,
  .st-selectableRow__caption {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .st-selectableRow__caption {
    color: var(--st-component-selectableRow-captionColor, var(--st-semantic-text-muted));
    font-size: var(--st-component-selectableRow-captionFontSize, 0.75rem);
  }

  @media (prefers-reduced-motion: reduce) {
    .st-selectableRow { transition: none; }
  }
</style>
