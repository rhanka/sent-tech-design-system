<script lang="ts">
  import type { Snippet } from "svelte";
  import IconButton from "./IconButton.svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export type MessageActionVariant = "default" | "danger";

  export type MessageAction = {
    id: string;
    label: string;
    icon: Snippet;
    onClick?: () => void;
    disabled?: boolean;
    variant?: MessageActionVariant;
  };

  type MessageActionsVisibility = "always" | "hover";

  type MessageActionsProps = Omit<HTMLAttributes<HTMLElement>, "children" | "class"> & {
    actions: MessageAction[];
    visibility?: MessageActionsVisibility;
    overflow?: Snippet;
    class?: string;
  };

  let {
    actions = [],
    visibility = "hover",
    overflow,
    class: className,
    ...rest
  }: MessageActionsProps = $props();

  const classes = () =>
    ["st-messageActions", visibility === "hover" && "st-messageActions--hoverOnly", className]
      .filter(Boolean)
      .join(" ");
</script>

<div class={classes()} {...rest} role="group" aria-label="Actions du message">
  {#if actions.length > 0}
    {#each actions as action (action.id)}
      <IconButton
        size="sm"
        variant={action.variant === "danger" ? "danger" : "ghost"}
        aria-label={action.label}
        disabled={action.disabled}
        onclick={action.onClick}
      >
        {@render action.icon()}
      </IconButton>
    {/each}
  {/if}
  {#if overflow}
    <div class="st-messageActions__overflow">{@render overflow()}</div>
  {/if}
</div>

<style>
  .st-messageActions {
    align-items: center;
    display: inline-flex;
    gap: 0.25rem;
  }

  .st-messageActions--hoverOnly {
    opacity: 0;
    pointer-events: none;
    transition:
      opacity var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-messageActions--hoverOnly:focus-within,
  .st-messageActions--hoverOnly:hover {
    opacity: 1;
    pointer-events: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-messageActions--hoverOnly {
      transition: none;
    }
  }

  .st-messageActions__overflow {
    align-items: center;
    display: inline-flex;
  }
</style>
