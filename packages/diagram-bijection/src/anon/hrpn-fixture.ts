// The S2-target-anon generator, pure core (§2.5). Raw values never leave
// memory except into the out-of-repo directory of §2.6 (written by the CLI,
// never by this module): the core receives bytes and returns bytes/values;
// it never reads the environment or the disk, so W-DL0.8 runs in CI on the
// synthetic fixture. Refusal messages never hold a raw value.
import { createHash } from "node:crypto";
import { canonicalBytes } from "@sentropic/diagram-core";
import type { FixturePin } from "../pins/fixture-pins.js";
import { countStructure, validateStructure, type SceneStructure, type StructureCounts, type StructureEntity } from "../structure/types.js";
import { PACKAGE_VERSION } from "../index.js";

export interface AnonymiseInput {
  readonly sceneId: "s2-target-anon";
  readonly language: "fr";
  readonly fixture: { readonly pin: FixturePin; readonly bytes: Uint8Array };
  readonly folds: { readonly pin: FixturePin; readonly bytes: Uint8Array };
}
export type AnonField = "entity.id" | "entity.label" | "relation.id" | "relation.label" | "tint" | "fold.id";
export interface AnonMapping {
  readonly schema: "ds.anon-mapping/1";
  readonly fixture: { readonly pinId: string; readonly sha256: string };
  readonly entries: readonly { readonly field: AnonField; readonly raw: string; readonly anon: string }[];
}
export interface SceneProvenance {
  readonly schema: "ds.scene-provenance/1";
  readonly sceneId: string;
  readonly kind: "anonymised" | "transcribed";
  readonly structure: { readonly path: string; readonly sha256: string };
  readonly inputs: readonly { readonly pinId: string; readonly sha256: string }[];
  readonly generator: { readonly name: "@sentropic/diagram-bijection"; readonly version: string; readonly dsCommit: string };
  readonly counts: StructureCounts;
  readonly folds: { readonly sourceIds: number; readonly resolved: number; readonly unresolved: number };
  readonly rawgate?: { readonly keyId: string; readonly digests: number; readonly baselineCommit: string; readonly baselinePresent: number; readonly outputScan: "pass" };
}
export interface AnonymiseOutput {
  readonly structure: SceneStructure; // committed (§3.5 type)
  readonly provenance: SceneProvenance; // committed, counts and digests only
  readonly mapping: AnonMapping; // out of repo only
  readonly rawStrings: readonly string[]; // out of repo only: input of the digest builder (§2.7)
  readonly rawIdentifiers: readonly string[]; // out of repo only: identifier fields for the digest builder (§2.7)
  readonly unresolvedFoldIds: readonly string[]; // out of repo only
}
export type AnonRefusal =
  | "anon-pin-mismatch" | "anon-ci-refused" | "anon-field-unknown" | "anon-value-invalid"
  | "anon-structure-invalid" | "anon-fold-source-unreadable" | "anon-raw-token-in-output"
  | "anon-path-in-git-work-tree" | "anon-home-not-absolute" | "anon-home-permissions";
export type AnonResult =
  | { readonly ok: true; readonly value: AnonymiseOutput }
  | { readonly ok: false; readonly refusal: AnonRefusal; readonly message: string }; // message never holds a raw value

const decoder = new TextDecoder();

function refuse(refusal: AnonRefusal, message: string): AnonResult {
  return { ok: false, refusal, message };
}

