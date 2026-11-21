export const cases = ['architecture-folded', 'architecture-unfolded', 'ontology-folded', 'ontology-unfolded', 'nested-zones', 'nested-zones-outside', 'three-cards', 'three-cards-compact', 'numbered-flows', 'numbered-flows-bundled', 'r7-connectors', 'r7-connectors-folded', 'r7-nested-styles'];

/** Expected canonical link-style legend entries for the r7 reference scenes (and their folded states). */
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
  return null;
}
