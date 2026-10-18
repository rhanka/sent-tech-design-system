/**
 * L-R6 — rank, cycles, self-loops and sibling order, for the members of ONE
 * nesting level. Document insertion order is never used.
 *
 * SELF-LOOPS are skipped at every level: no rank, no dummy, no segment, and
 * the entity's rank is unchanged. A reversal below never changes a relation's
 * semantic direction, its docks or its route endpoints.
 *
 * CYCLES. Lifted edges are processed in ascending relation id into a DAG; an
 * edge is added as oriented unless its target already reaches its source in
 * the DAG built so far, in which case it is added reversed. Each edge is
 * processed once and reachability is a finite walk, so the procedure
 * terminates and the result is acyclic. Adding the reversed edge cannot close
 * another cycle (that would need a path both ways, i.e. a cycle already
 * present).
 *
 * RANK. Longest path in that DAG: 0 with no predecessor, else `1 + max`
 * predecessor rank, computed in topological order with the ready set in
 * entity-id order. An edge spanning more than one rank gets one dummy per
 * intermediate rank, its key sorting after every entity id.
 *
 * ORDER. Each rank starts sorted by key (entity id, dummies last) and is
 * refined by at most 24 barycentre sweeps, alternating down (neighbours
 * above) and up (neighbours below); a member's weight is the mean position
 * of its neighbours in the adjacent rank, a member with no neighbour there
 * keeps its current index, and members sort by (weight, key). Crossings are
 * counted over adjacent-rank segments after each sweep; the earliest ordering
 * with the fewest crossings seen is kept, stopping at 0. The objective is to
 * reduce crossings: no global minimum is claimed.
 */

export interface LevelEdge {
  /** The relation reference. Its string order is the cycle-breaking order. */
  readonly id: string;
  readonly from: string;
  readonly to: string;
}

export interface LevelSegment {
  readonly edge: string;
  readonly from: string;
  readonly to: string;
}

export interface LevelOrder {
  readonly rankOf: ReadonlyMap<string, number>;
  /** Members and dummies, rank by rank, in final cross order. */
  readonly ranks: readonly (readonly string[])[];
  readonly dummies: ReadonlySet<string>;
  /** Every adjacent-rank segment, oriented from rank r to rank r + 1. */
  readonly segments: readonly LevelSegment[];
  /** Relation references reversed to break a cycle. */
  readonly reversed: ReadonlySet<string>;
  /** Crossings of the kept ordering, counted over `segments`. */
  readonly crossings: number;
}

const byString = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0);

export const BARYCENTRE_SWEEPS = 24;

