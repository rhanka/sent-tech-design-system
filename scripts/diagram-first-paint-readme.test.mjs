import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cases } from '../tools/diagram-first-paint/scenes.js';

test('should document the exact first-paint case count from scenes.js', () => {
  const readme = readFileSync(new URL('../tools/diagram-first-paint/README.md', import.meta.url), 'utf8');
  const documented = /The (\d+) cases/.exec(readme);
  assert.ok(documented, 'README must state the case count');
  assert.equal(Number(documented[1]), 2 * 2 * cases.length);
});
