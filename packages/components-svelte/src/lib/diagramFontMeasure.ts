import { measureBundleLabel } from '@sentropic/diagram-canvas';
/** Browser-only font read; the layout/cache still own geometry. */
import { CARD_GEOMETRY, cardLineMeasurer, createCardMeasure, layoutCard, layoutZone, projectCardProps, projectZoneProps,
  type CardLineMeasure } from './diagramCardModel.js';
import type { SceneModel } from '@sentropic/diagram-canvas/diagramSceneModel';

export function measureRenderedSceneFont(frame: HTMLElement, scene: SceneModel, previous: CardLineMeasure): CardLineMeasure | undefined {
  const card = frame.querySelector<HTMLElement>('.st-diagramCard, .st-diagramZone--expanded');
  if (card === null) return undefined;
  const context = frame.ownerDocument.createElement('canvas').getContext('2d');
  if (context === null) return undefined;
  const root = getComputedStyle(card);
  const selectors = { kicker: '.st-diagramCard-kicker', title: '.st-diagramCard-title',
    body: '.st-diagramCard-line, .st-diagramZone-subtitle', footer: '.st-diagramCard-footer, .st-diagramZone-footer' };
  const fonts = Object.fromEntries(Object.entries(selectors).map(([role, selector]) => {
    const element = frame.querySelector<HTMLElement>(selector);
    const geometry = CARD_GEOMETRY[role as keyof typeof selectors];
    if (element === null) return [role, {
      font: geometry.weight + ' ' + geometry.size + 'px ' + (root.fontFamily || 'Inter, system-ui, sans-serif'),
      spacing: role === 'kicker' ? 0.04 * geometry.size : 0,
    }];
    const style = getComputedStyle(element);
    return [role, { font: style.font || (style.fontWeight || geometry.weight) + ' ' +
      (style.fontSize || geometry.size + 'px') + ' ' + (style.fontFamily || root.fontFamily || 'Inter, system-ui, sans-serif'),
      spacing: parseFloat(style.letterSpacing) || (role === 'kicker' ? 0.04 * geometry.size : 0) }];
  })) as Record<keyof typeof selectors, { font: string; spacing: number }>;
  const widthOf = (text: string, role: keyof typeof selectors) => {
    const font = fonts[role];
    context.font = font.font;
    const normalized = role === 'kicker' ? text.toUpperCase() : text;
    return context.measureText(normalized).width + normalized.length * font.spacing + 2;
  };
  const version = 'computed-font:' + JSON.stringify(fonts) + ':' + Object.keys(fonts).map(role => widthOf('Mm09 É—', role as keyof typeof selectors)).join(',');
  const measured = createCardMeasure(widthOf, version, true);
  const resolveGlyph = () => ({ face: '' });
  for (const node of scene.nodes) {
    const projected = node.kind === 'zone'
      ? projectZoneProps(node.presentation, { entityId: node.entity, collapsed: node.collapsed,
          width: node.rect.width, height: node.rect.height, toggleLabel: 'toggle', resolveGlyph })
      : projectCardProps(node.presentation, { entityId: node.entity, resolveGlyph });
    if (projected.kind === 'label') continue;
    const layout = (measure: CardLineMeasure) => projected.kind === 'zone'
      ? layoutZone({ ...projected.props, autoSize: true }, measure)
      : layoutCard({ ...projected.props, height: node.rect.height, autoSize: true }, measure);
    const before = layout(previous), after = layout(measured);
    if (after.box.height > node.rect.height) return measured;
    // More wrapped header/body lines also need a new layout even if spare
    // space above the footer happens to absorb the extra height.
    const lines = (value: typeof before) => 'collapsed' in value
      ? [...(value.card?.title ?? value.header?.title ?? []), ...(value.card?.body ?? value.header?.subtitle ?? [])].length
      : value.title.length + value.body.length;
    if (lines(after) > lines(before)) return measured;
  }
  const lines = cardLineMeasurer(measured);
  for (const label of scene.labels) {
    const layout = label.bundle === undefined
      ? lines({ text: label.lines.join(' '), role: 'edge-label', availableWidth: 400, allocatedLines: 1 })
      : measureBundleLabel(label.bundle.groups.map(group => group.lines.join(' ')), lines, label.box.width).layout;
    if (layout.width > label.box.width + 0.01 || layout.height > label.box.height) return measured;
  }
  return undefined;
}
