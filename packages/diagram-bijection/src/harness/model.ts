// The canonical model M (§2.1): records ascending by name, names unique, each
// record held as its RFC 8785 bytes (`canonicalBytes` of diagram-core).
import { canonicalBytes } from "@sentropic/diagram-core";
import type { CanonicalModel, CanonicalRecord } from "./types.js";

export function modelFromRecords(values: Readonly<Record<string, unknown>>): CanonicalModel {
  const names = Object.keys(values).sort();
  const records: CanonicalRecord[] = names.map((name) => ({ name, jcs: canonicalBytes(values[name]) }));
  return { records };
}

export function modelsEqual(
  a: CanonicalModel,
  b: CanonicalModel,
): { readonly equal: true } | { readonly equal: false; readonly firstDifferingRecord: string } {
  if (a.records.length !== b.records.length) {
    return { equal: false, firstDifferingRecord: a.records[0]?.name ?? b.records[0]?.name ?? "" };
  }
  for (let i = 0; i < a.records.length; i += 1) {
    const ra = a.records[i];
    const rb = b.records[i];
    if (ra === undefined || rb === undefined) break;
    if (ra.name !== rb.name || ra.jcs !== rb.jcs) return { equal: false, firstDifferingRecord: ra.name };
  }
  return { equal: true };
}

/**
 * Apply RFC 6901/6902 JSON patch ops to a value (the subset S4 probes use).
 * Pure: the input is deep-cloned first, so applying several probes in a row
 * never lets one probe's expectation see another's mutation. Array targets
 * follow RFC 6902 (`remove` splices, `add` inserts at the index or appends on
 * "-", `replace` overwrites the index).
 */
export function applyJsonPatch(value: unknown, ops: readonly { op: string; path: string; value?: unknown }[]): unknown {
  let current: unknown = structuredClone(value);
  for (const op of ops) {
    const segments = op.path.split("/").filter((s) => s.length > 0).map((s) => s.replace(/~1/g, "/").replace(/~0/g, "~"));
    if (segments.length === 0) {
      if (op.op === "replace" || op.op === "add") current = structuredClone(op.value);
      continue;
    }
    // Walk to the parent of the last segment.
    let parent: unknown = current;
    for (const seg of segments.slice(0, -1)) {
      if (typeof parent !== "object" || parent === null) throw new Error(`patch path not traversable: ${op.path}`);
      parent = (parent as Record<string, unknown>)[seg];
    }
    const last = segments[segments.length - 1] as string;
    if (Array.isArray(parent)) {
      const idx = last === "-" ? parent.length : Number(last);
      if (!Number.isInteger(idx) || idx < 0) throw new Error(`patch path not traversable: ${op.path}`);
      if (op.op === "remove") {
        if (idx >= parent.length) throw new Error(`patch index out of range: ${op.path}`);
        parent.splice(idx, 1);
      } else if (op.op === "add") {
        parent.splice(idx, 0, structuredClone(op.value));
      } else {
        if (idx >= parent.length) throw new Error(`patch index out of range: ${op.path}`);
        parent[idx] = structuredClone(op.value);
      }
      continue;
    }
    if (typeof parent !== "object" || parent === null) throw new Error(`patch path not traversable: ${op.path}`);
    const record = parent as Record<string, unknown>;
    if (op.op === "remove") delete record[last];
    else record[last] = structuredClone(op.value);
  }
  return current;
}
