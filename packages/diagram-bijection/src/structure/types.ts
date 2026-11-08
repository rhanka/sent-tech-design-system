// Scene structure `ds.scene-structure/1` (SPEC_EVOL_DL01_BIJECTION_HARNESS §3.5).
// The committed, anonymised form of a scene: zones, cards, relations, fold
// exceptions and an optional legend. DL-0 needs the type, its validation and
// its counts (the stub loader and the anonymiser both produce/consume it);
// the archi lift of §3.5 is DL-1.
import type { Outcome } from "../harness/types.js";

export type Lifecycle = "current" | "proposed" | "retired";

export interface StructureEntity {
  readonly id: string; // ^[a-z][a-z0-9-]*$, at most 34 characters, never "dl-…"
  readonly parent: string | null; // a zone id
  readonly name: string;
  readonly shortName?: string; // at most 40 characters
  readonly role: string;
  readonly lifecycle: Lifecycle;
  readonly category?: string; // declared in legend.keys
}

export interface StructureRelation {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly label?: string;
  readonly lifecycle: Lifecycle;
}

export interface SceneStructure {
  readonly schema: "ds.scene-structure/1";
  readonly sceneId: string;
  readonly language: "fr" | "en";
  readonly evidence: string; // at most 200 characters, written on every lifted record
  readonly zones: readonly StructureEntity[]; // traversal order
  readonly cards: readonly StructureEntity[]; // traversal order
  readonly relations: readonly StructureRelation[];
  readonly expanded: readonly string[]; // Q4 exceptions, zone ids ascending
  readonly legend?: {
    readonly title: string;
    readonly keys: readonly { readonly category: string; readonly name: string; readonly token: string }[];
  };
}

export interface StructureCounts {
  readonly zones: number;
  readonly cards: number;
  readonly relations: number;
  readonly zonesByDepth: readonly number[]; // index = depth
  readonly cardsByDepth: readonly number[]; // index = depth
  readonly zoneContent: { readonly cardsOnly: number; readonly zonesOnly: number; readonly both: number; readonly empty: number };
  readonly maxChildren: number;
  readonly categorised: number;
  readonly categories: number;
  readonly notCurrent: { readonly entities: number; readonly relations: number };
  readonly expanded: number;
  readonly collapsed: number;
}

const ID_RE = /^[a-z][a-z0-9-]*$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validEntityId(id: unknown): id is string {
  return typeof id === "string" && id.length <= 34 && ID_RE.test(id) && !id.startsWith("dl-");
}

function entityProblem(value: unknown): string | undefined {
  if (!isRecord(value)) return "entity is not an object";
  if (!validEntityId(value.id)) return "entity id invalid";
  if (value.parent !== null && typeof value.parent !== "string") return "entity parent invalid";
  if (typeof value.name !== "string" || value.name.length === 0) return "entity name invalid";
  if (value.shortName !== undefined && (typeof value.shortName !== "string" || value.shortName.length > 40))
    return "entity shortName invalid";
  if (typeof value.role !== "string") return "entity role invalid";
  if (value.lifecycle !== "current" && value.lifecycle !== "proposed" && value.lifecycle !== "retired")
    return "entity lifecycle invalid";
  if (value.category !== undefined && typeof value.category !== "string") return "entity category invalid";
  return undefined;
}

