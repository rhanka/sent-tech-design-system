// Probe shim for @xyflow/react, substituted for "@xyflow/react" ONLY in the
// example sources (build-bundles.mjs, examples' own imports). Everything is
// re-exported unchanged except ReactFlow, which renders the REAL ReactFlow
// with the same props plus a <Probe/> child (rendered inside the flow's
// store context, renders nothing) and journals the real change callbacks.
// Observers only: each journaling wrapper calls the example's own callback
// with the same arguments, and an observer added where the example passed
// none (onNodesChange/onEdgesChange/onConnect/onInit) has no effect on the
// library (React Flow applies changes itself for uncontrolled flows).
import React from "react";
import { ReactFlow as RealReactFlow, useStoreApi } from "@xyflow/react";
import { registerStore, unregisterStore, journal, nextFlowIndex } from "./xyflow-instrument.mjs";

export * from "@xyflow/react";

const OBSERVED = ["onNodesChange", "onEdgesChange", "onConnect", "onInit"];

function Probe() {
  const store = useStoreApi();
  React.useEffect(() => {
    const index = registerStore("react", () => store.getState());
    return () => unregisterStore(index);
  }, [store]);
  return null;
}

export const ReactFlow = React.forwardRef(function ProbedReactFlow(props, ref) {
  const flowRef = React.useRef(null);
  if (flowRef.current === null) flowRef.current = nextFlowIndex();
  // The latest props, read by the stable journaling wrappers below.
  const latest = React.useRef(props);
  latest.current = props;
  // One STABLE wrapper per observed callback for the whole mount: a new
  // function per render would be pushed into the library store on every
  // render (StoreUpdater) and re-render every store subscriber — a
  // behaviour change. The wrapper calls the example's current callback.
  const wrappers = React.useRef(null);
  if (wrappers.current === null) {
    wrappers.current = {};
    for (const name of OBSERVED) {
      wrappers.current[name] = (...args) => {
        journal(flowRef.current, name, args);
        const original = latest.current[name];
        return typeof original === "function" ? original(...args) : undefined;
      };
    }
  }
  return React.createElement(RealReactFlow, { ...props, ...wrappers.current, ref }, props.children, React.createElement(Probe));
});
