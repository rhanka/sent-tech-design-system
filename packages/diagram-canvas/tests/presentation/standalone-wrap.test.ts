import { expect, it } from 'vitest';
import { defaultCardMeasure, layoutCard, layoutZone } from '../../src/presentation/diagramCardModel.js';
import { renderCardSvg } from '../../src/presentation/renderCardSvg.js';
import { renderZoneSvg } from '../../src/presentation/renderZoneSvg.js';

const identifier = 'W'.repeat(100);
it('should preserve long identifiers inside every default standalone card and zone slot (A11)', () => {
  const card = { entityId: 'long', kicker: identifier, title: identifier, body: [identifier], footer: identifier };
  const zone = { entityId: 'zone', kicker: identifier, title: identifier, subtitle: identifier, footer: identifier };
  const layouts = [layoutCard(card, defaultCardMeasure), ...[true, false].map(collapsed => layoutZone({ ...zone, collapsed, width: 600 }, defaultCardMeasure))];
  for (const layout of layouts) {
    expect(layout.diagnostics.filter(d => /overflow/.test(d.code))).toEqual([]);
    const c = 'collapsed' in layout ? layout.card : layout;
    const h = 'header' in layout ? layout.header : undefined;
    const slots = c ? [[c.kicker, 'kicker', c.headerTextWidth], [c.title, 'title', c.headerTextWidth], [c.body, 'body', c.bodyWidth], [c.footerLines, 'footer', c.box.width - 26]] as const
      : [[h!.kicker, 'kicker', h!.headerTextWidth], [h!.title, 'title', h!.headerTextWidth], [h!.subtitle, 'body', h!.subtitleWidth], [h!.footer, 'footer', layout.box.width - 32]] as const;
    for (const [lines, role, width] of slots) {
      expect(lines.map(line => line.text).join('')).toBe(identifier);
      for (const line of lines) expect(defaultCardMeasure(line.text, role, Number.MAX_SAFE_INTEGER).lineWidths![0]).toBeLessThanOrEqual(width);
    }
  }
  for (const rendered of [renderCardSvg(card), ...[true, false].map(collapsed => renderZoneSvg({ ...zone, collapsed, width: 600 }))]) {
    expect(rendered.kind).toBe('rendered');
    expect(rendered.diagnostics.filter(d => /overflow/.test(d.code))).toEqual([]);
  }
});

it('should retain unknown-icon diagnostics in both zone fold states (Carbon B3)', () => {
  for (const collapsed of [true, false]) {
    const rendered = renderZoneSvg({ entityId: 'unknown', title: 'Zone', icon: 'unmapped', collapsed, width: 600 });
    expect(rendered.diagnostics.some(d => d.code === 'zone-icon-unknown')).toBe(true);
    expect(rendered.kind).toBe('rendered');
    if (rendered.kind !== 'rendered') throw new Error('zone refused');
    expect(rendered.svg).toContain('data-zone-icon-unknown=');
  }
});
