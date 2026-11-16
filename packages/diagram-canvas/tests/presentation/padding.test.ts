import { expect, it } from 'vitest';
import { ownerInput, ownerFixture } from '../layout/dc2a/owner-fixtures.js';
import { layoutScene, resolveScene } from '../../src/presentation/diagramSceneModel.js';
import { layoutZone, projectZoneProps, sceneCardMeasure, defaultCardMeasure } from '../../src/presentation/diagramCardModel.js';

it('should put first children at the rendered zone content origin when inner padding grows', () => {
  const input = ownerInput('vue-globale', false), fixture = ownerFixture('vue-globale');
  const baseline = new Map<string, number>();
  for (const containerPadding of [16, 32]) {
    const result = layoutScene({ ...input, metrics: { containerPadding } });
    if (result.status !== 'laid-out') throw new Error('refused');
    const scene = resolveScene(result, input);
    let checked = 0;
    for (const parent of scene.nodes.filter(n => n.kind === 'zone' && !n.collapsed)) {
      const children = fixture.cards.filter(c => 'entity:' + c.parentId === parent.entity).flatMap(c => scene.nodes.filter(n => n.entity === 'entity:' + c.id));
      if (!children.length) continue;
      const projected = projectZoneProps(parent.presentation, { entityId: parent.entity, collapsed: false, width: parent.rect.width, height: parent.rect.height, containerPadding, toggleLabel: 'Toggle' });
      if (projected.kind !== 'zone') throw new Error('missing zone');
      const rendered = layoutZone(projected.props, sceneCardMeasure(defaultCardMeasure));
      const offset = Math.min(...children.map(c => c.rect.y)) - parent.rect.y - rendered.header!.contentTop;
      if (containerPadding === 16) baseline.set(parent.entity, offset);
      else expect(offset).toBeCloseTo(baseline.get(parent.entity)!, 4);
      checked++;
    }
    expect(checked).toBeGreaterThan(0);
  }
});
