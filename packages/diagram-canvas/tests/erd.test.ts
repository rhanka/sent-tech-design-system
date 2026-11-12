import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { convertEngramErdScene, m3ProfileRegistry, shippedExecutorBindings, validateView, type EngramErdScene } from '@sentropic/diagram-core';
import { buildScene, layoutMeasured, layoutFolded, relationRoute, portAnchorPoint, ERD_GEOMETRY, measureErdCard, renderErdCardSvg, renderErdTable, erdMarkerGeometry, renderErdMarkerSvg } from '../src/index.js';
import { cardLineMeasurer } from '../src/presentation/index.js';
import { resolveScene } from '../src/presentation/diagramSceneModel.js';
const scenes = JSON.parse(readFileSync(new URL('../../diagram-core/tests/fixtures/erd/ERD-SCENES.json', import.meta.url), 'utf8')).ontologies as EngramErdScene[];
const options = { registry: m3ProfileRegistry, bindings: shippedExecutorBindings, measureText: () => ({ width: 1, height: 1 }), measureLines: cardLineMeasurer(), targetWidth: 1440, rowPack: {} };
describe('ERD measured layout and SVG', () => {
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
});
