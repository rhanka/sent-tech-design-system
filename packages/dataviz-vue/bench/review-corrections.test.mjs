import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bench, require, normalizeHtml, mountedHtml } from './lib.mjs';
import { reviewCorrections } from './review-corrections.mjs';
const { JSDOM } = require('jsdom');

test('review correction removes duplicated control wrapper attrs and keeps native attrs', () => {
  const fixture = { id: 'attrs', html: '<div role="group"><div class="st-field" aria-label="Name"><input aria-label="Name" data-consumer="kept"></div><label class="st-choice--checkbox" aria-label="Check"><input type="checkbox" aria-label="Check"></label></div>' };
  const corrected = reviewCorrections('FormatPanel', fixture, JSDOM);
  const tree = JSDOM.fragment(corrected.html);
  assert.equal(tree.querySelector('.st-field').hasAttribute('aria-label'), false);
  assert.equal(tree.querySelector('.st-choice--checkbox').hasAttribute('aria-label'), false);
  assert.equal(tree.querySelector('input').getAttribute('aria-label'), 'Name');
  assert.equal(tree.querySelector('input').getAttribute('data-consumer'), 'kept');
  assert.equal(tree.firstElementChild.getAttribute('role'), 'group');
  assert.equal(reviewCorrections('AreaChart', fixture, JSDOM), fixture);
});

test('review correction retains date-picker and range-slider wrapper destinations', () => {
  for (const html of [
    '<div class="st-field" data-consumer="kept"><span class="st-datepicker"><input type="date"></span></div>',
    '<div class="st-field" data-consumer="kept"><input type="range"></div>',
  ]) assert.equal(normalizeHtml(reviewCorrections('DashboardFilterBar', { html }, JSDOM).html, JSDOM), normalizeHtml(html, JSDOM));
});

test('PR 286 corrections keep glyph geometry and unrelated SVG markup significant', () => {
  const svg = '<svg class="lucide lucide-x-icon lucide-x" width="12" stroke-width="2.5"><path d="M18 6 6 18"></path></svg>';
  const fixture = { html: `<div><button class="st-filterPill__remove">${svg}</button>${svg}</div>` };
  const tree = JSDOM.fragment(reviewCorrections('DashboardActiveFilters', fixture, JSDOM).html);
  const corrected = tree.querySelector('button svg');
  assert.equal(corrected.getAttribute('class'), 'lucide st-icon lucide-x-icon lucide-x');
  assert.equal(corrected.getAttribute('stroke-width'), '2.25');
  assert.equal(corrected.getAttribute('focusable'), 'false');
  assert.equal(corrected.getAttribute('width'), '12');
  assert.equal(corrected.querySelector('path').getAttribute('d'), 'M18 6 6 18');
  assert.equal(tree.querySelector('div > svg').outerHTML, svg);
  assert.equal(reviewCorrections('AreaChart', fixture, JSDOM), fixture);
});

test('PR 286 table correction removes only duplicated wrapper attrs', () => {
  const fixture = { html: '<div class="st-dataTable-wrap" data-shared="same" data-unique="kept"><table class="st-dataTable" data-shared="same" aria-label="Rows"></table></div>' };
  const tree = JSDOM.fragment(reviewCorrections('AdvancedPivotDataTable', fixture, JSDOM).html);
  assert.equal(tree.firstElementChild.hasAttribute('data-shared'), false);
  assert.equal(tree.firstElementChild.getAttribute('data-unique'), 'kept');
  assert.equal(tree.querySelector('table').getAttribute('data-shared'), 'same');
  assert.equal(tree.querySelector('table').getAttribute('aria-label'), 'Rows');
});

test('G5 serializer keeps live properties and valid style declarations observable', () => {
  const dom = new JSDOM('<body><input value="old"><textarea>old</textarea><button style="border:1px solid var(--border, #ccc);display:flex">Play</button></body>');
  const before = mountedHtml(dom.window.document.body, JSDOM);
  assert.match(before, /border:1px solid var\(--border, #ccc\)/);
  dom.window.document.querySelector('input').value = 'new';
  dom.window.document.querySelector('textarea').value = 'new';
  const after = mountedHtml(dom.window.document.body, JSDOM);
  assert.notEqual(after, before);
  assert.match(after, /value="new"/);
  assert.match(after, /<textarea>new<\/textarea>/);
  dom.window.close();
});

test('EventFeedPanel generated label IDs preserve suffixes and reference relationships', () => {
  const html = (id, ref = id) => '<p id="st-eventFeedPanel-' + id + '-label">Events</p><ul aria-labelledby="st-eventFeedPanel-' + ref + '-label"></ul>';
  const normalize = value => normalizeHtml(value, JSDOM);
  assert.equal(normalize(html('0')), normalize(html('v-0')));
  assert.notEqual(normalize(html('0')), normalize(html('v-0', 'v-1')));
  assert.notEqual(normalize(html('0')), normalize(html('v-0').replace('-label', '-other')));
});

test('populated feed golden input is independent of the host timezone', async () => {
  const { execFileSync } = await import('node:child_process');
  const { resolve } = await import('node:path');
  const outputs = ['UTC', 'Pacific/Honolulu'].map(TZ => JSON.parse(execFileSync(process.execPath,
    [resolve(bench, 'worker.mjs'), 'ssr', 'EventFeedPanel'],
    { encoding: 'utf8', env: { ...process.env, TZ } })).fixtures);
  assert.deepEqual(outputs[0], outputs[1]);
});
