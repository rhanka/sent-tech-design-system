import { expect, it } from 'vitest';
import { ownerFixture, ownerInput } from './owner-fixtures.js';
import { entityRef } from '@sentropic/diagram-core';
import { readFileSync } from 'node:fs';
import { layoutScene, resolveScene } from '../../../src/presentation/diagramSceneModel.js';
import { DIAGRAM_SCENE_SPACING as spacing } from './spacing-tokens.js';

it('should consume the approved R14 root and child order rather than card storage order (A6)', () => {
  const fixture = ownerFixture('memory');
  const approved = (fixture.source as { layout: { top: string[]; children: Record<string, string[]> } }).layout;
  const input = ownerInput('memory', false);
  expect(input.hints.rootOrder).toEqual(approved.top.map(entityRef));
  for (const [parent, children] of Object.entries(approved.children)) {
    expect(input.hints.ordering[entityRef(parent)] ?? [], parent).toEqual(children.map(entityRef));
  }
});

const reference = JSON.parse(readFileSync(new URL('./fixtures/owner-r14-geometry.json', import.meta.url), 'utf8'));
for (const name of ['memory', 'vue-globale']) for (const folded of [false, true]) {
  it(`should compare ${name}/${folded} grouping, reading order and channel geometry against R14 (A6)`, () => {
    const old = reference.scenes[`${name}/${folded ? 'folded' : 'expanded'}`];
    expect(reference.approvedRender.boxedLabels).toBeGreaterThan(0);
    const input = ownerInput(name, folded), result = layoutScene({ ...input, metrics: spacing });
    if (result.status !== 'laid-out') throw new Error('refused');
    const scene = resolveScene(result, input);
    const current = new Map(scene.nodes.map(n => [n.entity.slice(7), n.rect]));
    expect([...current.keys()].sort()).toEqual(Object.keys(old.rects).sort());
    const comparison: unknown[] = [];
    for (const [parent, ids] of Object.entries({ root: old.order.top, ...old.order.children }) as [string, string[]][]) {
      const visible = ids.filter(id => current.has(id));
      if (!visible.length) continue;
      const axis = scene.orientations[parent === 'root' ? 'root' : 'occurrence:e.' + parent] === 'columns' ? 'columns' : 'rows';
      const sorted = [...visible].sort((a,b) => { const x=current.get(a)!, y=current.get(b)!; return axis === 'rows' ? x.y-y.y || x.x-y.x : x.x-y.x || x.y-y.y; });
      const columns = (rect: (id: string) => { x: number }, members: string[]) => [...new Set(members.map(id => rect(id).x))].sort((a,b)=>a-b).map(x => members.filter(id => rect(id).x === x));
      comparison.push({ parent, oldColumns: columns(id => old.rects[id], visible), newColumns: columns(id => current.get(id)!, visible) });
      const oldSorted = [...visible].sort((a,b) => old.rects[a].y-old.rects[b].y || old.rects[a].x-old.rects[b].x);
      expect(sorted, `${name}/${parent} old/new column reading order`).toEqual(oldSorted);
      if (parent !== 'root') for (const id of visible) {
        const child = current.get(id)!, frame = current.get(parent)!;
        expect(child.x - frame.x).toBeGreaterThanOrEqual(spacing.containerPadding);
        expect(child.y).toBeGreaterThan(frame.y);
        expect(child.x + child.width).toBeLessThanOrEqual(frame.x + frame.width - spacing.containerPadding);
        expect(child.y + child.height).toBeLessThanOrEqual(frame.y + frame.height - spacing.containerPadding);
      }
    }
    expect(comparison).toMatchSnapshot();
    // Keep the independently measured old channel scale in the comparison.
    // A9 owns its replacement ratio; each new physical channel must equal the
    // current token-driven target rather than silently accepting an old ratio.
    expect(old.parameters.childGap).toBe(160);
    expect(old.parameters.rowGap).toBe(160);
    for (const channel of result.channels ?? []) {
      const oldGap = channel.id.startsWith('root|across|') ? old.parameters.topGap : channel.axis === 'horizontal' ? old.parameters.childGap : old.parameters.rowGap;
      expect(channel.gap / oldGap).toBeCloseTo(channel.expected / oldGap, 3);
      expect(channel.gap).toBeGreaterThanOrEqual(channel.axis === 'horizontal' ? spacing.gapMin : spacing.gapMinBlock);
    }
  });
}
