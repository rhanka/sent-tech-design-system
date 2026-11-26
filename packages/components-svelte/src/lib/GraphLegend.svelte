<script lang="ts" module>
  // Re-export types so GraphLegend can be used standalone without importing from ForceGraph.
  export type { ForceGraphLegendEntry, ForceGraphNodeShape, ForceGraphTone, ForceGraphEdgeDash } from "./ForceGraph.svelte";

  export type GraphLegendSize = "sm" | "md" | "lg";
  export type GraphLegendVariant = "overlay" | "inline";

  export type GraphLegendProps = {
    entries: import("./ForceGraph.svelte").ForceGraphLegendEntry[];
    /** Optional heading shown above entries. */
    title?: string;
    /** Visual density. `sm` (default) keeps the compact 11 px overlay; `lg` scales to >= 16 px for 3 m room legibility. */
    size?: GraphLegendSize;
    /** Presentation surface: translucent dark `overlay` (default) or light-theme horizontal `inline` bar. */
    variant?: GraphLegendVariant;
    class?: string;
  };
</script>

<script lang="ts">
  import { nodeShapePath, edgeDashArray } from "./ForceGraph.svelte";

  let {
    entries,
    title,
    size = "sm",
    variant = "overlay",
    class: className
  }: GraphLegendProps = $props();

  const SWATCH_SIZE: Record<GraphLegendSize, { node: number; edgeW: number; edgeH: number }> = {
    sm: { node: 16, edgeW: 16, edgeH: 8 },
    md: { node: 18, edgeW: 20, edgeH: 10 },
    lg: { node: 20, edgeW: 24, edgeH: 12 }
  };

  const swatch = $derived(SWATCH_SIZE[size]);

  const classes = $derived(
    [
      "st-graphLegend",
      variant !== "overlay" && `st-graphLegend--${variant}`,
      size !== "sm" && `st-graphLegend--${size}`,
      className
    ]
      .filter(Boolean)
      .join(" ")
  );
</script>

<div
  class={classes}
  role={variant === "inline" ? "region" : undefined}
  aria-label={title ?? "Graph legend"}
