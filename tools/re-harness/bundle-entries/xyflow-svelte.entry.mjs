// Bundle entry: real @xyflow/svelte (oracle) plus its harness host.
// The .svelte sources of the library (and of the host) are compiled at
// bundle time by the svelte compiler through the esbuild plugin in
// build-bundles.mjs; no library code is copied into the repository.
import { mount, unmount } from "svelte";
import Host from "./xyflow-svelte-host.svelte";
import "@xyflow/svelte/dist/style.css";

function mountFlow(container, fixture, journal) {
  const initialNodes = (fixture.model.nodes || []).map((n) => ({
    id: n.id,
    type: n.type || "default",
    position: { x: n.position?.x ?? 0, y: n.position?.y ?? 0 },
    data: { ...(n.data || {}) },
  }));
  const initialEdges = (fixture.model.edges || []).map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
  }));
  const initialViewport = fixture.viewport || fixture.model.viewport || { x: 0, y: 0, zoom: 1 };
  let api = null;
  const app = mount(Host, {
    target: container,
    props: {
      initialNodes,
      initialEdges,
      initialViewport,
      journal,
      onready: (a) => {
        api = a;
      },
    },
  });
  return {
    get handle() {
      return api;
    },
    unmount: () => unmount(app),
  };
}

window.__oracleXyflowSvelte = { mount, unmount, mountFlow };
