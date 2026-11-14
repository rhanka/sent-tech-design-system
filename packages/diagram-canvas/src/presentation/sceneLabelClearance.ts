import { rectsIntersect } from '../geometry.js';
import type { Rect, Vec2 } from '../transform.js';

/** Keep measured label sizes and routes; move only labels whose paint would
 * cover a connector. The same deterministic placement is used by both hosts. */
export function clearSceneLabels<T extends { readonly box: Rect; readonly leader?: readonly Vec2[] }>(
  labels: readonly T[], routes: readonly (readonly Vec2[])[], shapes: readonly Rect[], clearance: number,
): T[] {
  const obstacles = [...shapes];
  for (const route of routes) for (let i = 1; i < route.length; i++) {
    const a = route[i - 1]!, b = route[i]!;
    obstacles.push({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y) });
  }
  return labels.map(label => {
    const { box } = label;
    const padded = (x: number, y: number): Rect => ({ x: x - clearance, y: y - clearance, width: box.width + 2 * clearance, height: box.height + 2 * clearance });
    const candidates = [{ x: box.x, y: box.y, cost: 0 }];
    const visited = new Set<string>([`${box.x},${box.y}`]);
    const add = (x: number, y: number) => {
      const key = `${x},${y}`;
      if (visited.has(key)) return;
      visited.add(key);
      candidates.push({ x, y, cost: Math.abs(x - box.x) + Math.abs(y - box.y) });
    };
    // Expand only boundaries of obstacles actually hit. Coordinates come
    // from a finite set of rectangle edges; no unbounded nudge loop or
    // quadratic Cartesian grid is needed for dense scenes.
    while (candidates.length > 0) {
      candidates.sort((a, b) => a.cost - b.cost || a.y - b.y || a.x - b.x);
      const choice = candidates.shift()!;
      const hit = obstacles.find(obstacle => rectsIntersect(padded(choice.x, choice.y), obstacle));
      if (hit === undefined) {
        const placed = { ...box, x: choice.x, y: choice.y };
        obstacles.push(placed);
        if (choice.cost === 0) return label;
        // Keep the route anchor and attach the last segment to the moved box.
        const anchor = label.leader?.at(-2);
        const leader = anchor === undefined ? undefined : [
          ...label.leader!.slice(0, -1),
          { x: Math.max(placed.x, Math.min(anchor.x, placed.x + placed.width)),
            y: Math.max(placed.y, Math.min(anchor.y, placed.y + placed.height)) },
        ];
        return { ...label, box: placed, ...(leader === undefined ? {} : { leader }) };
      }
      add(hit.x - clearance - box.width, choice.y);
      add(hit.x + hit.width + clearance, choice.y);
      add(choice.x, hit.y - clearance - box.height);
      add(choice.x, hit.y + hit.height + clearance);
    }
    return label;
  });
}
