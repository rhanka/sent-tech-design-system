// Canonicalisation and tolerant comparison (SPEC_RE_BPMN_JS_PARITY.md §8.3,
// SPEC_RE_JOINTJS_PARITY.md §5.3). Zero dependencies.
export function canonicalise(value) {
  if (Array.isArray(value)) return value.map(canonicalise);
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = canonicalise(value[key]);
    return out;
  }
  return value;
}

export function canonicalString(value) {
  return JSON.stringify(canonicalise(value));
}

// Deep-compare with float tolerance. Returns a list of diff paths (empty = equal).
// `isFloatPath` marks DI-float subtrees; everything else compares exactly.
export function diffValues(a, b, { floatTolerance = 0, path = "$" } = {}) {
  const diffs = [];
  if (typeof a === "number" && typeof b === "number") {
    if (floatTolerance > 0 ? Math.abs(a - b) > floatTolerance : a !== b) {
      diffs.push(`${path}: ${a} !== ${b}`);
    }
    return diffs;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      diffs.push(`${path}: array shape differs`);
      return diffs;
    }
    a.forEach((v, i) => diffs.push(...diffValues(v, b[i], { floatTolerance, path: `${path}[${i}]` })));
    return diffs;
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of [...keys].sort()) {
      if (!(key in a)) { diffs.push(`${path}.${key}: only in right`); continue; }
      if (!(key in b)) { diffs.push(`${path}.${key}: only in left`); continue; }
      diffs.push(...diffValues(a[key], b[key], { floatTolerance, path: `${path}.${key}` }));
    }
    return diffs;
  }
  if (a !== b) diffs.push(`${path}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`);
  return diffs;
}
