#!/usr/bin/env node
/**
 * verify.mjs — non-tautological completeness guard for
 * docs/re/jointjs-inventory.json.
 *
 * This guard NEVER imports enumerate.mjs. It re-derives the expected set
 * with the separate TypeScript-AST extractor in extract-ast.mjs
 * (ts.createProgram + TypeChecker, own traversal code) and compares it
 * bidirectionally with the stored inventory:
 *   - expected (AST) minus inventory  => missing entries (guard fails);
 *   - inventory minus expected (AST)  => phantom/hallucinated entries.
 * It also checks ids, required fields, allowed values, that every source
 * and proof path:line resolves, that behaviour/acceptance are
 * entry-specific (the former generic templates are rejected), and that
 * the stored counts (including the parity denominator, which excludes
 * the 109 JointJS+ greenfield rows) equal the recomputed counts.
 * "100 %" may be claimed only when this guard exits 0.
 *
 * Exit code 0 = guard passed; 1 = at least one failure (all printed).
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractWithProgram } from './extract-ast.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const wtRoot = resolve(scriptDir, '..', '..');
const repoRoot = resolve(wtRoot, '..');
const inventoryPath = join(wtRoot, 'docs', 're', 'jointjs-inventory.json');

const failures = [];
const fail = (msg) => failures.push(msg);

const doc = JSON.parse(readFileSync(inventoryPath, 'utf8'));
const entries = doc.entries || [];

// Expected set from the independent AST extractor.
const expected = extractWithProgram();

// Map an inventory entry back to its expected-set key. This inversion is
// written for the guard only; it reads stored entry fields, never the
// generator's raw items.
function inventoryKey(e) {
  const fam = e.family;
  const nm = e.name;
  const own = e.owner || '';
  if (fam === 'catalog-app') {
    const m = String(e.source || '').match(/:(\d+)$/);
    return `${fam}\0${nm}@${m ? m[1] : '?'}`;
  }
  if (fam === 'dia-api') return `${fam}\0${own ? `${own}.${nm}` : nm}`;
  if (fam === 'geometry') {
    if (!own || own === 'g') return `${fam}\0${nm}`;
    return `${fam}\0${own}.${nm}`;
  }
  if (fam === 'mvc') {
    if (!own || own === 'mvc') return `${fam}\0${nm}`;
    return `${fam}\0${own}.${nm}`;
  }
  if (fam === 'vectorizer') {
    if (own === 'VStatic') return `${fam}\0V.${nm}`;
    return `${fam}\0${nm}`;
  }
  if (fam === 'util') {
    if (!own || own === 'util') return `${fam}\0${nm}`;
    return `${fam}\0${own}.${nm}`;
  }
  if (fam === 'core-config') {
    if (own === 'config') return `${fam}\0config.${nm}`;
    if (own === 'env') return `${fam}\0env.${nm}`;
    return `${fam}\0${nm}`;
  }
  if (fam === 'package-api') {
    if (e.package === '@joint/router-avoid' && e.kind === 'event') return `${fam}\0${e.package}:RouterService.event:${nm}`;
    return `${fam}\0${e.package}${e.subpath || ''}:${nm}`;
  }
  if (fam === 'router' || fam === 'connector') {
    if (e.kind === 'enum' && own) return `${fam}\0${own}.${nm}`;
    return `${fam}\0${nm}`;
  }
  if (fam === 'highlighter' || fam === 'link-tool' || fam === 'element-tool' || fam === 'shape') {
    if (own) return `${fam}\0${own}.${nm}`;
    return `${fam}\0${nm}`;
  }
  return `${fam}\0${nm}`;
}
function expectedKey(item) {
  if (item.family === 'catalog-app') return `${item.family}\0${item.label}@${item.at}`;
  return `${item.family}\0${item.key}`;
}

const expectedKeys = new Set([...expected.values()].map(expectedKey));
const seenIds = new Set();
const seenKeys = new Set();
const STATUSES = new Set(['covered', 'partial', 'missing']);
const TARGETS = new Set(['graph', 'diagram-core', 'diagram-canvas', 'ds-component', 'new-module']);
const PRIORITIES = new Set(['P0', 'P1', 'P2', 'P3']);
const GENERIC_BEHAVIOUR = /produces the .* behaviour named|calling or reading it on a .* instance produces/;

for (const e of entries) {
  if (seenIds.has(e.id)) fail(`duplicate id: ${e.id}`);
  seenIds.add(e.id);
  for (const field of ['id', 'family', 'name', 'source', 'behaviour', 'acceptance', 'target', 'status', 'proof', 'priority']) {
    if (e[field] === undefined || e[field] === null || e[field] === '') fail(`${e.id}: missing or empty field ${field}`);
  }
  if (!STATUSES.has(e.status)) fail(`${e.id}: invalid status ${e.status}`);
  if (!TARGETS.has(e.target)) fail(`${e.id}: invalid target ${e.target}`);
  if (!PRIORITIES.has(e.priority)) fail(`${e.id}: invalid priority ${e.priority}`);
  if (typeof e.behaviour === 'string' && GENERIC_BEHAVIOUR.test(e.behaviour)) fail(`${e.id}: generic tautological behaviour text must state the entry contract (signature/defaults)`);
  if (typeof e.behaviour === 'string' && e.behaviour.length < 60) fail(`${e.id}: behaviour too short to state a contract (${e.behaviour.length} chars)`);
  if (typeof e.acceptance === 'string' && e.acceptance.length < 60) fail(`${e.id}: acceptance too short to state an oracle (${e.acceptance.length} chars)`);
  if (!e.proof || !e.proof.path || !Number.isInteger(e.proof.line)) fail(`${e.id}: proof must carry path and integer line`);
  else {
    const proofAbs = join(wtRoot, e.proof.path);
    if (!existsSync(proofAbs)) fail(`${e.id}: proof file not found: ${e.proof.path}`);
    else {
      const proofLines = readFileSync(proofAbs, 'utf8').split(/\r?\n/).length;
      if (e.proof.line < 1 || e.proof.line > proofLines) fail(`${e.id}: proof line ${e.proof.line} out of range 1..${proofLines} in ${e.proof.path}`);
    }
  }
  const sm = String(e.source || '').match(/^(.*):(\d+)$/);
  if (!sm) fail(`${e.id}: source is not path:line: ${e.source}`);
  else {
    const abs = existsSync(join(repoRoot, sm[1])) ? join(repoRoot, sm[1]) : join(wtRoot, sm[1]);
    if (!existsSync(abs)) fail(`${e.id}: source file not found: ${sm[1]}`);
    else {
      const lineCount = readFileSync(abs, 'utf8').split(/\r?\n/).length;
      const line = Number(sm[2]);
      if (line < 1 || line > lineCount) fail(`${e.id}: source line ${line} out of range 1..${lineCount} in ${sm[1]}`);
    }
  }
  const ck = inventoryKey(e);
  if (seenKeys.has(ck)) fail(`${e.id}: duplicate expected key ${ck.replace('\0', '/')}`);
  seenKeys.add(ck);
}

// Bidirectional set comparison: the core non-tautological check.
const missingInInventory = [];
for (const item of expected.values()) {
  const ck = expectedKey(item);
  if (!seenKeys.has(ck)) missingInInventory.push(item);
}
const phantomInInventory = [];
for (const e of entries) {
  const ck = inventoryKey(e);
  if (!expectedKeys.has(ck)) phantomInInventory.push({ entry: e, ck });
}
const byFamilyCount = (list, getFam) => {
  const m = {};
  for (const x of list) { const f = getFam(x); m[f] = (m[f] || 0) + 1; }
  return m;
};
if (missingInInventory.length) {
  const counts = byFamilyCount(missingInInventory, (x) => x.family);
  fail(`AST-expected items missing from inventory: ${missingInInventory.length} (${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(', ')})`);
  for (const x of missingInInventory.slice(0, 60)) fail(`  missing: ${x.family}/${x.key} (AST ${x.file}:${x.at})`);
  if (missingInInventory.length > 60) fail(`  ... and ${missingInInventory.length - 60} more missing`);
}
if (phantomInInventory.length) {
  const counts = byFamilyCount(phantomInInventory, (x) => x.entry.family);
  fail(`inventory entries with no AST counterpart (phantom): ${phantomInInventory.length} (${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(', ')})`);
  for (const x of phantomInInventory.slice(0, 60)) fail(`  phantom: ${x.entry.id} [${x.ck.replace('\0', '/')}]`);
  if (phantomInInventory.length > 60) fail(`  ... and ${phantomInInventory.length - 60} more phantom`);
}

// Stored counts must match recomputed counts, including the parity split.
const byStatus = { covered: 0, partial: 0, missing: 0 };
const byFamilyInv = {};
for (const e of entries) { byStatus[e.status]++; byFamilyInv[e.family] = (byFamilyInv[e.family] || 0) + 1; }
const demoPlus = entries.filter((e) => e.family === 'catalog-app' && e.licenseMarker === 'JointJS+').length;
const parity = entries.filter((e) => !(e.family === 'catalog-app' && e.licenseMarker === 'JointJS+'));
const parityByStatus = { covered: 0, partial: 0, missing: 0 };
for (const e of parity) parityByStatus[e.status]++;
if (!doc.counts || doc.counts.total !== entries.length) fail(`counts.total ${doc.counts && doc.counts.total} != entries ${entries.length}`);
for (const s of Object.keys(byStatus)) if (!doc.counts || doc.counts.byStatus[s] !== byStatus[s]) fail(`counts.byStatus.${s} mismatch`);
if (!doc.counts || doc.counts.parityTotal !== parity.length) fail(`counts.parityTotal ${doc.counts && doc.counts.parityTotal} != parity entries ${parity.length} (JointJS+ rows must stay excluded)`);
for (const s of Object.keys(parityByStatus)) if (!doc.counts || doc.counts.parityByStatus[s] !== parityByStatus[s]) fail(`counts.parityByStatus.${s} mismatch`);
if (!doc.counts || doc.counts.demoPlusTracked !== demoPlus) fail(`counts.demoPlusTracked mismatch`);
if (doc.schema_version !== 2) fail(`schema_version must be 2, got ${doc.schema_version}`);

if (failures.length) {
  console.error(`FAIL: ${failures.length} problem(s):`);
  for (const f of failures.slice(0, 80)) console.error(`  - ${f}`);
  if (failures.length > 80) console.error(`  ... and ${failures.length - 80} more`);
  process.exit(1);
}
console.log(`OK: ${entries.length} entries; AST guard holds (expected ${expected.size} items, 0 missing, 0 phantom).`);
console.log(`byStatus: covered=${byStatus.covered} partial=${byStatus.partial} missing=${byStatus.missing}`);
console.log(`parity: ${parity.length} entries (covered=${parityByStatus.covered} partial=${parityByStatus.partial} missing=${parityByStatus.missing}); demoPlusTracked=${demoPlus} excluded from parity`);
for (const [k, v] of Object.entries(byFamilyInv).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`);
