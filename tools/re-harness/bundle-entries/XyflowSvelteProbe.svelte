<script>
  // Store probe rendered inside the real SvelteFlow context: registers the
  // library store for the final native-state read, and journals the store
  // collections as the library updates them (Svelte Flow 1.x has no
  // nodes/edges change callback): `store.nodes` / `store.edges` entries,
  // one per id added, removed or whose object identity changed — observations of the real store, not
  // synthesised changes.
  import { useStore } from "@xyflow/svelte";
  import { onDestroy } from "svelte";
  import { registerStore, unregisterStore, journal } from "./xyflow-instrument.mjs";

  let { flow } = $props();
  const store = useStore();
  const index = registerStore("svelte", () => store);
  onDestroy(() => unregisterStore(index));

  function observe(name, list, previous) {
    const prevById = new Map((previous || []).map((item) => [item.id, item]));
    const nextIds = new Set(list.map((item) => item.id));
    const added = list.filter((item) => !prevById.has(item.id)).map((item) => item.id);
    const removed = [...prevById.keys()].filter((id) => !nextIds.has(id));
    const replaced = list.filter((item) => prevById.has(item.id) && prevById.get(item.id) !== item).map((item) => item.id);
    // One entry per touched id (added, removed, then replaced, in list order):
    // how many ids one store update carries follows the browser's
    // ResizeObserver delivery, so update boundaries are not compared.
    if (previous) {
      for (const id of added) journal(flow, name, [{ added: id }]);
      for (const id of removed) journal(flow, name, [{ removed: id }]);
      for (const id of replaced) journal(flow, name, [{ replaced: id }]);
    }
  }
  let lastNodes = null;
  let lastEdges = null;
  $effect(() => { const list = store.nodes; observe("store.nodes", list, lastNodes); lastNodes = list; });
  $effect(() => { const list = store.edges; observe("store.edges", list, lastEdges); lastEdges = list; });
</script>
