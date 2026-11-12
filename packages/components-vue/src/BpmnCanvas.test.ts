import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BpmnCanvas from './BpmnCanvas.vue';

const engine = vi.hoisted(() => ({
  create: vi.fn(), destroy: vi.fn(), ready: Promise.resolve() as Promise<void>,
}));
vi.mock('@sentropic/bpmn-canvas', () => ({ createBpmnCanvas: (...args: unknown[]) => engine.create(...args) }));
const envelope = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../elements/tests/fixtures/bpmn-order-process.json'), 'utf8'));
afterEach(() => { vi.clearAllMocks(); engine.ready = Promise.resolve(); });
async function settled() { await vi.waitFor(() => expect(engine.create).toHaveBeenCalled()); await flushPromises(); await nextTick(); }
function renderer() {
  engine.create.mockImplementation(() => ({ ready: engine.ready, destroy: engine.destroy, getDiagnostics: () => [] }));
}

describe('BPMN envelope binding', () => {
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
