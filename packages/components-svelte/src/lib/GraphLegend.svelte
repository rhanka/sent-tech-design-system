<script lang="ts" module>
  // Re-export types so GraphLegend can be used standalone without importing from ForceGraph.
  export type { ForceGraphLegendEntry, ForceGraphNodeShape, ForceGraphTone } from "./ForceGraph.svelte";
</script>

<script lang="ts">
  import { nodeShapePath } from "./ForceGraph.svelte";
  import type { ForceGraphLegendEntry } from "./ForceGraph.svelte";

  type GraphLegendProps = {
    entries: ForceGraphLegendEntry[];
    /** Optional heading shown above entries. */
    title?: string;
    class?: string;
  };

  let { entries, title, class: className }: GraphLegendProps = $props();

  const classes = () =>
    ["st-graphLegend", className].filter(Boolean).join(" ");
</script>

<div class={classes()} aria-label={title ?? "Graph legend"}>
  {#if title}
    <p class="st-graphLegend__title">{title}</p>
  {/if}
  <ul class="st-graphLegend__list" role="list">
    {#each entries as entry}
      {@const swatchPath = entry.shape !== undefined ? nodeShapePath(entry.shape, 7) : null}
      {@const swatchTone = entry.tone ?? "category1"}
      <li class="st-graphLegend__entry">
        {#if entry.shape !== undefined}
          <svg
            class="st-graphLegend__swatch"
            viewBox="-8 -8 16 16"
            width="16"
            height="16"
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
            viewBox="0 0 16 8"
            width="16"
            height="8"
            aria-hidden="true"
          >
            <line
              x1="0"
              y1="4"
              x2="16"
              y2="4"
              class="st-graphLegend__edge"
              class:st-graphLegend__edge--weak={entry.weak}
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
    background: var(--st-semantic-surface-overlay, rgba(0,0,0,0.45));
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-semantic-text-inverse, #fff);
    display: inline-flex;
    flex-direction: column;
    font-size: 0.6875rem;
    gap: 0.25rem;
    padding: 0.375rem 0.5rem;
  }

  .st-graphLegend__title {
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    margin: 0 0 0.125rem;
    opacity: 0.75;
    text-transform: uppercase;
  }

  .st-graphLegend__list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .st-graphLegend__entry {
    align-items: center;
    display: flex;
    gap: 0.375rem;
  }

  .st-graphLegend__swatch { flex-shrink: 0; }

  .st-graphLegend__label { white-space: nowrap; }

  .st-graphLegend__shape {
    fill-opacity: 0.9;
    stroke: var(--st-semantic-surface-default, #fff);
    stroke-width: 1;
  }

  .st-graphLegend__shape--category1 { fill: var(--st-semantic-data-category1); }
  .st-graphLegend__shape--category2 { fill: var(--st-semantic-data-category2); }
  .st-graphLegend__shape--category3 { fill: var(--st-semantic-data-category3); }
  .st-graphLegend__shape--category4 { fill: var(--st-semantic-data-category4); }
  .st-graphLegend__shape--category5 { fill: var(--st-semantic-data-category5); }
  .st-graphLegend__shape--category6 { fill: var(--st-semantic-data-category6); }
  .st-graphLegend__shape--category7 { fill: var(--st-semantic-data-category7); }
  .st-graphLegend__shape--category8 { fill: var(--st-semantic-data-category8); }

  .st-graphLegend__edge {
    stroke: var(--st-semantic-border-strong, #888);
    stroke-width: 1.5;
    opacity: 0.8;
  }

  .st-graphLegend__edge--weak {
    stroke: var(--st-semantic-border-subtle, #aaa);
    stroke-dasharray: 3 3;
    opacity: 0.65;
  }
</style>
