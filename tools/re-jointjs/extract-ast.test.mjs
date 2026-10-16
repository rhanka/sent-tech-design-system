#!/usr/bin/env node
// Focused regression tests for the independent AST extractor and guard.
// Run: node --test tools/re-jointjs/extract-ast.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { extractWithProgram } from './extract-ast.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const wt = resolve(here, '..', '..');
const keys = () => new Set([...extractWithProgram().keys()]);

test('AST extractor finds generic methods the regex extractor dropped', () => {
  const set = keys();
  for (const ck of [
    'mvc\0Model.get',
    'mvc\0Model.previous',
    'mvc\0Collection.map',
    'mvc\0Collection.reduce',
    'mvc\0Collection.[Symbol.iterator]',
    'mvc\0Listener.listenTo',
    'dia-api\0Paper.findView',
    'dia-api\0Paper.findViewByModel',
    'dia-api\0Paper.getCellView',
    'dia-api\0Paper.requireView',
    'dia-api\0Graph.getTypeConstructor',
    'dia-api\0HighlighterView.add',
  ]) assert.ok(set.has(ck), `expected AST key ${ck.replace('\0', '/')}`);
});

test('AST extractor finds required properties, Segment and enums', () => {
  const set = keys();
  for (const ck of [
    'geometry\0Point.x',
    'geometry\0Rect.width',
    'geometry\0Segment.bbox',
    'geometry\0Segment.translate',
    'geometry\0types',
    'vectorizer\0V',
    'presentation-attribute\0ref-d',
    'presentation-attribute\0evalAttributes',
    'package-api\0@joint/router-avoid:RouterService.start',
    'package-api\0@joint/router-avoid:RouterService.routeAll',
  ]) assert.ok(set.has(ck), `expected AST key ${ck.replace('\0', '/')}`);
});

test('comment-only event example is not an observable event', () => {
  const set = keys();
  assert.ok(!set.has('event\0expand'), 'Events.mjs doc-header trigger(expand) must stay excluded');
});

test('guard is non-tautological and passes on the stored inventory', () => {
  const verifySrc = readFileSync(join(here, 'verify.mjs'), 'utf8');
  assert.ok(!verifySrc.includes("from './enumerate.mjs'"), 'verify.mjs must not import enumerate.mjs');
  assert.ok(verifySrc.includes("from './extract-ast.mjs'"), 'verify.mjs must use the independent extractor');
  const run = spawnSync(process.execPath, [join(here, 'verify.mjs')], { encoding: 'utf8', cwd: wt });
  assert.equal(run.status, 0, `verify.mjs must pass:\n${run.stdout}\n${run.stderr}`);
  assert.match(run.stdout, /AST guard holds/);
});
