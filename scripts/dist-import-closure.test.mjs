import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { checkPackage } from './dist-import-closure.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const workspace = name => {
  const dir = join(root, 'packages', name);
  return { dir, manifest: JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) };
};

test('should reject published canvas 0.2.0 against registry core 0.1.0 even with a repaired workspace present', async () => {
  const temp = mkdtempSync(join(tmpdir(), 'sent-closure-regression-'));
  try {
    const result = spawnSync('npm', ['pack', '@sentropic/diagram-canvas@0.2.0', '--json', '--ignore-scripts', '--pack-destination', temp], { cwd: temp, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const [pack] = JSON.parse(result.stdout);
    const canvas = workspace('diagram-canvas');
    canvas.manifest = { ...canvas.manifest, version: '0.2.0', dependencies: { '@sentropic/diagram-core': '0.1.0' } };
    const logs = [];
    await assert.rejects(checkPackage(canvas, { tarball: join(temp, pack.filename), workspaces: [workspace('diagram-core')], log: line => logs.push(line) }), /does not provide an export named '(?:flowIndex|validateFlows|relationBaseType|erdEntityOccurrence|erdPortOccurrence)'/);
    assert(!logs.some(line => line.includes('UNPUBLISHED SIBLING')), 'a published core must come from the registry');
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test('should import every repaired canvas entry using core 0.2.0 and mark an unpublished sibling', async () => {
  const logs = [];
  const result = await checkPackage(workspace('diagram-canvas'), { workspaces: [workspace('diagram-core')], log: line => logs.push(line) });
  assert(logs.some(line => line.includes('@sentropic/diagram-canvas/flowModel')));
  assert(logs.some(line => line.includes('@sentropic/diagram-canvas/diagram-render')));
  assert.deepEqual(result.lanes, ['node']);
  // After release this naturally switches to the real registry version.
  for (const sibling of result.unpublishedSiblings) assert(logs.some(line => line.includes(`UNPUBLISHED SIBLING ${sibling}`)));
});

test('should fail when a secondary public entry has an unresolved specifier', async () => {
  const temp = mkdtempSync(join(tmpdir(), 'sent-closure-secondary-'));
  try {
    const dir = join(temp, 'fixture');
    mkdirSync(dir);
    const manifest = { name: 'closure-secondary-fixture', version: '1.0.0', type: 'module', exports: { '.': './index.js', './secondary': './secondary.js' } };
    writeFileSync(join(dir, 'package.json'), JSON.stringify(manifest));
    writeFileSync(join(dir, 'index.js'), 'export const valid = true;');
    writeFileSync(join(dir, 'secondary.js'), 'export { absent } from "unresolved-closure-fixture";');
    await assert.rejects(checkPackage({ dir, manifest }, { log() {} }), /Cannot find package 'unresolved-closure-fixture'/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test('should follow Svelte source imports and reject missing named exports', async () => {
  const temp = mkdtempSync(join(tmpdir(), 'sent-closure-svelte-'));
  try {
    const manifest = { name: 'closure-svelte-fixture', version: '1.0.0', type: 'module', exports: './index.js', peerDependencies: { svelte: '^5' } };
    writeFileSync(join(temp, 'package.json'), JSON.stringify(manifest));
    writeFileSync(join(temp, 'index.js'), 'export { default as Component } from "./Component.svelte";');
    writeFileSync(join(temp, 'Component.svelte'), '<script module>import { absent } from "./helper"; export const value = absent;</script><p>{value}</p>');
    writeFileSync(join(temp, 'helper.js'), 'export const present = true;');
    await assert.rejects(checkPackage({ dir: temp, manifest }, { log() {} }), /does not provide an export named 'absent'/);
    writeFileSync(join(temp, 'helper.js'), 'export const absent = true;');
    await checkPackage({ dir: temp, manifest }, { log() {} });
  } finally { rmSync(temp, { recursive: true, force: true }); }
});
