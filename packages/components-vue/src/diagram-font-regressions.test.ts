import { afterEach, expect, it, vi } from 'vitest';
import { measureRenderedSceneFont as svelteMeasure } from '../../components-svelte/src/lib/diagramFontMeasure.js';
import { measureRenderedSceneFont as vueMeasure } from './diagramFontMeasure.js';
import type { SceneModel } from '@sentropic/diagram-canvas/diagramSceneModel';
import { defaultCardMeasure, sceneCardMeasure } from '@sentropic/diagram-canvas/diagramCardModel';
afterEach(() => vi.restoreAllMocks());
for (const [host, measure] of [['Svelte', svelteMeasure], ['Vue', vueMeasure]] as const) {
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
