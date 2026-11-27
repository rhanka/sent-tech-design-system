import { test } from 'node:test';
import assert from 'node:assert/strict';
import { borderDistance, centredBodyFindings, centredContainerContentFindings, combinedLegendFindings, compactCardFindings, connectorFindings, exposedSegments, legendFindings, linkStrokeWidthFindings, roundedElbowFindings, segmentInterval } from '../tools/diagram-first-paint/geometry.mjs';
import { cases, expectedLegendAnchor, expectedLegendStyles, expectedVisibleCounts, foldTargets } from '../tools/diagram-first-paint/scenes.js';

test('should clip a crossing connector against the stroke-inset badge disk', () => {
  const a = { x: -20, y: 0 }, b = { x: 20, y: 0 };
  assert.deepEqual(segmentInterval({ x: 0, y: 0, radius: 10 }, a, b), [.25, .75]);
  assert.deepEqual(exposedSegments(a, b, [{ x: 0, y: 0, radius: 10 }], 2),
    [[a, { x: -8, y: 0 }], [{ x: 8, y: 0 }, b]]);
});

test('should preserve connectors outside the disk, including zero-length segments', () => {
  const disk = { x: 0, y: 0, radius: 10 };
  const a = { x: -20, y: 11 }, b = { x: 20, y: 11 };
  assert.equal(segmentInterval(disk, a, b), undefined);
  assert.deepEqual(exposedSegments(a, b, [disk], 1), [[a, b]]);
  assert.deepEqual(exposedSegments(a, a, [disk], 1), [[a, a]]);
  assert.deepEqual(exposedSegments({ x: 0, y: 0 }, { x: 0, y: 0 }, [disk], 1), []);
});

test('should skip disks exhausted by stroke and combine disks with rectangles', () => {
  const a = { x: -20, y: 0 }, b = { x: 20, y: 0 };
  assert.deepEqual(exposedSegments(a, b, [{ x: 0, y: 0, radius: 2 }], 2), [[a, b]]);
  assert.deepEqual(exposedSegments(a, b, [{ x: 0, y: 0, radius: 10 },
    { left: -20, right: -5, top: -10, bottom: 10 }], 2),
    [[a, { x: -18, y: 0 }], [{ x: 8, y: 0 }, b]]);
});

// A class relation between two cards nested in a zone, in screen pixels.
const zone = { id: 'zone', left: 0, top: 0, right: 400, bottom: 200 };
const cardA = { id: 'a', left: 20, top: 60, right: 120, bottom: 140 };
const cardB = { id: 'b', left: 280, top: 60, right: 380, bottom: 140 };
const route = { id: 'rel', stroke: 0.75, points: [{ x: 120, y: 100 }, { x: 280, y: 100 }] };
const inner = box => ({ left: box.left + 4, top: box.top + 4, right: box.right - 4, bottom: box.bottom - 4 });
const scene = { paths: [route], labels: ['rel'], nodes: [zone, cardA, cardB], tolerance: 1,
  relations: [{ occurrence: 'rel', ends: ['a', 'b'] }] };

test('should accept a connector painted above its zone frame and touching both cards', () => {
  assert.deepEqual(connectorFindings({ ...scene, occluders: [inner(cardA), inner(cardB)] }), []);
  assert.deepEqual(connectorFindings({ ...scene, relations: undefined, occluders: [inner(cardA), inner(cardB)] }), []);
});

test('should fail when the zone frame is painted over the connector (labels without lines)', () => {
  const findings = connectorFindings({ ...scene, occluders: [inner(zone), inner(cardA), inner(cardB)] });
  assert.deepEqual(findings, ['connector rel is hidden: 0 of 160 px painted']);
});

