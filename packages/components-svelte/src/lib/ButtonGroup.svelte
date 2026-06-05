<script lang="ts" module>
  export type ButtonGroupOrientation = "horizontal" | "vertical";
  export type ButtonGroupSize = "sm" | "md" | "lg";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type ButtonGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    orientation?: ButtonGroupOrientation;
    /** Look segmenté joint (boutons collés, coins arrondis seulement aux extrémités). */
    attached?: boolean;
    /** Espacement entre boutons (échelle spacing), ignoré quand `attached`. */
    gap?: number;
    /** Taille indicative (transmise via data-attr pour styliser les enfants si besoin). */
    size?: ButtonGroupSize;
    /** Étiquette a11y du groupe. */
    label?: string;
    class?: string;
    children?: Snippet;
  };

  let {
    orientation = "horizontal",
    attached = false,
    gap,
    size = "md",
    label,
    class: className,
    children,
    ...rest
  }: ButtonGroupProps = $props();

  const classes = $derived(
    [
      "st-buttonGroup",
      `st-buttonGroup--${orientation}`,
      attached ? "st-buttonGroup--attached" : null,
      className
    ]
      .filter(Boolean)
      .join(" ")
  );

  const gapValue = $derived(
    attached || gap == null ? null : `var(--st-spacing-${gap}, ${gap * 0.25}rem)`
  );
</script>

<div
  {...rest}
  class={classes}
  role="group"
  aria-label={label}
  data-size={size}
  style:gap={gapValue}
>
  {@render children?.()}
</div>

<style>
  .st-buttonGroup {
    align-items: stretch;
    display: inline-flex;
  }

  .st-buttonGroup--horizontal {
    flex-direction: row;
  }

  .st-buttonGroup--vertical {
    flex-direction: column;
  }

  /* Default gap when no explicit gap prop and not attached. The inline style
     overrides this when a gap prop is provided. */
  .st-buttonGroup:not(.st-buttonGroup--attached) {
    gap: var(--st-spacing-2, 0.5rem);
  }

  /* Attached / segmented look: buttons share edges, only the outer corners
     remain rounded. Inner borders are collapsed to a single hairline. */
  .st-buttonGroup--attached {
    gap: 0;
  }

  .st-buttonGroup--attached.st-buttonGroup--horizontal > :global(* + *) {
    margin-inline-start: -1px;
  }

  .st-buttonGroup--attached.st-buttonGroup--vertical > :global(* + *) {
    margin-block-start: -1px;
  }

  .st-buttonGroup--attached.st-buttonGroup--horizontal > :global(*:not(:first-child):not(:last-child)) {
    border-radius: 0;
  }

  .st-buttonGroup--attached.st-buttonGroup--horizontal > :global(*:first-child) {
    border-end-end-radius: 0;
    border-start-end-radius: 0;
  }

  .st-buttonGroup--attached.st-buttonGroup--horizontal > :global(*:last-child) {
    border-end-start-radius: 0;
    border-start-start-radius: 0;
  }

  .st-buttonGroup--attached.st-buttonGroup--vertical > :global(*:not(:first-child):not(:last-child)) {
    border-radius: 0;
  }

  .st-buttonGroup--attached.st-buttonGroup--vertical > :global(*:first-child) {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }

  .st-buttonGroup--attached.st-buttonGroup--vertical > :global(*:last-child) {
    border-start-start-radius: 0;
    border-start-end-radius: 0;
  }

  /* Raise the focused/hovered button so its full border is visible over the
     collapsed hairline. */
  .st-buttonGroup--attached > :global(*:hover),
  .st-buttonGroup--attached > :global(*:focus-visible) {
    z-index: 1;
  }
</style>
