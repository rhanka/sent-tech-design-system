import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, expect, it, vi } from 'vitest';
import { MERGE_DURATION_MS } from '@sentropic/graph/presentation';
import ForceGraph from './ForceGraph.vue';

const props = { label: 'Graph', nodes: [{ id: 'a' }, { id: 'b' }], edges: [{ source: 'a', target: 'b' }], iterations: 1 };
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('should zoom, pan, reset and track reduced-motion changes with a non-passive wheel listener', async () => {
  const media = new EventTarget() as EventTarget & { matches: boolean }; media.matches = false;
  vi.stubGlobal('matchMedia', () => media);
  const add = vi.spyOn(SVGElement.prototype, 'addEventListener');
  const vue = mount(ForceGraph, { props }); const svg = vue.find('svg');
  const remove = vi.spyOn(svg.element, 'removeEventListener');
  vi.spyOn(svg.element, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, left: 0, top: 0, width: 480, height: 360, right: 480, bottom: 360, toJSON() {} });
  expect(add).toHaveBeenCalledWith('wheel', expect.any(Function), { passive: false });
  const initial = svg.attributes('viewBox');
  const wheel = new WheelEvent('wheel', { deltaY: -100, clientX: 240, clientY: 180, cancelable: true });
  svg.element.dispatchEvent(wheel); await nextTick();
  expect(wheel.defaultPrevented).toBe(true); expect(svg.attributes('viewBox')).not.toBe(initial);
  await vue.find('.st-forceGraph__resetBtn').trigger('click'); expect(svg.attributes('viewBox')).toBe(initial);
  await svg.trigger('mousedown', { clientX: 100, clientY: 100 });
  await svg.trigger('mousemove', { clientX: 150, clientY: 140 }); await svg.trigger('mouseup');
  expect(svg.attributes('viewBox')).not.toBe(initial);
  await vue.find('.st-forceGraph__resetBtn').trigger('click'); expect(svg.attributes('viewBox')).toBe(initial);
  media.matches = true; media.dispatchEvent(new Event('change')); await nextTick();
  expect(vue.classes()).toContain('st-forceGraph--static');
  svg.element.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 })); await nextTick();
  expect(svg.attributes('viewBox')).toBe(initial);
  vue.unmount(); expect(remove).toHaveBeenCalledWith('wheel', expect.any(Function));
});

it('should complete a merge once per id and mask the source and incident edges', async () => {
  const frames = new Map<number, FrameRequestCallback>(); let sequence = 0;
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { frames.set(++sequence, cb); return sequence; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  async function draw(time: number) { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(cb => cb(time)); await nextTick(); }
  const onMergeComplete = vi.fn(); const mergePair = { id: 'one', from: 'a', into: 'b' };
  const vue = mount(ForceGraph, { props: { ...props, mergePair, onMergeComplete } });
  await draw(0); await draw(MERGE_DURATION_MS / 2);
  expect(onMergeComplete).not.toHaveBeenCalled();
  expect(Number(vue.find('.st-forceGraph__node').attributes('opacity'))).toBeGreaterThan(0);
  await draw(MERGE_DURATION_MS); expect(onMergeComplete).toHaveBeenCalledExactlyOnceWith(mergePair);
  expect(vue.find('.st-forceGraph__node').attributes('aria-hidden')).toBe('true');
  expect(vue.find('.st-forceGraph__edge').attributes('opacity')).toBe('0');
  await vue.setProps({ mergePair: { ...mergePair } }); expect(frames.size).toBe(0);
  await vue.setProps({ mergePair: { ...mergePair, id: 'two' } }); expect(frames.size).toBe(1);
  vue.unmount(); expect(frames.size).toBe(0); expect(onMergeComplete).toHaveBeenCalledTimes(1);
});
