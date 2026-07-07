<script lang="ts">
  import { ChevronDown } from "@lucide/svelte";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type CollapsibleProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "title"> & {
    /** État ouvert (bindable). */
    open?: boolean;
    title: string;
    /**
     * Density of the trigger — `"md"` (default) is the current render. `"sm"`
     * de-emphasizes the trigger (smaller font/weight/padding) for NESTED /
     * level-2 collapsibles; `"lg"` enlarges it. Additive: with `size` unset the
     * trigger renders byte-identically to before.
     */
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    /**
     * Trailing content rendered inside the trigger, BETWEEN the title and the
     * chevron (e.g. a count Badge, a status Tag, a glyph). The chevron stays the
     * rightmost affordance. If the trailing content carries information SR users
     * need as part of the trigger name, set `aria-label` on the Collapsible via
     * `...rest` (e.g. `aria-label="Entities, 128 items"`).
     */
    trailing?: Snippet;
    onToggle?: (open: boolean) => void;
    class?: string;
    children?: Snippet;
  };

  let {
    open = $bindable(false),
    title,
    size = "md",
    disabled = false,
    trailing,
    onToggle,
    class: className,
    children,
    ...rest
  }: CollapsibleProps = $props();

  const uid = `st-collapsible-${Math.random().toString(36).slice(2, 9)}`;

  const classes = $derived(
    [
      "st-collapsible",
      `st-collapsible--${size}`,
      open ? "st-collapsible--open" : null,
      className
    ]
      .filter(Boolean)
      .join(" ")
  );

  function toggle() {
    if (disabled) return;
    open = !open;
    onToggle?.(open);
  }
</script>

<div {...rest} class={classes}>
  <button
    type="button"
    class="st-collapsible__trigger"
    aria-expanded={open ? "true" : "false"}
    aria-controls={`${uid}-region`}
    id={`${uid}-trigger`}
    {disabled}
    onclick={toggle}
  >
    <span class="st-collapsible__title">{title}</span>
    {#if trailing}
      <span class="st-collapsible__trailing">{@render trailing()}</span>
    {/if}
    <span class="st-collapsible__icon" aria-hidden="true">
      <ChevronDown size={18} strokeWidth={2.25} />
    </span>
  </button>
  {#if open}
    <div
      class="st-collapsible__region"
      role="region"
      id={`${uid}-region`}
      aria-labelledby={`${uid}-trigger`}
    >
      {@render children?.()}
    </div>
  {/if}
</div>

<style>
  .st-collapsible {
    color: var(--st-semantic-text-primary);
    width: 100%;
  }

  .st-collapsible__trigger {
    align-items: center;
    background: transparent;
    border: 0;
    color: var(--st-component-accordion-text, inherit);
    cursor: pointer;
    display: flex;
    font: inherit;
    font-size: var(--st-component-accordion-fontSize, 0.9375rem);
    font-weight: var(--st-component-accordion-fontWeight, 650);
    gap: 0.75rem;
    justify-content: space-between;
    line-height: var(--st-component-accordion-lineHeight, 1.3);
    padding: var(--st-component-accordion-paddingBlock, 0.625rem)
      var(--st-component-accordion-paddingInline, 0.25rem);
    text-align: start;
    transition: background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: 100%;
  }

  .st-collapsible__trigger:hover:not(:disabled) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-collapsible__trigger:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: -2px;
  }

  .st-collapsible__trigger:disabled {
    color: var(--st-semantic-text-muted);
    cursor: not-allowed;
  }

  /* Density variants (additive). `md` is the UNTOUCHED base `.st-collapsible__trigger`
     above — no `--md` rule exists, so a `size="md"` (or unset) trigger renders
     byte-identically. `--sm` de-emphasizes for nesting; `--lg` enlarges. Every
     leaf falls back to a base literal so a theme that emits no
     `--st-component-collapsible-*` renders these variants identically. */
  .st-collapsible--sm .st-collapsible__trigger {
    font-size: var(--st-component-collapsible-sm-fontSize, 0.875rem);
    font-weight: var(--st-component-collapsible-sm-fontWeight, 500);
    padding: var(--st-component-collapsible-sm-paddingBlock, 0.4rem)
      var(--st-component-collapsible-sm-paddingInline, 0.25rem);
  }

  .st-collapsible--lg .st-collapsible__trigger {
    font-size: var(--st-component-collapsible-lg-fontSize, 1rem);
    padding: var(--st-component-collapsible-lg-paddingBlock, 0.875rem)
      var(--st-component-collapsible-lg-paddingInline, 0.25rem);
  }

  .st-collapsible__title {
    flex: 1 1 auto;
  }

  /* Trigger trailing slot (additive). Holds a count badge / status / glyph
     between the title and the chevron; never grows, so the chevron stays the
     rightmost affordance and the title keeps `flex: 1 1 auto`. */
  .st-collapsible__trailing {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
  }

  .st-collapsible__icon {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    flex: 0 0 auto;
    height: 1.25rem;
    justify-content: center;
    transition: transform var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: 1.25rem;
  }

  .st-collapsible--open > .st-collapsible__trigger .st-collapsible__icon {
    transform: rotate(180deg);
  }

  .st-collapsible__region {
    color: var(--st-semantic-text-secondary);
    line-height: 1.5;
    padding: 0 0.25rem 0.625rem;
  }
</style>
