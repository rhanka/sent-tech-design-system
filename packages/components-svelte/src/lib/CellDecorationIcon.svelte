<script lang="ts">
  import { cellDecorationIcon } from "./cellDecoration.js";

  let { icon }: { icon?: string } = $props();

  const nodes = $derived(cellDecorationIcon(icon));
</script>

{#if nodes}
  <svg
    class="st-cell__icon"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {#each nodes as [tag, attrs]}
      {#if tag === "path"}
        <path {...attrs} />
      {:else if tag === "circle"}
        <circle {...attrs} />
      {:else if tag === "line"}
        <line {...attrs} />
      {/if}
    {/each}
  </svg>
{/if}

<style>
  .st-cell__icon {
    flex: 0 0 auto;
  }
</style>
