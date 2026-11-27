export const cases = ['architecture-folded', 'architecture-unfolded', 'ontology-folded', 'ontology-unfolded', 'nested-zones', 'nested-zones-outside', 'three-cards', 'three-cards-compact', 'numbered-flows', 'numbered-flows-bundled', 'r7-connectors', 'r7-connectors-folded', 'r7-nested-styles', 'r7-authored-legend', 'h2-example-a', 'h2-example-b', 'h2-aspect-16-9', 'h2-stacked-zones'];

/** Expected canonical link-style legend entries for the r7 and H2 reference scenes (and their folded states). */
export function expectedLegendStyles(name) {
  if (name === 'r7-authored-legend' || name.startsWith('r7-authored-legend--folded')) {
    return [];
  }
  if (name === 'r7-connectors' || name === 'r7-nested-styles') {
    return ['solid:arrow:default', 'solid:none:emphasis', 'dashed:arrow:default', 'dotted:arrow:default'];
  }
  if (name === 'r7-connectors-folded' || name === 'r7-connectors--folded') {
    return ['dashed:arrow:default', 'dotted:arrow:default'];
  }
  if (name === 'r7-nested-styles--folded:occurrence:e.zone-core') {
    return ['solid:none:emphasis', 'dashed:arrow:default', 'dotted:arrow:default'];
  }
  if (name.startsWith('r7-nested-styles--folded')) {
    return [];
  }
  if (name === 'h2-example-a' || name.startsWith('h2-example-a--folded')) {
    return ['solid:arrow:default', 'solid:arrow:emphasis', 'dashed:arrow:default'];
  }
  if (name === 'h2-example-b--folded:occurrence:e.layer-b') {
    return [];
  }
  if (name === 'h2-example-b' || name.startsWith('h2-example-b--folded') || name === 'h2-aspect-16-9' || name.startsWith('h2-aspect-16-9--folded') || name === 'h2-stacked-zones' || name.startsWith('h2-stacked-zones--folded')) {
    return ['solid:arrow:default', 'dashed:arrow:default'];
  }
  return null;
}

/** Expected legend anchor for scenes asserting a link-style legend in first-paint. */
export function expectedLegendAnchor(name) {
  if (name === 'r7-authored-legend' || name.startsWith('r7-authored-legend--folded')) return null;
  if (name === 'h2-example-b--folded:occurrence:e.layer-b') return null;
  if (name === 'r7-nested-styles--folded:occurrence:e.zone-platform') return null;
  if (name === 'h2-example-a' || name.startsWith('h2-example-a--folded')) return 'free-cell';
  if (name === 'h2-stacked-zones' || name.startsWith('h2-stacked-zones--folded')) return 'free-cell';
  if (name === 'r7-connectors-folded' || name === 'r7-connectors--folded' || name === 'r7-nested-styles') return 'pocket';
  if (name === 'h2-example-b--folded:occurrence:e.layer-a' || name === 'h2-aspect-16-9' || name.startsWith('h2-aspect-16-9--folded')) return 'pocket';
  if (name === 'h2-example-b' || name === 'r7-connectors' || name === 'r7-nested-styles--folded:occurrence:e.zone-core') return 'right';
  return null;
}

/** Explicit non-legend `[data-scene-occurrence]` ids to fold/unfold per scene in browser.mjs. */
export function foldTargets(name) {
  if (name === 'r7-authored-legend' || name === 'r7-connectors') return ['occurrence:e.zone-core'];
  if (name === 'r7-nested-styles') return ['occurrence:e.zone-platform', 'occurrence:e.zone-core'];
  if (name === 'h2-example-a') return ['occurrence:e.tools'];
  if (name === 'h2-example-b') return ['occurrence:e.layer-a', 'occurrence:e.layer-b'];
  if (name === 'h2-stacked-zones') return ['occurrence:e.zone-one', 'occurrence:e.zone-nested', 'occurrence:e.sub-narrow'];
  if (name === 'h2-aspect-16-9') {
    return [
      'occurrence:zone-immo',
      'occurrence:zone-engram',
      'occurrence:zone-extractors',
      'occurrence:zone-assembly',
      'occurrence:zone-graph-json',
      'occurrence:zone-cluster-mesh',
    ];
  }
  return [];
}

/** Per-scene expected visible minimums (`minNodes`, `expectEdges`, `expectLabels`), supporting `--folded` states. */
export function expectedVisibleCounts(name) {
  const noConnectors = name === 'three-cards' || name === 'three-cards-compact';
  return { minNodes: 3, expectEdges: !noConnectors, expectLabels: !noConnectors };
}
