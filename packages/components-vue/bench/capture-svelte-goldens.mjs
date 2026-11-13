import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { registerHooks } from 'node:module';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { compile } from 'svelte/compiler';
import { render } from 'svelte/server';
import { JSDOM } from 'jsdom';
import { bench, installSourceLoader, normalizeHtml } from './lib.mjs';

// Capture only components with no historical Vue implementation. Reference
// markup comes from the Svelte server compiler, never the new Vue SFC.
const references = {
  LabelledIconButton: 'packages/components-svelte/src/lib/LabelledIconButton.svelte',
  LockPresenceBadge: 'packages/components-svelte/src/lib/presence-badge/LockPresenceBadge.svelte',
  WebFrame: 'packages/dataviz-svelte/src/lib/WebFrame.svelte',
  RichTextEditor: 'packages/components-svelte/src/lib/rich-text-editor/RichTextEditor.svelte',
  ComposerEditor: 'packages/components-svelte/src/lib/rich-text-editor/ComposerEditor.svelte',
};
const root = resolve(bench, '../../..');
const names = process.argv.slice(2);
if (!names.length || names.some(name => !references[name])) throw new Error('Pass explicit V8 component names');
installSourceLoader('classic');
registerHooks({
  load(url, context, next) {
    if (url.startsWith('file:') && url.endsWith('.svelte')) {
      const filename = new URL(url).pathname;
      return { format: 'module', shortCircuit: true,
        source: compile(readFileSync(filename, 'utf8'), { filename, generate: 'server', css: 'external' }).js.code };
    }
    return next(url, context);
  },
});
const revision = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' });
if (revision.status !== 0) throw new Error(revision.stderr);
const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');
const normalizeSvelte = html => {
  const fragment = JSDOM.fragment(html);
  for (const node of fragment.querySelectorAll('[class]')) {
    const classes = [...node.classList].filter(value => !/^svelte-[a-z0-9]+$/.test(value));
    if (classes.length) node.setAttribute('class', classes.join(' '));
    else node.removeAttribute('class');
  }
  const host = new JSDOM('').window.document.createElement('div');
  host.append(fragment);
  return normalizeHtml(host.innerHTML.replace(/<!--(?:\[(?:!|-?\d+)?|\]|)-->/g, ''), JSDOM);
};
for (const name of names) {
  const reference = resolve(root, references[name]);
  const fixtureFile = resolve(bench, 'fixtures', name + '.fixtures.ts');
  const { default: Component } = await import(pathToFileURL(reference).href);
  const { default: fixtures } = await import(pathToFileURL(fixtureFile).href);
  if (fixtures.length < 4 || fixtures[0]?.id !== 'default') throw new Error('Expected default-first, four or more fixtures');
  if (fixtures.some(fixture => Object.keys(fixture.slots ?? {}).length)) throw new Error('Svelte V8 references have no public slots; capture only props');
  const captures = fixtures.map(fixture => ({ id: fixture.id,
    html: normalizeSvelte(render(Component, { props: fixture.props }).body) }));
  const publicExports = [{ name, typeOnly: false }, { name: name + 'Props', typeOnly: true }];
  writeFileSync(resolve(bench, 'goldens', name + '.json'), JSON.stringify({
    schema: 1, component: name, sourceRevision: revision.stdout.trim(), source: relative(root, reference),
    referenceFramework: 'svelte', sourceSha256: hash(reference), fixtureSha256: hash(fixtureFile),
    fixtures: captures, publicExports,
  }, null, 2) + '\n');
  console.log(name + ': ' + captures.length + ' Svelte SSR fixtures');
}
