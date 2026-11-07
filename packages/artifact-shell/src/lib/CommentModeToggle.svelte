<script lang="ts" module>
  export type { CommentModeToggleEvents, CommentModeToggleProps } from "./types.js";
</script>

<script lang="ts">
  import { LabelledIconButton } from "@sentropic/design-system-svelte";
  import type { CommentModeToggleEvents, CommentModeToggleProps } from "./types.js";

  // §5.1 — the mode entry/exit control. Toggle semantics only: click emits
  // onToggle and opens nothing. `shortcutLabel` is carried in props so other
  // chrome can render the binding; this component renders labels.tooltip
  // verbatim (the host guarantees it contains shortcutLabel).
  let {
    pressed,
    label,
    ariaKeyshortcuts,
    labels,
    onToggle
  }: CommentModeToggleProps & CommentModeToggleEvents = $props();
</script>

<span
  class={pressed ? "st-commentModeToggle st-commentModeToggle--pressed" : "st-commentModeToggle"}
  data-st-shell="comment-mode-toggle"
>
  <LabelledIconButton
    {label}
    icon="comment"
    {pressed}
    ariaKeyshortcuts={ariaKeyshortcuts}
    tooltipContent={labels.tooltip}
    onclick={() => onToggle()}
  />
</span>

<style>
  /* commentModeToggle owns no token of its own (§2.5): it inherits IconButton
     + Tooltip tokens through the LabelledIconButton composition. */
  .st-commentModeToggle {
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-component-iconButton-radius, 0.375rem);
    display: inline-flex;
    transition:
      background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  /* Pressed state is never colour alone: a heavier border (weight change)
     plus the aria-pressed state on the button carry it. */
  .st-commentModeToggle--pressed {
    background: var(--st-semantic-surface-subtle);
    border-color: var(--st-semantic-border-interactive);
    border-width: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-commentModeToggle {
      animation-duration: 0s;
      transition-duration: 0s;
    }
  }
</style>
