<script>
  // Store probe rendered inside the real SvelteFlow context: registers the
  // library store for the final native-state read, and journals the store
  // collections as the library updates them (Svelte Flow 1.x has no
  // nodes/edges change callback): one `store.nodes` / `store.edges` entry
  // per library update, carrying the ids added and removed and the ids
  // whose object identity changed — observations of the real store, not
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
    if (previous && (added.length || removed.length || replaced.length)) journal(flow, name, [{ added, removed, replaced }]);
  }
  let lastNodes = null;
  let lastEdges = null;
  $effect(() => { const list = store.nodes; observe("store.nodes", list, lastNodes); lastNodes = list; });
  $effect(() => { const list = store.edges; observe("store.edges", list, lastEdges); lastEdges = list; });
</script>
