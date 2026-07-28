<script lang="ts" module>
  import type { Snippet } from "svelte";

  export type PanelSectionProps = {
    id: string;
    label: string;
    children?: Snippet;
    /** Optional header-trailing controls (buttons, counts…). */
    actions?: Snippet;
    class?: string;
  };
</script>

<script lang="ts">
  import { getContext } from "svelte";
  import { ChevronDown } from "@lucide/svelte";
  import { PANEL_STACK_KEY, type PanelStackContext } from "./PanelStack.svelte";

  let { id, label, children, actions, class: className }: PanelSectionProps = $props();

  // A PanelSection outside a PanelStack (no context) falls back to a fully
  // expanded, scroll-owning, non-primary section so it still renders sanely in
  // isolation — but the component is designed to always live inside a stack.
  const stack = getContext<PanelStackContext | undefined>(PANEL_STACK_KEY);

  let rootEl: HTMLElement | null = $state(null);
  // The header is also registered (not just the root): split-primary's
  // auto-collapse measures whichever section is CURRENTLY primary by its
  // header height specifically — see PanelStack.svelte's `register` doc.
  let headerEl: HTMLElement | null = $state(null);

  // Register with the parent stack (mount order) so it can fall back to "the
  // first section" whenever nothing else designates a scroll owner (unset or
  // stale `expanded`/`primary`) — see PanelStack.svelte's `register`. Same
  // register-in-an-effect / return-the-unregister-callback idiom as
  // SelectableRow.
  $effect(() => {
    if (!stack || !rootEl || !headerEl) return;
    return stack.register(id, rootEl, headerEl);
  });

  const triggerId = $derived(`st-panelSection-trigger-${id}`);
  const regionId = $derived(`st-panelSection-region-${id}`);

  const isPrimary = $derived(stack?.isPrimary(id) ?? false);
  const expanded = $derived(stack?.isExpanded(id) ?? true);
  const scrollOwner = $derived(stack?.isScrollOwner(id) ?? true);

  function onTriggerClick() {
    stack?.toggle(id);
  }

  const rootClasses = $derived(
    ["st-panelSection", scrollOwner ? "st-panelSection--scrollOwner" : null, className]
      .filter(Boolean)
      .join(" ")
  );

  const bodyClasses = $derived(
    [
      "st-panelSection__body",
      scrollOwner ? "st-panelSection__body--scrollOwner" : !expanded ? "st-panelSection__body--collapsed" : null
    ]
      .filter(Boolean)
      .join(" ")
  );
</script>

<div class={rootClasses} data-panel-section-id={id} bind:this={rootEl}>
  <div class="st-panelSection__header" bind:this={headerEl}>
    <h3 class="st-panelSection__heading">
      {#if isPrimary}
        <span class="st-panelSection__title st-panelSection__title--primary" id={triggerId}>
          {label}
        </span>
      {:else}
        <button
          type="button"
          class="st-panelSection__trigger"
          aria-expanded={expanded ? "true" : "false"}
          aria-controls={regionId}
          id={triggerId}
          onclick={onTriggerClick}
        >
          <span class="st-panelSection__title">{label}</span>
          <span
            class="st-panelSection__icon"
            class:st-panelSection__icon--expanded={expanded}
            aria-hidden="true"
          >
            <ChevronDown size={18} strokeWidth={2.25} />
          </span>
        </button>
      {/if}
    </h3>
    {#if actions}
      <div class="st-panelSection__actions">
        {@render actions()}
      </div>
    {/if}
  </div>
  <!-- Mounted once, always — collapsing is purely a class/CSS concern (sizing
       + hiding this region), never a conditional block. A chat session, a map
       or any other stateful widget rendered here survives collapse/expand
       without remounting; see AppShell's panelCollapse="accordion" region for
       the same technique. -->
  <div class={bodyClasses} role="region" id={regionId} aria-labelledby={triggerId}>
    {@render children?.()}
  </div>
</div>

<style>
  .st-panelSection {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    min-block-size: 0;
  }

  /* The scroll-owning section grows to fill the stack; every other section
     stays content-sized. */
  .st-panelSection--scrollOwner {
    flex: 1 1 0;
    min-block-size: 0;
    overflow: hidden;
  }

  .st-panelSection__header {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
  }

  .st-panelSection__heading {
    flex: 1 1 auto;
    margin: 0;
    min-inline-size: 0;
  }

  .st-panelSection__trigger {
    align-items: center;
    background: transparent;
    border: 0;
    color: var(--st-component-accordion-text, inherit);
    cursor: pointer;
    display: flex;
    font: inherit;
    font-size: var(--st-component-accordion-fontSize, inherit);
    font-weight: var(--st-component-accordion-fontWeight, 600);
    gap: 0.75rem;
    inline-size: 100%;
    justify-content: space-between;
    line-height: var(--st-component-accordion-lineHeight, normal);
    padding: var(--st-component-accordion-paddingBlock, 0.875rem)
      var(--st-component-accordion-paddingInline, 0.5rem);
    text-align: start;
    transition: background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-panelSection__trigger:hover {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-panelSection__trigger:focus-visible {
    outline: 2px solid var(--st-semantic-border-focus, var(--st-semantic-brand-default));
    outline-offset: -2px;
  }

  .st-panelSection__title {
    flex: 1 1 auto;
  }

  /* Primary heading (split-primary): same box/typography as a trigger's title
     so switching shapes doesn't reflow the header row, but it is a plain
     `<span>` inside the `<h3>` — never a `<button>` — because it cannot
     collapse and a disclosure affordance would lie. */
  .st-panelSection__title--primary {
    color: var(--st-semantic-text-primary);
    display: block;
    font-weight: 600;
    padding: var(--st-component-accordion-paddingBlock, 0.875rem)
      var(--st-component-accordion-paddingInline, 0.5rem);
  }

  .st-panelSection__icon {
    align-items: center;
    block-size: 1.25rem;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    flex: 0 0 auto;
    inline-size: 1.25rem;
    justify-content: center;
    transition: transform var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-panelSection__icon--expanded {
    transform: rotate(180deg);
  }

  .st-panelSection__actions {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    gap: 0.5rem;
    padding-inline-end: 0.5rem;
  }

  .st-panelSection__body {
    color: var(--st-semantic-text-secondary);
    flex: 0 0 auto;
    line-height: 1.5;
    overflow: hidden;
    padding: 0 0.5rem 0.875rem;
  }

  /* THE single scroll owner across the whole stack: at any moment exactly one
     PanelSection body carries this class (see PanelStack.svelte's context
     contract, which is the only place deciding who gets it) — every other
     body stays `overflow: hidden`, content-sized or collapsed to zero.

     `min-block-size` is the floor split-primary's auto-collapse protects (see
     PanelStack.svelte): secondaries collapse before the primary is ever
     squeezed below this. Keep the fallback in sync with PanelStack.svelte's
     `PRIMARY_MIN_BLOCK_SIZE_PX`. Harmless for sticky-item too (there is only
     ever one scroll owner in that shape as well). */
  .st-panelSection__body--scrollOwner {
    flex: 1 1 0;
    min-block-size: var(--st-component-panelStack-primaryMinBlockSize, 10rem);
    overflow: auto;
  }

  /* Collapsed (sticky-item, not the expanded item): header-only. The region
     stays mounted — never removed — only sized to zero and hidden. */
  .st-panelSection__body--collapsed {
    block-size: 0;
    max-block-size: 0;
    overflow: hidden;
    padding-block: 0;
    visibility: hidden;
  }
</style>
