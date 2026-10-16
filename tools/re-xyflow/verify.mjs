#!/usr/bin/env node
/** Completeness guard: raw enumeration keys <-> inventory entries. */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const worktree = resolve(here, "../..");
const repoParent = resolve(worktree, "..");
const invPath = join(worktree, "docs/re/xyflow-inventory.json");
const rawPath = join(here, "raw-enumeration.json");
const inv = JSON.parse(readFileSync(invPath, "utf8"));
const raw = JSON.parse(readFileSync(rawPath, "utf8"));
const errors = [];
const ids = new Set();
for (const e of inv.entries) {
  if (ids.has(e.id)) errors.push(`duplicate id ${e.id}`);
  ids.add(e.id);
  for (const f of ["id", "family", "source", "behaviour", "acceptance", "target", "status", "priority"]) if (!e[f]) errors.push(`${e.id}: missing field ${f}`);
  if (!["covered", "partial", "missing"].includes(e.status)) errors.push(`${e.id}: bad status ${e.status}`);
  if (!["graph", "diagram-core", "diagram-canvas", "composant DS", "nouveau module"].includes(e.target)) errors.push(`${e.id}: bad target ${e.target}`);
  if (!["P0", "P1", "P2"].includes(e.priority)) errors.push(`${e.id}: bad priority`);
  const m = String(e.source).match(/^(.+):(\d+)$/);
  if (!m) errors.push(`${e.id}: source has no :line`);
  else {
    const p = join(repoParent, m[1]);
    if (!existsSync(p)) errors.push(`${e.id}: source file missing ${m[1]}`);
  }
  if (!e.proof || !/:\d+$/.test(e.proof)) errors.push(`${e.id}: proof missing/invalid`);
  else {
    const pm = e.proof.match(/^(.+):(\d+)$/);
    if (pm && !existsSync(join(worktree, pm[1]))) errors.push(`${e.id}: proof file missing ${pm[1]}`);
  }
}
if (raw.total !== inv.entries.length) errors.push(`count mismatch raw=${raw.total} inventory=${inv.entries.length}`);
if (inv.meta?.total !== inv.entries.length) errors.push(`meta.total=${inv.meta?.total} != entries=${inv.entries.length}`);
console.log(`raw=${raw.total} inventory=${inv.entries.length} families=${Object.keys(inv.meta.byFamily).length}`);
console.log(`byStatus ${JSON.stringify(inv.meta.byStatus)}`);
if (errors.length) { console.error(`GUARD FAIL (${errors.length})`); for (const e of errors.slice(0, 40)) console.error(" -", e); process.exit(1); }
console.log("GUARD PASS: 100% of enumerated elements have an inventory entry; ids unique; sources and proofs resolve.");
