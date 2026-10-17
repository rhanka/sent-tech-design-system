// Probe shim for @xyflow/react, substituted for "@xyflow/react" ONLY in the
// example sources (build-bundles.mjs, examples' own imports). Everything is
// re-exported unchanged except ReactFlow, which renders the REAL ReactFlow
// with the same props plus a <Probe/> child (rendered inside the flow's
// store context, renders nothing).
//
// No prop is added: only the callbacks the example itself passes (every
// `on*` function prop) are replaced by a STABLE journaling wrapper that
// calls the example's current callback with the same arguments. A
// callback the example does not pass stays absent, so the library store
// holds exactly what it would hold without the probe (null/undefined
// handlers, hasDefaultNodes...). The store's own updates are observed
// through store.subscribe (`store.nodes` / `store.edges` entries, as on
// the Svelte side), which covers uncontrolled flows without a handler.
import React from "react";
import { ReactFlow as RealReactFlow, useStoreApi } from "@xyflow/react";
import { registerStore, unregisterStore, journal, nextFlowIndex } from "./xyflow-instrument.mjs";

export * from "@xyflow/react";

function observe(flow, name, list, previous) {
  const prevById = new Map((previous || []).map((item) => [item.id, item]));
  const nextIds = new Set((list || []).map((item) => item.id));
  const added = (list || []).filter((item) => !prevById.has(item.id)).map((item) => item.id);
  const removed = [...prevById.keys()].filter((id) => !nextIds.has(id));
  const replaced = (list || []).filter((item) => prevById.has(item.id) && prevById.get(item.id) !== item).map((item) => item.id);
  // One entry per touched id (added, removed, then replaced, in list order):
  // how many ids one store update carries follows the browser's
  // ResizeObserver delivery, so update boundaries are not compared.
  if (true) {
    for (const id of added) journal(flow, name, [{ added: id }]);
    for (const id of removed) journal(flow, name, [{ removed: id }]);
    for (const id of replaced) journal(flow, name, [{ replaced: id }]);
  }
}

function Probe({ flow }) {
  const store = useStoreApi();
  React.useEffect(() => {
    const index = registerStore("react", () => store.getState());
    const unsubscribe = store.subscribe((state, prev) => {
      if (state.nodes !== prev.nodes) observe(flow, "store.nodes", state.nodes, prev.nodes);
      if (state.edges !== prev.edges) observe(flow, "store.edges", state.edges, prev.edges);
    });
    return () => { unsubscribe(); unregisterStore(index); };
  }, [store, flow]);
  return null;
}

export const ReactFlow = React.forwardRef(function ProbedReactFlow(props, ref) {
  const flowRef = React.useRef(null);
  if (flowRef.current === null) flowRef.current = nextFlowIndex();
  const latest = React.useRef(props);
  latest.current = props;
  // One stable wrapper per callback name for the whole mount: a new
  // function per render would be pushed into the library store on every
  // render (StoreUpdater) and re-render every store subscriber.
  const wrappers = React.useRef(new Map());
  const wrapperFor = (name) => {
    if (!wrappers.current.has(name)) {
      wrappers.current.set(name, (...args) => {
        // Change callbacks: one change per journal entry, in order — how
        // changes are grouped into calls follows the browser's
        // ResizeObserver delivery (measured on react-layouting: the same 11
        // `dimensions` changes arrive in 1 call or in 11 calls between two
        // identical mounts), so batch boundaries are not compared.
        if ((name === "onNodesChange" || name === "onEdgesChange") && Array.isArray(args[0])) {
          for (const change of args[0]) journal(flowRef.current, name, [[change]]);
        } else journal(flowRef.current, name, args);
        const original = latest.current[name];
        return typeof original === "function" ? original(...args) : undefined;
      });
    }
    return wrappers.current.get(name);
  };
  const passed = {};
  for (const [name, value] of Object.entries(props)) {
    passed[name] = /^on[A-Z]/.test(name) && typeof value === "function" ? wrapperFor(name) : value;
  }
  return React.createElement(RealReactFlow, { ...passed, ref }, props.children, React.createElement(Probe, { flow: flowRef.current }));
});
