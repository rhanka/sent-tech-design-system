// Mounts one pinned @xyflow/react example (the example's own default
// export, compiled from .ds-scrap/re-sources/xyflow/examples) the way the
// example app does (examples/react/src/main.tsx: StrictMode, the library
// stylesheet and the app's index.css are imported by the generated entry).
import React from "react";
import { createRoot } from "react-dom/client";

export function mountExample(Example, container) {
  // examples/react/src/index.css styles #root (height 100%, flex column).
  const rootEl = document.createElement("div");
  rootEl.id = "root";
  container.appendChild(rootEl);
  const root = createRoot(rootEl);
  root.render(React.createElement(React.StrictMode, null, React.createElement(Example)));
  return { unmount: () => root.unmount() };
}
