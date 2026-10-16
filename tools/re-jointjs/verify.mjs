#!/usr/bin/env node
/**
 * verify.mjs — completeness guard for docs/re/jointjs-inventory.json.
 *
 * Re-runs the mechanical extraction of enumerate.mjs and asserts:
 *  1. every raw item has exactly one inventory entry (bijection);
 *  2. every inventory entry corresponds to a raw item (no phantom rows);
 *  3. ids are unique; required fields are present and non-empty;
 *  4. status / target / priority take only the allowed values;
 *  5. every `source` file exists and its line is in range; every `proof`
 *     file exists (proof paths are relative to this worktree);
 *  6. the stored counts equal the recomputed counts.
 *
 * The guard proves completeness relative to the extraction conventions
 * stated in enumerate.mjs and reproduced in the spec. It does not prove
 * that JointJS has no observable behaviour outside those conventions;
 * known residuals are listed as unknowns in the spec.
 *
 * Exit code 0 = guard passed; 1 = at least one failure (all printed).
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractRaw, buildEntries } from './enumerate.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const wtRoot = resolve(scriptDir, '..', '..');
const repoRoot = resolve(wtRoot, '..');
const inventoryPath = join(wtRoot, 'docs', 're', 'jointjs-inventory.json');

const failures = [];
const fail = (msg) => failures.push(msg);

const doc = JSON.parse(readFileSync(inventoryPath, 'utf8'));
const entries = doc.entries || [];

// Recompute raw keys exactly as the generator does.
const raw = extractRaw();
const rawKeys = new Set([...raw.values()].map((r) => `${r.family}\0${r.key}`));

// The generator is deterministic: rebuilding must yield the same id set.
const rebuilt = buildEntries();
const rebuiltIds = new Set(rebuilt.map((e) => e.id));

// Map inventory entries back to raw keys via family + source-independent key.
// Entries store `name`/`owner`, so rebuild the expected key per family.
function expectedKey(e) {
  switch (e.family) {
    case 'dia-api':
      return e.owner ? `${e.owner}.${e.name}` : e.name;
    case 'geometry':
      // Standalone helpers carry owner 'g' but are keyed by bare name.
      return e.owner && e.owner !== 'g' ? `${e.owner}.${e.name}` : e.name;
    case 'mvc':
      // Data and $ carry owner 'mvc' but are keyed by bare name.
      return e.owner && e.owner !== 'mvc' ? `${e.owner}.${e.name}` : e.name;
    case 'vectorizer':
      return e.owner === 'VStatic' ? `V.${e.name}` : e.name;
    case 'util':
      return e.owner && e.owner !== 'util' ? `${e.owner}.${e.name}` : e.name;
    case 'core-config':
      return e.owner === 'config' ? `config.${e.name}` : e.owner === 'env' ? `env.${e.name}` : e.name;
    case 'package-api': {
      // id encodes `jointjs:package-api:<package>-<name slug>`; recover via package + name.
      return `${e.package}:${e.name}`;
    }
    case 'catalog-app': {
      // Recover entry_key from the id: jointjs:catalog-app:jointjs-demo-<source-id>
      return null; // checked by count + name/source below instead
    }
    default:
      return e.name;
  }
}

const seenIds = new Set();
const seenKeys = new Set();
const STATUSES = new Set(['covered', 'partial', 'missing']);
const TARGETS = new Set(['graph', 'diagram-core', 'diagram-canvas', 'ds-component', 'new-module']);
const PRIORITIES = new Set(['P0', 'P1', 'P2', 'P3']);

for (const e of entries) {
  if (seenIds.has(e.id)) fail(`duplicate id: ${e.id}`);
  seenIds.add(e.id);
  for (const field of ['id', 'family', 'name', 'source', 'behaviour', 'acceptance', 'target', 'status', 'proof', 'priority']) {
    if (e[field] === undefined || e[field] === null || e[field] === '') fail(`${e.id}: missing or empty field ${field}`);
  }
  if (!STATUSES.has(e.status)) fail(`${e.id}: invalid status ${e.status}`);
  if (!TARGETS.has(e.target)) fail(`${e.id}: invalid target ${e.target}`);
  if (!PRIORITIES.has(e.priority)) fail(`${e.id}: invalid priority ${e.priority}`);
  if (!e.proof || !e.proof.path || !Number.isInteger(e.proof.line)) fail(`${e.id}: proof must carry path and integer line`);
  else if (!existsSync(join(wtRoot, e.proof.path))) fail(`${e.id}: proof file not found: ${e.proof.path}`);
  const sm = String(e.source || '').match(/^(.*):(\d+)$/);
  if (!sm) fail(`${e.id}: source is not path:line: ${e.source}`);
  else {
    // JointJS sources resolve from the repo root (.ds-scrap/…); catalogue
    // sources resolve from this worktree (docs/…).
    const abs = existsSync(join(repoRoot, sm[1])) ? join(repoRoot, sm[1]) : join(wtRoot, sm[1]);
    if (!existsSync(abs)) fail(`${e.id}: source file not found: ${sm[1]}`);
    else {
      const lineCount = readFileSync(abs, 'utf8').split(/\r?\n/).length;
      const line = Number(sm[2]);
      if (line < 1 || line > lineCount) fail(`${e.id}: source line ${line} out of range 1..${lineCount} in ${sm[1]}`);
    }
  }
  const key = expectedKey(e);
  if (key !== null) {
    const ck = `${e.family}\0${key}`;
    if (seenKeys.has(ck)) fail(`${e.id}: duplicate raw key ${e.family}/${key}`);
    seenKeys.add(ck);
    if (!rawKeys.has(ck)) fail(`${e.id}: no raw item for ${e.family}/${key} (phantom entry)`);
  }
}

// Every raw item must be present (catalogue rows checked by family count).
const byFamilyRaw = {};
for (const r of raw.values()) byFamilyRaw[r.family] = (byFamilyRaw[r.family] || 0) + 1;
const byFamilyInv = {};
for (const e of entries) byFamilyInv[e.family] = (byFamilyInv[e.family] || 0) + 1;
for (const [family, count] of Object.entries(byFamilyRaw)) {
  if (byFamilyInv[family] !== count) {
    fail(`family ${family}: inventory has ${byFamilyInv[family] || 0} entries, extraction yields ${count}`);
  }
}
for (const family of Object.keys(byFamilyInv)) {
  if (!(family in byFamilyRaw)) fail(`family ${family}: present in inventory, absent from extraction`);
}
for (const id of seenIds) {
  if (!rebuiltIds.has(id)) fail(`inventory id not reproduced by generator: ${id}`);
}
for (const id of rebuiltIds) {
  if (!seenIds.has(id)) fail(`generator id missing from inventory (stale file?): ${id}`);
}

// Stored counts must match recomputed counts.
const byStatus = { covered: 0, partial: 0, missing: 0 };
for (const e of entries) byStatus[e.status]++;
if (!doc.counts || doc.counts.total !== entries.length) fail(`counts.total ${doc.counts && doc.counts.total} != entries ${entries.length}`);
for (const s of Object.keys(byStatus)) {
  if (!doc.counts || doc.counts.byStatus[s] !== byStatus[s]) fail(`counts.byStatus.${s} mismatch`);
}

if (failures.length) {
  console.error(`FAIL: ${failures.length} problem(s):`);
  for (const f of failures.slice(0, 50)) console.error(`  - ${f}`);
  if (failures.length > 50) console.error(`  … and ${failures.length - 50} more`);
  process.exit(1);
}
console.log(`OK: ${entries.length} entries; bijection with ${raw.size} extracted raw items holds for every family.`);
console.log(`byStatus: covered=${byStatus.covered} partial=${byStatus.partial} missing=${byStatus.missing}`);
for (const [k, v] of Object.entries(byFamilyInv).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`);
