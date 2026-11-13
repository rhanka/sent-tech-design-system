#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { bench, src, names } from './lib.mjs';

// Run exclusively: this deliberately converts Badge temporarily, then restores
// exact original bytes in finally. No git restore/stash or product commits.
for (const name of names) {
  assert(existsSync(resolve(src, `${name}.ts`)) && !existsSync(resolve(src, `${name}.vue`)), `${name}: requires unconverted tree`);
}
const indexFile = resolve(src, 'index.ts');
const oldFile = resolve(src, 'Badge.ts');
const newFile = resolve(src, 'Badge.vue');
const index = readFileSync(indexFile);
const original = readFileSync(oldFile);
const results = { baseline: [], badgeProof: null, negativeControls: [], restored: false };
function check(name) {
  const child = spawnSync(process.execPath, [resolve(bench, 'check.mjs'), name, '--json'], {
    encoding: 'utf8', timeout: 180000, maxBuffer: 8 * 1024 * 1024,
  });
  assert(!child.error, String(child.error));
  const result = JSON.parse(child.stdout);
  assert.equal(child.status, result.ok ? 0 : 1, child.stderr);
  return result;
}
function status(result, gate) { return result.gates.find(g => g.gate === gate)?.status; }
function negative(label, gate, mutate, restore) {
  try {
    mutate();
    const result = check('Badge');
    assert.equal(status(result, gate), 'FAIL', `${label}: ${gate} should fail`);
    results.negativeControls.push({ label, gate, detected: true });
    console.log(`${label}: ${gate} rejected`);
  } finally { restore(); }
}
try {
  for (const name of names) {
    const result = check(name);
    assert.equal(status(result, 'G1'), 'FAIL');
    assert.equal(status(result, 'G4'), 'PASS', JSON.stringify(result));
    assert.equal(status(result, 'G6'), 'PASS', JSON.stringify(result));
    results.baseline.push(result);
    console.log(`${name}: baseline G1 FAIL, G4 PASS, G6 PASS`);
  }
  const converted = readFileSync(resolve(bench, 'examples/Badge.vue'), 'utf8');
  const convertedIndex = index.toString().replace('export { Badge } from "./Badge.js";', 'export { default as Badge } from "./Badge.vue";')
    .replace('from "./Badge.js"', 'from "./Badge.vue"');
  writeFileSync(newFile, converted);
  unlinkSync(oldFile);
  writeFileSync(indexFile, convertedIndex);
  results.badgeProof = check('Badge');
  assert.equal(results.badgeProof.ok, true, JSON.stringify(results.badgeProof));
  console.log('Badge conversion: G1–G6 PASS');
  negative('Forbidden render call', 'G1', () => writeFileSync(newFile, converted.replace("import { classNames }", "import { h as makeNode } from 'vue';\nmakeNode('div');\nimport { classNames }")), () => writeFileSync(newFile, converted));
  negative('Render call in template', 'G1', () => writeFileSync(newFile, converted.replace('<slot />', '{{ h("span") }}')), () => writeFileSync(newFile, converted));
  negative('Invalid template', 'G2', () => writeFileSync(newFile, converted.replace('<slot />', '<slot>')), () => writeFileSync(newFile, converted));
  negative('Type error', 'G3', () => writeFileSync(newFile, converted.replace('</script>', 'const invalid: number = "text";\n</script>')), () => writeFileSync(newFile, converted));
  negative('Changed markup', 'G4', () => writeFileSync(newFile, converted.replace("'st-badge'", "'st-badge-regression'")), () => writeFileSync(newFile, converted));
  const fixtureFile = resolve(bench, 'fixtures/Badge.fixtures.ts');
  const originalFixture = readFileSync(fixtureFile);
  negative('Changed fixture input', 'G4', () => writeFileSync(fixtureFile, originalFixture.toString() + '\n// mutation control\n'), () => writeFileSync(fixtureFile, originalFixture));
  negative('Mount lifecycle exception', 'G5', () => writeFileSync(newFile, converted.replace('</script>', 'onMounted(() => { throw new Error("bench mount failure"); });\n</script>').replace("import { classNames }", "import { onMounted } from 'vue';\nimport { classNames }")), () => writeFileSync(newFile, converted));
  negative('Missing Props export', 'G6', () => writeFileSync(indexFile, convertedIndex.replace('BadgeProps, ', '')), () => writeFileSync(indexFile, convertedIndex));
} finally {
  writeFileSync(oldFile, original);
  writeFileSync(indexFile, index);
  if (existsSync(newFile)) unlinkSync(newFile);
  results.restored = readFileSync(oldFile).equals(original) && readFileSync(indexFile).equals(index) && !existsSync(newFile);
  mkdirSync(resolve(bench, 'results'), { recursive: true });
  writeFileSync(resolve(bench, 'results/selftest.json'), JSON.stringify(results, null, 2) + '\n');
}
assert.equal(results.restored, true);
console.log('Badge.ts and index.ts restored byte-for-byte; Badge.vue absent');
