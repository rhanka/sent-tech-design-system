/** Browser-only font read; the layout/cache still own geometry. */
import { CARD_GEOMETRY, createCardMeasure,
  type CardLineMeasure } from './diagramCardModel.js';
import type { SceneModel } from '@sentropic/diagram-canvas/diagramSceneModel';

export function measureRenderedSceneFont(frame: HTMLElement, _scene: SceneModel, _previous: CardLineMeasure): CardLineMeasure | undefined {
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
  const heights = Object.fromEntries(Object.keys(fonts).map(role => {
    context.font = fonts[role as keyof typeof selectors].font;
    const metrics = context.measureText('Mg');
    return [role, (metrics.fontBoundingBoxAscent ?? 0) + (metrics.fontBoundingBoxDescent ?? 0)];
  })) as Record<keyof typeof selectors, number>;
  const measured = createCardMeasure(widthOf, version + ':' + JSON.stringify(heights), true, role => heights[role]);
  // A14 uses the loaded face for ellipses even when line counts do not change.
  return measured;
}