function reaches(adjacency: ReadonlyMap<string, string[]>, from: string, to: string): boolean {
  if (from === to) return true;
  const seen = new Set<string>([from]);
  const stack = [from];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const next of adjacency.get(current) ?? []) {
      if (next === to) return true;
      if (!seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return false;
}

export function dummyKey(edge: string, rank: number): string {
  // `~` sorts after every character a reference may hold, so a dummy never
  // takes an entity's place in an id tie.
  return `~${edge}~${rank}`;
}

export function orderLevel(members: readonly string[], edges: readonly LevelEdge[]): LevelOrder {
  const sortedMembers = [...members].sort(byString);
  const adjacency = new Map<string, string[]>(sortedMembers.map((member) => [member, []]));
  const oriented: LevelEdge[] = [];
  const reversed = new Set<string>();

  for (const edge of [...edges].sort((left, right) => byString(left.id, right.id))) {
    if (edge.from === edge.to) continue;
    if (reaches(adjacency, edge.to, edge.from)) {
      reversed.add(edge.id);
      adjacency.get(edge.to)!.push(edge.from);
      oriented.push({ id: edge.id, from: edge.to, to: edge.from });
    } else {
      adjacency.get(edge.from)!.push(edge.to);
      oriented.push(edge);
    }
  }

  // Longest path from a source (Kahn, ready set kept sorted so the walk is total).
  const indegree = new Map<string, number>(sortedMembers.map((member) => [member, 0]));
  for (const edge of oriented) indegree.set(edge.to, indegree.get(edge.to)! + 1);
  const rankOf = new Map<string, number>(sortedMembers.map((member) => [member, 0]));
  const ready = sortedMembers.filter((member) => indegree.get(member) === 0);
  while (ready.length > 0) {
    ready.sort(byString);
    const current = ready.shift()!;
    for (const next of adjacency.get(current)!) {
      rankOf.set(next, Math.max(rankOf.get(next)!, rankOf.get(current)! + 1));
      const remaining = indegree.get(next)! - 1;
      indegree.set(next, remaining);
      if (remaining === 0) ready.push(next);
    }
  }

  const rankCount = sortedMembers.length === 0 ? 0 : Math.max(...rankOf.values()) + 1;
  const ranks: string[][] = Array.from({ length: rankCount }, () => []);
  for (const member of sortedMembers) ranks[rankOf.get(member)!]!.push(member);

  const dummies = new Set<string>();
  const segments: LevelSegment[] = [];
  for (const edge of oriented) {
    const fromRank = rankOf.get(edge.from)!;
    const toRank = rankOf.get(edge.to)!;
    let previous = edge.from;
    for (let rank = fromRank + 1; rank < toRank; rank += 1) {
      const key = dummyKey(edge.id, rank);
      dummies.add(key);
      rankOf.set(key, rank);
      ranks[rank]!.push(key);
      segments.push({ edge: edge.id, from: previous, to: key });
      previous = key;
    }
    segments.push({ edge: edge.id, from: previous, to: edge.to });
  }
  for (const rank of ranks) rank.sort(byString);

  const up = new Map<string, string[]>();
  const down = new Map<string, string[]>();
  for (const segment of segments) {
    (down.get(segment.from) ?? down.set(segment.from, []).get(segment.from)!).push(segment.to);
    (up.get(segment.to) ?? up.set(segment.to, []).get(segment.to)!).push(segment.from);
  }

  const countCrossings = (order: readonly (readonly string[])[]): number => {
    const position = new Map<string, number>();
    for (const rank of order) rank.forEach((key, index) => position.set(key, index));
    let total = 0;
    for (let rank = 0; rank + 1 < order.length; rank += 1) {
      const pairs = segments
        .filter((segment) => rankOf.get(segment.from) === rank)
        .map((segment) => [position.get(segment.from)!, position.get(segment.to)!] as const);
      for (let i = 0; i < pairs.length; i += 1) {
        for (let j = i + 1; j < pairs.length; j += 1) {
          if ((pairs[i]![0] - pairs[j]![0]) * (pairs[i]![1] - pairs[j]![1]) < 0) total += 1;
        }
      }
    }
    return total;
  };

  const reorder = (order: string[][], rank: number, neighbours: ReadonlyMap<string, string[]>, adjacent: number) => {
    const adjacentPosition = new Map<string, number>();
    order[adjacent]!.forEach((key, index) => adjacentPosition.set(key, index));
    const current = order[rank]!;
    const weight = new Map<string, number>();
    current.forEach((key, index) => {
      const linked = neighbours.get(key) ?? [];
      weight.set(
        key,
        linked.length === 0
          ? index
          : linked.reduce((sum, other) => sum + adjacentPosition.get(other)!, 0) / linked.length,
      );
    });
    current.sort((left, right) => weight.get(left)! - weight.get(right)! || byString(left, right));
  };

  let order = ranks.map((rank) => [...rank]);
  let best = order.map((rank) => [...rank]);
  let bestCrossings = countCrossings(best);
  for (let sweep = 0; sweep < BARYCENTRE_SWEEPS && bestCrossings > 0; sweep += 1) {
    if (sweep % 2 === 0) for (let rank = 1; rank < order.length; rank += 1) reorder(order, rank, up, rank - 1);
    else for (let rank = order.length - 2; rank >= 0; rank -= 1) reorder(order, rank, down, rank + 1);
    const crossings = countCrossings(order);
    if (crossings < bestCrossings) {
      bestCrossings = crossings;
      best = order.map((rank) => [...rank]);
    }
  }
  order = best;

  return { rankOf, ranks: order, dummies, segments, reversed, crossings: bestCrossings };
}
