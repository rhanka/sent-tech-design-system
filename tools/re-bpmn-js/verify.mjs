#!/usr/bin/env node
/**
 * verify.mjs — NON-TAUTOLOGICAL completeness guard for
 * docs/re/bpmn-js-inventory.json.
 *
 * The inventory is produced by enumerate.mjs (line/regex extraction). This
 * guard compares it against a SECOND, independent enumeration produced by
 * extract-ast.mjs (TypeScript compiler API, AST visitors, no shared code
 * with enumerate.mjs). It asserts:
 *  1. bijection: every AST-extracted (family, key) has exactly one inventory
 *     entry and every inventory entry corresponds to an AST-extracted item.
 *     Both directions are listed on failure, so an omission in either
 *     extractor fails the guard instead of being confirmed by construction;
 *  2. schema: every entry carries id/family/source(path:line)/behaviour/
 *     acceptance/target/status/proof/priority with allowed vocabularies;
 *  3. sources: every source path exists and its line is inside the file;
 *  4. proofs: every proof path exists in this worktree (line inside file);
 *  5. ids are unique and stable (`RE.<family>.<slug>`).
 *
 * "100 %" may only be quoted when this guard passes: 100 % of the surface
 * two independent extractors agree on, under the conventions of
 * SPEC_RE_BPMN_JS_PARITY.md section 3.1.
 *
 * Exit 0 = guard passes. Any failure prints the offending keys and exits 1.
 * Usage: node tools/re-bpmn-js/verify.mjs [path/to/inventory.json]
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractAstAll } from './extract-ast.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const wtRoot = resolve(scriptDir, '..', '..');
const repoRoot = resolve(wtRoot, '..');
const inventoryPath = process.argv[2]
  ? resolve(process.argv[2])
  : join(wtRoot, 'docs', 're', 'bpmn-js-inventory.json');

const FAMILIES = ['module', 'command', 'rule', 'palette', 'context-pad', 'replace-menu', 'popup-menu', 'keyboard', 'event', 'config', 'renderer', 'moddle-type', 'api', 'example'];
const STATUSES = new Set(['covered', 'partial', 'missing']);
const TARGETS = new Set(['graph', 'diagram-core', 'diagram-canvas', 'ds-component', 'new-module']);
const PRIORITIES = new Set(['P0', 'P1', 'P2']);

function lineCount(abs) {
  return readFileSync(abs, 'utf8').split(/\r?\n/).length;
}

const failures = [];
const raw = extractAstAll();
const rawKeys = new Map(); // "family\0key" -> item
for (const [family, items] of Object.entries(raw)) {
  for (const it of items) rawKeys.set(`${family}\0${it.key}`, it);
}

if (!existsSync(inventoryPath)) {
  console.error(`FAIL inventory not found: ${inventoryPath}`);
  process.exit(1);
}
const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'));
const entries = inventory.entries || [];

const seenIds = new Set();
const seenKeys = new Set();
for (const e of entries) {
  const where = e.id || e.key || '(no id)';
  if (!e.id || !/^RE\.[a-z-]+\.[a-z0-9-]+$/.test(e.id)) failures.push(`${where}: bad id`);
  if (seenIds.has(e.id)) failures.push(`${where}: duplicate id`);
  seenIds.add(e.id);
  if (!FAMILIES.includes(e.family)) failures.push(`${where}: unknown family ${e.family}`);
  const k = `${e.family}\0${e.key}`;
  if (seenKeys.has(k)) failures.push(`${where}: duplicate (family,key)`);
  seenKeys.add(k);
  if (!e.source || !e.source.path || !Number.isInteger(e.source.line)) failures.push(`${where}: missing source path:line`);
  else {
    const abs = join(repoRoot, e.source.path);
    if (!existsSync(abs)) failures.push(`${where}: source file missing ${e.source.path}`);
    else if (e.source.line < 1 || e.source.line > lineCount(abs)) failures.push(`${where}: source line out of range ${e.source.path}:${e.source.line}`);
  }
  for (const field of ['behaviour', 'acceptance']) {
    if (!e[field] || String(e[field]).length < 20) failures.push(`${where}: ${field} missing/too short`);
  }
  if (!STATUSES.has(e.status)) failures.push(`${where}: bad status ${e.status}`);
  if (!TARGETS.has(e.target)) failures.push(`${where}: bad target ${e.target}`);
  if (!PRIORITIES.has(e.priority)) failures.push(`${where}: bad priority ${e.priority}`);
  if (!e.proof || !e.proof.path) failures.push(`${where}: missing proof`);
  else {
    const abs = join(wtRoot, e.proof.path);
    if (!existsSync(abs)) failures.push(`${where}: proof file missing ${e.proof.path}`);
    else if (Number.isInteger(e.proof.line) && (e.proof.line < 1 || e.proof.line > lineCount(abs))) failures.push(`${where}: proof line out of range ${e.proof.path}:${e.proof.line}`);
  }
}

// Bijection against the independent AST extraction (both directions).
const onlyAst = [];
for (const k of rawKeys.keys()) {
  if (!seenKeys.has(k)) onlyAst.push(k.replace('\0', ' / '));
}
const onlyInventory = [];
for (const k of seenKeys) {
  if (!rawKeys.has(k)) onlyInventory.push(k.replace('\0', ' / '));
}
for (const k of onlyAst) failures.push(`ONLY-IN-AST (missing from inventory): ${k}`);
for (const k of onlyInventory) failures.push(`ONLY-IN-INVENTORY (not found by AST extractor): ${k}`);

// Summary consistency.
const total = entries.length;
if (inventory.summary && inventory.summary.total !== total) failures.push(`summary.total ${inventory.summary.total} != entries ${total}`);

const byFamily = {};
for (const e of entries) byFamily[e.family] = (byFamily[e.family] || 0) + 1;
const astByFamily = {};
for (const [family, items] of Object.entries(raw)) astByFamily[family] = items.length;

if (failures.length) {
  console.error(`COMPLETENESS GUARD: FAIL (${failures.length})`);
  console.error(`entries=${total} astExtracted=${rawKeys.size} onlyInAst=${onlyAst.length} onlyInInventory=${onlyInventory.length}`);
  for (const f of failures.slice(0, 200)) console.error(` - ${f}`);
  if (failures.length > 200) console.error(` - … and ${failures.length - 200} more`);
  process.exit(1);
}
console.log(`COMPLETENESS GUARD: PASS entries=${total} astExtracted=${rawKeys.size} bijection=exact`);
console.log('byFamily=' + JSON.stringify(byFamily));
console.log('astByFamily=' + JSON.stringify(astByFamily));
