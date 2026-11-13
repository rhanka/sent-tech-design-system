import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { bench, src, names, installSourceLoader, wrapperSource, normalizeHtml } from './lib.mjs';

const [operation, name] = process.argv.slice(2);
// Keep stdout as a single JSON record, including when Vue's development runtime
// announces itself or a component logs. Diagnostics remain visible on stderr.
console.log = console.info = (...args) => console.error(...args);
const report = value => process.stdout.write(JSON.stringify(value) + '\n');
let temporary;
try {
  if (!names.includes(name) || !['ssr', 'vapor'].includes(operation)) throw new Error('Invalid worker arguments');
  const { JSDOM } = await import('jsdom');
  let dom;
  if (operation === 'vapor' || name === 'Dropdown' || name === 'Popper') {
    dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url: 'http://localhost/' });
    for (const key of ['window', 'document', 'Node', 'Element', 'HTMLElement', 'SVGElement', 'Text', 'Comment', 'Document', 'DocumentFragment', 'MutationObserver', 'Event', 'CustomEvent']) {
      Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true });
    }
  }
  installSourceLoader(operation === 'vapor' ? 'vapor' : 'classic');
  const { default: fixtures } = await import(pathToFileURL(resolve(bench, 'fixtures', `${name}.fixtures.ts`)).href);
  if (fixtures.length < 4 || fixtures.length > 8 || fixtures[0]?.id !== 'default' || new Set(fixtures.map(f => f.id)).size !== fixtures.length) {
    throw new Error('Expected 4–8 uniquely named fixtures with default first');
  }
  temporary = mkdtempSync(resolve(bench, '.tmp-worker-'));
  const legacy = name === 'cellDecoration'
    ? /\bh\(/.test(readFileSync(resolve(src, 'cellDecoration.ts'), 'utf8'))
    : existsSync(resolve(src, `${name}.ts`));
  if (operation === 'ssr') {
    const { createSSRApp } = await import('vue');
    const { renderToString } = await import('@vue/server-renderer');
    const results = [];
    for (const fixture of fixtures) {
      const file = resolve(temporary, fixture.id + '.vue');
      writeFileSync(file, wrapperSource(name, fixture, legacy));
      const { default: Component } = await import(pathToFileURL(file).href);
      const app = createSSRApp(Component);
      const warnings = [];
      app.config.warnHandler = warning => warnings.push(warning);
      const context = {};
      const html = await renderToString(app, context);
      if (warnings.length) throw new Error(`${fixture.id}: ${warnings.join('; ')}`);
      results.push({ id: fixture.id, html: normalizeHtml(html, JSDOM),
        ...(context.teleports ? { teleports: Object.fromEntries(Object.entries(context.teleports).map(([target, html]) => [target, normalizeHtml(html, JSDOM)])) } : {}) });
    }
    report({ ok: true, implementation: legacy ? 'ts' : 'vue', fixtures: results });
  } else {
    if (legacy) throw new Error('G5 requires the converted .vue');
    const { createVaporApp, nextTick } = await import('vue');
    if (typeof createVaporApp !== 'function') throw new Error('Runtime does not export createVaporApp');
    const { default: Target } = await import(pathToFileURL(resolve(src, name === 'cellDecoration' ? 'CellDecorationIcon.vue' : `${name}.vue`)).href);
    if (Target.__vapor !== true) throw new Error('Target is not a compiled Vapor component');
    const golden = JSON.parse(readFileSync(resolve(bench, 'goldens', name + '.json'), 'utf8'));
    const errors = [];
    dom.window.addEventListener('error', event => errors.push(String(event.error ?? event.message)));
    const mounted = [];
    for (const fixture of fixtures) {
      document.body.innerHTML = '<div id="app"></div><div id="destination"></div>';
      const file = resolve(temporary, 'mount-' + fixture.id + '.vue');
      writeFileSync(file, wrapperSource(name, fixture));
      const { default: Component } = await import(pathToFileURL(file).href);
      const app = createVaporApp(Component);
      app.config.errorHandler = error => errors.push(String(error));
      app.config.warnHandler = warning => errors.push(warning);
      try {
        app.mount(document.querySelector('#app'));
        await nextTick();
        await new Promise(done => setTimeout(done, 0));
        const expected = golden.fixtures.find(f => f.id === fixture.id);
        if ((expected.html || Object.values(expected.teleports ?? {}).some(Boolean)) && !document.body.textContent && !document.querySelector('#app *') && !document.querySelector('.st-popper,.st-portal')) throw new Error(fixture.id + ': mount produced no content');
        if (name === 'Portal') {
          const target = fixture.props.disabled ? document.querySelector('#app') : typeof fixture.props.target === 'string' ? document.querySelector(fixture.props.target) : fixture.props.target ?? document.body;
          if (!target?.querySelector('.st-portal')) throw new Error(fixture.id + ': portal did not reach its destination');
          if (!fixture.props.disabled && document.querySelector('#app .st-portal')) throw new Error('Portal stayed inline');
        }
        if (name === 'Popper') {
          const panel = document.querySelector('.st-popper');
          if (Boolean(panel) !== Boolean(fixture.props.open && fixture.props.anchor)) throw new Error(fixture.id + ': incorrect Popper visibility');
          if (panel && (fixture.props.portal === false) !== Boolean(document.querySelector('#app .st-popper'))) throw new Error(fixture.id + ': incorrect Popper destination');
        }
        if (name === 'Dropdown') {
          if (Boolean(document.querySelector('.st-dropdown__list')) !== Boolean(fixture.props.open)) throw new Error(fixture.id + ': incorrect Dropdown visibility');
          if (document.querySelector('#app .st-dropdown__list')) throw new Error('Dropdown list was not teleported');
        }
        mounted.push(fixture.id);
      } finally {
        app.unmount();
        await nextTick();
      }
      if (['Portal', 'Popper', 'Dropdown'].includes(name) && document.querySelector('.st-portal,.st-popper,.st-dropdown__list')) throw new Error(fixture.id + ': teleported content survived unmount');
      if (errors.length) throw new Error(fixture.id + ': ' + errors.join('; '));
    }
    dom.window.close();
    report({ ok: true, fixture: mounted.join(', '), runtime: 'vue/dist/vue.runtime-with-vapor.esm-browser.js', interop: false });
  }
} catch (error) {
  report({ ok: false, error: error.stack ?? String(error) });
  process.exitCode = 1;
} finally {
  if (temporary) rmSync(temporary, { recursive: true, force: true });
}
