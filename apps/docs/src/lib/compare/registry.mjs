// apps/docs/src/lib/compare/registry.mjs
// Pure, dependency-free helpers shared by the docs app (Vite) AND the oracle
// (tools/compare/fidelity.mjs, plain Node ESM). NO imports — keep it portable.

/** Stable gap identity: theme/component/scenario/state/property. */
export function gapKey({ theme, component, scenario, state, property }) {
  return [theme, component, scenario, state, property].join("/");
}

/** FNV-1a 32-bit hash → 8 hex chars. Deterministic, dependency-free. */
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** Order-independent hash of the manifest's identity + selectors + markup. */
export function manifestHash(manifest) {
  const parts = [];
  for (const theme of Object.keys(manifest).sort()) {
    for (const key of Object.keys(manifest[theme]).sort()) {
      const m = manifest[theme][key];
      parts.push(
        `${theme}/${key}|${m.component}|${m.scenario}|${m.state}|` +
          `${m.ourSelector}|${m.refSelector}|${m.refMarkup}`
      );
    }
  }
  return fnv1a(parts.join("\n"));
}

/**
 * Merge fresh oracle measurements into an existing registry WITHOUT destroying
 * human triage. Oracle owns ours/ref/delta/lastSeen/manifestHash and the
 * existence of source:oracle entries. Humans own status/note (+ manual entries).
 *
 * @param {object|null} existing  prior registry ({version, entries:{}}) or null
 * @param {Array} oracleGaps      [{theme,component,scenario,state,property,ours,ref,delta}]
 * @param {object} stamp          {manifestHash, generatedAt, anatomyVersion, dsVersion, themeVersion}
 */
export function mergeRegistry(existing, oracleGaps, stamp) {
  const next = {};
  for (const [key, e] of Object.entries(existing?.entries ?? {})) {
    next[key] = { ...e };
  }

  const seen = new Set();
  for (const g of oracleGaps) {
    const key = gapKey(g);
    seen.add(key);
    const prior = next[key];
    if (prior) {
      next[key] = {
        ...prior,
        ours: g.ours,
        ref: g.ref,
        delta: g.delta,
        lastSeen: stamp.generatedAt,
        manifestHash: stamp.manifestHash,
        regressed: prior.status === "fixed",
      };
    } else {
      next[key] = {
        theme: g.theme,
        component: g.component,
        scenario: g.scenario,
        state: g.state,
        property: g.property,
        ours: g.ours,
        ref: g.ref,
        delta: g.delta,
        status: "open",
        source: "oracle",
        lastSeen: stamp.generatedAt,
        manifestHash: stamp.manifestHash,
      };
    }
  }

  // Oracle-sourced gaps not seen this run = closed → fixed (keep history).
  for (const e of Object.values(next)) {
    if (e.source === "oracle" && !seen.has(gapKey(e))) {
      if (e.status === "open") {
        e.status = "fixed";
        e.lastSeen = stamp.generatedAt;
        e.manifestHash = stamp.manifestHash;
      }
      e.regressed = false;
    }
  }

  return {
    version: 1,
    generatedAt: stamp.generatedAt,
    manifestHash: stamp.manifestHash,
    anatomyVersion: stamp.anatomyVersion,
    dsVersion: stamp.dsVersion,
    themeVersion: stamp.themeVersion,
    entries: next,
  };
}

/** Display status layered on the human status: stale > regressed > status. */
export function deriveStatus(entry, currentManifestHash) {
  if (entry.manifestHash && currentManifestHash && entry.manifestHash !== currentManifestHash) {
    return "stale";
  }
  if (entry.regressed) return "regressed";
  return entry.status;
}
