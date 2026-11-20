import { test } from 'node:test';
import assert from 'node:assert/strict';
import { borderDistance, centredBodyFindings, compactCardFindings, connectorFindings, exposedSegments, segmentInterval } from '../tools/diagram-first-paint/geometry.mjs';

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