test('should fail on a label without connector, a missing relation and a detached end', () => {
  assert.deepEqual(connectorFindings({ ...scene, paths: [], occluders: [] }),
    ['label rel has no connector', 'relation rel has no connector']);
  const detached = { ...route, points: [{ x: 120, y: 100 }, { x: 250, y: 100 }] };
  assert.deepEqual(connectorFindings({ ...scene, paths: [detached], occluders: [] }),
    ['connector rel must touch a and b, touches [a] and []']);
  assert.deepEqual(connectorFindings({ ...scene, relations: undefined, paths: [detached], occluders: [] }),
    ['connector rel must touch two boxes, touches [a] and []']);
  assert.equal(borderDistance({ x: 120, y: 100 }, cardA), 0);
  assert.equal(borderDistance({ x: 130, y: 100 }, cardA), 10);
});

test('should keep a connector that only passes behind a footer cutout', () => {
  const cutout = { left: 150, top: 90, right: 200, bottom: 110 };
  assert.deepEqual(connectorFindings({ ...scene, occluders: [cutout] }), []);
});

test('should occlude terminal connector overlap along flat edges of a rounded-rect box', () => {
  const roundedRectOccluders = ({ left, top, right, bottom }, radius) => [
    { left: left + radius, top, right: right - radius, bottom },
    { left, top: top + radius, right, bottom: bottom - radius },
  ];
  const segments = exposedSegments(
    { x: 100, y: 260 },
    { x: 100, y: 200 },
    roundedRectOccluders({ left: 0, top: 0, right: 200, bottom: 200 }, 12),
    2,
  );
  assert.equal(segments.length, 1);
  assert.ok(segments[0][1].y >= 198);
});

// Owner card-body-centring: the three-cards gate pins the single-line
// `First paint` ink in the frozen body box (centre-x 232, ink inside
// [104, 172] card px vertically — never top- or bottom-aligned).
// Screen px below, card px in the call.
const paintCard = { id: 'occurrence:e.a', left: 100, top: 50, right: 560, bottom: 250 };
const paintArgs = { nodes: [paintCard], text: 'First paint', bodyCx: 232, minTop: 104, maxBottom: 172, tolerance: 2 };
const centredInk = { id: 'First paint', left: 262, top: 176, right: 402, bottom: 202 };
const legacyInk = { id: 'First paint', left: 114, top: 140, right: 254, bottom: 166 };
const bottomInk = { id: 'First paint', left: 262, top: 214, right: 402, bottom: 234 };

test('should accept body ink centred in the body box, at scale 1 and at the readability floor', () => {
  assert.deepEqual(centredBodyFindings({ ...paintArgs, labels: [centredInk], scale: 1 }), []);
  const small = {
    nodes: [{ ...paintCard, left: 0, top: 0, right: 230, bottom: 100 }],
    labels: [{ ...centredInk, left: 46, right: 186, top: 63, bottom: 76 }],
    scale: 0.5,
  };
  assert.deepEqual(centredBodyFindings({ ...paintArgs, ...small }), []);
});

test('should fail legacy top-left body ink on both axes', () => {
  assert.deepEqual(centredBodyFindings({ ...paintArgs, labels: [legacyInk], scale: 1 }), [
    'card occurrence:e.a body ink off-centre: 184 != 332',
    'card occurrence:e.a body ink above the centred block top: 140 < 154',
  ]);
});

test('should fail bottom-aligned body ink on the upper bound (card offsets top 164 bottom 184)', () => {
  assert.deepEqual(centredBodyFindings({ ...paintArgs, labels: [bottomInk], scale: 1 }), [
    'card occurrence:e.a body ink below the centred block bottom: 234 > 222',
  ]);
});

test('should fail a card with no body ink at all', () => {
  assert.deepEqual(centredBodyFindings({ ...paintArgs, labels: [], scale: 1 }), [
    'card occurrence:e.a has no "First paint" body ink',
  ]);
});

