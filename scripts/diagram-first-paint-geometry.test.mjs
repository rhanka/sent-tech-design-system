import { test } from 'node:test';
import assert from 'node:assert/strict';
import { borderDistance, connectorFindings, exposedSegments, segmentInterval } from '../tools/diagram-first-paint/geometry.mjs';

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
