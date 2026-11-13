import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { convertEngramErdScene, m3ProfileRegistry, shippedExecutorBindings, validateView, type EngramErdScene } from '@sentropic/diagram-core';
import { buildScene, layoutMeasured, layoutFolded, relationRoute, portAnchorPoint, ERD_GEOMETRY, measureErdCard, renderErdCardSvg, renderErdTable, erdMarkerGeometry, renderErdMarkerSvg } from '../src/index.js';
import { cardLineMeasurer } from '../src/presentation/index.js';
import { resolveScene } from '../src/presentation/diagramSceneModel.js';
import { renderSceneSvg } from '../src/presentation/renderSceneSvg.js';
const scenes = JSON.parse(readFileSync(new URL('../../diagram-core/tests/fixtures/erd/ERD-SCENES.json', import.meta.url), 'utf8')).ontologies as EngramErdScene[];
const options = { registry: m3ProfileRegistry, bindings: shippedExecutorBindings, measureText: () => ({ width: 1, height: 1 }), measureLines: cardLineMeasurer(), targetWidth: 1440, rowPack: {} };
describe('ERD measured layout and SVG', () => {
  it('should retain ERD fields, cardinalities and leaders in standalone scene SVG (Carbon M4)', () => {
    const data = convertEngramErdScene(scenes[0]!);
    const rendered = renderSceneSvg({ ...data, collapsed: [], registry: m3ProfileRegistry, bindings: shippedExecutorBindings, measureLines: options.measureLines });
    expect(rendered.svg.match(/data-erd-field=/g)).toHaveLength(Object.keys(data.document.ports).length);
    expect(rendered.svg.match(/data-erd-marker=/g)).toHaveLength(2 * scenes[0]!.relations.length);
    expect(rendered.svg).not.toContain('marker-end="url(#scene-arrow)"');
    for (const label of rendered.scene.labels.filter(label => label.leader)) expect(rendered.svg).toContain(label.leader!.map(p => p.x + ',' + p.y).join(' '));
  });
  for (const source of scenes)
    it('should validate and render every row and relation in ' + source.id, () => {
      const { document, view, presentation } = convertEngramErdScene(source);
      const result = layoutMeasured(document, { ...options, presentation }, view);
      expect(result.status).toBe('laid-out');
      if (result.status !== 'laid-out')
        return;
      expect(validateView(result.view, document, options)).toEqual([]);
      const scene = resolveScene(result, { document, presentation, measureLines: options.measureLines });
      expect(scene.nodes).toHaveLength(source.classes.length);
      expect(scene.edges).toHaveLength(source.relations.length);
      expect(scene.labels).toHaveLength(source.relations.filter(r => r.roleLabel).length);
      for (const label of scene.labels)
        for (const rect of [...scene.nodes.map(n => n.rect), ...scene.labels.filter(l => l !== label).map(l => l.box)]) {
          const a = label.box;
          expect(a.x + a.width <= rect.x || rect.x + rect.width <= a.x || a.y + a.height <= rect.y || rect.y + rect.height <= a.y).toBe(true);
        }
      expect(scene.nodes.flatMap(n => n.erd?.rows ?? [])).toHaveLength(source.classes.reduce((n, c) => n + c.fields.length, 0));
      const svg = scene.nodes.map(n => renderErdCardSvg(n.erd!)).join('');
      expect(svg.match(/data-erd-field=/g)).toHaveLength(Object.keys(document.ports).length);
      expect(scene.edges.map(e => e.markers).join('').match(/data-erd-marker=/g)).toHaveLength(2 * source.relations.length);
      expect(layoutMeasured(document, { ...options, presentation }, view)).toEqual(result);
      const cards = scene.nodes.map(n => n.rect);
      for (let i = 0; i < cards.length; i++)
        for (let j = i + 1; j < cards.length; j++) {
          const a = cards[i]!, b = cards[j]!;
          expect(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y).toBe(true);
        }
      for (const edge of Object.values(result.view.relationOccurrences))
        for (const end of edge.endpoints) {
          const po = result.view.portOccurrences[end.occurrence];
          if (!po)
            continue;
          const node = scene.nodes.find(n => n.occurrence === po.ownerOccurrence)!;
          const row = node.erd!.rows.find(r => r.field.id === po.port)!;
          const point = portAnchorPoint(node.rect, po.side, po.anchor);
          expect(point.y).toBeCloseTo(node.rect.y + row.y + row.height / 2, 8);
          const route = relationRoute(result.view, edge.id)!;
          expect(end.role === 'from' ? route[0] : route[route.length - 1]).toEqual(point);
        }
    });
  it('should fold to headers, retain relation ends and restore row ports after repeated reflow', () => {
    const { document, view, presentation } = convertEngramErdScene(scenes[0]!);
    const collapsed = Object.values(view.entityOccurrences).map(o => o.id);
    const folded = layoutFolded(document, view, { ...options, presentation, collapsed });
    expect(folded.status).toBe('laid-out');
    if (folded.status !== 'laid-out')
      return;
    expect(validateView(folded.view, document, options)).toEqual([]);
    expect(buildScene({ document, views: { [folded.view.viewId]: folded.view } }, folded.view.viewId).items.filter(item => item.kind === 'port')).toHaveLength(0);
    expect(Object.values(folded.view.entityOccurrences).every(o => o.geometry.height === ERD_GEOMETRY.headerHeight)).toBe(true);
    expect(Object.values(folded.view.relationOccurrences)).toHaveLength(scenes[0]!.relations.length);
    for (const r of Object.values(folded.view.relationOccurrences)) {
      const route = relationRoute(folded.view, r.id)!;
      expect(route.length).toBeGreaterThanOrEqual(2);
      for (const end of r.endpoints) {
        expect(folded.view.entityOccurrences[end.occurrence]).toBeDefined();
        const rect = folded.view.entityOccurrences[end.occurrence]!.geometry;
        const p = end.role === 'from' ? route[0]! : route[route.length - 1]!;
        expect(p.y).toBeGreaterThanOrEqual(rect.y);
        expect(p.y).toBeLessThanOrEqual(rect.y + rect.height);
      }
    }
    const unfolded = layoutFolded(document, folded.view, { ...options, presentation, collapsed: [] });
    expect(unfolded).toEqual(layoutMeasured(document, { ...options, presentation }, view));
    expect(renderErdTable(document).match(/data-erd-table-field=/g)).toHaveLength(Object.keys(document.ports).length);
  });
  it('should encode all four cardinalities with rotated token-driven geometry and hollow zeros', () => {
    for (const cardinality of ['1', '0..1', '1..n', '0..n'] as const) {
      const m = erdMarkerGeometry(cardinality, { x: 100, y: 50 }, { x: -1, y: 0 });
      expect(Boolean(m.circle)).toBe(cardinality.startsWith('0'));
      expect(m.lines).toHaveLength((cardinality.endsWith('n') ? 3 : 1) + (cardinality.startsWith('0') ? 0 : 1));
      expect(m.lines.flat().every(p => p.x < 100)).toBe(true);
      if (m.circle)
        expect(renderErdMarkerSvg(cardinality, { x: 0, y: 0 }, { x: 1, y: 0 })).toContain('fill="var(--st-semantic-surface-default)"');
    }
    const small = erdMarkerGeometry('0..n', { x: 0, y: 0 }, { x: 0, y: 1 }, { ...ERD_GEOMETRY, markerLength: 48 });
    expect(small.circle!.center.y).toBe(44);
  });
  it('should escape untrusted identifiers and preserve long enum text without clipping', () => {
    const input: EngramErdScene = { id: 'test', container: 'schema', classes: [{ name: '<script>&', fields: [{ name: 'longCamelCaseIdentifier', type: 'enum(' + 'option|'.repeat(30) + ')', pk: true, fk: null, nullable: false }] }], relations: [] };
    const { document } = convertEngramErdScene(input);
    const c = measureErdCard(document, Object.values(document.entities)[0]!.id);
    expect(c.rows[0]!.type.join('')).toBe(input.classes[0]!.fields[0]!.type);
    expect(c.rows[0]!.height).toBeGreaterThan(ERD_GEOMETRY.rowHeight);
    expect(renderErdCardSvg(c)).not.toContain('<script>');
    expect(renderErdTable(document)).toContain('&lt;script&gt;');
  });
  it('should mirror every ERD geometry token', () => {
    const source = readFileSync(new URL('../../tokens/src/component.ts', import.meta.url), 'utf8');
    const block = source.slice(source.indexOf('    diagramErd:'), source.indexOf('    diagramCard:'));
    for (const [key, value] of Object.entries(ERD_GEOMETRY))
      expect(block).toContain('"' + key + '": "' + value + 'px"');
  });
  it('should keep self loops inside their entity gutter regardless of the scene relation count', () => {
    const data = convertEngramErdScene(scenes[2]!);
    const result = layoutMeasured(data.document, { ...options, presentation: data.presentation }, data.view);
    expect(result.status).toBe('laid-out');
    if (result.status !== 'laid-out') return;
    for (const occurrence of Object.values(result.view.relationOccurrences)) {
      const relation = data.document.relations[occurrence.relation]!;
      const owners = relation.endpoints.map(e => data.document.ports[e.target]?.owner ?? e.target);
      if (owners[0] !== owners[1]) continue;
      const rect = Object.values(result.view.entityOccurrences).find(e => e.entity === owners[0])!.geometry;
      const route = relationRoute(result.view, occurrence.id)!;
      expect(Math.max(...route.map(p => p.x)) - rect.x - rect.width).toBeLessThan(ERD_GEOMETRY.gapInline / 2);
      expect(Math.max(...route.map(p => p.y)) - Math.min(...route.map(p => p.y))).toBeGreaterThan(0);
    }
  });
  it('should preserve coincident row anchors while giving self loops a visible vertical span', () => {
    const input: EngramErdScene = { id: 'self', container: 'schema', classes: [{ name: 'self', fields: [{ name: 'id', type: 'uuid', pk: true, fk: { class: 'self', field: 'id' }, nullable: false }] }], relations: [{ name: 'self', roleLabel: '', from: { class: 'self', cardinality: '1' }, to: { class: 'self', cardinality: '1' } }] };
    const data = convertEngramErdScene(input);
    const result = layoutMeasured(data.document, { ...options, presentation: data.presentation }, data.view);
    expect(result.status).toBe('laid-out');
    if (result.status !== 'laid-out') return;
    const occurrence = Object.values(result.view.relationOccurrences)[0]!;
    const route = relationRoute(result.view, occurrence.id)!;
    expect(route[0]).toEqual(route.at(-1));
    expect(Math.max(...route.map(p => p.y)) - Math.min(...route.map(p => p.y))).toBeGreaterThanOrEqual(ERD_GEOMETRY.rowHeight);
    for (let i = 1; i < route.length; i++) expect(route[i]!.x === route[i - 1]!.x || route[i]!.y === route[i - 1]!.y).toBe(true);
  });
  it('should wrap titles at their rendered size and keep the combined key clear of the field name', () => {
    const name = 'i'.repeat(45);
    const data = convertEngramErdScene({ id: 'wide', container: 'schema', classes: [{ name, fields: [{ name: 'id', type: 'uuid', pk: true, fk: { class: name, field: 'id' }, nullable: false }] }], relations: [] });
    const card = measureErdCard(data.document, Object.values(data.document.entities)[0]!.id, false, request => ({ ...options.measureLines(request), width: request.text.length * ERD_GEOMETRY.fontSize * 0.6 }));
    expect(card.titleLines.join('')).toBe(name);
    for (const line of card.titleLines) expect(line.length * ERD_GEOMETRY.titleFontSize * 0.6).toBeLessThanOrEqual(card.width - 2 * ERD_GEOMETRY.padding - ERD_GEOMETRY.titleFontSize);
  });
  it('should reserve enough room for the combined primary and foreign key label', () => {
    expect('PK/FK'.length * ERD_GEOMETRY.fontSize * 0.6).toBeLessThanOrEqual(ERD_GEOMETRY.keyWidth);
  });
  it('should use component typography and stroke tokens in card and marker SVG', () => {
    const data = convertEngramErdScene(scenes[0]!);
    const svg = renderErdCardSvg(measureErdCard(data.document, Object.values(data.document.entities)[0]!.id));
    expect(svg).toContain('var(--st-component-diagramErd-fontFamily)');
    expect(svg).toContain('var(--st-component-diagramErd-fontSize)');
    expect(svg).toContain('var(--st-component-diagramErd-titleFontSize)');
    expect(svg).toContain('var(--st-component-diagramErd-strokeWidth)');
    expect(renderErdMarkerSvg('1', { x: 0, y: 0 }, { x: 1, y: 0 })).toContain('var(--st-component-diagramErd-strokeWidth)');
    const tokens = readFileSync(new URL('../../tokens/src/component.ts', import.meta.url), 'utf8');
    expect(tokens.slice(tokens.indexOf('    diagramErd:'), tokens.indexOf('    diagramCard:'))).toContain('fontFamily: "var(--st-font-mono)"');
  });
  it('should expose relationship names without role labels', () => {
    const data = convertEngramErdScene(scenes[0]!);
    const relation = Object.values(data.document.relations)[0]!;
    const document = { ...data.document, relations: { [relation.id]: { ...relation, attributes: { ...relation.attributes, name: { kind: 'text' as const, value: '<named>' }, label: { kind: 'text' as const, value: '' }, fromRole: { kind: 'text' as const, value: '' }, toRole: { kind: 'text' as const, value: '' } } } } };
    expect(renderErdTable(document)).toContain('&lt;named&gt;');
  });
  it('should show the current fold affordance', () => {
    const { document } = convertEngramErdScene(scenes[0]!);
    const entity = Object.values(document.entities)[0]!.id;
    expect(renderErdCardSvg(measureErdCard(document, entity))).toMatch(/data-erd-fold-indicator[^>]*>−<\/text>/);
    expect(renderErdCardSvg(measureErdCard(document, entity, true))).toMatch(/data-erd-fold-indicator[^>]*>\+<\/text>/);
  });
  it('should route shared PK corridors without fallbacks or card intersections in all acceptance scenes', () => {
    for (const source of scenes) {
      const data = convertEngramErdScene(source);
      const result = layoutMeasured(data.document, { ...options, presentation: data.presentation }, data.view);
      expect(result.status).toBe('laid-out');
      if (result.status !== 'laid-out') continue;
      expect(result.warnings.filter(w => w.code === 'route-obstructed'), source.id).toEqual([]);
      for (const occurrence of Object.values(result.view.relationOccurrences)) {
        const route = relationRoute(result.view, occurrence.id)!;
        for (let i = 1; i < route.length; i++) {
          const a = route[i - 1]!, b = route[i]!;
          expect(a.x === b.x || a.y === b.y).toBe(true);
          for (const node of Object.values(result.view.entityOccurrences)) {
            const r = node.geometry;
            const intersects = a.x === b.x
              ? a.x > r.x && a.x < r.x + r.width && Math.max(a.y, b.y) > r.y && Math.min(a.y, b.y) < r.y + r.height
              : a.y > r.y && a.y < r.y + r.height && Math.max(a.x, b.x) > r.x && Math.min(a.x, b.x) < r.x + r.width;
            expect(intersects, source.id + ' ' + occurrence.relation).toBe(false);
          }
        }
      }
    }
  });
});
