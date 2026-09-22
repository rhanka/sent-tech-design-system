<script>
  // Candidat interactif générique : @xyflow/svelte, configuration CSP-sûre (sans MiniMap,
  // cf. tools/xyflow-csp-probe). Même vue placée que le repli statique.
  import { SvelteFlow, Background, Controls } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  // sized   : dimensions fournies (width/height), prérequis SSR documenté par xyflow ;
  // handles : poignées fournies en plus, prérequis SSR des arêtes.
  let { view, sized = false, handles = false, oninit = undefined } = $props();
  // svelte-ignore state_referenced_locally
  let nodes = $state.raw(view.children.map((n) => ({
    id: n.id, position: { x: n.x, y: n.y }, data: { label: n.labels?.[0]?.text ?? n.id },
    ...(sized ? { width: n.width, height: n.height } : {}),
    ...(handles ? { handles: [
      { type: 'target', position: 'top', x: n.width / 2, y: 0 },
      { type: 'source', position: 'bottom', x: n.width / 2, y: n.height }
    ] } : {})
  })));
  // svelte-ignore state_referenced_locally
  let edges = $state.raw(view.edges.map((e) => ({ id: e.id, source: e.sources[0], target: e.targets[0] })));
</script>

<div class="st-flow-host">
  <SvelteFlow bind:nodes bind:edges fitView width={sized ? 1400 : undefined} height={sized ? 800 : undefined} {oninit}>
    <Background /><Controls />
  </SvelteFlow>
</div>
