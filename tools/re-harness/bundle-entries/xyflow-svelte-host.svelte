<script>
  // Minimal controlled host for the real @xyflow/svelte SvelteFlow.
  // Harness code only: it binds the fixture nodes/edges/viewport into the
  // real component and journals store-observable changes (add/remove,
  // position, dimensions, selection, connect) from $effect observations
  // of the bound store state — the Svelte counterpart of React's
  // onNodesChange/onEdgesChange. No library code lives here.
  import { SvelteFlow } from "@xyflow/svelte";

  let { initialNodes, initialEdges, initialViewport, flowOptions = {}, journal, onready } = $props();

  let nodes = $state(structuredClone(initialNodes));
  let edges = $state(structuredClone(initialEdges));
  let viewport = $state({ ...initialViewport });

  // Seeded with the initial nodes (C6): the first $effect must not emit
  // synthetic `add` events for nodes that were present from the start —
  // that was the React/Svelte mount asymmetry (5 events vs 3).
  let seen = new Map(snapshot(initialNodes).map((s) => [s.id, s]));
  function snapshot(list) {
    return list.map((n) => ({
      id: n.id,
      x: n.position?.x ?? 0,
      y: n.position?.y ?? 0,
      w: n.measured?.width ?? n.width ?? 0,
      h: n.measured?.height ?? n.height ?? 0,
      selected: !!n.selected,
    }));
  }
  $effect(() => {
    const snap = snapshot(nodes);
    const next = new Map();
    for (const s of snap) {
      next.set(s.id, s);
      const prev = seen.get(s.id);
      if (!prev) journal.push({ name: "nodesChange", payload: { id: s.id, type: "add", position: { x: s.x, y: s.y } } });
      else {
        if (prev.w !== s.w || prev.h !== s.h) journal.push({ name: "nodesChange", payload: { id: s.id, type: "dimensions", dimensions: { width: s.w, height: s.h } } });
        if (prev.x !== s.x || prev.y !== s.y) journal.push({ name: "nodesChange", payload: { id: s.id, type: "position", position: { x: s.x, y: s.y } } });
        if (prev.selected !== s.selected) journal.push({ name: "nodesChange", payload: { id: s.id, type: "select", selected: s.selected } });
      }
    }
    for (const id of seen.keys()) {
      if (!next.has(id)) journal.push({ name: "nodesChange", payload: { id, type: "remove" } });
    }
    seen = next;
  });

  let api = {
    getNodes: () => $state.snapshot(nodes),
    getEdges: () => $state.snapshot(edges),
    getViewport: () => ({ ...viewport }),
    setViewport: (vp) => { viewport = { ...vp }; },
    setNodes: (next) => { nodes = next; },
    setEdges: (next) => { edges = next; },
  };

  $effect(() => {
    onready(api);
  });
</script>

<SvelteFlow
  bind:nodes
  bind:edges
  bind:viewport
  oninit={() => journal.push({ name: "init", payload: {} })}
  onconnect={(c) => journal.push({ name: "connect", payload: JSON.parse(JSON.stringify(c)) })}
  fitView={Boolean(flowOptions.fitView)}
  minZoom={flowOptions.minZoom}
  maxZoom={flowOptions.maxZoom}
  proOptions={{ hideAttribution: true }}
/>