>
  {#if title}
    <p class="st-graphLegend__title">{title}</p>
  {/if}
  <ul class="st-graphLegend__list" role="list">
    {#each entries as entry}
      {@const swatchPath = entry.shape !== undefined ? nodeShapePath(entry.shape, 7) : null}
      {@const swatchTone = entry.tone ?? "category1"}
      {@const swatchDash = entry.shape === undefined ? edgeDashArray(entry.dash, entry.weak) : null}
      <li class="st-graphLegend__entry">
        {#if entry.shape !== undefined}
          <svg
            class="st-graphLegend__swatch"
            viewBox="-13 -13 26 26"
            width={swatch.node}
            height={swatch.node}
            aria-hidden="true"
          >
            {#if swatchPath}
              <path
                d={swatchPath}
                class="st-graphLegend__shape st-graphLegend__shape--{swatchTone}"
              />
            {:else}
              <circle
                r="7"
                class="st-graphLegend__shape st-graphLegend__shape--{swatchTone}"
              />
            {/if}
          </svg>
        {:else}
          <svg
            class="st-graphLegend__swatch"
            viewBox="0 0 {swatch.edgeW} 8"
            width={swatch.edgeW}
            height={swatch.edgeH}
            aria-hidden="true"
          >
            <line
              x1="0"
              y1="4"
              x2={swatch.edgeW}
              y2="4"
              class={[
                "st-graphLegend__edge",
                entry.weak && "st-graphLegend__edge--weak",
                entry.tone && `st-graphLegend__edge--${entry.tone}`
              ]
                .filter(Boolean)
                .join(" ")}
              stroke-dasharray={swatchDash}
            />
          </svg>
        {/if}
        <span class="st-graphLegend__label">{entry.label}</span>
      </li>
    {/each}
  </ul>
</div>

<style>
  .st-graphLegend {
    background: var(--st-semantic-surface-overlay, rgba(0, 0, 0, 0.45));
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-semantic-text-inverse, #fff);
    display: inline-flex;
    flex-direction: column;
    font-size: 0.6875rem;
    gap: var(--st-spacing-1, 0.25rem);
    padding: 0.375rem 0.5rem;
  }

  .st-graphLegend--inline {
    background: var(--st-semantic-surface-subtle, #f1f5f9);
    border: 1px solid var(--st-semantic-border-subtle, #cbd5e1);
    border-radius: var(--st-radius-md, 0.5rem);
    color: var(--st-semantic-text-primary, #0f172a);
    display: flex;
    width: 100%;
    box-sizing: border-box;
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
  }

  .st-graphLegend--md {
    font-size: var(--st-typography-label-size, 0.875rem);
    gap: var(--st-spacing-2, 0.5rem);
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
  }

  .st-graphLegend--lg {
    font-size: max(1rem, var(--st-typography-field-size, 1rem));
    font-weight: 500;
    gap: var(--st-spacing-2, 0.5rem);
    padding: var(--st-spacing-3, 0.75rem) var(--st-spacing-4, 1rem);
  }

  .st-graphLegend__title {
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    margin: 0 0 0.125rem;
    opacity: 0.75;
    text-transform: uppercase;
  }

  .st-graphLegend--md .st-graphLegend__title {
    font-size: 0.75rem;
  }

  .st-graphLegend--lg .st-graphLegend__title {
    font-size: 1rem;
    opacity: 0.85;
  }

  .st-graphLegend__list {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-1, 0.25rem);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .st-graphLegend--inline .st-graphLegend__list {
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem) var(--st-spacing-4, 1rem);
  }

  .st-graphLegend--lg .st-graphLegend__list {
    gap: var(--st-spacing-3, 0.75rem) var(--st-spacing-6, 1.5rem);
  }

  .st-graphLegend__entry {
    align-items: center;
    display: flex;
    gap: 0.375rem;
  }

  .st-graphLegend--lg .st-graphLegend__entry {
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-graphLegend__swatch { flex-shrink: 0; }

  .st-graphLegend__label {
    line-height: 1.3;
    white-space: nowrap;
  }

  .st-graphLegend__shape {
    fill-opacity: 0.92;
    stroke: var(--st-semantic-surface-default, #fff);
    stroke-width: 1.25;
  }

  .st-graphLegend--inline .st-graphLegend__shape {
    stroke: var(--st-semantic-border-strong, #334155);
  }

  .st-graphLegend__shape--category1 { fill: var(--st-semantic-data-category1, #01055e); }
  .st-graphLegend__shape--category2 { fill: var(--st-semantic-data-category2, #e87432); }
  .st-graphLegend__shape--category3 { fill: var(--st-semantic-data-category3, #4a4f8f); }
  .st-graphLegend__shape--category4 { fill: var(--st-semantic-data-category4, #ff9b62); }
  .st-graphLegend__shape--category5 { fill: var(--st-semantic-data-category5, #15803d); }
  .st-graphLegend__shape--category6 { fill: var(--st-semantic-data-category6, #d4621f); }
  .st-graphLegend__shape--category7 { fill: var(--st-semantic-data-category7, #6b7280); }
  .st-graphLegend__shape--category8 { fill: var(--st-semantic-data-category8, #dc2626); }

  .st-graphLegend__edge {
    stroke: var(--st-semantic-border-strong, #64748b);
    stroke-width: 2;
    opacity: 0.9;
  }

  .st-graphLegend__edge--weak {
    stroke: var(--st-semantic-border-subtle, #94a3b8);
    opacity: 0.75;
  }

  :where(.st-graphLegend--inline) .st-graphLegend__edge--weak {
    stroke: var(--st-semantic-text-secondary, #475569);
    opacity: 0.9;
  }

  .st-graphLegend__edge--category1 { stroke: var(--st-semantic-data-category1, #01055e); opacity: 1; }
  .st-graphLegend__edge--category2 { stroke: var(--st-semantic-data-category2, #e87432); opacity: 1; }
  .st-graphLegend__edge--category3 { stroke: var(--st-semantic-data-category3, #4a4f8f); opacity: 1; }
  .st-graphLegend__edge--category4 { stroke: var(--st-semantic-data-category4, #ff9b62); opacity: 1; }
  .st-graphLegend__edge--category5 { stroke: var(--st-semantic-data-category5, #15803d); opacity: 1; }
  .st-graphLegend__edge--category6 { stroke: var(--st-semantic-data-category6, #d4621f); opacity: 1; }
  .st-graphLegend__edge--category7 { stroke: var(--st-semantic-data-category7, #6b7280); opacity: 1; }
  .st-graphLegend__edge--category8 { stroke: var(--st-semantic-data-category8, #dc2626); opacity: 1; }
</style>
