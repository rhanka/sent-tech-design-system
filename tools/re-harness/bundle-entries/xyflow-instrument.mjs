// Harness instrumentation shared by the xyflow example bundles (harness
// code, not library code). It never changes behaviour: it only RECORDS.
//   - registerStore(kind, getState): the store of every mounted flow, read
//     back after the run as the library's own native state.
//   - journal(name, payload): the real callbacks of the flow, in emission
//     order, with their arguments serialised by serializeNative.
// serializeNative is a mechanical JSON projection of a live value: every
// own enumerable property (and, for class instances, every accessor of
// the prototype chain) is kept under its own name; functions, DOM nodes,
// events and cyclic back-references are dropped; Map/Set become their
// iteration arrays. No field list, no renaming.
const SKIP = Symbol("skip");

function isDomLike(v) {
  return (typeof Node !== "undefined" && v instanceof Node) || (typeof Window !== "undefined" && v instanceof Window) || (typeof Event !== "undefined" && v instanceof Event);
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
  if (t === "number") return Number.isFinite(value) ? value : String(value);
  if (t === "string" || t === "boolean") return value;
  if (t === "undefined" || t === "function" || t === "symbol" || t === "bigint") return SKIP;
  if (isDomLike(value) || ancestors.includes(value)) return SKIP;
  const next = [...ancestors, value];
  if (value instanceof Map) return [...value].map(([k, v]) => [serializeOrNull(k, next), serializeOrNull(v, next)]);
  if (value instanceof Set) return [...value].map((v) => serializeOrNull(v, next));
  if (Array.isArray(value)) return value.map((v) => serializeOrNull(v, next));
  const out = {};
  const keys = Object.keys(value);
  const proto = Object.getPrototypeOf(value);
  if (proto && proto !== Object.prototype) for (const n of accessorNames(value)) if (!keys.includes(n)) keys.push(n);
  for (const key of keys) {
    let v;
    try { v = value[key]; } catch { continue; }
    const s = serializeNative(v, next);
    if (s !== SKIP) out[key] = s;
  }
  return out;
}

function serializeOrNull(v, ancestors) {
  const s = serializeNative(v, ancestors);
  return s === SKIP ? null : s;
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
  const payload = serializeNative(args);
  registry().journal.push({ name, payload: { flow, args: payload === SKIP ? null : payload } });
}

export function nextFlowIndex() {
  const reg = registry();
  reg.flowCounter = (reg.flowCounter || 0) + 1;
  return reg.flowCounter - 1;
}

// The harness page reads the final store state with the same projection.
if (typeof window !== "undefined") window.__xyflowSerializeNative = serializeNative;
