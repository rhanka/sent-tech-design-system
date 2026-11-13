import { afterEach, expect, it, vi } from 'vitest';
import { measureRenderedBounds as svelteBounds } from '../../components-svelte/src/lib/diagramRenderedBounds.js';
import { measureRenderedBounds as vueBounds } from './diagramRenderedBounds.js';
afterEach(() => vi.restoreAllMocks());
for (const [host, measure] of [['Svelte', svelteBounds], ['Vue', vueBounds]] as const) {
  it(`should fit ${host} text, badges, toggles and non-scaling strokes, rounding outwards`, () => {
    const frame = document.createElement('div');
    frame.innerHTML = '<div class="st-diagramSceneFigure-world"><div data-scene-occurrence="card"><button>Toggle</button><svg data-diagram-icon="badge"><path/></svg></div><div data-scene-label="occurrence:rel-arch-16">appelle · MCP distant OAuth</div><svg><polyline style="stroke:black;stroke-width:1.5px;vector-effect:non-scaling-stroke"/></svg></div>';
    const world = frame.firstElementChild!;
    const screen = (x: number, y: number, width: number, height: number) => new DOMRect(100 + x * .62, 200 + y * .62, width * .62, height * .62);
    vi.spyOn(world, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 200, 0, 0));
    vi.spyOn(frame.querySelector('[data-scene-occurrence]')!, 'getBoundingClientRect').mockReturnValue(screen(0, 0, 460, 200));
    vi.spyOn(frame.querySelector('button')!, 'getBoundingClientRect').mockReturnValue(screen(421.001, -32.001, 32, 32));
    vi.spyOn(frame.querySelector('[data-diagram-icon]')!, 'getBoundingClientRect').mockReturnValue(screen(-10.001, 10, 70, 70));
    vi.spyOn(frame.querySelector('[data-scene-label]')!, 'getBoundingClientRect').mockReturnValue(screen(389.015625, -26, 237.953125, 22));
    vi.spyOn(frame.querySelector('polyline')!, 'getBoundingClientRect').mockReturnValue(screen(0, 204.001, 627.001, 0));
    const range = { selectNodeContents: vi.fn(), getClientRects: () => [screen(389.015625, -27, 237.953125, 24)] };
    vi.spyOn(frame.ownerDocument, 'createRange').mockReturnValue(range as unknown as Range);
    const bounds = measure(frame, { x: 0, y: -26, width: 627, height: 230.001 }, .62)!;
    expect(bounds.x).toBe(-10.015625);
    expect(bounds.y).toBe(-32.015625);
    expect(bounds.x + bounds.width).toBeGreaterThanOrEqual(627.001 + .75 / .62);
    expect(bounds.y + bounds.height).toBeGreaterThanOrEqual(204.001 + .75 / .62);
    expect(bounds.x * 64).toBe(Math.floor(bounds.x * 64));
    expect(bounds.y * 64).toBe(Math.floor(bounds.y * 64));
  });
}
