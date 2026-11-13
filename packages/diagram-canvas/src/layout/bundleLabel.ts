import type { LineLayout, LineMeasurer } from './measure.js';
export interface BundleLabelGroup { readonly lines: readonly string[]; readonly top: number; readonly height: number }
export function measureBundleLabel(relations: readonly string[], measure: LineMeasurer, maxWidth = 320, relationCount = relations.length) {
  const line = (text: string, width: number) => measure({ text, role: 'edge-label', availableWidth: width,
    allocatedLines: Number.MAX_SAFE_INTEGER, folded: false });
  const header = `${relationCount} liaisons`;
  const heading = line(header, maxWidth - 8);
  let top = heading.height + 8;
  const groups: BundleLabelGroup[] = relations.map(text => {
    const measured = line(text, maxWidth - 24);
    const group = { lines: measured.lines, top, height: measured.height + 8 };
    top += group.height;
    return group;
  });
  const layout: LineLayout = { lines: [header, ...groups.flatMap(group => group.lines)], width: maxWidth, height: top, overflow: false };
  return { header, groups, layout };
}
