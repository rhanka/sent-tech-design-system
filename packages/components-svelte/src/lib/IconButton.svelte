<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type IconButtonProps = Omit<HTMLButtonAttributes, "class" | "type" | "aria-label"> & {
    "aria-label": string;
    size?: "sm" | "md" | "lg";
    variant?: "ghost" | "secondary" | "danger";
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    class?: string;
    children: Snippet;
  };

  let {
    "aria-label": ariaLabel,
    size = "md",
    variant = "ghost",
    type = "button",
    disabled = false,
    class: className,
    children,
    ...rest
  }: IconButtonProps = $props();

  const classes = () =>
    ["st-iconButton", `st-iconButton--${size}`, `st-iconButton--${variant}`, className]
      .filter(Boolean)
      .join(" ");
</script>

<button
  {...rest}
  class={classes()}
  {type}
  {disabled}
  aria-label={ariaLabel}
>
  {@render children()}
</button>

<style>
  .st-iconButton {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--st-component-iconButton-radius, 0.375rem);
    color: var(--st-component-iconButton-text, var(--st-semantic-text-primary));
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    font: inherit;
    justify-content: center;
    padding: 0;
    transition:
      background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-iconButton--sm {
    height: var(--st-component-iconButton-smSize, 2rem);
    width: var(--st-component-iconButton-smSize, 2rem);
  }

  .st-iconButton--md {
    height: var(--st-component-iconButton-mdSize, 2.25rem);
    width: var(--st-component-iconButton-mdSize, 2.25rem);
  }

  .st-iconButton--lg {
    height: var(--st-component-iconButton-lgSize, 2.5rem);
    width: var(--st-component-iconButton-lgSize, 2.5rem);
  }

  .st-iconButton--secondary {
    background: var(--st-component-control-background, var(--st-semantic-surface-default));
    border-color: var(--st-component-control-border, var(--st-semantic-border-subtle));
  }

  .st-iconButton--danger {
    color: var(--st-semantic-feedback-danger, #b91c1c);
  }

  .st-iconButton:hover:not(:disabled) {
    background: var(--st-component-iconButton-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-iconButton--secondary:hover:not(:disabled) {
    border-color: var(--st-component-control-hoverBorder, var(--st-semantic-border-strong));
  }

  .st-iconButton:focus-visible {
    border-color: var(--st-component-iconButton-focusRing, var(--st-semantic-border-interactive));
    box-shadow: 0 0 0 2px var(--st-component-iconButton-focusRing, var(--st-semantic-border-interactive));
    outline: none;
  }

  .st-iconButton:disabled {
    color: var(--st-component-control-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
  }
</style>