test('should verify compact 352x154 card centering within 1/64 px and slot containment', () => {
  const slot = {
    id: 'occurrence:e.a',
    card: { left: 0, top: 0, right: 352, bottom: 154, width: 352, height: 154 },
    headerText: { left: 68, top: 8, right: 344, bottom: 60, width: 276, height: 52 },
    bodyArea: { left: 14, top: 66, right: 344, bottom: 146, width: 330, height: 80 },
    titleLines: [{ left: 68, top: 13.203125, right: 344, bottom: 54.796875, width: 276, height: 41.59375 }],
    bodyLines: [{ left: 14, top: 90.40625, right: 344, bottom: 121.59375, width: 330, height: 31.1875 }],
  };
  const labels = [
    { id: 'Card a', left: 156, top: 20, right: 256, bottom: 48, width: 100, height: 28 },
    { id: 'First paint', left: 129, top: 94, right: 229, bottom: 118, width: 100, height: 24 },
  ];
  assert.deepEqual(compactCardFindings({ cardSlots: [slot], labels, scale: 1 }), []);
  // Body block shifted vertically beyond 1/64 px must fail.
  const shifted = { ...slot, bodyLines: [{ ...slot.bodyLines[0], top: 91, bottom: 122.1875 }] };
  assert.ok(compactCardFindings({ cardSlots: [shifted], labels, scale: 1 }).some(f => f.includes('centre-y')));
  // Left-aligned title ink in a compact card must fail.
  const leftTitle = [
    { id: 'Card a', left: 68, top: 20, right: 168, bottom: 48, width: 100, height: 28 },
    labels[1],
  ];
  assert.ok(compactCardFindings({ cardSlots: [slot], labels: leftTitle, scale: 1 }).some(f => f.includes('title ink off-centre')));
});

test('should include 3 r7 reference scenes and 3 H2 composed scenes with expected legend styles and anchors', () => {
  assert.ok(cases.includes('r7-connectors'));
  assert.ok(cases.includes('r7-connectors-folded'));
  assert.ok(cases.includes('r7-nested-styles'));
  assert.ok(cases.includes('h2-example-a'));
  assert.ok(cases.includes('h2-example-b'));
  assert.ok(cases.includes('h2-aspect-16-9'));
  assert.ok(cases.length >= 16);
  assert.deepEqual(expectedLegendStyles('r7-connectors'), ['solid:arrow:default', 'solid:none:emphasis', 'dashed:arrow:default', 'dotted:arrow:default']);
  assert.deepEqual(expectedLegendStyles('r7-connectors--folded'), ['dashed:arrow:default', 'dotted:arrow:default']);
  assert.deepEqual(expectedLegendStyles('r7-nested-styles--folded'), []);
  assert.deepEqual(expectedLegendStyles('h2-example-a'), ['solid:arrow:default', 'solid:arrow:emphasis', 'dashed:arrow:default']);
  assert.deepEqual(expectedLegendStyles('h2-example-b'), ['solid:arrow:default', 'dashed:arrow:default']);
  assert.deepEqual(expectedLegendStyles('h2-aspect-16-9'), ['solid:arrow:default', 'dashed:arrow:default']);
  assert.equal(expectedLegendAnchor('h2-example-a'), 'free-cell');
  assert.equal(expectedLegendAnchor('h2-example-b'), 'right');
  assert.equal(expectedLegendAnchor('h2-aspect-16-9'), 'right');
});

test('should verify rounded elbow radius cap (<= 12 and <= half shorter leg)', () => {
  assert.deepEqual(roundedElbowFindings({
    paths: [
      { id: 'normal', d: 'M0 0 L88 0 Q100 0 100 12 L100 100' },
      { id: 'short-leg', d: 'M0 0 L92 0 Q100 0 100 8 Q100 16 108 16 L200 16' },
      { id: 'straight', d: 'M0 0 L100 0' },
    ],
  }), []);
  const oversized = roundedElbowFindings({
    paths: [{ id: 'bad', d: 'M0 0 L80 0 Q100 0 100 20 L100 100' }],
  });
  assert.ok(oversized.some(f => f.includes('> 12')));
  const pastHalfLeg = roundedElbowFindings({
    paths: [{ id: 'short', d: 'M0 0 L90 0 Q100 0 100 10 L100 14' }],
  });
  assert.ok(pastHalfLeg.some(f => f.includes('half-leg cap')));
});

