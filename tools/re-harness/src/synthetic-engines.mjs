// SYNTHETIC engines — NOT oracles. These are pure functions of
// (fixture, ops) written for this harness; they re-implement an
// interpretation of the fixture data and contain no library behaviour.
// Their only legitimate uses are (a) self-testing the comparators and
// (b) offline determinism checks. Every report produced from them MUST
// carry oracle: "synthetic", and a synthetic verdict NEVER counts for a
// gate (the gate guard in tests/harness.test.mjs enforces this). The
// reference paths run the real libraries through harness-page.html.
//
// Undo/redo: every mutating op pushes its inverse onto the undo stack, so
// undo chains round-trip exactly (SPEC_RE_BPMN_JS_PARITY.md §8.2, §5.2).

function clone(v) { return JSON.parse(JSON.stringify(v)); }

function baseState(fixture) {
  const model = clone(fixture.model || {});
  const elements = new Map();
  const order = [];
  if (Array.isArray(model.elements)) {
    for (const el of model.elements) { elements.set(el.id, clone(el)); order.push(el.id); }
  }
  if (Array.isArray(model.nodes)) {
    for (const n of model.nodes) {
      elements.set(n.id, { id: n.id, type: n.type || "node", x: n.position?.x ?? n.x ?? 0, y: n.position?.y ?? n.y ?? 0, width: n.width ?? 100, height: n.height ?? 40, label: n.data?.label || "" });
      order.push(n.id);
    }
  }
  if (Array.isArray(model.cells)) {
    for (const c of model.cells) {
      elements.set(c.id, { id: c.id, type: c.type || "element", x: c.position?.x ?? 0, y: c.position?.y ?? 0, width: c.size?.width ?? 100, height: c.size?.height ?? 40, label: c.attrs?.label?.text || "" });
      order.push(c.id);
    }
  }
  const connections = [];
  for (const src of [model.flows, model.edges]) {
    if (Array.isArray(src)) for (const f of src) connections.push(clone(f));
  }
  return { elements, order, connections, viewport: clone(fixture.viewport || { x: 0, y: 0, zoom: 1 }), selection: [] };
}

function toModel(state, fixture) {
  const model = clone(fixture.model || {});
  model.elements = state.order.map((id) => state.elements.get(id)).filter(Boolean);
  model.flows = state.connections;
  return model;
}

function geometryOf(state) {
  const bounds = {}; const waypoints = {};
  for (const [id, el] of state.elements) {
    bounds[id] = { x: el.x ?? 0, y: el.y ?? 0, width: el.width ?? 0, height: el.height ?? 0 };
  }
  for (const c of state.connections) {
    if (Array.isArray(c.waypoints)) waypoints[c.id] = clone(c.waypoints);
  }
  let viewbox = null;
  const all = Object.values(bounds);
  if (all.length) {
    const minX = Math.min(...all.map((b) => b.x)); const minY = Math.min(...all.map((b) => b.y));
    const maxX = Math.max(...all.map((b) => b.x + b.width)); const maxY = Math.max(...all.map((b) => b.y + b.height));
    viewbox = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }
  return { bounds, waypoints, viewbox };
}

// Minimal deterministic rasteriser: draws element bounds onto an RGBA buffer
// so the pixel comparator has a real signal without a browser. The browser
// runner replaces this with backing-store pixels (golden harness pattern).
export function rasterise(state, { width = 64, height = 48 } = {}) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) { data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; data[i + 3] = 255; }
  const geo = geometryOf(state);
  const vb = geo.viewbox || { x: 0, y: 0, width: 1, height: 1 };
  const sx = width / Math.max(1, vb.width); const sy = height / Math.max(1, vb.height);
  for (const b of Object.values(geo.bounds)) {
    const x0 = Math.max(0, Math.floor((b.x - vb.x) * sx)); const y0 = Math.max(0, Math.floor((b.y - vb.y) * sy));
    const x1 = Math.min(width - 1, Math.floor((b.x + b.width - vb.x) * sx));
    const y1 = Math.min(height - 1, Math.floor((b.y + b.height - vb.y) * sy));
    for (let y = y0; y <= y1; y += 1) for (let x = x0; x <= x1; x += 1) {
      const i = (y * width + x) * 4; data[i] = 30; data[i + 1] = 90; data[i + 2] = 200; data[i + 3] = 255;
    }
  }
  return { width, height, data: Array.from(data) };
}

