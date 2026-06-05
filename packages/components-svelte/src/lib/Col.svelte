<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export type ColSpan = number | "auto";

  export type ColProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    /** Number of 12-grid columns to span, or "auto" to size to content. */
    span?: ColSpan;
    /** Columns to offset (0..11) via margin-inline-start. */
    offset?: number;
    /** Responsive overrides applied at and above the breakpoint. */
    sm?: ColSpan;
    md?: ColSpan;
    lg?: ColSpan;
    as?: string;
    class?: string;
    children?: Snippet;
  };

  /** Width expression for a given span. Accounts for the shared row gutter so a
      full 12 columns still fit on one line (gap-based layout). */
  export function spanBasis(span: ColSpan | undefined): string | undefined {
    if (span == null) return undefined;
    if (span === "auto") return "auto";
    const clamped = Math.max(1, Math.min(12, Math.round(span)));
    const ratio = clamped / 12;
    // Subtract this column's share of the inter-column gutters.
    return `calc(${ratio * 100}% - var(--st-row-gutter, 0px) * ${(12 - clamped) / 12})`;
  }

  export function offsetMargin(offset: number | undefined): string | undefined {
    if (!offset) return undefined;
    const clamped = Math.max(0, Math.min(11, Math.round(offset)));
    if (clamped === 0) return undefined;
    const ratio = clamped / 12;
    return `calc(${ratio * 100}% + var(--st-row-gutter, 0px) * ${ratio})`;
  }
</script>

<script lang="ts">
  let {
    span = "auto",
    offset = 0,
    sm,
    md,
    lg,
    as = "div",
    class: className,
    children,
    ...rest
  }: ColProps = $props();

  const isAuto = $derived(span === "auto");
  const classes = $derived(
    [
      "st-col",
      isAuto && "st-col--auto",
      sm != null && "st-col--has-sm",
      md != null && "st-col--has-md",
      lg != null && "st-col--has-lg",
      className
    ]
      .filter(Boolean)
      .join(" ")
  );
</script>

<svelte:element
  this={as}
  {...rest}
  class={classes}
  style:flex-basis={spanBasis(span)}
  style:max-inline-size={isAuto ? undefined : spanBasis(span)}
  style:flex-grow={isAuto ? "1" : "0"}
  style:margin-inline-start={offsetMargin(offset)}
  style:--st-col-sm={spanBasis(sm)}
  style:--st-col-md={spanBasis(md)}
  style:--st-col-lg={spanBasis(lg)}
>
  {@render children?.()}
</svelte:element>

<style>
  .st-col {
    box-sizing: border-box;
    flex-shrink: 1;
    min-width: 0;
  }

  .st-col--auto {
    flex-basis: auto;
  }

  @media (min-width: 640px) {
    .st-col--has-sm {
      flex-basis: var(--st-col-sm);
      max-inline-size: var(--st-col-sm);
      flex-grow: 0;
    }
  }

  @media (min-width: 768px) {
    .st-col--has-md {
      flex-basis: var(--st-col-md);
      max-inline-size: var(--st-col-md);
      flex-grow: 0;
    }
  }

  @media (min-width: 1024px) {
    .st-col--has-lg {
      flex-basis: var(--st-col-lg);
      max-inline-size: var(--st-col-lg);
      flex-grow: 0;
    }
  }
</style>
