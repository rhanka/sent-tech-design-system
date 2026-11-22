import { expect, it } from 'vitest';
import { ownerFixture, ownerInput } from './owner-fixtures.js';
import { layoutScene, resolveScene } from '../../../src/presentation/diagramSceneModel.js';
import { renderSceneSvg } from '../../../src/presentation/renderSceneSvg.js';
import { DIAGRAM_SCENE_SPACING as spacing } from './spacing-tokens.js';
import { measureSceneBox } from '../../../src/layout/sceneMeasure.js';
import { cardLineMeasurer, defaultCardMeasure } from '../../../src/presentation/diagramCardModel.js';

function pair() {
  const seed = ownerInput('vue-globale');
  const ids = Object.keys(seed.document.entities).slice(0, 2);
  return { ...seed, document: { ...seed.document, entities: Object.fromEntries(ids.map(id => [id, seed.document.entities[id]])), relations: {} },
    presentation: { ...seed.presentation, entities: Object.fromEntries(ids.map(id => ['occurrence:e.' + id.slice(7), { form: 'card', text: { title: id } }])) },
    collapsed: [], hints: { rootOrder: ids } } as unknown as ReturnType<typeof ownerInput>;
}
it('should retain an explicit small sibling gap in an empty channel (Carbon M2)', () => {
  const input = pair();
  const result = layoutScene({ ...input, hints: { ...input.hints, cardGapX: 48, cardGapY: 48 } });
  if (result.status !== 'laid-out') throw new Error('refused');
  expect(result.channels!.length).toBeGreaterThan(0);
  for (const channel of result.channels!) expect(channel.gap).toBe(48);
});
for (const shape of ['flow', 'note'] as const) it(`should draw an iconless ${shape} through the full scene path (Carbon B3)`, () => {
  const input = { ...pair(), iconBindings: { node: { shape } } };
  const result = layoutScene(input);
  if (result.status !== 'laid-out') throw new Error('refused');
  expect(renderSceneSvg(input).svg).not.toContain('data-diagram-icon=');
});
it('should suppress unresolved icons when strictIcons is false (Carbon B3)', () => {
  expect(renderSceneSvg({ ...pair(), strictIcons: false, iconBindings: { node: { role: 'unbound' } } }).svg).not.toContain('data-diagram-icon=');
});

it('should reserve the thickness of placed chips and converge without shrinking their channels (Carbon B1)', () => {
  const input = ownerInput('vue-globale', false), result = layoutScene(input);
  if (result.status !== 'laid-out') throw new Error('refused');
  const scene = resolveScene(result, input);
  let widened = 0;
  for (const channel of result.channels ?? []) {
    const intersecting = scene.labels.filter(label => channel.strips.some(strip => strip.x < label.box.x + label.box.width && label.box.x < strip.x + strip.width && strip.y < label.box.y + label.box.height && label.box.y < strip.y + strip.height));
    for (const label of intersecting) {
      const required = (channel.axis === 'horizontal' ? label.box.width : label.box.height) + 8;
      if (required <= spacing.gapMax) expect(channel.gap + 1e-9).toBeGreaterThanOrEqual(required);
      if (required > (channel.axis === 'horizontal' ? spacing.gapMin : spacing.gapMinBlock)) widened++;
    }
    expect(channel.gap).toBeCloseTo(channel.expected, 0);
  }
  expect(widened).toBeGreaterThan(0);
  expect(result.warnings.filter(w => w.code === 'channel-unresolved' || w.code === 'label-unplaced')).toEqual([]);
});

it('should keep nested zone/card padding on the same token at every level', () => {
  const input = ownerInput('vue-globale', false);
  for (const containerPadding of [16, 32]) {
    const result = layoutScene({ ...input, metrics: { containerPadding } });
    if (result.status !== 'laid-out') throw new Error('refused');
    const scene = resolveScene(result, input), fixture = ownerFixture('vue-globale');
    let pairs = 0;
    for (const card of fixture.cards.filter(card => card.parentId)) {
      const parent = scene.nodes.find(n => n.entity === 'entity:' + card.parentId), child = scene.nodes.find(n => n.entity === 'entity:' + card.id);
      if (!parent || !child) continue;
      expect(child.rect.x - parent.rect.x).toBeGreaterThanOrEqual(containerPadding);
      expect(parent.rect.x + parent.rect.width - child.rect.x - child.rect.width).toBeGreaterThanOrEqual(containerPadding);
      pairs++;
    }
    expect(pairs).toBeGreaterThan(0);
  }
});

it('should measure zone footers inside a raised inner-padding token', () => {
  const box = measureSceneBox({ form: 'container', text: { title: 'Zone', footer: 'W'.repeat(88) } }, 'occurrence:padding' as never, 600, false, cardLineMeasurer(defaultCardMeasure), 32);
  expect(box.footerWidth).toBe(536);
});

it('should keep semantic relation IDs out of unlabelled bundle chips (Carbon M1)', () => {
  const seed = ownerInput('memory', true);
  const document = { ...seed.document, relations: Object.fromEntries(Object.entries(seed.document.relations).map(([id, relation]) => [id, relation.type === 'contains' ? relation : { ...relation, attributes: {} }])) };
  const { scene, svg } = renderSceneSvg({ ...seed, document });
  expect(scene.labels.filter(label => label.bundle).length).toBeGreaterThan(0);
  for (const label of scene.labels.filter(label => label.bundle)) {
    expect(label.bundle!.header).toMatch(/^[2-9]\d* liaisons$/);
    expect(label.bundle!.groups).toHaveLength(0);
    expect(label.lines.join(' ')).not.toContain('relation:');
  }
  expect(svg).not.toContain('>relation:');
});
