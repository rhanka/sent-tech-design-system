<script lang="ts">
  import type { Snippet } from "svelte";

  type ToggletipProps = {
    content: string;
    label?: string;
    placement?: "top" | "bottom" | "start" | "end";
    open?: boolean;
    triggerLabel?: string;
    class?: string;
    children?: Snippet;
  };

  let {
    content,
    label,
    placement = "top",
    open = $bindable(false),
    triggerLabel,
    class: className,
    children
  }: ToggletipProps = $props();

  const wrapperClasses = () =>
    ["st-toggletip", `st-toggletip--${placement}`, className].filter(Boolean).join(" ");

  function toggle() {
    open = !open;
  }

  function close() {
    open = false;
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      close();
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<span class={wrapperClasses()}>
  {#if children}
    {@render children()}
  {/if}
  <button
    type="button"
    class="st-toggletip__trigger"
    aria-label={triggerLabel ?? label ?? "More information"}
    aria-expanded={open ? "true" : "false"}
    onclick={toggle}
  >
    <span aria-hidden="true">i</span>
  </button>
  {#if open}
    <span class="st-toggletip__bubble" role="status" aria-live="polite">
      {#if label}<span class="st-toggletip__label">{label}</span>{/if}
      <span class="st-toggletip__content">{content}</span>
    </span>
  {/if}
</span>

<style>
  .st-toggletip {
    align-items: center;
    display: inline-flex;
    gap: 0.25rem;
    position: relative;
  }

  .st-toggletip__trigger {
    align-items: center;
    background: var(--st-component-selection-switchTrack, var(--st-semantic-border-subtle));
    border: 0;
    border-radius: 50%;
    color: var(--st-semantic-text-primary);
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 0.75rem;
    font-weight: 700;
    height: 1.25rem;
    justify-content: center;
    line-height: 1;
    padding: 0;
    width: 1.25rem;
  }

  .st-toggletip__trigger:hover {
    background: var(--st-semantic-border-strong);
  }

  .st-toggletip__trigger:focus-visible {
    box-shadow: 0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline: none;
  }

  .st-toggletip__bubble {
    background: var(--st-semantic-surface-default);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-md, 0.5rem);
    box-shadow: var(--st-shadow-sm, 0 4px 12px rgba(0, 0, 0, 0.08));
    color: var(--st-semantic-text-primary);
    display: grid;
    font-size: 0.8125rem;
    gap: 0.25rem;
    line-height: 1.4;
    max-width: 16rem;
    min-width: 8rem;
    padding: 0.5rem 0.625rem;
    position: absolute;
    z-index: var(--st-zindex-overlay, 50);
  }

  .st-toggletip--top .st-toggletip__bubble {
    bottom: calc(100% + 0.375rem);
    left: 50%;
    transform: translateX(-50%);
  }

  .st-toggletip--bottom .st-toggletip__bubble {
    top: calc(100% + 0.375rem);
    left: 50%;
    transform: translateX(-50%);
  }

  .st-toggletip--start .st-toggletip__bubble {
    right: calc(100% + 0.375rem);
    top: 50%;
    transform: translateY(-50%);
  }

  .st-toggletip--end .st-toggletip__bubble {
    left: calc(100% + 0.375rem);
    top: 50%;
    transform: translateY(-50%);
  }

  .st-toggletip__label {
    color: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
  }
</style>
