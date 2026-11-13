import { afterEach, expect, it, vi } from 'vitest';
import * as Vue from 'vue';
import { createVaporApp, defineVaporCustomElement, nextTick, version, type VaporComponent } from 'vue';
import * as renderer from '@vue/server-renderer';
import { parse, compileScript } from '@vue/compiler-sfc';
import ts from 'typescript';
import { GraphLegend } from '../dist/vapor/index.js';
import DropdownTeleport from './test-support/DropdownTeleport.vue';
import PortalPopper from './test-support/PortalPopper.vue';
import ContextParent from './test-support/ContextParent.vue';

const apps: ReturnType<typeof createVaporApp>[] = [];
afterEach(() => { apps.splice(0).forEach(app => app.unmount()); document.body.replaceChildren(); vi.restoreAllMocks(); });
function mount(component: VaporComponent, props: Record<string, unknown> = {}) {
  expect(version).toBe('3.6.0-rc.15');
  const root = document.createElement('div'); document.body.append(root);
  const inputs = Object.fromEntries(Object.entries(props).map(([key, value]) => [key, typeof value === 'function' ? () => value : value]));
  const app = createVaporApp(component, inputs); apps.push(app);
  const vm = app.mount(root); return { root, vm };
}

it('should teleport, disable and clean up public Portal and Popper SFCs without interop', async () => {
  const target = document.createElement('aside'); document.body.append(target);
  const anchor = document.createElement('button'); document.body.append(anchor);
  vi.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({ top: 10, bottom: 30, left: 20, right: 100, width: 80, height: 20 } as DOMRect);
  const { root, vm } = mount(PortalPopper, { anchor, target });
  await nextTick();
  expect(target.textContent).toContain('Portal action');
  const popper = document.body.querySelector<HTMLElement>('.st-popper')!;
  expect(root.contains(popper)).toBe(false);
  expect(popper.textContent).toContain('Popper action');
  expect(popper.style.top).toBe('38px'); expect(popper.style.left).toBe('60px');
  expect(popper.querySelector('.st-popper__arrow')?.getAttribute('data-popper-side')).toBe('bottom');
  vm.inline(); await nextTick();
  expect(target.textContent).toBe(''); expect(root.textContent).toContain('Portal action');
  vm.close(); await nextTick(); expect(document.querySelector('.st-popper')).toBeNull();
  apps.pop()!.unmount(); expect(document.querySelector('[data-st-portal]')).toBeNull();
});

it('should open and select from a native Dropdown-shaped teleported listbox exactly once', async () => {
  const selected = vi.fn();
  const { root } = mount(DropdownTeleport, { label: 'Pick', options: [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta', disabled: true }], onSelect: selected });
  root.querySelector('button')!.click(); await nextTick();
  const list = document.querySelector('[role="listbox"]')!;
  expect(root.contains(list)).toBe(false); expect(list.textContent).toContain('Alpha');
  expect(list.querySelectorAll('button')[1].disabled).toBe(true);
  list.querySelector('button')!.click(); await nextTick();
  expect(selected).toHaveBeenCalledExactlyOnceWith('a'); expect(document.querySelector('[role="listbox"]')).toBeNull();
});

it('should wrap a published Vapor SFC as a custom element with reactive attributes and teardown', async () => {
  const name = 'v0c-vapor-legend';
  const unmounted = vi.fn();
  if (!customElements.get(name)) customElements.define(name, defineVaporCustomElement(GraphLegend, {
    configureApp: app => app.onUnmount(unmounted),
  }));
  const element = document.createElement(name) as HTMLElement & { entries: { label: string }[] };
  element.entries = [{ label: 'Custom node' }]; element.setAttribute('title', 'Before'); document.body.append(element);
  await nextTick();
  expect(element.shadowRoot!.textContent).toContain('Custom node');
  expect(element.shadowRoot!.textContent).toContain('Before');
  element.setAttribute('title', 'After');
  await vi.waitFor(() => expect(element.shadowRoot!.textContent).toContain('After'));
  element.remove(); await nextTick();
  expect(unmounted).toHaveBeenCalledOnce();
});

it('should replace the null legacy instance with useId and reactive provide/inject', async () => {
  const { root, vm } = mount(ContextParent, { initial: 'shared' });
  expect([...root.querySelectorAll('article')].every(node => node.getAttribute('data-legacy-null') === 'true')).toBe(true);
  const inputs = [...root.querySelectorAll('input')];
  expect(new Set(inputs.map(input => input.id)).size).toBe(2);
  expect(inputs.every(input => input.id.length > 0 && root.querySelector(`label[for="${input.id}"]`))).toBe(true);
  expect(inputs.map(input => input.value)).toEqual(['shared', 'shared']);
  root.querySelector('button')!.click(); await nextTick();
  expect(inputs.map(input => input.value)).toEqual(['shared!', 'shared!']);
  vm.setValue('updated'); await nextTick(); expect(inputs.map(input => input.value)).toEqual(['updated', 'updated']);
});

it('should server-render the pinned compiler SSR output of a Vapor SFC through createVaporApp', async () => {
  const source = '<script setup lang="ts" vapor>defineProps<{ label: string }>();</script><template><p>{{ label }}</p></template>';
  const { descriptor } = parse(source, { filename: 'ServerWitness.vue' });
  const compiled = compileScript(descriptor, { id: 'server-witness', inlineTemplate: true, templateOptions: { ssr: true } });
  const code = ts.transpileModule(compiled.content, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} as { default: VaporComponent & { __vapor?: boolean } } };
  const imports: Record<string, unknown> = { vue: Vue, 'vue/server-renderer': renderer };
  // Evaluate only compiler output from the static SFC above; dependency lookup
  // is closed so it uses the same pinned ESM runtime as the mounted witnesses.
  new Function('require', 'module', 'exports', code)((name: string) => {
    if (!(name in imports)) throw new Error(`Unexpected SSR import: ${name}`);
    return imports[name];
  }, module, module.exports);
  expect(module.exports.default.__vapor).toBe(true);
  const app = createVaporApp(module.exports.default, { label: '<Server & Vapor>' });
  expect(await renderer.renderToString(app)).toBe('<p>&lt;Server &amp; Vapor&gt;</p>');
});
