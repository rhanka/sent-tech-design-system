export function segmentInterval(box, a, b) {
  if ('radius' in box) {
    const dx = b.x - a.x, dy = b.y - a.y, x = a.x - box.x, y = a.y - box.y;
    const length = dx * dx + dy * dy;
    const outside = x * x + y * y - box.radius * box.radius;
    if (length === 0) return outside <= 0 ? [0, 1] : undefined;
    const dot = x * dx + y * dy, discriminant = dot * dot - length * outside;
    if (discriminant < 0) return undefined;
    const enter = Math.max(0, (-dot - Math.sqrt(discriminant)) / length);
    const leave = Math.min(1, (-dot + Math.sqrt(discriminant)) / length);
    return enter <= leave ? [enter, leave] : undefined;
  }
  const dx = b.x - a.x, dy = b.y - a.y;
  let enter = 0, leave = 1;
  for (const [start, delta, low, high] of [[a.x, dx, box.left, box.right], [a.y, dy, box.top, box.bottom]]) {
    if (delta === 0) {
      if (start < low || start > high) { leave = -1; break; }
    } else {
      const t1 = (low - start) / delta, t2 = (high - start) / delta;
      enter = Math.max(enter, Math.min(t1, t2));
      leave = Math.min(leave, Math.max(t1, t2));
    }
  }
  return enter <= leave ? [enter, leave] : undefined;
}

export function exposedSegments(a, b, occluders, stroke) {
  let segments = [[a, b]];
  for (const box of occluders) {
    const interior = 'radius' in box
      ? { x: box.x, y: box.y, radius: box.radius - stroke }
      : { left: box.left + stroke, top: box.top + stroke,
        right: box.right - stroke, bottom: box.bottom - stroke };
    if ('radius' in interior ? interior.radius <= 0 : interior.left >= interior.right || interior.top >= interior.bottom) continue;
    segments = segments.flatMap(([start, end]) => {
      const interval = segmentInterval(interior, start, end);
      if (interval === undefined) return [[start, end]];
      const [enter, leave] = interval;
      const at = t => ({ x: start.x + t * (end.x - start.x), y: start.y + t * (end.y - start.y) });
      return [...(enter > 0 ? [[start, at(enter)]] : []), ...(leave < 1 ? [[at(leave), end]] : [])];
    });
  }
  return segments;
}

