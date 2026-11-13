import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BpmnCanvas from './BpmnCanvas.vue';

const engine = vi.hoisted(() => ({
  create: vi.fn(), destroy: vi.fn(), ready: Promise.resolve() as Promise<void>,
}));
vi.mock('@sentropic/bpmn-canvas', () => ({ createBpmnCanvas: (...args: unknown[]) => engine.create(...args) }));
const envelope = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../elements/tests/fixtures/bpmn-order-process.json'), 'utf8'));
afterEach(() => { vi.restoreAllMocks(); vi.clearAllMocks(); engine.ready = Promise.resolve(); document.getElementById('st-host-config')?.remove(); });
async function settled() { await vi.waitFor(() => expect(engine.create).toHaveBeenCalled(), { timeout: 10000 }); await flushPromises(); await nextTick(); }
function renderer() {
  engine.create.mockImplementation(() => ({ ready: engine.ready, destroy: engine.destroy, getDiagnostics: () => [] }));
}

describe('BPMN envelope binding', () => {
  for (const outcome of ['rendered', 'refused'] as const) it(`should settle ready only after the engine is ${outcome}`, async () => {
    let finish!: () => void; let fail!: (error: Error) => void;
    engine.ready = new Promise((resolve, reject) => { finish = resolve; fail = reject; }); renderer();
    const vue = mount(BpmnCanvas, { props: { envelope } });
    const terminal = vi.fn(); void vue.vm.ready.then(terminal);
    await settled();
    expect(vue.vm.state).toBe('rendering'); expect(terminal).not.toHaveBeenCalled();
    if (outcome === 'rendered') finish(); else fail(new Error('engine failed'));
    await flushPromises(); await nextTick();
    expect(vue.vm.state).toBe(outcome); expect(terminal).toHaveBeenCalledTimes(1);
    vue.unmount();
  });
  it('should ingest a child island once with host config and observe replacements', async () => {
    renderer();
    const abort = vi.spyOn(AbortController.prototype, 'abort');
    const host = document.createElement('script'); host.id = 'st-host-config'; host.type = 'application/json';
    host.textContent = JSON.stringify({ theme: 'forge' }); document.body.append(host);
    const island = defineComponent({ setup: () => ({ payload: JSON.stringify(envelope) }), template: '<component is="script" type="application/json" v-text="payload" />' });
    const vue = mount(BpmnCanvas, { slots: { default: island } });
    await settled();
    expect(engine.create).toHaveBeenCalledTimes(1); expect(abort).not.toHaveBeenCalled(); expect(vue.attributes('data-st-theme')).toBe('forge');
    vue.element.querySelector('script')!.textContent = '{}';
    await vi.waitFor(() => expect(vue.vm.state).toBe('refused'));
    expect(engine.destroy).toHaveBeenCalledTimes(1);
    vue.element.querySelector('script')!.textContent = JSON.stringify(envelope);
    await vi.waitFor(() => expect(engine.create).toHaveBeenCalledTimes(2));
    await flushPromises(); expect(vue.vm.state).toBe('rendered'); vue.unmount();
  });
  it('should refuse invalid envelopes before mounting an engine', async () => {
    const vue = mount(BpmnCanvas, { props: { envelope: {} } });
    await vi.waitFor(() => expect(vue.find('[role="alert"]').exists()).toBe(true));
    expect(vue.find('[data-st-error-code]').text()).toBe('schema-violation');
    expect(engine.create).not.toHaveBeenCalled(); vue.unmount();
  });
  it('should serialize F1 and pass read-only assets/watermark options to the shared mount', async () => {
    renderer();
    const vue = mount(BpmnCanvas, { props: { envelope, hostConfig: { theme: 'forge', colorScheme: 'dark', assetBase: 'https://example.test/assets/' } } });
    await settled();
    const options = engine.create.mock.calls[0][1];
    expect(options.xml).toContain('order-process-definitions');
    expect(options.readOnly).toBe(true); expect(options.styles).toBe('auto');
    expect(options.assetBase).toBe('https://example.test/assets/'); expect(options.watermark).toBeUndefined();
    expect(vue.attributes('data-st-theme')).toBe('forge'); expect(vue.attributes('data-color-mode')).toBe('dark');
    vue.unmount(); expect(options.signal.aborted).toBe(true); expect(engine.destroy).toHaveBeenCalledTimes(1);
  });
  it('should abort a pending engine immediately and clean up only once', async () => {
    let finish!: () => void;
    engine.ready = new Promise(resolve => { finish = resolve; }); renderer();
    const vue = mount(BpmnCanvas, { props: { envelope } }); await settled();
    vue.unmount(); expect(engine.destroy).toHaveBeenCalledTimes(1);
    finish(); await flushPromises(); expect(engine.destroy).toHaveBeenCalledTimes(1);
  });
  it('should destroy an engine whose readiness rejects and show its failure', async () => {
    let fail!: (error: Error) => void;
    engine.ready = new Promise((_, reject) => { fail = reject; }); renderer();
    const vue = mount(BpmnCanvas, { props: { envelope } }); await settled();
    fail(new Error('mount failed')); await flushPromises();
    expect(vue.find('[role="alert"]').text()).toContain('mount failed');
    expect(engine.destroy).toHaveBeenCalledTimes(1); vue.unmount();
  });
  it('should replace an in-flight canvas without exposing stale diagnostics', async () => {
    let finish!: () => void;
    engine.ready = new Promise(resolve => { finish = resolve; }); renderer();
    const vue = mount(BpmnCanvas, { props: { envelope } }); await settled();
    const old = engine.create.mock.calls[0][1];
    await vue.setProps({ envelope: {} });
    await vi.waitFor(() => expect(vue.find('[role="alert"]').exists()).toBe(true));
    expect(old.signal.aborted).toBe(true); expect(engine.destroy).toHaveBeenCalledTimes(1);
    finish(); await flushPromises(); expect(vue.find('[data-st-error-code]').text()).toBe('schema-violation'); vue.unmount();
  });
});
