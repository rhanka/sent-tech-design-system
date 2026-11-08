<script lang="ts" module>
  import type { IconName } from "./icons.js";

  export type LabelledIconButtonProps = {
    /** Hover/focus label AND accessible name. The two are the same string by contract. */
    label: string;
    /** DS icon rendered inside the button. */
    icon: IconName;
    /** Forwarded to IconButton. */
    size?: "sm" | "md" | "lg";
    /** Forwarded to IconButton. */
    variant?: "ghost" | "secondary" | "danger";
    /** Forwarded to IconButton. */
    disabled?: boolean;
    /** Forwarded to Tooltip. */
    tooltipPlacement?: "top" | "bottom";
    onclick?: (event: MouseEvent) => void;
    class?: string;
    // CA-L1 amendment (AS-1 fold-in, additive only): pressed -> aria-pressed,
    // ariaKeyshortcuts -> aria-keyshortcuts, tooltipContent overrides the
    // Tooltip content while the accessible name stays `label`.
    /** Toggle state, rendered as aria-pressed on the button. */
    pressed?: boolean;
    /** WAI-ARIA key-shortcut grammar, rendered as aria-keyshortcuts verbatim. */
    ariaKeyshortcuts?: string;
    /** Overrides the Tooltip content; the accessible name stays `label`. */
    tooltipContent?: string;
  };
</script>

<script lang="ts">
  import Icon from "./Icon.svelte";
  import IconButton from "./IconButton.svelte";
  import Tooltip from "./Tooltip.svelte";

  let {
    label,
    icon,
    size = "md",
    variant = "ghost",
    disabled = false,
    tooltipPlacement = "top",
    onclick,
    class: className,
    pressed,
    ariaKeyshortcuts,
    tooltipContent
  }: LabelledIconButtonProps = $props();
</script>

<Tooltip content={tooltipContent ?? label} placement={tooltipPlacement} class={className}>
  <IconButton
    aria-label={label}
    {size}
    {variant}
    {disabled}
    {onclick}
    aria-pressed={pressed}
    aria-keyshortcuts={ariaKeyshortcuts}
  >
    <Icon name={icon} />
  </IconButton>
</Tooltip>
