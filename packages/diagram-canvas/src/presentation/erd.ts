import { rectsIntersect } from '../geometry.js';
import { edgeLabelPlacement, placeEdgeLabels } from '../layout/labels.js';
import type { Rect } from '../transform.js';
import { type SemanticDocument, type SemanticPort, type EntityRef, type ErdCardinality } from '@sentropic/diagram-core';
import type { LineMeasurer } from '../layout/measure.js';
import type { Vec2 } from '../transform.js';
/** Numeric mirrors of component.diagramErd; verified against the token source. */
export const ERD_GEOMETRY = {
  "width": 460,
  "headerHeight": 64,
  "rowHeight": 32,
  "lineHeight": 24,
  "padding": 12,
  "keyWidth": 56,
  "nameWidth": 170,
  "typeWidth": 170,
  "fontSize": 18,
  "titleFontSize": 24,
  "markerLength": 24,
  "markerHalfWidth": 8,
  "markerRadius": 4,
  "markerGap": 4,
  "strokeWidth": 1.5,
  "gapInline": 160,
  "gapBlock": 120,
  "labelWidth": 240
} as const;
export const escapeErdXml = (value: string): string => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
export function erdText(attributes: SemanticPort['attributes'], key: string): string {
  const value = attributes[key];
  return value && 'value' in value ? String(value.value) : '';
}
export const erdFlag = (p: SemanticPort, key: string): boolean => p.attributes[key]?.kind === 'boolean' && p.attributes[key].value === true;
export function erdFields(document: SemanticDocument, entity: string): SemanticPort[] {
  return Object.values(document.ports).filter(p => p.owner === entity).sort((a, b) => Number(erdText(a.attributes, 'ordinal')) - Number(erdText(b.attributes, 'ordinal')) || (a.id < b.id ? -1 : 1));
}
export interface ErdRow {
  readonly field: SemanticPort;
  readonly y: number;
  readonly height: number;
  readonly name: readonly string[];
  readonly type: readonly string[];
  readonly fk: readonly string[];
}
export interface ErdCard {
  readonly title: string;
  readonly titleLines: readonly string[];
  readonly width: number;
  readonly height: number;
  readonly headerHeight: number;
  readonly rows: readonly ErdRow[];
  readonly collapsed: boolean;
}
/** Wraps without truncation, breaking at identifier/punctuation boundaries where possible. */
export function wrapErdText(text: string, width: number, measure?: LineMeasurer, fontSize: number = ERD_GEOMETRY.fontSize): string[] {
  // The shared edge-label measurer uses the body size and may use a proportional font.
  const size = (value: string) => Math.max(Array.from(value).length * fontSize * 0.6,
    measure ? measure({ text: value, role: 'edge-label', availableWidth: Number.MAX_SAFE_INTEGER, allocatedLines: 1, folded: false }).width * fontSize / ERD_GEOMETRY.fontSize : 0);
  const lines: string[] = [];
  let line = '';
  for (const word of text.replace(/([a-z0-9])([A-Z])/g, '$1​$2').split(/(?<=[_|(),.s​])/u)) {
    const clean = word.replaceAll('​', '');
    if (line && size(line + clean) > width) {
      lines.push(line);
      line = '';
    }
    for (const ch of clean) {
      if (line && size(line + ch) > width) {
        lines.push(line);
        line = '';
      }
      line += ch;
    }
  }
  if (line || !lines.length)
    lines.push(line);
  return lines;
}
export function measureErdCard(document: SemanticDocument, entity: EntityRef, collapsed = false, measure?: LineMeasurer): ErdCard {
  const t = ERD_GEOMETRY, title = erdText(document.entities[entity]!.attributes, 'name');
  const titleLines = wrapErdText(title, t.width - 2 * t.padding - t.titleFontSize, measure, t.titleFontSize);
  const headerHeight = Math.max(t.headerHeight, titleLines.length * t.lineHeight + 2 * t.padding);
  let y = headerHeight;
  const rows = collapsed ? [] : erdFields(document, entity).map(field => {
    const name = wrapErdText(field.name, t.nameWidth, measure), type = wrapErdText(erdText(field.attributes, 'dataType'), t.typeWidth, measure);
    const target = document.ports[erdText(field.attributes, 'fk')];
    const fk = target ? wrapErdText('→ ' + erdText(document.entities[target.owner]!.attributes, 'name') + '.' + target.name, t.width - 2 * t.padding, measure) : [];
    const height = Math.max(t.rowHeight, (Math.max(name.length, type.length) + fk.length) * t.lineHeight + t.padding);
    const row = { field, y, height, name, type, fk };
    y += height;
    return row;
  });
  return { title, titleLines, width: t.width, height: y, headerHeight, rows, collapsed };
}
const ink = 'var(--st-semantic-text-primary)';
const paper = 'var(--st-semantic-surface-default)';
const border = 'var(--st-semantic-border-strong)';
const strokeWidth = 'var(--st-component-diagramErd-strokeWidth)';
export function renderErdCardSvg(card: ErdCard): string {
  const t = ERD_GEOMETRY;
  const text = (lines: readonly string[], x: number, y: number, size = 'fontSize', attributes = '') => lines.map((line, i) => '<text x="' + x + '" y="' + (y + i * t.lineHeight) + '" font-size="var(--st-component-diagramErd-' + size + ')"' + attributes + '>' + escapeErdXml(line) + '</text>').join('');
  let body = '<rect width="' + card.width + '" height="' + card.height + '" fill="' + paper + '" stroke="' + border + '" stroke-width="' + strokeWidth + '"/>' + text(card.titleLines, t.padding, t.padding + t.lineHeight, 'titleFontSize');
  body += text([card.collapsed ? '+' : '−'], card.width - t.padding, t.padding + t.lineHeight, 'titleFontSize', ' data-erd-fold-indicator="" text-anchor="end"');
  for (const row of card.rows) {
    body += '<g data-erd-field="' + escapeErdXml(row.field.id) + '"><path d="M0 ' + row.y + 'H' + card.width + '" stroke="' + border + '" stroke-width="' + strokeWidth + '"/>';
    body += text([[erdFlag(row.field, 'pk') ? 'PK' : '', row.field.attributes.fk ? 'FK' : ''].filter(Boolean).join('/')], t.padding, row.y + t.lineHeight);
    body += text(row.name, t.padding + t.keyWidth, row.y + t.lineHeight) + text(row.type, t.padding + t.keyWidth + t.nameWidth, row.y + t.lineHeight);
    body += text([erdFlag(row.field, 'nullable') ? '?' : 'NN'], card.width - t.padding, row.y + t.lineHeight, 'fontSize', ' text-anchor="end"');
    body += text(row.fk, t.padding, row.y + (Math.max(row.name.length, row.type.length) + 1) * t.lineHeight) + '</g>';
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" class="st-diagramErdCard" aria-hidden="true" width="100%" height="100%" viewBox="0 0 ' + card.width + ' ' + card.height + '" style="color:' + ink + ';font-family:var(--st-component-diagramErd-fontFamily);fill:currentColor">' + body + '</svg>';
}
export interface ErdMarker {
  readonly lines: readonly (readonly [
    Vec2,
    Vec2
  ])[];
  readonly circle?: {
    readonly center: Vec2;
    readonly radius: number;
  };
}
/** The outward direction follows the edge away from the card; geometry is token driven. */
export function erdMarkerGeometry(cardinality: ErdCardinality, anchor: Vec2, direction: Vec2, tokens: {
  readonly [K in keyof typeof ERD_GEOMETRY]: number;
} = ERD_GEOMETRY): ErdMarker {
  const n = Math.hypot(direction.x, direction.y) || 1, dx = direction.x / n, dy = direction.y / n;
  const p = (along: number, across: number): Vec2 => ({ x: anchor.x + dx * along - dy * across, y: anchor.y + dy * along + dx * across });
  const l = tokens.markerLength, h = tokens.markerHalfWidth, g = tokens.markerGap;
  const many = cardinality.endsWith('n'), optional = cardinality.startsWith('0');
  const lines: [
    Vec2,
    Vec2
  ][] = many ? [[p(l / 2, 0), p(g, -h)], [p(l / 2, 0), p(g, 0)], [p(l / 2, 0), p(g, h)]] : [[p(g, -h), p(g, h)]];
  if (!optional)
    lines.push([p(l - g, -h), p(l - g, h)]);
  return { lines, ...(optional ? { circle: { center: p(l - tokens.markerRadius, 0), radius: tokens.markerRadius } } : {}) };
}
export function renderErdMarkerSvg(cardinality: ErdCardinality, anchor: Vec2, direction: Vec2): string {
  const marker = erdMarkerGeometry(cardinality, anchor, direction);
  return '<g data-erd-marker="' + cardinality + '" stroke="' + border + '" stroke-width="' + strokeWidth + '" fill="none">' + marker.lines.map(([a, b]) => '<path d="M' + a.x + ' ' + a.y + 'L' + b.x + ' ' + b.y + '"/>').join('') + (marker.circle ? '<circle cx="' + marker.circle.center.x + '" cy="' + marker.circle.center.y + '" r="' + marker.circle.radius + '" fill="' + paper + '"/>' : '') + '</g>';
}
/** Escaped native HTML shared verbatim by both framework hosts; always includes folded fields. */
export function renderErdTable(document: SemanticDocument): string {
  const e = escapeErdXml;
  const entities = Object.values(document.entities).sort((a, b) => a.id < b.id ? -1 : 1);
  const endpoint = (target: string) => { const p = document.ports[target]; return p ? erdText(document.entities[p.owner]!.attributes, 'name') + '.' + p.name : erdText(document.entities[target]?.attributes ?? {}, 'name'); };
  let html = '<details class="st-diagramErdTable"><summary>Entities, fields and relations</summary><table><caption>Entities and fields</caption><thead><tr><th scope="col">Entity</th><th scope="col">Field</th><th scope="col">Type</th><th scope="col">Key</th><th scope="col">Foreign key</th><th scope="col">Nullable</th></tr></thead><tbody>';
  for (const entity of entities)
    for (const field of erdFields(document, entity.id))
      html += '<tr data-erd-table-field="' + e(field.id) + '"><th scope="row">' + e(erdText(entity.attributes, 'name')) + '</th><td>' + e(field.name) + '</td><td>' + e(erdText(field.attributes, 'dataType')) + '</td><td>' + [erdFlag(field, 'pk') ? 'PK' : '', field.attributes.fk ? 'FK' : ''].filter(Boolean).join(' ') + '</td><td>' + e(endpoint(erdText(field.attributes, 'fk'))) + '</td><td>' + (erdFlag(field, 'nullable') ? 'Yes' : 'No') + '</td></tr>';
  html += '</tbody></table><table><caption>Relations</caption><thead><tr><th scope="col">From</th><th scope="col">Cardinality</th><th scope="col">Role</th><th scope="col">To</th><th scope="col">Cardinality</th><th scope="col">Role</th></tr></thead><tbody>';
  for (const relation of Object.values(document.relations).sort((a, b) => a.id < b.id ? -1 : 1))
    html += '<tr data-erd-table-relation="' + e(relation.id) + '">' + ['from', 'to'].map(role => '<td>' + e(endpoint(relation.endpoints.find(end => end.role === role)?.target ?? '')) + '</td><td>' + e(erdText(relation.attributes, role + 'Cardinality')) + '</td><td>' + e(erdText(relation.attributes, role + 'Role') || (role === 'to' ? erdText(relation.attributes, 'label') || erdText(relation.attributes, 'name') : '')) + '</td>').join('') + '</tr>';
  return html + '</tbody></table></details>';
}
export interface ErdLabelEntry {
  readonly id: string;
  readonly route: readonly Vec2[];
  readonly size: {
    readonly width: number;
    readonly height: number;
  };
}
/** Keep every role readable: crowded labels move to a free box with a leader instead of disappearing. */
export function placeErdRoleLabels(entries: readonly ErdLabelEntry[], blockers: readonly Rect[], margin: number): Map<string, {
  box: Rect;
  leader?: readonly Vec2[];
}> {
  const out = new Map<string, {
    box: Rect;
    leader?: readonly Vec2[];
  }>(), occupied = [...blockers];
  const normal = placeEdgeLabels(entries, blockers, margin);
  for (const entry of entries) {
    const placement = normal.get(entry.id);
    if (placement) {
      out.set(entry.id, { box: placement.box });
      occupied.push(placement.box);
    }
  }
  const free = (box: Rect) => occupied.every(b => !rectsIntersect({ x: box.x - margin, y: box.y - margin, width: box.width + 2 * margin, height: box.height + 2 * margin }, b));
  for (const entry of entries) {
    if (out.has(entry.id))
      continue;
    const initial = edgeLabelPlacement(entry.route, entry.size);
    if (!initial)
      continue;
    let box: Rect | undefined;
    for (let ring = 1; ring <= 64 && !box; ring++)
      for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const candidate = { ...initial.box, x: initial.box.x + dx! * ring * ERD_GEOMETRY.rowHeight, y: initial.box.y + dy! * ring * ERD_GEOMETRY.rowHeight };
        if (free(candidate)) {
          box = candidate;
          break;
        }
      }
    if (!box)
      box = { ...initial.box, x: Math.max(0, ...occupied.map(b => b.x + b.width)) + ERD_GEOMETRY.padding };
    const end = { x: Math.max(box.x, Math.min(initial.centre.x, box.x + box.width)), y: Math.max(box.y, Math.min(initial.centre.y, box.y + box.height)) };
    out.set(entry.id, { box, leader: [initial.centre, end] });
    occupied.push(box);
  }
  return out;
}
