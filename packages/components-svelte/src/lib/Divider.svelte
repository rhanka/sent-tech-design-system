<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  export type DividerOrientation = "horizontal" | "vertical";
  export type DividerVariant = "solid" | "dashed";

  export type DividerProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    orientation?: DividerOrientation;
    /** Spacing scale step (0..12) applied as margin around the divider. */
    spacing?: number;
    /** Optional label centered on a horizontal divider line. */
    label?: string;
    variant?: DividerVariant;
    class?: string;
  };
</script>

<script lang="ts">
  import { spacingToken } from "./Flex.svelte";

  let {
    orientation = "horizontal",
    spacing,
    label,
    variant = "solid",
    class: className,
    ...rest
  }: DividerProps = $props();

  const isVertical = $derived(orientation === "vertical");
  const hasLabel = $derived(!isVertical && label != null && label !== "");
  const margin = $derived(spacingToken(spacing));

  const classes = $derived(
    [
      "st-divider",
      `st-divider--${orientation}`,
      `st-divider--${variant}`,
      hasLabel && "st-divider--labeled",
      className
    ]
      .filter(Boolean)
      .join(" ")
  );
</script>

{#if hasLabel}
  <div
    {...rest}
    class={classes}
    role="separator"
    aria-orientation="horizontal"
    style:margin-block={margin}
  >
    <span class="st-divider__line" aria-hidden="true"></span>
    <span class="st-divider__label">{label}</span>
    <span class="st-divider__line" aria-hidden="true"></span>
  </div>
{:else}
  <div
    {...rest}
    class={classes}
    role="separator"
    aria-orientation={orientation}
    style:margin-block={isVertical ? undefined : margin}
    style:margin-inline={isVertical ? margin : undefined}
  ></div>
{/if}

<style>
  .st-divider {
    border: 0;
    box-sizing: border-box;
    color: var(--st-semantic-border-subtle, #e2e8f0);
  }

  .st-divider--horizontal:not(.st-divider--labeled) {
    block-size: 0;
    border-block-start-width: 1px;
    border-block-start-style: solid;
    border-block-start-color: currentColor;
    inline-size: 100%;
  }

  .st-divider--vertical {
    align-self: stretch;
    border-inline-start-width: 1px;
    border-inline-start-style: solid;
    border-inline-start-color: currentColor;
    display: inline-block;
    inline-size: 0;
    min-block-size: 1em;
  }

  .st-divider--dashed.st-divider--horizontal:not(.st-divider--labeled) {
    border-block-start-style: dashed;
  }

  .st-divider--dashed.st-divider--vertical {
    border-inline-start-style: dashed;
  }

  .st-divider--labeled {
    align-items: center;
    display: flex;
    gap: var(--st-spacing-3, 0.75rem);
    inline-size: 100%;
  }

  .st-divider__line {
    block-size: 0;
    border-block-start-width: 1px;
    border-block-start-style: solid;
    border-block-start-color: currentColor;
    flex: 1 1 0;
  }

  .st-divider--dashed .st-divider__line {
    border-block-start-style: dashed;
  }

  .st-divider__label {
    color: var(--st-semantic-text-secondary, inherit);
    flex: 0 0 auto;
    font-size: var(--st-font-size-sm, 0.875rem);
    line-height: 1;
    white-space: nowrap;
  }
</style>
