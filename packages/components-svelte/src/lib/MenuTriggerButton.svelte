<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { ChevronDownCircle } from "@lucide/svelte";
  import IconButton from "./IconButton.svelte";

  type MenuTriggerButtonProps = Omit<
    HTMLButtonAttributes,
    "class" | "type" | "aria-label" | "aria-haspopup" | "aria-expanded" | "aria-controls"
  > & {
    "aria-label": string;
    "aria-controls"?: string;
    expanded?: boolean;
    size?: "sm" | "md" | "lg";
    variant?: "ghost" | "secondary";
    disabled?: boolean;
    class?: string;
    children?: Snippet;
  };

  let {
    "aria-label": ariaLabel,
    "aria-controls": ariaControls,
    expanded = false,
    size = "md",
    variant = "ghost",
    disabled = false,
    class: className,
    children,
    ...rest
  }: MenuTriggerButtonProps = $props();
</script>

<IconButton
  {...rest}
  aria-label={ariaLabel}
  aria-haspopup="menu"
  aria-expanded={expanded}
  aria-controls={ariaControls}
  {size}
  {variant}
  {disabled}
  class={className}
>
  {#if children}
    {@render children()}
  {:else}
    <ChevronDownCircle size={18} strokeWidth={2} aria-hidden="true" />
  {/if}
</IconButton>
