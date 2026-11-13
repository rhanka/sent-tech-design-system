import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { normalizeHtml } from './lib.mjs';
import { compileSfc, bench, src } from './lib.mjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const normalize = html => normalizeHtml(html, JSDOM);

test('attribute order, indentation, entities and Vue markers are canonical', () => {
  assert.equal(normalize('<div title="a &amp; b" class="x">\n <span>A   B</span><!--[--><!----><!--]--></div>'),
    '<div class="x" title="a &amp; b"><span>A B</span></div>');
});
test('counter IDs and useId IDs match while reference relationships survive', () => {
  assert.equal(normalize('<label for="st-input-21">Name</label><input id="st-input-21">'),
    normalize('<label for="st-input-v-0">Name</label><input id="st-input-v-0">'));
  assert.notEqual(normalize('<label for="st-input-21">Name</label><input id="st-input-21">'),
    normalize('<label for="st-input-v-0">Name</label><input id="st-input-v-1">'));
  assert.notEqual(normalize('<div id="st-tabs-1-tab-one" aria-controls="st-tabs-1-panel-one"></div>'),
    normalize('<div id="st-tabs-v-0-tab-one" aria-controls="st-tabs-v-0-panel-two"></div>'));
});
test('static IDs, classes, text, styles, attributes and element order remain significant', () => {
  const base = '<section id="consumer" class="a b" style="color:red" aria-hidden="false"><strong>A</strong><em>B</em></section>';
  for (const changed of [base.replace('consumer', 'other'), base.replace('a b', 'b a'), base.replace('red', 'blue'), base.replace('false', 'true'), base.replace('>A<', '>C<'), base.replace('<strong>A</strong><em>B</em>', '<em>B</em><strong>A</strong>')]) {
    assert.notEqual(normalize(base), normalize(changed));
  }
  assert.equal(normalize('<span>st-input-99</span>'), '<span>st-input-99</span>');
});
test('HARD generated identities normalize while explicit names and relationships remain distinct', () => {
  assert.equal(normalize('<input name="st-tileGroup-21"><input name="st-tileGroup-21">'),
    normalize('<input name="st-tileGroup-v-0"><input name="st-tileGroup-v-0">'));
  assert.notEqual(normalize('<input name="st-tileGroup-21"><input name="st-tileGroup-21">'),
    normalize('<input name="st-tileGroup-v-0"><input name="st-tileGroup-v-1">'));
  assert.notEqual(normalize('<input name="consumer-one">'), normalize('<input name="consumer-two">'));
  assert.equal(normalize('<button aria-controls="st-appChrome-drawer-3"></button><nav id="st-appChrome-drawer-3"></nav>'),
    normalize('<button aria-controls="st-appChrome-drawer-v-0"></button><nav id="st-appChrome-drawer-v-0"></nav>'));
  assert.notEqual(normalize('<section aria-labelledby="st-navSection-3-label"></section>'),
    normalize('<section aria-labelledby="st-navSection-v-0-other"></section>'));
  assert.equal(normalize('<div data-name="st-tileGroup-9">st-navSection-3</div>'),
    '<div data-name="st-tileGroup-9">st-navSection-3</div>');
});
test('SVG geometry and namespaced attributes survive normalization', () => {
  const a = '<svg viewBox="0 0 10 10"><use xlink:href="#glyph"/><rect x="1" width="2"/></svg>';
  assert.match(normalize(a), /viewBox="0 0 10 10"/);
  assert.match(normalize(a), /xlink:href="#glyph"/);
  assert.notEqual(normalize(a), normalize(a.replace('width="2"', 'width="3"')));
});
test('generated SVG identities preserve cell suffixes and reference targets', () => {
  const svg = (base, ref = '1') => `<svg><defs><clipPath id="${base}-0"></clipPath><clipPath id="${base}-1"></clipPath></defs><g clip-path="url(#${base}-${ref})"></g></svg>`;
  assert.equal(normalize(svg('st-treemap-clip-abc1234')), normalize(svg('st-treemap-clip-v0')));
  assert.notEqual(normalize(svg('st-treemap-clip-abc1234')), normalize(svg('st-treemap-clip-v0', '0')));
  assert.notEqual(normalize('<svg><path fill="url(#consumer-a)"></path></svg>'), normalize('<svg><path fill="url(#consumer-b)"></path></svg>'));
});
test('worked examples compile with the house options in classic and Vapor', () => {
  for (const name of ['Badge', 'Tabs']) {
    const source = readFileSync(resolve(bench, 'examples', `${name}.vue`), 'utf8');
    for (const mode of ['classic', 'vapor']) assert(compileSfc(source, resolve(src, `${name}.vue`), mode).length > 0);
  }
});
