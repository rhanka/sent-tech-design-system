export const cases = ['architecture-folded', 'architecture-unfolded', 'ontology-folded', 'ontology-unfolded', 'nested-zones', 'nested-zones-outside', 'three-cards', 'three-cards-compact', 'numbered-flows', 'numbered-flows-bundled', 'r7-connectors', 'r7-connectors-folded', 'r7-nested-styles', 'h2-example-a', 'h2-example-b', 'h2-aspect-16-9'];

/** Expected canonical link-style legend entries for the r7 and H2 reference scenes (and their folded states). */
export function expectedLegendStyles(name) {
  if (name === 'r7-connectors' || name === 'r7-nested-styles') {
    return ['solid:arrow:default', 'solid:none:emphasis', 'dashed:arrow:default', 'dotted:arrow:default'];
  }
  if (name === 'r7-connectors-folded' || name === 'r7-connectors--folded') {
    return ['dashed:arrow:default', 'dotted:arrow:default'];
  }
  if (name === 'r7-nested-styles--folded') {
    return [];
  }
  if (name === 'h2-example-a') {
    return ['solid:arrow:default', 'solid:arrow:emphasis', 'dashed:arrow:default'];
  }
  if (name === 'h2-example-b' || name === 'h2-aspect-16-9') {
    return ['solid:arrow:default', 'dashed:arrow:default'];
  }
  return null;
}

/** Expected legend anchor for scenes asserting a link-style legend in first-paint. */
export function expectedLegendAnchor(name) {
  if (name === 'h2-example-a') return 'free-cell';
  if (name === 'h2-example-b' || name === 'h2-aspect-16-9' || name.startsWith('r7-')) return 'right';
  return null;
}
