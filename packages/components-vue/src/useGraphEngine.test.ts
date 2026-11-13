import { readFileSync } from 'node:fs';
import { mount } from '@vue/test-utils';
import { isProxy, nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import GraphCanvas from './GraphCanvas.vue';
import { createGraphEngine, graphIntentStyle, type GraphEngineData } from '@sentropic/graph/engine';
import ts from 'typescript';

function fixture(): GraphEngineData {
  return { graph: { nodeIds: ['a', 'b'], positions: new Float32Array([0, 0, 1, 1]), edges: new Uint32Array([0, 1]) },
    style: { nodeSizes: new Float32Array([4, 4]), nodeColors: new Uint8Array([10, 20, 30, 255, 40, 50, 60, 255]),
      nodeShapes: new Uint8Array(2), edgeWidths: new Float32Array([1]), edgeColors: new Uint8Array([20, 30, 40, 255]),
      edgeDash: new Uint8Array(1), edgeCurvatures: new Float32Array(1) } };
}
const frames = new Map<number, FrameRequestCallback>();
let sequence = 0;
beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.set(++sequence, callback); return sequence; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
});
afterEach(() => { frames.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function draw() { const pending = [...frames.values()]; frames.clear(); for (const callback of pending) callback(0); }

describe('raw graph data and engine-owned frames', () => {
  it('should treat absent and freshly allocated empty engine selections alike', () => {
    const engine = createGraphEngine(document.createElement('canvas'));
    engine.setData(fixture()); engine.setIntent({ hover: 'a' }); draw();
    const setStyle = vi.spyOn(engine.renderer, 'setStyle');
    engine.setIntent({ selection: [], hover: 'a', viewport: { x: 1, y: 1, zoom: 2 } }); draw();
    engine.setIntent({ selection: [], hover: 'a', viewport: { x: 2, y: 2, zoom: 3 } }); draw();
    engine.setIntent({ hover: 'a', viewport: { x: 3, y: 3, zoom: 4 } }); draw();
    expect(setStyle).not.toHaveBeenCalled(); engine.destroy();
  });
  it('should apply selection/hover/filter masks without mutating caller buffers', () => {
    const data = fixture();
    const style = graphIntentStyle(data, { selection: ['a'], hover: 'b', filters: ['a'] });
    expect([...style.haloMask!]).toEqual([1, 1]);
    expect([...style.edgeHaloMask!]).toEqual([1]);
    expect(style.nodeColors[7]).toBe(0); expect(style.edgeColors[3]).toBe(0);
    expect(data.style.nodeColors[7]).toBe(255); expect(data.style.edgeColors[3]).toBe(255);
    expect(graphIntentStyle(data, {}).nodeColors).toEqual(data.style.nodeColors);
  });
  it('should batch intents, keep all heavy buffers raw, trigger versions and cancel on teardown', async () => {
    const data = fixture();
    const vue = mount(GraphCanvas, { props: { graph: data.graph, styles: data.style, label: 'Raw graph' } });
    await nextTick();
    expect(frames.size).toBe(1); draw(); expect(frames.size).toBe(0);
    // Traverse the component's actual composable boundary rather than a copy of its implementation.
    const state = (vue.vm as unknown as { $: { setupState: { graph: { data: { value: GraphEngineData }; engine: { value: { renderer: { setGraph: (value: unknown) => void; setStyle: (value: unknown) => void; destroy: () => void } } } } } } }).$.setupState.graph;
    expect(isProxy(state.data.value)).toBe(false);
    expect(isProxy(state.data.value.graph)).toBe(false);
    expect(isProxy(state.data.value.graph.positions)).toBe(false);
    expect(isProxy(state.data.value.graph.nodeIds)).toBe(false);
    expect(isProxy(state.data.value.style)).toBe(false);
    expect(isProxy(state.engine.value)).toBe(false);
    const setGraph = vi.spyOn(state.engine.value.renderer, 'setGraph');
    const setStyle = vi.spyOn(state.engine.value.renderer, 'setStyle');
    const destroy = vi.spyOn(state.engine.value.renderer, 'destroy');
    await vue.setProps({ viewport: { x: 5, y: 5, zoom: 1.5 } }); await nextTick(); draw();
    expect(setStyle).not.toHaveBeenCalled();
    await vue.setProps({ hover: 'a' }); await nextTick(); draw(); setStyle.mockClear();
    await vue.setProps({ viewport: { x: 6, y: 6, zoom: 2 } }); await nextTick(); draw();
    expect(setStyle).not.toHaveBeenCalled();
    await vue.setProps({ selection: ['a'], hover: 'b', filters: ['a'], viewport: { x: 1, y: 2, zoom: 2 } });
    await nextTick(); expect(frames.size).toBe(1); draw();
    expect(setGraph).not.toHaveBeenCalled(); expect(setStyle).toHaveBeenCalledTimes(1);
    await vue.setProps({ viewport: { x: 2, y: 3, zoom: 3 } }); await nextTick(); draw();
    expect(setGraph).not.toHaveBeenCalled(); expect(setStyle).toHaveBeenCalledTimes(1);
    data.graph.positions[0] = 9;
    await vue.setProps({ version: 1 }); await nextTick(); draw();
    expect(setGraph).toHaveBeenCalledTimes(1);
    await vue.setProps({ hover: null }); await nextTick(); expect(frames.size).toBe(1);
    vue.unmount(); expect(frames.size).toBe(0); expect(destroy).toHaveBeenCalledTimes(1);
  });
  it('should forbid deep reactive imports at graph data boundaries', () => {
    for (const file of ['useGraphEngine.ts', 'GraphCanvas.vue', 'ForceGraph.vue']) {
      const source = readFileSync(new URL(file, import.meta.url), 'utf8');
      const script = file.endsWith('.vue') ? source.split('<script setup lang="ts">')[1].split('</script>')[0] : source;
      const ast = ts.createSourceFile(file + '.ts', script, ts.ScriptTarget.Latest, true);
      for (const statement of ast.statements) {
        if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier) || statement.moduleSpecifier.text !== 'vue') continue;
        const bindings = statement.importClause?.namedBindings;
        if (bindings && ts.isNamedImports(bindings)) for (const binding of bindings.elements) {
          expect((binding.propertyName ?? binding.name).text, `${file}: heavy graph data must use markRaw/shallowRef`).not.toBe('reactive');
        }
      }
      expect(script).not.toMatch(/deep:\s*true/);
    }
  });
});
