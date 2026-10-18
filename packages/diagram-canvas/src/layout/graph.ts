/**
 * Reading a `generic@1` `SemanticDocument` into the engine's working graph.
 *
 * NOT A MODEL. These records are private, transient indexes over the document
 * (who contains whom, which link joins which entities), built and thrown away
 * inside one `layoutDocument` call. Nothing here is exported from the package
 * barrel and nothing is persisted: the engine's input is the document and its
 * output is a `ViewDocument`.
 *
 * WHAT IS LAID OUT: `node` and `container` entities (or document type
 * definitions refining them), `link` relations, and nesting through the
 * `contains` tree. A relation of any other type (`association`, or a type of
 * another profile) is refused by name rather than silently skipped, because a
 * dropped edge is what study invariant 1 forbids.
 *
 * ORDER: every collection below is sorted by reference. Records are keyed by id
 * in `diagram-core`, so insertion order carries no content (L-R6) and no
 * iteration here depends on it.
 */

import {
  GENERIC_PROFILE_ID,
  type EntityRef,
  type PortRef,
  type RelationRef,
  type SemanticDocument,
} from "@sentropic/diagram-core";

import type { LayoutRefusal } from "./types.js";

export type LayoutNodeKind = "node" | "container";

export interface LayoutNode {
  readonly id: EntityRef;
  readonly kind: LayoutNodeKind;
  readonly label: string;
  readonly parent: EntityRef | undefined;
  /** Sorted by reference. */
  readonly children: readonly EntityRef[];
  /** 0 for a top-level entity. */
  readonly depth: number;
}

export interface LayoutEnd {
  readonly entity: EntityRef;
  /** Set when the link endpoint targets a semantic port: the view then gets a port occurrence for it. */
  readonly port?: PortRef;
}

export interface LayoutEdge {
  readonly id: RelationRef;
  readonly source: LayoutEnd;
  readonly target: LayoutEnd;
  readonly label?: string;
}

export interface LayoutGraph {
  readonly nodes: ReadonlyMap<EntityRef, LayoutNode>;
  /** Top-level entities, sorted. */
  readonly roots: readonly EntityRef[];
  /** `link` relations, sorted by reference. */
  readonly edges: readonly LayoutEdge[];
}

const byString = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0);

function textAttribute(attributes: Readonly<Record<string, unknown>>, name: string): string | undefined {
  const value = attributes[name] as { readonly kind?: unknown; readonly value?: unknown } | undefined;
  return value !== undefined && value.kind === "text" && typeof value.value === "string" ? value.value : undefined;
}

/**
 * The working graph, or the refusals that prevent one. The document is assumed
 * VALID here (`layoutDocument` runs `validateDocument` first), so references
 * resolve and the `contains` tree has one parent per child and no cycle.
 */
export function readGraph(
  document: SemanticDocument,
): { readonly graph: LayoutGraph } | { readonly refusals: readonly LayoutRefusal[] } {
  const refusals: LayoutRefusal[] = [];
  const kinds = new Map<EntityRef, LayoutNodeKind>();
  const labels = new Map<EntityRef, string>();

  for (const key of Object.keys(document.entities).sort(byString)) {
    const entity = document.entities[key]!;
    if (entity.profile !== GENERIC_PROFILE_ID) {
      refusals.push({
        code: "entity-profile-unsupported",
        path: `entities.${key}.profile`,
        message: `the layout engine lays out ${GENERIC_PROFILE_ID} entities; ${entity.id} is ${entity.profile}`,
        refs: [entity.id],
      });
      continue;
    }
    const base = document.typeDefinitions[entity.type]?.baseType ?? entity.type;
    if (base !== "node" && base !== "container") {
      refusals.push({
        code: "entity-type-unsupported",
        path: `entities.${key}.type`,
        message: `the layout engine lays out node and container entities; ${entity.id} is ${entity.type}`,
        refs: [entity.id],
      });
      continue;
    }
    kinds.set(entity.id, base);
    labels.set(entity.id, textAttribute(entity.attributes, "name") ?? "");
  }

  const parentOf = new Map<EntityRef, EntityRef>();
  const edges: LayoutEdge[] = [];
  for (const key of Object.keys(document.relations).sort(byString)) {
    const relation = document.relations[key]!;
    const role = (name: string) => relation.endpoints.find((endpoint) => endpoint.role === name)?.target;
    if (relation.profile === GENERIC_PROFILE_ID && relation.type === "contains") {
      const parent = role("parent") as EntityRef | undefined;
      const child = role("child") as EntityRef | undefined;
      if (parent !== undefined && child !== undefined) parentOf.set(child, parent);
      continue;
    }
    if (relation.profile !== GENERIC_PROFILE_ID || relation.type !== "link") {
      refusals.push({
        code: "relation-type-unsupported",
        path: `relations.${key}.type`,
        message: `the layout engine lays out link and contains relations; ${relation.id} is ${relation.profile} ${relation.type}`,
        refs: [relation.id],
      });
      continue;
    }
    const end = (name: string): LayoutEnd | undefined => {
      const target = role(name);
      if (target === undefined) return undefined;
      if (target.startsWith("port:")) {
        const port = document.ports[target];
        return port === undefined ? undefined : { entity: port.owner, port: port.id };
      }
      return { entity: target as EntityRef };
    };
    const source = end("source");
    const target = end("target");
    if (source === undefined || target === undefined) continue;
    const label = textAttribute(relation.attributes, "label");
    edges.push({ id: relation.id, source, target, ...(label === undefined || label === "" ? {} : { label }) });
  }

  if (refusals.length > 0) return { refusals };

  const children = new Map<EntityRef, EntityRef[]>();
  for (const id of kinds.keys()) children.set(id, []);
  for (const [child, parent] of parentOf) children.get(parent)?.push(child);

  const depthOf = (id: EntityRef): number => {
    let depth = 0;
    for (let cursor = parentOf.get(id); cursor !== undefined; cursor = parentOf.get(cursor)) depth += 1;
    return depth;
  };

  const nodes = new Map<EntityRef, LayoutNode>();
  for (const id of [...kinds.keys()].sort(byString)) {
    nodes.set(id, {
      id,
      kind: kinds.get(id)!,
      label: labels.get(id)!,
      parent: parentOf.get(id),
      children: [...children.get(id)!].sort(byString),
      depth: depthOf(id),
    });
  }
  const roots = [...nodes.values()].filter((node) => node.parent === undefined).map((node) => node.id);
  return { graph: { nodes, roots, edges } };
}

/** Strict ancestors of an entity, nearest first. */
export function ancestorsOf(graph: LayoutGraph, id: EntityRef): readonly EntityRef[] {
  const found: EntityRef[] = [];
  for (let cursor = graph.nodes.get(id)?.parent; cursor !== undefined; cursor = graph.nodes.get(cursor)?.parent) {
    found.push(cursor);
  }
  return found;
}

export function isAncestor(graph: LayoutGraph, ancestor: EntityRef, of: EntityRef): boolean {
  return ancestorsOf(graph, of).includes(ancestor);
}

/**
 * The member of `parent`'s level an entity is laid out with: itself when its
 * own parent is `parent` (`undefined` at the root), else the ancestor it
 * descends from. `undefined` when the entity is not under `parent` at all.
 */
export function memberOf(
  graph: LayoutGraph,
  entity: EntityRef,
  parent: EntityRef | undefined,
): EntityRef | undefined {
  for (let cursor: EntityRef | undefined = entity; cursor !== undefined; cursor = graph.nodes.get(cursor)?.parent) {
    if (graph.nodes.get(cursor)?.parent === parent) return cursor;
  }
  return undefined;
}