/** Structural validation of a `ds.scene-structure/1` value (fail-closed). */
export function validateStructure(value: unknown): Outcome<SceneStructure> {
  if (!isRecord(value)) return { ok: false, diagnostics: [{ origin: "ds-harness", code: "structure-invalid", message: "structure is not an object" }] };
  const fail = (message: string) => ({
    ok: false as const,
    diagnostics: [{ origin: "ds-harness" as const, code: "structure-invalid", message }],
  });
  if (value.schema !== "ds.scene-structure/1") return fail("schema must be ds.scene-structure/1");
  if (typeof value.sceneId !== "string" || !ID_RE.test(value.sceneId)) return fail("sceneId invalid");
  if (value.language !== "fr" && value.language !== "en") return fail("language invalid");
  if (typeof value.evidence !== "string" || value.evidence.length === 0 || value.evidence.length > 200)
    return fail("evidence invalid");
  if (!Array.isArray(value.zones) || !Array.isArray(value.cards) || !Array.isArray(value.relations))
    return fail("zones/cards/relations must be arrays");
  if (!Array.isArray(value.expanded)) return fail("expanded must be an array");

  const ids = new Set<string>();
  for (const list of [value.zones, value.cards]) {
    for (const entity of list) {
      const problem = entityProblem(entity);
      if (problem !== undefined) return fail(problem);
      if (ids.has((entity as StructureEntity).id)) return fail("duplicate entity id");
      ids.add((entity as StructureEntity).id);
    }
  }
  const zoneIds = new Set((value.zones as StructureEntity[]).map((z) => z.id));
  for (const entity of [...(value.zones as StructureEntity[]), ...(value.cards as StructureEntity[])]) {
    if (entity.parent !== null && !zoneIds.has(entity.parent)) return fail(`unknown parent ${entity.parent}`);
    if (entity.category !== undefined) {
      const legend = value.legend;
      if (!isRecord(legend) || !Array.isArray(legend.keys)) return fail("category without legend");
      if (!legend.keys.some((k) => isRecord(k) && k.category === entity.category)) return fail("category not declared in legend");
    }
  }
  for (const relation of value.relations) {
    if (!isRecord(relation)) return fail("relation is not an object");
    if (!validEntityId(relation.id)) return fail("relation id invalid");
    if (typeof relation.from !== "string" || !ids.has(relation.from)) return fail("relation from unknown");
    if (typeof relation.to !== "string" || !ids.has(relation.to)) return fail("relation to unknown");
    if (relation.label !== undefined && typeof relation.label !== "string") return fail("relation label invalid");
    if (relation.lifecycle !== "current" && relation.lifecycle !== "proposed" && relation.lifecycle !== "retired")
      return fail("relation lifecycle invalid");
  }
  const expanded = value.expanded as string[];
  if (!expanded.every((id) => zoneIds.has(id))) return fail("expanded names a non-zone");
  if (new Set(expanded).size !== expanded.length) return fail("expanded has duplicates");
  for (let i = 1; i < expanded.length; i += 1) {
    const prev: string = expanded[i - 1] as string;
    const cur: string = expanded[i] as string;
    if (prev >= cur) return fail("expanded not ascending");
  }
  if (value.legend !== undefined) {
    const legend = value.legend;
    if (!isRecord(legend) || typeof legend.title !== "string" || !Array.isArray(legend.keys)) return fail("legend invalid");
    const categories = new Set<string>();
    for (const key of legend.keys) {
      if (!isRecord(key) || typeof key.category !== "string" || typeof key.name !== "string" || typeof key.token !== "string")
        return fail("legend key invalid");
      if (categories.has(key.category)) return fail("legend category duplicated");
      categories.add(key.category);
    }
  }
  return { ok: true, value: value as unknown as SceneStructure };
}

function depthOf(id: string, parentOf: ReadonlyMap<string, string | null>): number {
  let depth = 0;
  let current: string | null = id;
  while (current !== null) {
    const parent = parentOf.get(current);
    if (parent === undefined) return depth;
    current = parent;
    depth += 1;
  }
  return depth;
}

/** Structural counts of a scene structure (§3.5 StructureCounts). */
export function countStructure(s: SceneStructure): StructureCounts {
  const parentOf = new Map<string, string | null>();
  for (const entity of [...s.zones, ...s.cards]) parentOf.set(entity.id, entity.parent);

  const zonesByDepth: number[] = [];
  for (const zone of s.zones) {
    const depth = depthOf(zone.id, parentOf);
    zonesByDepth[depth] = (zonesByDepth[depth] ?? 0) + 1;
  }
  const cardsByDepth: number[] = [];
  for (const card of s.cards) {
    const depth = depthOf(card.id, parentOf);
    cardsByDepth[depth] = (cardsByDepth[depth] ?? 0) + 1;
  }

  const childrenOf = new Map<string, { cards: number; zones: number }>();
  for (const zone of s.zones) childrenOf.set(zone.id, { cards: 0, zones: 0 });
  for (const entity of [...s.zones, ...s.cards]) {
    if (entity.parent === null) continue;
    const slot = childrenOf.get(entity.parent);
    if (slot === undefined) continue;
    if (s.zones.includes(entity as StructureEntity)) slot.zones += 1;
    else slot.cards += 1;
  }
  let cardsOnly = 0;
  let zonesOnly = 0;
  let both = 0;
  let empty = 0;
  let maxChildren = 0;
  for (const { cards, zones } of childrenOf.values()) {
    if (cards > 0 && zones > 0) both += 1;
    else if (cards > 0) cardsOnly += 1;
    else if (zones > 0) zonesOnly += 1;
    else empty += 1;
    maxChildren = Math.max(maxChildren, cards + zones);
  }

  const categories = new Set<string>();
  let categorised = 0;
  for (const entity of [...s.zones, ...s.cards]) {
    if (entity.category !== undefined) {
      categorised += 1;
      categories.add(entity.category);
    }
  }
  const notCurrentEntities = [...s.zones, ...s.cards].filter((e) => e.lifecycle !== "current").length;
  const notCurrentRelations = s.relations.filter((r) => r.lifecycle !== "current").length;

  // Depth arrays are dense: a hole would not survive RFC 8785 canonicalisation.
  const dense = (a: number[]): number[] => {
    for (let i = 0; i < a.length; i += 1) if (!(i in a)) a[i] = 0;
    return a;
  };

  return {
    zones: s.zones.length,
    cards: s.cards.length,
    relations: s.relations.length,
    zonesByDepth: dense(zonesByDepth),
    cardsByDepth: dense(cardsByDepth),
    zoneContent: { cardsOnly, zonesOnly, both, empty },
    maxChildren,
    categorised,
    categories: categories.size,
    notCurrent: { entities: notCurrentEntities, relations: notCurrentRelations },
    expanded: s.expanded.length,
    collapsed: s.zones.length - s.expanded.length,
  };
}