export function runSyntheticEngine(fixture, ops) {
  const state = baseState(fixture);
  const events = [];
  const undoStack = []; const redoStack = [];
  const emit = (name, payload) => events.push({ name, payload });
  const applyInverse = (inv) => {
    if (!inv) return;
    if (inv.kind === "restore") {
      state.elements.set(inv.el.id, clone(inv.el));
      if (!state.order.includes(inv.el.id)) state.order.push(inv.el.id);
    } else if (inv.kind === "remove") {
      state.elements.delete(inv.id); state.order = state.order.filter((x) => x !== inv.id);
    } else if (inv.kind === "patch") {
      const el = state.elements.get(inv.id); if (el) Object.assign(el, clone(inv.fields));
    } else if (inv.kind === "connections") {
      state.connections = clone(inv.connections);
    } else if (inv.kind === "viewport") {
      state.viewport = clone(inv.viewport);
    }
  };
  for (const step of ops?.steps || []) {
    if (step.op === "undo") {
      const entry = undoStack.pop();
      if (entry) { redoStack.push(entry); applyInverse(entry.inverse); emit("commandStack.undone", { command: entry.name }); }
      continue;
    }
    if (step.op === "redo") {
      const entry = redoStack.pop();
      if (entry) { undoStack.push(entry); applyInverse(entry.forward); emit("commandStack.redone", { command: entry.name }); }
      continue;
    }
    redoStack.length = 0;
    if (step.op === "create") {
      const el = { id: step.elementId, type: step.type || "task", x: step.x ?? 0, y: step.y ?? 0, width: step.width ?? 100, height: step.height ?? 80, label: step.label || "" };
      state.elements.set(el.id, el); state.order.push(el.id);
      undoStack.push({ name: "create", inverse: { kind: "remove", id: el.id }, forward: { kind: "restore", el: clone(el) } });
      emit("shape.create", { elementId: el.id, type: el.type });
      emit("element.changed", { elementId: el.id });
    } else if (step.op === "move" || step.op === "resize") {
      const el = state.elements.get(step.elementId); if (!el) continue;
      const before = { x: el.x, y: el.y, width: el.width, height: el.height };
      if (step.op === "move") { el.x = step.x ?? el.x; el.y = step.y ?? el.y; }
      else { el.width = step.width ?? el.width; el.height = step.height ?? el.height; }
      undoStack.push({ name: step.op, inverse: { kind: "patch", id: el.id, fields: before }, forward: { kind: "patch", id: el.id, fields: { x: el.x, y: el.y, width: el.width, height: el.height } } });
      emit(step.op === "move" ? "shape.move" : "shape.resize", { elementId: el.id });
      emit("element.changed", { elementId: el.id });
    } else if (step.op === "connect" || step.op === "reconnect") {
      const before = clone(state.connections);
      const conn = { id: step.elementId || `flow_${state.connections.length + 1}`, source: step.sourceId, target: step.targetId, waypoints: step.waypoints || [] };
      state.connections.push(conn);
      undoStack.push({ name: "connect", inverse: { kind: "connections", connections: before }, forward: { kind: "connections", connections: clone(state.connections) } });
      emit("connection.create", { elementId: conn.id, sourceId: conn.source, targetId: conn.target });
    } else if (step.op === "remove") {
      const el = state.elements.get(step.elementId); if (!el) continue;
      const beforeConns = clone(state.connections);
      state.elements.delete(el.id); state.order = state.order.filter((x) => x !== el.id);
      state.connections = state.connections.filter((c) => c.source !== el.id && c.target !== el.id);
      undoStack.push({ name: "remove", inverse: { kind: "restore", el: clone(el) }, forward: { kind: "remove", id: el.id }, connectionsBefore: beforeConns });
      emit("shape.remove", { elementId: el.id });
    } else if (step.op === "setLabel" || step.op === "setType") {
      const el = state.elements.get(step.elementId); if (!el) continue;
      const field = step.op === "setLabel" ? "label" : "type";
      const before = { [field]: el[field] };
      el[field] = field === "label" ? (step.label || "") : (step.type || el.type);
      undoStack.push({ name: step.op, inverse: { kind: "patch", id: el.id, fields: before }, forward: { kind: "patch", id: el.id, fields: { [field]: el[field] } } });
      emit("element.updateLabel", { elementId: el.id });
    } else if (step.op === "setViewport") {
      const before = clone(state.viewport);
      state.viewport = { x: step.x ?? state.viewport.x, y: step.y ?? state.viewport.y, zoom: state.viewport.zoom };
      undoStack.push({ name: "setViewport", inverse: { kind: "viewport", viewport: before }, forward: { kind: "viewport", viewport: clone(state.viewport) } });
      emit("canvas.viewbox.changed", { elementId: "" });
    } else if (step.op === "select") {
      state.selection = step.elementId ? [step.elementId] : [];
      emit("selection.changed", { elementId: step.elementId || "" });
    }
  }
  const model = toModel(state, fixture);
  const geometry = geometryOf(state);
  const pixels = rasterise(state);
  return { model, events, geometry, pixels, viewport: clone(state.viewport) };
}
