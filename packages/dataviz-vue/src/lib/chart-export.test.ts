import { describe, it, expect } from 'vitest';
import {
  serializeSvg,
  svgStringToBlob,
  svgStringToPngBlob,
  downloadBlob,
  downloadSvg,
  downloadPng,
  downloadPdf,
  printElement,
  resolveSvg,
} from './chart-export.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Build a small, deterministic `<svg>` in jsdom (no layout engine needed). */
function makeSvg(): SVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', '120');
  svg.setAttribute('height', '60');
  const rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttribute('x', '0');
  rect.setAttribute('y', '0');
  rect.setAttribute('width', '120');
  rect.setAttribute('height', '60');
  svg.appendChild(rect);
  return svg;
}

describe('serializeSvg', () => {
  it('emits a namespaced, standalone SVG with an XML declaration', () => {
    const out = serializeSvg(makeSvg(), { inlineStyles: false });
    expect(out.startsWith('<?xml version="1.0" encoding="UTF-8" standalone="no"?>')).toBe(true);
    expect(out).toContain(`xmlns="${SVG_NS}"`);
    expect(out).toContain('xmlns:xlink="http://www.w3.org/1999/xlink"');
    expect(out).toContain('version="1.1"');
  });

  it('keeps the source node width/height and derives a viewBox', () => {
    const out = serializeSvg(makeSvg(), { inlineStyles: false });
    expect(out).toContain('width="120"');
    expect(out).toContain('height="60"');
    expect(out).toContain('viewBox="0 0 120 60"');
  });

  it('honours explicit width/height overrides', () => {
    const out = serializeSvg(makeSvg(), { inlineStyles: false, width: 300, height: 150 });
    expect(out).toContain('width="300"');
    expect(out).toContain('height="150"');
    expect(out).toContain('viewBox="0 0 300 150"');
  });

  it('prepends a background rect when a background is requested', () => {
    const out = serializeSvg(makeSvg(), { inlineStyles: false, background: '#ffffff' });
    expect(out).toContain('fill="#ffffff"');
    // Two rects now (background + original) and the background is serialised
    // first — assert on the markup order without relying on attribute layout.
    const rectTags = out.match(/<rect\b[^>]*>/g) ?? [];
    expect(rectTags.length).toBe(2);
    expect(rectTags[0]).toContain('fill="#ffffff"');
    expect(rectTags[0]).toContain('width="100%"');
  });

  it('does not mutate the source node', () => {
    const svg = makeSvg();
    serializeSvg(svg, { inlineStyles: false, background: '#000' });
    expect(svg.getAttribute('xmlns')).toBeNull();
    expect(svg.querySelectorAll('rect').length).toBe(1);
  });

  it('is deterministic with inlineStyles disabled', () => {
    expect(serializeSvg(makeSvg(), { inlineStyles: false })).toBe(
      serializeSvg(makeSvg(), { inlineStyles: false }),
    );
  });
});

describe('svgStringToBlob', () => {
  it('wraps a string in an image/svg+xml Blob', () => {
    const blob = svgStringToBlob('<svg/>');
    expect(blob).toBeInstanceOf(Blob);
    expect(blob?.type).toContain('image/svg+xml');
  });
});

describe('resolveSvg', () => {
  it('returns the element itself when it is an svg', () => {
    const svg = makeSvg();
    document.body.appendChild(svg);
    expect(resolveSvg(svg)).toBe(svg);
    svg.remove();
  });

  it('finds a nested svg inside a container', () => {
    const wrap = document.createElement('div');
    const svg = makeSvg();
    wrap.appendChild(svg);
    document.body.appendChild(wrap);
    expect(resolveSvg(wrap)).toBe(svg);
    wrap.remove();
  });

  it('resolves by CSS selector', () => {
    const wrap = document.createElement('div');
    wrap.id = 'chart-host';
    wrap.appendChild(makeSvg());
    document.body.appendChild(wrap);
    expect(resolveSvg('#chart-host')?.tagName.toLowerCase()).toBe('svg');
    wrap.remove();
  });

  it('returns null for a missing target', () => {
    expect(resolveSvg(null)).toBeNull();
    expect(resolveSvg('#does-not-exist')).toBeNull();
  });
});

describe('rasterisation / download (jsdom no-op guards)', () => {
  it('svgStringToPngBlob resolves to null in jsdom (no canvas decode)', async () => {
    expect(await svgStringToPngBlob(serializeSvg(makeSvg(), { inlineStyles: false }))).toBeNull();
  });

  it('downloadPng reports false when rasterisation is unavailable', async () => {
    expect(await downloadPng(makeSvg(), 'chart.png', { inlineStyles: false })).toBe(false);
  });

  it('downloadPdf reports false (no-op) when the SVG has no resolvable dimensions', async () => {
    // A bare, dimensionless <svg> bails before the lazy jspdf/svg2pdf import.
    const bare = document.createElementNS(SVG_NS, 'svg') as SVGElement;
    expect(await downloadPdf(bare, 'chart.pdf')).toBe(false);
  });

  it('downloadBlob does not throw', () => {
    expect(() => downloadBlob(new Blob(['x']), 'x.txt')).not.toThrow();
  });

  it('downloadSvg does not throw', () => {
    expect(() => downloadSvg(makeSvg(), 'chart.svg', { inlineStyles: false })).not.toThrow();
  });

  it('printElement does not throw with or without a target', () => {
    expect(() => printElement()).not.toThrow();
    expect(() => printElement(makeSvg())).not.toThrow();
  });
});
