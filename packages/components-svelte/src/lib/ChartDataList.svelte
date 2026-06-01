<script lang="ts">
  type ChartDataListProps = {
    label: string;
    items: string[];
    class?: string;
  };

  let { label, items = [], class: className }: ChartDataListProps = $props();

  const classes = () => ["st-chartDataList", className].filter(Boolean).join(" ");
</script>

{#if items.length > 0}
  <ul class={classes()} aria-label={`Data values for ${label}`}>
    {#each items as item, i (i)}
      <li>{item}</li>
    {/each}
  </ul>
{/if}

<style>
  .st-chartDataList {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }
</style>
