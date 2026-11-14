import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exposedSegments, segmentInterval } from '../tools/diagram-first-paint/geometry.mjs';

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
