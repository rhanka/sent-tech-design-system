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


/**
 * Owner card-body-centring: every card centres its body ink horizontally in
 * the frozen body box and drops a short block by half the spare space. The
 * three-cards scene carries the same single-line `First paint` body on
 * every card, so the gate pins both axes from DOM ink: the ink centre-x
 * must sit at the body-box centre and the ink block must sit inside the
 * centred single-line band (never top-aligned, never bottom-aligned).
 * `bodyCx`/`minTop`/`maxBottom` are card px scaled by `scale`; `tolerance`
 * is screen px. `maxBottom` is optional so older callers keep working.
 * Returns the defects, empty when the scene is sound.
 */
export function centredBodyFindings({ nodes, labels, text, bodyCx, minTop, maxBottom, scale, tolerance }) {
  const findings = [];
  for (const node of nodes) {
    const ink = labels.filter(label => label.id === text
      && label.left >= node.left - tolerance && label.right <= node.right + tolerance
      && label.top >= node.top - tolerance && label.bottom <= node.bottom + tolerance);
    if (ink.length === 0) { findings.push(`card ${node.id} has no \"${text}\" body ink`); continue; }
    for (const label of ink) {
      const centre = (label.left + label.right) / 2;
      const expected = node.left + bodyCx * scale;
      if (Math.abs(centre - expected) > tolerance) {
        findings.push(`card ${node.id} body ink off-centre: ${centre} != ${expected}`);
      }
      const floor = node.top + minTop * scale;
      if (label.top < floor - tolerance) {
        findings.push(`card ${node.id} body ink above the centred block top: ${label.top} < ${floor}`);
      }
      if (maxBottom !== undefined) {
        const ceiling = node.top + maxBottom * scale;
        if (label.bottom > ceiling + tolerance) {
          findings.push(`card ${node.id} body ink below the centred block bottom: ${label.bottom} > ${ceiling}`);
        }
      }
    }
  }
  return findings;
}

/** Distance from a point to the border of a box: 0 on the border, positive inside and outside alike. */
export function borderDistance(point, box) {
  const dx = Math.max(box.left - point.x, 0, point.x - box.right);
  const dy = Math.max(box.top - point.y, 0, point.y - box.bottom);
  if (dx > 0 || dy > 0) return Math.hypot(dx, dy);
  return Math.min(point.x - box.left, box.right - point.x, point.y - box.top, box.bottom - point.y);
}

const lengthOf = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

/**
 * Every visible relation has a rendered connector that touches both boxes it
 * joins and is actually painted. `occluders` are the opaque surfaces painted
 * ABOVE the connector layer (and the cutouts of its mask): a connector drawn
 * under a zone surface for its whole run counts as hidden, whatever its DOM
 * says. `relations` (optional) names the exact boxes each connector joins.
 * Returns the list of defects, empty when the scene is sound.
 */
export function connectorFindings({ paths, labels, nodes, occluders, relations, tolerance }) {
  const findings = [];
  const drawn = new Set(paths.map(path => path.id));
  for (const id of labels) if (!drawn.has(id)) findings.push(`label ${id} has no connector`);
  for (const relation of relations ?? []) if (!drawn.has(relation.occurrence)) findings.push(`relation ${relation.occurrence} has no connector`);
  for (const path of paths) {
    if (path.points.length < 2) { findings.push(`connector ${path.id} has no route`); continue; }
    const touching = point => nodes.filter(node => borderDistance(point, node) <= tolerance).map(node => node.id);
    const first = touching(path.points[0]), last = touching(path.points[path.points.length - 1]);
    const expected = relations?.find(relation => relation.occurrence === path.id);
    if (relations !== undefined && expected === undefined) findings.push(`connector ${path.id} joins no expected relation`);
    if (expected !== undefined) {
      const [a, b] = expected.ends;
      if (!((first.includes(a) && last.includes(b)) || (first.includes(b) && last.includes(a)))) {
        findings.push(`connector ${path.id} must touch ${a} and ${b}, touches [${first}] and [${last}]`);
      }
    } else if (first.length === 0 || last.length === 0) {
      // A self-relation legitimately leaves and reaches the same box.
      findings.push(`connector ${path.id} must touch two boxes, touches [${first}] and [${last}]`);
    }
    let total = 0, painted = 0;
    for (let i = 1; i < path.points.length; i++) {
      total += lengthOf(path.points[i - 1], path.points[i]);
      for (const [a, b] of exposedSegments(path.points[i - 1], path.points[i], occluders, path.stroke)) painted += lengthOf(a, b);
    }
    if (!(total > 0) || painted < total / 2) {
      findings.push(`connector ${path.id} is hidden: ${painted} of ${total} px painted`);
    }
  }
  return findings;
}