function sha256Hex(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const TOP_KEYS = new Set(["schema", "profile", "profileMapping", "coordinates", "scene", "source", "counts", "entities", "relations", "zoneHierarchy"]);
const SCENE_KEYS = new Set(["id", "title", "caption", "legendPassages"]);
const ZONE_KEYS = new Set(["id", "kind", "parent", "label", "tint", "code", "detail", "footer"]);
const CARD_EXTRA_KEYS = new Set(["name", "role", "store"]);
const RELATION_KEYS = new Set(["id", "from", "to", "label", "style"]);
const ZH_KEYS = new Set(["rootCards", "zones"]);
const ZH_NODE_KEYS = new Set(["id", "label", "cards", "zones"]);

interface RawEntity {
  readonly id: string;
  readonly kind: "zone" | "card";
  readonly parent: string | null;
  readonly label: string;
  readonly tint: string | null;
  readonly code?: string;
}
interface RawRelation { readonly id: string; readonly from: string; readonly to: string; readonly label: string; readonly style: "solid" | "dashed" }
interface ZoneNode { readonly id: string; readonly cards: readonly string[]; readonly zones: readonly ZoneNode[] }

function collectStrings(value: unknown, out: string[]): void {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) collectStrings(v, out);
  else if (isRecord(value)) for (const k of Object.keys(value)) collectStrings(value[k], out);
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

/**
 * The §2.5 anonymiser. Deterministic: no clock and no randomness enter the
 * returned structure or mapping bytes.
 */
export function anonymiseHrpnFixture(input: AnonymiseInput): AnonResult {
  // Pin check first: the raw bytes must match the pinned digest and length.
  if (sha256Hex(input.fixture.bytes) !== input.fixture.pin.sha256 || input.fixture.bytes.length !== input.fixture.pin.bytes)
    return refuse("anon-pin-mismatch", "fixture bytes do not match the pin");
  if (sha256Hex(input.folds.bytes) !== input.folds.pin.sha256 || input.folds.bytes.length !== input.folds.pin.bytes)
    return refuse("anon-pin-mismatch", "folds bytes do not match the pin");

  let raw: unknown;
  try {
    raw = JSON.parse(decoder.decode(input.fixture.bytes));
  } catch {
    return refuse("anon-value-invalid", "fixture is not JSON");
  }
  if (!isRecord(raw)) return refuse("anon-value-invalid", "fixture is not an object");
  for (const key of Object.keys(raw)) if (!TOP_KEYS.has(key)) return refuse("anon-field-unknown", `unknown top-level key (${key.length} chars)`);
  // `schema` is a dropped field (§2.5): only its type is checked, never its
  // value, so no raw schema token can leak into this file.
  if (typeof raw.schema !== "string" || raw.schema.length === 0)
    return refuse("anon-value-invalid", "schema is not a non-empty string");
  const scene = raw.scene;
  if (!isRecord(scene)) return refuse("anon-value-invalid", "scene missing");
  for (const key of Object.keys(scene)) if (!SCENE_KEYS.has(key)) return refuse("anon-field-unknown", "unknown scene key");
  if (typeof scene.id !== "string" || scene.id.length === 0) return refuse("anon-value-invalid", "scene.id invalid");
  const sceneId = scene.id as string;
  // Dropped scene fields (§2.5 table): the value is never kept, but its type
  // is still checked — the raw-field handling is fail-closed on value types.
  if (scene.title !== undefined && typeof scene.title !== "string") return refuse("anon-value-invalid", "scene.title invalid");
  if (scene.caption !== undefined && typeof scene.caption !== "string") return refuse("anon-value-invalid", "scene.caption invalid");
  if (scene.legendPassages !== undefined && (!Array.isArray(scene.legendPassages) || scene.legendPassages.some((p) => typeof p !== "string")))
    return refuse("anon-value-invalid", "scene.legendPassages invalid");

  // Entities, fail-closed on keys and value types.
  if (!Array.isArray(raw.entities) || !Array.isArray(raw.relations) || !isRecord(raw.zoneHierarchy))
    return refuse("anon-value-invalid", "entities/relations/zoneHierarchy missing");
  const entities = new Map<string, RawEntity>();
  for (const entry of raw.entities) {
    if (!isRecord(entry)) return refuse("anon-value-invalid", "entity is not an object");
    const allowed = entry.kind === "card" ? new Set([...ZONE_KEYS, ...CARD_EXTRA_KEYS]) : ZONE_KEYS;
    for (const key of Object.keys(entry)) if (!allowed.has(key)) return refuse("anon-field-unknown", "unknown entity key");
    if (typeof entry.id !== "string" || entry.id.length === 0) return refuse("anon-value-invalid", "entity id invalid");
    if (entities.has(entry.id)) return refuse("anon-structure-invalid", "duplicate entity id");
    if (entry.kind !== "zone" && entry.kind !== "card") return refuse("anon-value-invalid", "entity kind invalid");
    if (entry.parent !== null && typeof entry.parent !== "string") return refuse("anon-value-invalid", "entity parent invalid");
    if (typeof entry.label !== "string") return refuse("anon-value-invalid", "entity label invalid");
    if (entry.tint !== null && typeof entry.tint !== "string") return refuse("anon-value-invalid", "entity tint invalid");
    if (entry.code !== undefined && typeof entry.code !== "string") return refuse("anon-value-invalid", "entity code invalid");
    // Dropped entity fields (kit faces): value type still checked, fail-closed.
    if (entry.detail !== undefined && typeof entry.detail !== "string") return refuse("anon-value-invalid", "entity detail invalid");
    if (entry.footer !== undefined && typeof entry.footer !== "string") return refuse("anon-value-invalid", "entity footer invalid");
    if (entry.name !== undefined && typeof entry.name !== "string") return refuse("anon-value-invalid", "card name invalid");
    if (entry.role !== undefined && typeof entry.role !== "string") return refuse("anon-value-invalid", "card role invalid");
    if (entry.store !== undefined && typeof entry.store !== "string") return refuse("anon-value-invalid", "card store invalid");
    entities.set(entry.id, {
      id: entry.id,
      kind: entry.kind,
      parent: entry.parent as string | null,
      label: entry.label,
      tint: entry.tint as string | null,
      ...(typeof entry.code === "string" ? { code: entry.code } : {}),
    });
  }
  // Every non-null parent must name a known entity and the ancestor chain
  // must terminate (a dangling or cyclic parent would otherwise be mapped
  // silently, or loop the depth walk of the counts).
  for (const e of entities.values()) {
    if (e.parent === null) continue;
    if (!entities.has(e.parent)) return refuse("anon-structure-invalid", "entity parent unknown");
    const seen = new Set<string>([e.id]);
    let cursor: string | null = e.parent;
    while (cursor !== null) {
      if (seen.has(cursor)) return refuse("anon-structure-invalid", "entity parent cycle");
      seen.add(cursor);
      cursor = entities.get(cursor)?.parent ?? null;
    }
  }
  const relations: RawRelation[] = [];
  for (const entry of raw.relations) {
    if (!isRecord(entry)) return refuse("anon-value-invalid", "relation is not an object");
    for (const key of Object.keys(entry)) if (!RELATION_KEYS.has(key)) return refuse("anon-field-unknown", "unknown relation key");
    if (typeof entry.id !== "string" || typeof entry.from !== "string" || typeof entry.to !== "string") return refuse("anon-value-invalid", "relation id/from/to invalid");
    if (!entities.has(entry.from) || !entities.has(entry.to)) return refuse("anon-structure-invalid", "relation endpoint unknown");
    if (typeof entry.label !== "string") return refuse("anon-value-invalid", "relation label invalid");
    if (entry.style !== "solid" && entry.style !== "dashed") return refuse("anon-value-invalid", "relation style invalid");
    relations.push({ id: entry.id, from: entry.from, to: entry.to, label: entry.label, style: entry.style });
  }

  // zoneHierarchy: read for order only.
  const zh = raw.zoneHierarchy;
  for (const key of Object.keys(zh)) if (!ZH_KEYS.has(key)) return refuse("anon-field-unknown", "unknown zoneHierarchy key");
  if (!Array.isArray(zh.rootCards) || zh.rootCards.some((c) => typeof c !== "string")) return refuse("anon-value-invalid", "rootCards invalid");
  if (zh.rootCards.length > 0) return refuse("anon-value-invalid", "rootCards must be empty in the pinned shape");
  const parseNode = (node: unknown): { node?: ZoneNode; problem?: AnonResult } => {
    if (!isRecord(node)) return { problem: refuse("anon-value-invalid", "zone node is not an object") };
    for (const key of Object.keys(node)) if (!ZH_NODE_KEYS.has(key)) return { problem: refuse("anon-field-unknown", "unknown zone node key") };
    if (typeof node.id !== "string" || typeof node.label !== "string" || !Array.isArray(node.cards) || !Array.isArray(node.zones))
      return { problem: refuse("anon-value-invalid", "zone node invalid") };
    if (node.cards.some((c) => typeof c !== "string")) return { problem: refuse("anon-value-invalid", "zone node cards invalid") };
    const children: ZoneNode[] = [];
    for (const child of node.zones) {
      const parsed = parseNode(child);
      if (parsed.problem !== undefined) return parsed;
      children.push(parsed.node as ZoneNode);
    }
    return { node: { id: node.id, cards: node.cards as string[], zones: children } };
  };
  if (!Array.isArray(zh.zones)) return refuse("anon-value-invalid", "zoneHierarchy.zones invalid");
  const roots: ZoneNode[] = [];
  for (const node of zh.zones) {
    const parsed = parseNode(node);
    if (parsed.problem !== undefined) return parsed.problem;
    roots.push(parsed.node as ZoneNode);
  }

  // Pre-order walk: zone, then its cards in listed order, then its zones.
  const zoneCount = entities.size > 0 ? [...entities.values()].filter((e) => e.kind === "zone").length : 0;
  const cardCount = entities.size - zoneCount;
  const zoneWidth = Math.max(2, String(zoneCount).length);
  const cardWidth = Math.max(2, String(cardCount).length);
  const relWidth = Math.max(2, String(relations.length).length);
  const idMap = new Map<string, string>();
  const zoneOrder: string[] = [];
  const cardOrder: string[] = [];
  let zoneSeq = 0;
  let cardSeq = 0;
  const seenZones = new Set<string>();
  const seenCards = new Set<string>();
  const visit = (node: ZoneNode): AnonResult | void => {
    const zone = entities.get(node.id);
    if (zone === undefined || zone.kind !== "zone") return refuse("anon-structure-invalid", "zone node id is not a zone entity");
    if (seenZones.has(node.id)) return refuse("anon-structure-invalid", "zone appears twice in the hierarchy");
    seenZones.add(node.id);
    zoneSeq += 1;
    idMap.set(node.id, `z${pad(zoneSeq, zoneWidth)}`);
    zoneOrder.push(node.id);
    for (const cardId of node.cards) {
      const card = entities.get(cardId);
      if (card === undefined || card.kind !== "card") return refuse("anon-structure-invalid", "card reference is not a card entity");
      if (seenCards.has(cardId)) return refuse("anon-structure-invalid", "card appears twice in the hierarchy");
      seenCards.add(cardId);
      cardSeq += 1;
      idMap.set(cardId, `c${pad(cardSeq, cardWidth)}`);
      cardOrder.push(cardId);
    }
    for (const child of node.zones) {
      const problem = visit(child);
      if (problem !== undefined) return problem;
    }
    return undefined;
  };
  for (const root of roots) {
    const problem = visit(root);
    if (problem !== undefined) return problem;
  }
  if (seenZones.size !== zoneCount || seenCards.size !== cardCount) return refuse("anon-structure-invalid", "hierarchy does not cover every entity");

  // Tint categories, in order of first appearance in walk order.
  const tintMap = new Map<string, string>();
  const walkEntities = [...zoneOrder, ...cardOrder];
  for (const rawId of walkEntities) {
    const tint = entities.get(rawId)?.tint ?? null;
    if (tint !== null && !tintMap.has(tint)) {
      const index = tintMap.size;
      if (index >= 26) return refuse("anon-value-invalid", "more than 26 tint categories");
      tintMap.set(tint, `teinte-${String.fromCharCode(97 + index)}`);
    }
  }

  // Folds: exactly one line keyed by the raw scene id.
  const foldsText = decoder.decode(input.folds.bytes);
  const escapedKey = sceneId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const foldLineRe = new RegExp(`^\\s*'${escapedKey}':\\s*\\[\\s*('[A-Z0-9_]+'\\s*,?\\s*)*\\],?\\s*$`);
  const matches = foldsText.split("\n").filter((line) => foldLineRe.test(line));
  if (matches.length !== 1) return refuse("anon-fold-source-unreadable", `expected exactly one fold line for the scene, found ${matches.length}`);
  const idsMatch = /\[([^\]]*)\]/.exec(matches[0] as string);
  const inner = idsMatch?.[1] ?? "";
  const foldRawIds = [...inner.matchAll(/'([A-Z0-9_]+)'/g)].map((m) => m[1] as string);
  const resolved: string[] = [];
  const resolvedRaw: string[] = [];
  const unresolved: string[] = [];
  for (const rawId of foldRawIds) {
    const anon = idMap.get(rawId);
    if (anon !== undefined && entities.get(rawId)?.kind === "zone") {
      resolved.push(anon);
      resolvedRaw.push(rawId);
    } else unresolved.push(rawId);
  }
  const collapsed = [...new Set(resolved)].sort();
  const expanded = zoneOrder.map((id) => idMap.get(id) as string).filter((anon) => !collapsed.includes(anon)).sort();

  // Structure.
  const entityOf = (rawId: string, kind: "zone" | "card"): StructureEntity => {
    const e = entities.get(rawId) as RawEntity;
    const anon = idMap.get(rawId) as string;
    const nn = anon.slice(1);
    const base = {
      id: anon,
      parent: e.parent === null ? null : (idMap.get(e.parent) as string),
      name: kind === "zone" ? `Zone ${nn}` : `Carte ${nn}`,
      role: kind === "zone" ? `Rôle de la zone ${nn}` : `Rôle de la carte ${nn}`,
      lifecycle: "current" as const,
    };
    return e.tint !== null ? { ...base, category: tintMap.get(e.tint) as string } : base;
  };
  const zones: StructureEntity[] = zoneOrder.map((rawId) => entityOf(rawId, "zone"));
  const cards: StructureEntity[] = cardOrder.map((rawId) => entityOf(rawId, "card"));
  const anonRelations = relations.map((r, i) => ({
    id: `r${pad(i + 1, relWidth)}`,
    from: idMap.get(r.from) as string,
    to: idMap.get(r.to) as string,
    label: `flux ${pad(i + 1, relWidth)}`,
    lifecycle: (r.style === "solid" ? "current" : "proposed") as "current" | "proposed",
  }));
  const legend =
    tintMap.size > 0
      ? {
          title: "Teintes",
          keys: [...tintMap.values()].map((category, i) => ({
            category,
            name: `Teinte ${String.fromCharCode(65 + i)}`,
            token: `st-semantic-data-category${i + 1}`,
          })),
        }
      : undefined;
  const structure: SceneStructure = {
    schema: "ds.scene-structure/1",
    sceneId: input.sceneId,
    language: input.language,
    evidence: `ds:${input.sceneId} (anonymised structure)`,
    zones,
    cards,
    relations: anonRelations,
    expanded,
    ...(legend !== undefined ? { legend } : {}),
  };
  const structureCheck = validateStructure(structure);
  if (!structureCheck.ok) return refuse("anon-structure-invalid", "generated structure failed validation");

  // §2.5 provenance: `counts` are measured on the raw input, not on the
  // anonymised output. Count the raw-id view of the same scene and refuse if
  // the anonymisation changed the shape; the raw counts are what is committed.
  const rawEntityOf = (rawId: string): StructureEntity => {
    const e = entities.get(rawId) as RawEntity;
    return {
      id: rawId,
      parent: e.parent,
      name: e.label,
      role: "",
      lifecycle: "current",
      ...(e.tint !== null ? { category: e.tint } : {}),
    };
  };
  const foldedRaw = new Set(resolvedRaw);
  const rawStructure: SceneStructure = {
    schema: "ds.scene-structure/1",
    sceneId,
    language: input.language,
    evidence: `raw scene ${sceneId}`,
    zones: zoneOrder.map(rawEntityOf),
    cards: cardOrder.map(rawEntityOf),
    relations: relations.map((r) => ({
      id: r.id,
      from: r.from,
      to: r.to,
      label: r.label,
      lifecycle: (r.style === "solid" ? "current" : "proposed") as "current" | "proposed",
    })),
    expanded: zoneOrder.filter((id) => !foldedRaw.has(id)).sort(),
  };
  const rawCounts = countStructure(rawStructure);
  if (JSON.stringify(rawCounts) !== JSON.stringify(countStructure(structure)))
    return refuse("anon-structure-invalid", "raw and anonymised counts differ");

  // Mapping (out of repo only) and raw token sources (out of repo only).
  const entries: { field: AnonField; raw: string; anon: string }[] = [];
  for (const rawId of walkEntities) {
    const e = entities.get(rawId) as RawEntity;
    entries.push({ field: "entity.id", raw: rawId, anon: idMap.get(rawId) as string });
    entries.push({ field: "entity.label", raw: e.label, anon: (e.kind === "zone" ? `Zone ${idMap.get(rawId)!.slice(1)}` : `Carte ${idMap.get(rawId)!.slice(1)}`) });
    if (e.tint !== null) entries.push({ field: "tint", raw: e.tint, anon: tintMap.get(e.tint) as string });
  }
  relations.forEach((r, i) => {
    entries.push({ field: "relation.id", raw: r.id, anon: `r${pad(i + 1, relWidth)}` });
    entries.push({ field: "relation.label", raw: r.label, anon: `flux ${pad(i + 1, relWidth)}` });
  });
  for (const rawId of foldRawIds) {
    const anon = idMap.get(rawId);
    if (anon !== undefined) entries.push({ field: "fold.id", raw: rawId, anon });
  }
  const mapping: AnonMapping = {
    schema: "ds.anon-mapping/1",
    fixture: { pinId: input.fixture.pin.id, sha256: input.fixture.pin.sha256 },
    entries,
  };

  const rawStrings: string[] = [];
  collectStrings(raw, rawStrings);
  rawStrings.push(foldsText);
  const rawIdentifiers: string[] = [];
  for (const e of entities.values()) {
    rawIdentifiers.push(e.id);
    if (e.code !== undefined) rawIdentifiers.push(e.code);
  }
  for (const r of relations) rawIdentifiers.push(r.id);
  rawIdentifiers.push(...foldRawIds);

  const structureSha = sha256Hex(new TextEncoder().encode(`${canonicalBytes(structure)}\n`));
  const provenance: SceneProvenance = {
    schema: "ds.scene-provenance/1",
    sceneId: input.sceneId,
    kind: "anonymised",
    structure: { path: `fixtures/structures/${input.sceneId}.structure.json`, sha256: structureSha },
    inputs: [
      { pinId: input.fixture.pin.id, sha256: input.fixture.pin.sha256 },
      { pinId: input.folds.pin.id, sha256: input.folds.pin.sha256 },
    ],
    generator: { name: "@sentropic/diagram-bijection", version: PACKAGE_VERSION, dsCommit: "unknown" },
    counts: rawCounts,
    folds: { sourceIds: foldRawIds.length, resolved: resolved.length, unresolved: unresolved.length },
  };

  return {
    ok: true,
    value: { structure, provenance, mapping, rawStrings, rawIdentifiers, unresolvedFoldIds: unresolved },
  };
}
