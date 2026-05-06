<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type ButtonProps = Omit<HTMLButtonAttributes, "class" | "disabled" | "type"> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    class?: string;
    children?: Snippet;
  };

  let {
    variant = "primary",
    size = "md",
    disabled = false,
    type = "button",
    class: className,
    children,
    ...rest
  }: ButtonProps = $props();

  const classes = () =>
    ["st-button", `st-button--${variant}`, `st-button--${size}`, className]
      .filter(Boolean)
      .join(" ");
</script>

<button {...rest} class={classes()} {type} {disabled}>
  {@render children?.()}
</button>

<style>
  .st-button {
    border: 1px solid transparent;
    border-radius: var(--st-component-button-radius, 0.375rem);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--st-spacing-2, 0.5rem);
    font: inherit;
    font-weight: 600;
    transition:
      background var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-button--sm {
    min-height: 2rem;
    padding: 0 0.75rem;
    font-size: 0.875rem;
  }

  .st-button--md {
    min-height: 2.5rem;
    padding: 0 1rem;
    font-size: 0.9375rem;
  }

  .st-button--lg {
    min-height: 3rem;
    padding: 0 1.25rem;
    font-size: 1rem;
  }

  .st-button--primary {
    background: var(--st-component-button-primaryBackground, var(--st-semantic-action-primary));
    color: var(--st-component-button-primaryText, var(--st-semantic-action-primaryText));
  }

  .st-button--secondary {
    background: var(--st-component-button-secondaryBackground, var(--st-semantic-action-secondary));
    color: var(--st-component-button-secondaryText, var(--st-semantic-action-secondaryText));
    border-color: var(--st-semantic-border-subtle);
  }

  .st-button--ghost {
    background: transparent;
    color: var(--st-semantic-text-link);
  }

  .st-button--danger {
    background: var(--st-semantic-action-danger);
    color: var(--st-semantic-text-inverse);
  }

  .st-button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .st-button:focus-visible {
    outline: 2px solid var(--st-component-input-focusRing, var(--st-semantic-border-interactive));
    outline-offset: 2px;
  }
</style>
