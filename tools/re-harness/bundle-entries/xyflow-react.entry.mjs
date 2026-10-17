// Bundle entry: real @xyflow/react (oracle) plus a minimal controlled host.
// The host is harness code (not library code): it mounts a ReactFlow from a
// fixture, applies the library's own change handlers, and journals every
// onNodesChange / onEdgesChange / onConnect callback so the harness can
// compare real store behaviour between two independent mounts.
import React from "react";
import { createRoot } from "react-dom/client";
import {
  ReactFlow,
  ReactFlowProvider,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const { createElement: h, useState, useRef, useEffect } = React;

function Host(props) {
  const [nodes, setNodes] = useState(props.initialNodes);
  const [edges, setEdges] = useState(props.initialEdges);
  const [viewport, setViewport] = useState(props.initialViewport);
  const instanceRef = useRef(null);
  const handleRef = useRef(null);

  if (!handleRef.current) {
    handleRef.current = {
      getNodes: () => nodes,
      getEdges: () => edges,
      getViewport: () => (instanceRef.current ? instanceRef.current.getViewport() : viewport),
      getInstance: () => instanceRef.current,
      setNodes,
      setEdges,
      setViewport: (vp) => {
        if (instanceRef.current) instanceRef.current.setViewport(vp);
        setViewport(vp);
      },
    };
  }
  // Keep the imperative handle pointed at the latest state.
  handleRef.current.getNodes = () => nodes;
  handleRef.current.getEdges = () => edges;

  useEffect(() => {
    props.onHandle(handleRef.current);
  }, []);

  const onNodesChange = (changes) => {
    for (const c of changes) props.journal.push({ name: "nodesChange", payload: { id: c.id || "", type: c.type || "" } });
    setNodes((nds) => applyNodeChanges(changes, nds));
  };
  const onEdgesChange = (changes) => {
    for (const c of changes) props.journal.push({ name: "edgesChange", payload: { id: c.id || "", type: c.type || "" } });
    setEdges((eds) => applyEdgeChanges(changes, eds));
  };
  const onConnect = (connection) => {
    props.journal.push({ name: "connect", payload: { source: connection.source || "", target: connection.target || "" } });
    setEdges((eds) => addEdge(connection, eds));
  };

  return h(
    ReactFlowProvider,
    null,
    h(ReactFlow, {
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      onInit: (instance) => {
        instanceRef.current = instance;
        props.journal.push({ name: "init", payload: {} });
      },
      onMoveEnd: (_event, vp) => {
        setViewport(vp);
      },
      defaultViewport: props.initialViewport,
      fitView: false,
      proOptions: { hideAttribution: true },
    }),
  );
}

// mountFlow(container, fixture, journal) -> { handle, unmount }
// Nodes/edges are copied from the fixture verbatim (xyflow fields only).
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
  let handle = null;
  const root = createRoot(container);
  root.render(
    h(Host, {
      initialNodes,
      initialEdges,
      initialViewport,
      journal,
      onHandle: (hd) => {
        handle = hd;
      },
    }),
  );
  return {
    get handle() {
      return handle;
    },
    unmount: () => root.unmount(),
  };
}

window.__oracleXyflowReact = { React, createRoot, ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, mountFlow };
