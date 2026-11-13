import { afterEach, expect, it, vi } from 'vitest';
import { measureRenderedSceneFont as svelteMeasure } from '../../components-svelte/src/lib/diagramFontMeasure.js';
import { measureRenderedSceneFont as vueMeasure } from './diagramFontMeasure.js';
import type { SceneModel } from '@sentropic/diagram-canvas/diagramSceneModel';
import { cardLineMeasurer, defaultCardMeasure, sceneCardMeasure } from '@sentropic/diagram-canvas/diagramCardModel';
import { hCondInput } from '../../diagram-canvas/tests/layout/dc2a/h-cond.js';
import { layoutScene, resolveScene } from '@sentropic/diagram-canvas/diagramSceneModel';
afterEach(() => vi.restoreAllMocks());
for (const [host, measure] of [['Svelte', svelteMeasure], ['Vue', vueMeasure]] as const) {
  it(`should size ${host} rel-arch-16 from the font line box, including the probe's 2px overshoot`, () => {
    const input = hCondInput('architecture', true), result = layoutScene(input);
    if (result.status !== 'laid-out') throw new Error('refused');
    const scene = resolveScene(result, input);
    const label = scene.labels.find(label => label.occurrence === 'occurrence:rel-arch-16')!;
    const frame = document.createElement('div');
    frame.innerHTML = '<div class="st-diagramCard" style="font:400 24px Noto Sans"></div>';
    // The recorded probe has a 24px text box inside a 22px chip: one
    // pixel overshoot on each side, i.e. 0.62px at the desktop zoom.
    const context = { font: '', measureText: () => ({ width: 600, fontBoundingBoxAscent: 25, fontBoundingBoxDescent: 7 }) };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
    const measured = sceneCardMeasure(measure(frame, scene, sceneCardMeasure(defaultCardMeasure))!);
    const layout = cardLineMeasurer(measured)({ text: label.lines.join(' '), role: 'edge-label', availableWidth: 400, allocatedLines: 1 });
    expect(layout.height / layout.lines.length).toBe(24);
    const refit = layoutScene({ ...input, measureLines: cardLineMeasurer(measured) });
    if (refit.status !== 'laid-out') throw new Error('refused');
    const rendered = resolveScene(refit, { ...input, measureLines: cardLineMeasurer(measured) });
    expect(rendered.labels.find(l => l.occurrence === label.occurrence)?.box.height).toBeGreaterThanOrEqual(24);
  });
  it(`should measure missing ${host} slots at their rendered role sizes rather than the inherited 16px font (Carbon B2)`, () => {
    const frame = document.createElement('div');
    frame.innerHTML = '<div class="st-diagramCard" style="font:400 16px Inter"><span class="st-diagramCard-title" style="font:700 32px Inter">Title</span></div>';
    const context = { font: '', measureText: () => ({ width: 200 }) };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
    const scene = { nodes: [], labels: [{ lines: ['force remeasurement'], box: { width: 1, height: 1 } }] } as unknown as SceneModel;
    const measured = measure(frame, scene, sceneCardMeasure(defaultCardMeasure))!;
    for (const [role, size, weight] of [['kicker', 22, 400], ['title', 32, 700], ['body', 24, 400], ['footer', 24, 700]] as const) {
      measured('sample', role, 1000, 1);
      expect(context.font).toContain(`${size}px`);
      expect(context.font).toContain(String(weight));
    }
  });
}
