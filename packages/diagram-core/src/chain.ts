/** Document-only chain evaluation. The sole view input is the drawn-target index. */
import { diagnostic, type Diagnostic } from "./diagnostics.js";
import type { Relation, SemanticDocument } from "./document.js";
import type { ChainConstraint, ChainPath, ChainStep, Profile, ProfileRegistry } from "./profile.js";
import type { EntityRef, OccurrenceRef, PortRef, RelationRef } from "./refs.js";
import type { TypeResolver } from "./resolver.js";
import type { RelationOccurrenceEndpoint } from "./view.js";

type Target = EntityRef | PortRef | RelationRef;
interface Edge { readonly relation: RelationRef; readonly end: EntityRef }
interface Adjacency { readonly forward: Map<EntityRef, Edge[]>; readonly inverse: Map<EntityRef, Edge[]> }
interface ProfileIndex { readonly types: Map<string, Adjacency>; readonly relations: Relation[] }
interface Walk {
  readonly end: EntityRef;
  readonly hops: readonly RelationRef[];
  readonly nodes: readonly { readonly entity: EntityRef; readonly prefixEnd: boolean }[];
}
const compare = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0;

export function createChainValidator(
  document: SemanticDocument,
  registry: ProfileRegistry,
  resolver: TypeResolver,
  drawnTargets: ReadonlyMap<OccurrenceRef, Target>,
): (relation: Relation, occurrence: OccurrenceRef, endpoint: RelationOccurrenceEndpoint, path: string, scoped: boolean) => Diagnostic | undefined {
  const indexes = new Map<string, ProfileIndex>();
  const entityOf = (target: Target): EntityRef | undefined => {
    if (document.entities[target] !== undefined) return target as EntityRef;
    return document.ports[target]?.owner;
  };
  const drawnEntities = new Set([...drawnTargets.values()].map(entityOf).filter((id) => id !== undefined));
  const ancestries = new Map<Profile, Map<string, readonly string[] | undefined>>();
  // Once per validateView: type -> source/target adjacency, sorted by relation id.
  for (const relation of Object.values(document.relations).sort((a, b) => compare(a.id, b.id))) {
    let index = indexes.get(relation.profile);
    if (index === undefined) {
      index = { types: new Map(), relations: [] };
      indexes.set(relation.profile, index);
    }
    index.relations.push(relation);
    let adjacency = index.types.get(relation.type);
    if (adjacency === undefined) {
      adjacency = { forward: new Map(), inverse: new Map() };
      index.types.set(relation.type, adjacency);
    }
    const sources = relation.endpoints.filter((e) => e.role === "source").map((e) => entityOf(e.target));
    const targets = relation.endpoints.filter((e) => e.role === "target").map((e) => entityOf(e.target));
    for (const source of sources) for (const target of targets) {
      if (source === undefined || target === undefined || document.entities[source]?.profile !== relation.profile ||
          document.entities[target]?.profile !== relation.profile) continue;
      const append = (map: Map<EntityRef, Edge[]>, from: EntityRef, end: EntityRef): void => {
        const edges = map.get(from) ?? [];
        edges.push({ relation: relation.id, end });
        map.set(from, edges);
      };
      append(adjacency.forward, source, target);
      append(adjacency.inverse, target, source);
    }
  }
  const matches = (profile: Profile, id: EntityRef, types: readonly string[], constraints: readonly ChainConstraint[] = []): boolean => {
    const entity = document.entities[id];
    if (entity?.profile !== profile.id) return false;
    let byType = ancestries.get(profile);
    if (byType === undefined) { byType = new Map(); ancestries.set(profile, byType); }
    if (!byType.has(entity.type)) {
      const resolution = resolver.resolve(profile, entity.type);
      byType.set(entity.type, resolution.ok ? resolution.resolved.ancestry : undefined);
    }
    const ancestry = byType.get(entity.type);
    if (ancestry === undefined || !types.some((type) => ancestry.includes(type))) return false;
    return constraints.every(({ attribute, equals }) => {
      const value = entity.attributes[attribute];
      return typeof equals === "boolean"
        ? value?.kind === "boolean" && value.value === equals
        : (value?.kind === "text" || value?.kind === "enum") && value.value === equals;
    });
  };
  function* candidates(profile: Profile, node: EntityRef, step: ChainStep, excluded: RelationRef): Generator<Edge> {
    for (const type of step.relationTypes) {
      for (const edge of indexes.get(profile.id)?.types.get(type)?.[step.direction].get(node) ?? []) {
        if (edge.relation !== excluded) yield edge;
      }
    }
  }
  /** Iterative DFS with branch-local (entity, step) visits and shared path trails. */
  function* walk(profile: Profile, start: EntityRef, path: ChainPath, excluded: RelationRef, drawnPrefix = false): Generator<Walk> {
    if (document.entities[start]?.profile !== profile.id || path.steps.length === 0) return;
    interface Move { node: EntityRef; step: number; used: boolean; edge?: Edge; prefixEnd: boolean }
    interface Frame extends Move { entered: boolean; moves?: Generator<Move>; key?: string; memoKey?: string; blockers?: Set<string> }
    const frames: Frame[] = [{ node: start, step: 0, used: false, prefixEnd: false, entered: false }];
    const visiting = new Set<string>();
    const completed = new Map<string, ReadonlySet<string>>();
    const hops: RelationRef[] = [];
    const nodes = [{ entity: start, prefixEnd: false }];
    const pop = (): void => {
      const frame = frames.pop()!;
      if (frame.key !== undefined) {
        visiting.delete(frame.key);
        // A cycle back into this suffix is internal, not an external
        // ancestor dependency of the completed suffix.
        frame.blockers?.delete(frame.key);
        completed.set(frame.memoKey!, frame.blockers ?? new Set());
      }
      const parent = frames[frames.length - 1];
      if (parent !== undefined && frame.blockers !== undefined) {
        parent.blockers ??= new Set();
        for (const key of frame.blockers) if (key !== parent.key) parent.blockers.add(key);
      }
      if (frame.edge !== undefined) { hops.pop(); nodes.pop(); }
    };
    function* moves(frame: Frame, step: ChainStep): Generator<Move> {
      const mayStop = frame.used || step.repeat === "zeroOrMore";
      if (mayStop && frame.step + 1 < path.steps.length) {
        yield { node: frame.node, step: frame.step + 1, used: false, prefixEnd: false };
      }
      if (step.repeat === "one" && frame.used) return;
      for (const edge of candidates(profile, frame.node, step, excluded)) {
        yield { node: edge.end, step: frame.step, used: true, edge,
          prefixEnd: step.repeat === "one" && frame.step + 1 < path.steps.length };
      }
    }
    while (frames.length > 0) {
      const frame = frames[frames.length - 1]!;
      const step = path.steps[frame.step]!;
      if (!frame.entered) {
        frame.entered = true;
        const key = `${frame.step}:${frame.node}`;
        if (visiting.has(key)) { frame.blockers = new Set([key]); pop(); continue; }
        const memoKey = `${frame.used}:${key}`;
        const blockers = completed.get(memoKey);
        // All ends of this suffix were already emitted in canonical order.
        // Reuse only if the ancestors that pruned it are still on this branch;
        // otherwise another context may permit a previously blocked route.
        if (blockers !== undefined && [...blockers].every((blocked) => visiting.has(blocked))) {
          frame.blockers = new Set(blockers);
          pop(); continue;
        }
        frame.memoKey = memoKey;
        visiting.add(key);
        frame.key = key;
        const mayStop = frame.used || step.repeat === "zeroOrMore";
        if ((drawnPrefix && frame.prefixEnd && drawnEntities.has(frame.node)) ||
            (mayStop && frame.step === path.steps.length - 1 && matches(profile, frame.node, path.endTypes, path.endConstraints))) {
          yield { end: frame.node, hops: [...hops], nodes: [...nodes] };
          pop();
          continue;
        }
        frame.moves = moves(frame, step);
      }
      const next = frame.moves!.next();
      if (next.done) { pop(); continue; }
      if (next.value.edge !== undefined) {
        hops.push(next.value.edge.relation);
        nodes.push({ entity: next.value.node, prefixEnd: next.value.prefixEnd });
      }
      frames.push({ ...next.value, entered: false });
    }
  }
  return (relation, occurrence, endpoint, path, scoped) => {
    const provenance = endpoint.chainProvenance!;
    const semantic = endpoint.semanticTarget!;
    const foldFailure = (check: string): Diagnostic => diagnostic({
      code: "occurrence-endpoint-mismatch", path: `${path}.occurrence`,
      message: `projected endpoint for role ${endpoint.role} fails check ${check}`,
      refs: [occurrence, endpoint.occurrence], details: { role: endpoint.role, check },
    });
    const refs = [occurrence, endpoint.occurrence, semantic];
    const fail = (check: string, details: Record<string, string | number | boolean> = {}, extra: readonly string[] = []): Diagnostic => diagnostic({
      code: "occurrence-endpoint-mismatch", path: `${path}.occurrence`,
      message: `chain endpoint for role ${endpoint.role} fails check ${check} (predicate ${provenance.predicateId})`,
      refs: [...refs, ...extra], details: { role: endpoint.role, check, predicateId: provenance.predicateId, ...details },
    });
    for (const ref of [...provenance.hops, ...(provenance.members ?? [])]) {
      if (document.relations[ref] === undefined) return diagnostic({
        code: "dangling-reference", path: `${path}.occurrence`, message: `${ref} is no relation of this document`, refs: [ref],
      });
    }
    if (!relation.endpoints.some((e) => e.role === endpoint.role && e.target === semantic)) return foldFailure("provenance-mismatch");
    const drawn = drawnTargets.get(endpoint.occurrence);
    if (drawn === undefined) return diagnostic({
      code: "dangling-reference", path: `${path}.occurrence`,
      message: scoped ? `${endpoint.occurrence} is no entity, port or relation occurrence of this view`
        : `${endpoint.occurrence} is no entity or port occurrence of this view`, refs: [endpoint.occurrence],
    });
    const profile = registry.get(relation.profile);
    const predicate = profile?.chainPredicates?.find((p) => p.id === provenance.predicateId);
    if (profile === undefined || predicate === undefined) return fail("chain-not-declared");
    const start = entityOf(semantic);
    const end = entityOf(drawn);
    if (!predicate.appliesTo.relationTypes.includes(relation.type) || !predicate.appliesTo.roles.includes(endpoint.role) ||
        start === undefined || !matches(profile, start, predicate.appliesTo.startTypes, predicate.startConstraints)) return fail("chain-hop-mismatch");
    if ((predicate.selection === "aggregate") !== (provenance.members !== undefined)) return fail("chain-hop-mismatch");
    let expected: Walk | undefined;
    if (predicate.selection === "aggregate") {
      const aggregation = predicate.aggregation;
      if (aggregation === undefined) return fail("chain-hop-mismatch");
      const members: { relation: Relation; source: EntityRef; target: EntityRef; route: Walk }[] = [];
      for (const member of indexes.get(profile.id)?.relations ?? []) {
        if (!aggregation.memberRelationTypes.includes(member.type)) continue;
        const source = member.endpoints.find((e) => e.role === "source")?.target;
        const target = member.endpoints.find((e) => e.role === "target")?.target;
        const s = source === undefined ? undefined : entityOf(source);
        const t = target === undefined ? undefined : entityOf(target);
        if (s === undefined || t === undefined || walk(profile, t, aggregation.memberTargetChain, relation.id).next().done) continue;
        for (const route of walk(profile, s, aggregation.memberSourceChain, relation.id)) {
          if (route.end === end) { members.push({ relation: member, source: s, target: t, route }); break; }
        }
      }
      members.sort((a, b) => compare(a.source, b.source) || compare(a.target, b.target) || compare(a.relation.id, b.relation.id));
      const declared = provenance.members!;
      const firstDifference = members.findIndex((m, i) => m.relation.id !== declared[i]);
      if (members.length === 0 || members.length !== declared.length || firstDifference !== -1 || members[0]!.relation.id !== relation.id) {
        const differing = firstDifference === -1 ? declared[members.length] : declared[firstDifference] ?? members[firstDifference]?.relation.id;
        const carrier = members[0]?.relation.id;
        return fail("chain-aggregation-mismatch", { expectedCount: members.length, declaredCount: declared.length },
          carrier !== relation.id && carrier !== undefined ? [carrier] : differing === undefined ? [] : [differing]);
      }
      expected = members[0]!.route;
    } else if (predicate.selection === "first-drawn") {
      search: for (const alternative of predicate.alternatives) {
        for (const route of walk(profile, start, alternative, relation.id, true)) {
          const index = route.nodes.findIndex((node) => drawnEntities.has(node.entity));
          if (index === -1) return fail("chain-not-proven");
          const node = route.nodes[index]!;
          // A completed one-step prefix is an admitted lift (e.g. the exposer).
          // Nodes inside a repeating step must satisfy that path's end test.
          if (!node.prefixEnd && index !== route.nodes.length - 1) return fail("chain-not-proven", { blockingDrawn: node.entity });
          if (node.entity !== end) return fail("chain-not-proven", { earlierDrawn: node.entity });
          expected = { ...route, end: node.entity, hops: route.hops.slice(0, index) };
          break search;
        }
      }
    } else {
      const ends = new Map<EntityRef, Walk>();
      for (const alternative of predicate.alternatives) {
        for (const route of walk(profile, start, alternative, relation.id)) {
          if (predicate.selection === "ordered" && !drawnEntities.has(route.end)) continue;
          if (!ends.has(route.end)) ends.set(route.end, route);
        }
        if (predicate.selection === "ordered" && ends.size > 0) break;
      }
      if (ends.size > 1) {
        return predicate.selection === "unique" ? fail("chain-not-proven", { cause: "cardinality" })
          : fail("chain-ambiguous", { candidateCount: ends.size }, [...ends.keys()].sort(compare));
      }
      expected = ends.values().next().value;
    }
    if (expected === undefined) return fail("chain-not-proven");
    if (expected.end !== end) return fail("chain-not-proven", { expectedEnd: expected.end });
    if (provenance.hops.length === 0) return fail("chain-not-proven");
    const length = Math.max(provenance.hops.length, expected.hops.length);
    for (let i = 0; i < length; i++) {
      if (provenance.hops[i] !== expected.hops[i]) {
        const hop = provenance.hops[i] ?? expected.hops[i]!;
        return fail("chain-hop-mismatch", { hopIndex: i, hop }, [hop]);
      }
    }
    return undefined;
  };
}