test('should verify resting (3.5px) and emphasis (3.5px) link stroke widths', () => {
  assert.deepEqual(linkStrokeWidthFindings({
    paths: [
      { id: 'rest', strokeWidthCss: 3.5, emphasis: 'default', flow: false, erd: false },
      { id: 'related', strokeWidthCss: 3.5, arrowhead: 'none', emphasis: 'default', flow: false, erd: false },
      { id: 'emph', strokeWidthCss: 3.5, emphasis: 'emphasis', flow: false, erd: false },
      { id: 'flow', strokeWidthCss: 1.5, emphasis: 'default', flow: true, erd: false },
    ],
  }), []);
  const bad = linkStrokeWidthFindings({
    paths: [{ id: 'thin', strokeWidthCss: 2.5, emphasis: 'default', flow: false, erd: false }],
  });
  assert.deepEqual(bad, ['connector thin stroke width 2.5 != 3.5']);
});

test('should verify legend canonical order, right anchor, non-overlap, and omission after fold', () => {
  const nodes = [{ id: 'n1', left: 0, top: 0, right: 400, bottom: 200 }];
  const legend = {
    id: 'legend',
    left: 448, top: 0, right: 690, bottom: 160,
    anchor: 'right',
    styles: ['solid:arrow:default', 'solid:none:emphasis', 'dashed:arrow:default', 'dotted:arrow:default'],
  };
  assert.deepEqual(legendFindings({ legend, nodes, expectedStyles: legend.styles }), []);
  assert.deepEqual(legendFindings({ legend: null, nodes, expectedStyles: [] }), []);
  assert.ok(legendFindings({ legend, nodes, expectedStyles: [] }).some(f => f.includes('omitted')));
  assert.ok(legendFindings({
    legend: { ...legend, styles: ['dotted:arrow:default', 'solid:arrow:default'] },
    nodes,
  }).some(f => f.includes('canonical order')));
  assert.ok(legendFindings({
    legend: { ...legend, left: 300, right: 540 },
    nodes,
  }).some(f => f.includes('overlaps')));
  // H2 free-cell legend sits to the left of functional nodes without overlapping any box
  const freeCellLegend = {
    id: 'legend',
    left: 0, top: 0, right: 240, bottom: 160,
    anchor: 'free-cell',
    styles: ['solid:arrow:default', 'solid:arrow:emphasis', 'dashed:arrow:default'],
  };
  const stageNode = [{ id: 'n1', left: 336, top: 0, right: 688, bottom: 154 }];
  assert.deepEqual(legendFindings({ legend: freeCellLegend, nodes: stageNode, expectedAnchor: 'free-cell', expectedStyles: freeCellLegend.styles }), []);

  // DE3-L1b pocket legend sits inside an open corner >= 24 px clear without overlapping any box
  const pocketLegend = {
    id: 'legend',
    left: 448, top: 24, right: 616, bottom: 154,
    anchor: 'pocket',
    styles: ['solid:arrow:default', 'dashed:arrow:default'],
  };
  assert.deepEqual(legendFindings({ legend: pocketLegend, nodes, expectedAnchor: 'pocket', expectedStyles: pocketLegend.styles }), []);
});

