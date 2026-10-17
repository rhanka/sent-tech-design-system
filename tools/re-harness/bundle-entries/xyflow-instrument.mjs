// Harness instrumentation shared by the xyflow example bundles (harness
// code, not library code). It never changes behaviour: it only RECORDS.
//   - registerStore(kind, getState): the store of every mounted flow, read
//     back after the run as the library's own native state.
//   - journal(flow, name, args): the callbacks the example passed to the
//     flow, and the observed store updates, in emission order, with their
//     arguments serialised by serializeNative.
// serializeNative is a mechanical JSON projection of a live value: every
// own enumerable property (and, for class instances, every accessor of
// the prototype chain) is kept under its own name, so the KEY SET of every
// object is preserved. Values JSON cannot carry are encoded with an
// explicit marker object { "$js": <kind>, ... } instead of being dropped:
// undefined, function, symbol, bigint, non-finite number, DOM node/window/
// event (native or React synthetic), React fiber, cyclic back-reference,
// Date, RegExp, Error, and a getter that throws. Map/Set become their iteration arrays. No field list, no
// renaming.
function isDomLike(v) {
  if (typeof Node !== "undefined" && v instanceof Node) return "dom";
  if (typeof Window !== "undefined" && v instanceof Window) return "window";
  if (typeof Event !== "undefined" && v instanceof Event) return "event";
  // React SyntheticEvent: wraps a native event (and holds a fiber).
  if (typeof Event !== "undefined" && v.nativeEvent instanceof Event) return "event";
  // React fiber (reachable from synthetic events or elements): the
  // renderer's internal tree, not a value of the flow.
  if ("stateNode" in v && "return" in v && "tag" in v && "memoizedProps" in v) return "react-fiber";
  return null;
}

function accessorNames(obj) {
  const names = [];
  let proto = Object.getPrototypeOf(obj);
  while (proto && proto !== Object.prototype && proto !== Array.prototype) {
    for (const [name, d] of Object.entries(Object.getOwnPropertyDescriptors(proto))) {
      if (name !== "constructor" && typeof d.get === "function" && !names.includes(name)) names.push(name);
    }
    proto = Object.getPrototypeOf(proto);
  }
  return names;
}

export function serializeNative(value, ancestors = []) {
  if (value === null) return null;
  const t = typeof value;
  if (t === "number") return Number.isFinite(value) ? value : { $js: "number", value: String(value) };
  if (t === "string" || t === "boolean") return value;
  if (t === "undefined") return { $js: "undefined" };
  if (t === "function") return { $js: "function" };
  if (t === "symbol") return { $js: "symbol", value: String(value.description ?? "") };
  if (t === "bigint") return { $js: "bigint", value: String(value) };
  const dom = isDomLike(value);
  if (dom === "dom") return { $js: "dom", nodeName: String(value.nodeName) };
  if (dom === "event") return { $js: "event", type: String(value.type) };
  if (dom === "react-fiber") return { $js: "react-fiber" };
  if (dom) return { $js: dom };
  if (ancestors.includes(value)) return { $js: "cycle", depth: ancestors.length - ancestors.indexOf(value) };
  if (value instanceof Date) return { $js: "Date", value: Number.isFinite(value.getTime()) ? value.toISOString() : "Invalid Date" };
  if (value instanceof RegExp) return { $js: "RegExp", value: String(value) };
  if (value instanceof Error) return { $js: "Error", name: String(value.name), message: String(value.message) };
  const next = [...ancestors, value];
  if (value instanceof Map) return [...value].map(([k, v]) => [serializeNative(k, next), serializeNative(v, next)]);
  if (value instanceof Set) return [...value].map((v) => serializeNative(v, next));
  if (Array.isArray(value)) return value.map((v) => serializeNative(v, next));
  const out = {};
  const keys = Object.keys(value);
  const proto = Object.getPrototypeOf(value);
  if (proto && proto !== Object.prototype) for (const n of accessorNames(value)) if (!keys.includes(n)) keys.push(n);
  for (const key of keys) {
    let v;
    try { v = value[key]; } catch (err) { out[key] = { $js: "getter-error", message: String(err && err.message || err) }; continue; }
    out[key] = serializeNative(v, next);
  }
  return out;
}

function registry() {
  if (!window.__xyHarness) window.__xyHarness = { stores: [], journal: [] };
  return window.__xyHarness;
}

export function registerStore(kind, getState) {
  const reg = registry();
  const entry = { kind, getState, index: reg.stores.length };
  reg.stores.push(entry);
  return entry.index;
}

export function unregisterStore(index) {
  const reg = registry();
  if (reg.stores[index]) reg.stores[index].removed = true;
}

export function journal(flow, name, args) {
  const reg = registry();
  // segment: index of the pointer op being played (0 = mount), set by the
  // harness page; used to normalise the store-observation channel.
  reg.journal.push({ name, segment: reg.segment || 0, payload: { flow, args: serializeNative(args) } });
}

export function nextFlowIndex() {
  const reg = registry();
  reg.flowCounter = (reg.flowCounter || 0) + 1;
  return reg.flowCounter - 1;
}

// The harness page reads the final store state with the same projection.
if (typeof window !== "undefined") window.__xyflowSerializeNative = serializeNative;
