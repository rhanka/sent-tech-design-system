<script>
  import { SvelteFlow, Background, Controls, MiniMap } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  const withMiniMap = __WITH_MINIMAP__;
  let nodes = $state.raw([
    { id: '1', position: { x: 40, y: 40 }, data: { label: 'Collecte' } },
    { id: '2', position: { x: 260, y: 140 }, data: { label: 'Contr\u00f4le' } }
  ]);
  let edges = $state.raw([{ id: 'e1-2', source: '1', target: '2' }]);
</script>
<div style:width="820px" style:height="420px">
  <SvelteFlow bind:nodes bind:edges fitView>
    <Background />
    <Controls />
    {#if withMiniMap}<MiniMap />{/if}
  </SvelteFlow>
</div>