test('should enforce combined legend count <= 1 and zero overlap for authored legends (DE3-L1a)', () => {
  assert.ok(cases.includes('r7-authored-legend'));
  assert.deepEqual(foldTargets('r7-authored-legend'), ['occurrence:e.zone-core']);
  assert.ok(!foldTargets('r7-authored-legend').includes('occurrence:e.legend'));
  assert.deepEqual(expectedLegendStyles('r7-authored-legend'), []);
  assert.deepEqual(expectedLegendStyles('r7-authored-legend--folded'), []);
  assert.equal(expectedLegendAnchor('r7-authored-legend'), null);
  assert.equal(expectedLegendAnchor('r7-authored-legend--folded'), null);
  assert.deepEqual(expectedVisibleCounts('r7-authored-legend--folded'), { minNodes: 3, expectEdges: true, expectLabels: true });

  const authored = { id: 'occurrence:e.legend', left: 10, top: 10, right: 200, bottom: 160 };
  const auto = { id: 'legend', left: 300, top: 10, right: 540, bottom: 160, anchor: 'right', styles: ['solid:arrow:default', 'dashed:arrow:default'] };
  const nodes = [
    { id: 'occurrence:e.legend', kind: 'zone', left: 10, top: 10, right: 200, bottom: 160 },
    { id: 'occurrence:e.key-core', kind: 'legend-key', left: 26, top: 60, right: 184, bottom: 90 },
    { id: 'occurrence:e.alpha', kind: 'card', left: 250, top: 200, right: 450, bottom: 320 },
  ];
  const labels = [{ id: 'calls', left: 260, top: 170, right: 320, bottom: 192 }];
  const paths = [{ id: 'r1', stroke: 1.75, points: [{ x: 250, y: 260 }, { x: 450, y: 260 }] }];

  assert.deepEqual(combinedLegendFindings({ legend: null, authoredLegends: [authored], nodes, labels, paths }), []);
  assert.ok(combinedLegendFindings({ legend: auto, authoredLegends: [authored], nodes, labels, paths }).some(f => f.includes('2')));
  assert.ok(combinedLegendFindings({ legend: null, authoredLegends: [authored], nodes, labels: [{ id: 'overlap', left: 150, top: 100, right: 220, bottom: 130 }], paths }).some(f => f.includes('overlaps label')));
  // Interior foreign cards and interior edge labels must be flagged; enclosing outer zones must not.
  assert.ok(combinedLegendFindings({ legend: null, authoredLegends: [authored], nodes: [...nodes, { id: 'inside-card', kind: 'card', left: 30, top: 30, right: 90, bottom: 90 }], labels, paths }).some(f => f.includes('overlaps box inside-card')));
  assert.ok(combinedLegendFindings({ legend: null, authoredLegends: [authored], nodes, labels: [{ id: 'inside-label', left: 30, top: 30, right: 90, bottom: 50 }], paths }).some(f => f.includes('overlaps label inside-label')));
  assert.deepEqual(combinedLegendFindings({ legend: null, authoredLegends: [authored], nodes: [...nodes, { id: 'outer-zone', kind: 'zone', left: 0, top: 0, right: 220, bottom: 180 }], labels, paths }), []);
});

test('should verify widened container horizontal centring and flag left-packed cards (DE3-L7)', () => {
  assert.ok(cases.includes('h2-stacked-zones'));
  assert.deepEqual(foldTargets('h2-stacked-zones'), ['occurrence:e.zone-one', 'occurrence:e.zone-nested', 'occurrence:e.sub-narrow']);
  assert.deepEqual(expectedLegendStyles('h2-stacked-zones'), ['solid:arrow:default', 'dashed:arrow:default']);
  assert.deepEqual(expectedLegendStyles('h2-stacked-zones--folded:occurrence:e.zone-one'), ['solid:arrow:default', 'dashed:arrow:default']);
  assert.equal(expectedLegendAnchor('h2-stacked-zones'), 'right');

  assert.deepEqual(centredContainerContentFindings({
    zones: [
      {
        id: 'occurrence:e.zone-one',
        left: 0, top: 0, right: 800, bottom: 250,
        children: [{ left: 224, top: 60, right: 576, bottom: 214 }],
      },
    ],
    tolerance: 1,
  }), []);

  const leftPacked = centredContainerContentFindings({
    zones: [
      {
        id: 'occurrence:e.zone-one',
        left: 0, top: 0, right: 800, bottom: 250,
        children: [{ left: 16, top: 60, right: 368, bottom: 214 }],
      },
    ],
    tolerance: 1,
  });
  assert.equal(leftPacked.length, 1);
  assert.ok(leftPacked[0].includes('off-centre'));
});
