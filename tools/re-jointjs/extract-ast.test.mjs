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

test('round 2: checker-derived paper options include the sibling interfaces', () => {
  const set = keys();
  for (const ck of [
    'paper-option\0cellVisibility',
    'paper-option\0viewport',
    'paper-option\0beforeRender',
    'paper-option\0afterRender',
  ]) assert.ok(set.has(ck), `expected AST key ${ck.replace('\0', '/')}`);
});

test('round 2: package surfaces follow the real entry points', () => {
  const set = keys();
  for (const ck of [
    'package-api\0@joint/router-avoid:InitAvoidOptions',
    'package-api\0@joint/router-avoid:TrackLinkCallback',
    'package-api\0@joint/router-avoid:RouteOrigin',
    'package-api\0@joint/layout-msagl:Options',
    'package-api\0@joint/layout-msagl:LayoutResult',
    'package-api\0@joint/decorators:ModelOptions',
    'package-api\0@joint/react/internal:MapElementToAttributes',
    'package-api\0@joint/shapes-general:Table.data',
    'package-api\0@joint/shapes-general:Table.dividerX',
    'mvc\0Events',
    'mvc\0TriggeredEvent',
    'mvc\0views',
    'mvc\0View.addThemeClassName',
    'util\0addClassNamePrefix',
    'util\0wrappers',
    'dia-api\0sortingTypes',
  ]) assert.ok(set.has(ck), `expected AST key ${ck.replace('\0', '/')}`);
  for (const ck of [
    'package-api\0@joint/router-avoid:RouterServiceOptions',
    'package-api\0@joint/router-avoid:RouteAttributes',
    'package-api\0@joint/router-avoid:FallbackRouteAttributes',
    'link-anchor\0resolveRef',
  ]) assert.ok(!set.has(ck), `unexpected AST key ${ck.replace('\0', '/')}`);
});

test('round 2: extractor shares no whitelist literal with the generator', () => {
  // The guard extractor must derive these surfaces from the sources; the
  // literal item names below belong to the generator side only.
  const extractSrc = readFileSync(join(here, 'extract-ast.mjs'), 'utf8');
  for (const literal of [
    'sortingTypes', 'InitAvoidOptions', 'TrackLinkCallback', 'ModelOptions',
    'addClassNamePrefix', 'magnetSelector', 'RouterServiceEventMap',
    'RightAngleDirections', 'use-no-break-space', 'normalizeWheel',
  ]) assert.ok(!extractSrc.includes(literal), `extract-ast.mjs must not restate ${literal}`);
  assert.ok(!/if \(false\)\s*\{[^}]*\}\s*else/.test(extractSrc), 'no dead branch may remain');
});

test('guard is non-tautological and passes on the stored inventory', () => {
  const verifySrc = readFileSync(join(here, 'verify.mjs'), 'utf8');
  assert.ok(!verifySrc.includes("from './enumerate.mjs'"), 'verify.mjs must not import enumerate.mjs');
  assert.ok(verifySrc.includes("from './extract-ast.mjs'"), 'verify.mjs must use the independent extractor');
  const run = spawnSync(process.execPath, [join(here, 'verify.mjs')], { encoding: 'utf8', cwd: wt });
  assert.equal(run.status, 0, `verify.mjs must pass:\n${run.stdout}\n${run.stderr}`);
  assert.match(run.stdout, /AST guard holds/);
});
