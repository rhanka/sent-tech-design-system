import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { convertEngramErdScene, erdLocalId, erdProfile, validateDocument, validateProfile, m3ProfileRegistry, shippedExecutorBindings, canonicalise, type EngramErdScene } from '../src/index.js';
const scenes = JSON.parse(readFileSync(new URL('./fixtures/erd/ERD-SCENES.json', import.meta.url), 'utf8')).ontologies as EngramErdScene[];
const options = { registry: m3ProfileRegistry, bindings: shippedExecutorBindings };
describe('erd@1 scene conversion and validation', () => {
  it('should qualify the data profile and encode reference IDs injectively', () => {
    expect(validateProfile(erdProfile, 'scoped-constraints@1')).toEqual([]);
    expect(new Set(['a:b', 'a.b', 'a-b', 'a_b', 'é', '😀'].map(erdLocalId)).size).toBe(6);
  });
  for (const scene of scenes)
    it('should conserve every entity, field, relation and cardinality in ' + scene.id, () => {
      const { document } = convertEngramErdScene(scene);
      expect(validateDocument(document, options)).toEqual([]);
      expect(Object.keys(document.entities)).toHaveLength(scene.classes.length);
      expect(Object.keys(document.ports)).toHaveLength(scene.classes.reduce((n, c) => n + c.fields.length, 0));
      for (const cls of scene.classes) {
        const entity = Object.values(document.entities).find(e => e.attributes.name?.kind === 'text' && e.attributes.name.value === cls.name)!;
        const fields = Object.values(document.ports).filter(p => p.owner === entity.id);
        cls.fields.forEach((source, index) => {
          const field = fields[index]!;
          expect(field.name).toBe(source.name);
          expect(field.attributes.dataType).toEqual({ kind: 'text', value: source.type });
          expect(field.attributes.pk).toEqual({ kind: 'boolean', value: source.pk });
          expect(field.attributes.nullable).toEqual({ kind: 'boolean', value: source.nullable });
          expect(field.attributes.ordinal).toEqual({ kind: 'quantity', unit: 'index', value: index });
          if (source.fk) {
            const ref = field.attributes.fk!;
            expect(ref.kind).toBe('reference');
            if (ref.kind === 'reference')
              expect(document.ports[ref.value]!.name).toBe(source.fk.field);
          }
          else
            expect(field.attributes.fk).toBeUndefined();
        });
      }
      const relations = Object.values(document.relations);
      expect(relations).toHaveLength(scene.relations.length);
      scene.relations.forEach((source, index) => {
        const target = relations[index]!;
        expect(target.attributes.fromCardinality).toEqual({ kind: 'enum', value: source.from.cardinality });
        expect(target.attributes.toCardinality).toEqual({ kind: 'enum', value: source.to.cardinality });
        const materialized = scene.classes.some(c => c.fields.some(f =>
          (c.name === source.from.class && f.fk?.class === source.to.class) ||
          (c.name === source.to.class && f.fk?.class === source.from.class)));
        if (!materialized)
          expect(target.endpoints.every(e => e.target.startsWith('entity:'))).toBe(true);
      });
      expect(canonicalise(document)).toBe(canonicalise(convertEngramErdScene(scene).document));
    });
  it('should diagnose missing and multiple primary keys', () => {
    const { document } = convertEngramErdScene(scenes[0]!);
    const key = Object.values(document.ports).find(p => p.attributes.pk?.kind === 'boolean' && p.attributes.pk.value)!;
    const without = { ...document, ports: { ...document.ports, [key.id]: { ...key, attributes: { ...key.attributes, pk: { kind: 'boolean' as const, value: false } } } } };
    expect(validateDocument(without, options).some(d => d.code === 'erd-missing-pk')).toBe(true);
    const nonkey = Object.values(document.ports).find(p => p.owner === key.owner && p.id !== key.id)!;
    const multiple = { ...document, ports: { ...document.ports, [nonkey.id]: { ...nonkey, attributes: { ...nonkey.attributes, pk: { kind: 'boolean' as const, value: true } } } } };
    expect(validateDocument(multiple, options).some(d => d.code === 'erd-multiple-pk')).toBe(true);
  });
  it('should diagnose a dangling foreign key and a missing end', () => {
    const { document } = convertEngramErdScene(scenes[0]!);
    const fk = Object.values(document.ports).find(p => p.attributes.fk)!;
    const bad = { ...document, ports: { ...document.ports, [fk.id]: { ...fk, attributes: { ...fk.attributes, fk: { kind: 'reference' as const, value: 'port:missing' } } } } };
    expect(validateDocument(bad, options).some(d => d.code === 'erd-dangling-fk')).toBe(true);
    const r = Object.values(document.relations)[0]!;
    expect(validateDocument({ ...document, relations: { ...document.relations, [r.id]: { ...r, endpoints: r.endpoints.slice(0, 1) } } }, options).some(d => d.code === 'erd-missing-end')).toBe(true);
  });
  it('should choose the matching foreign-key row for parallel entity pairs', () => {
    const { document } = convertEngramErdScene(scenes[2]!);
    for (const r of Object.values(document.relations))
      if (r.attributes.name?.kind === 'text' && r.attributes.name.value === 'operatedBy' && r.endpoints[0]!.target.startsWith('port:')) {
        expect(document.ports[r.endpoints[0]!.target]!.name).toMatch(/^operatedBy/);
      }
  });
  it('should retain declaration order when relation IDs are sorted', () => {
    for (const scene of scenes) {
      const { document } = convertEngramErdScene(scene);
      expect(Object.values(document.relations).sort((a, b) => a.id < b.id ? -1 : 1).map(r => r.attributes.name))
        .toEqual(scene.relations.map(r => ({ kind: 'text', value: r.name })));
    }
  });
  it('should anchor materialized many-to-many and reverse relationships to their FK and PK rows', () => {
    let manyCount = 0, reverseCount = 0;
    for (const scene of scenes) {
      const { document } = convertEngramErdScene(scene);
      scene.relations.forEach((r, index) => {
        const forward = scene.classes.find(c => c.name === r.from.class)!.fields.filter(f => f.fk?.class === r.to.class);
        const reverse = scene.classes.find(c => c.name === r.to.class)!.fields.filter(f => f.fk?.class === r.from.class);
        if (!forward.length && !reverse.length) return;
        const relation = Object.values(document.relations)[index]!;
        const from = document.ports[relation.endpoints.find(e => e.role === 'from')!.target];
        const to = document.ports[relation.endpoints.find(e => e.role === 'to')!.target];
        expect(from, r.name).toBeDefined();
        expect(to, r.name).toBeDefined();
        if (forward.length) expect(from!.attributes.fk).toEqual({ kind: 'reference', value: to!.id });
        else {
          expect(to!.attributes.fk).toEqual({ kind: 'reference', value: from!.id });
          reverseCount++;
        }
        if (r.from.cardinality.endsWith('n') && r.to.cardinality.endsWith('n')) manyCount++;
      });
    }
    expect(manyCount).toBe(18);
    expect(reverseCount).toBe(5);
  });
  it('should keep endpoint direction when the target entity holds the materializing FK', () => {
    const { document } = convertEngramErdScene(scenes[4]!);
    const relation = Object.values(document.relations).find(r => r.attributes.name?.kind === 'text' && r.attributes.name.value === 'invokesMcpTool')!;
    const from = document.ports[relation.endpoints.find(e => e.role === 'from')!.target];
    const to = document.ports[relation.endpoints.find(e => e.role === 'to')!.target];
    expect(from?.name).toBe('skillId');
    expect(to?.attributes.fk).toEqual({ kind: 'reference', value: from?.id });
  });
});
