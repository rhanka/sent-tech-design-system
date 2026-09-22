/**
 * chart-export — framework-agnostic, dependency-free helpers to export a chart's
 * `<svg>` node as a standalone SVG string, rasterise it to a PNG `Blob`, trigger
 * a file download, or print it. Every browser-only path (`document`, `window`,
 * `Image`, `<canvas>`, `URL.createObjectURL`) is guarded so the module is safe to
 * import under SSR / jsdom; the pure `serializeSvg` core is deterministic and is
 * unit-tested without a real canvas.
 *
 * The presentation layer lives entirely in `@sentropic/design-system-*`; this
 * module only serialises whatever SVG the design-system charts already rendered.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

export type SerializeSvgOptions = {
  /** Force a width on the root `<svg>` (px). Defaults to the node's own width. */
  width?: number;
  /** Force a height on the root `<svg>` (px). Defaults to the node's own height. */
  height?: number;
  /**
   * Inline the *computed* style of every element as a `style` attribute so the
   * standalone SVG renders without the page's stylesheet. Requires
   * `window.getComputedStyle`; silently skipped when unavailable (SSR/jsdom).
   * Defaults to `true`.
   */
  inlineStyles?: boolean;
  /** Background fill painted behind the chart (e.g. `#ffffff`). Omit for transparent. */
  background?: string;
};

export type RasterizeOptions = SerializeSvgOptions & {
  /** Device-pixel multiplier for a crisper PNG (default 2). */
  scale?: number;
  /** PNG background; defaults to `#ffffff` (PNG has no transparency story here). */
  background?: string;
  /** Canvas image MIME type (default `image/png`). */
  type?: string;
  /** Quality 0..1 for lossy types. */
  quality?: number;
};

export type PdfExportOptions = {
  /** Force a page width (px → pt 1:1). Defaults to the SVG's own width. */
  width?: number;
  /** Force a page height. Defaults to the SVG's own height. */
  height?: number;
  /** Solid page background painted behind the vector (e.g. `#ffffff`). Omit for white page. */
  background?: string;
};

/** True when running somewhere with a usable DOM (browser, not SSR). */
function hasDom(): boolean {
  return typeof document !== 'undefined' && typeof window !== 'undefined';
}

/** Read a numeric pixel dimension off an `<svg>`, falling back to its bbox/attrs. */
function svgDimension(svg: SVGElement, axis: 'width' | 'height'): number | undefined {
  const attr = svg.getAttribute(axis);
  if (attr && /^\d*\.?\d+$/.test(attr.trim())) return Number(attr);
  const viewBox = svg.getAttribute('viewBox');
  if (viewBox) {
    const parts = viewBox.split(/[ ,]+/).map(Number);
    if (parts.length === 4) return axis === 'width' ? parts[2] : parts[3];
  }
  // `clientWidth`/`getBBox` only exist in a real layout engine; guard for jsdom.
  const client = axis === 'width' ? svg.clientWidth : svg.clientHeight;
  if (client) return client;
  return undefined;
}

/** Inline `getComputedStyle` onto `target` (and recurse) — browser only. */
function inlineComputedStyles(source: Element, target: Element): void {
  if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') return;
  const computed = window.getComputedStyle(source);
  if (computed && computed.length) {
    let css = '';
    for (let i = 0; i < computed.length; i += 1) {
      const prop = computed.item(i);
      css += `${prop}:${computed.getPropertyValue(prop)};`;
    }
    target.setAttribute('style', css);
  }
  const sourceChildren = source.children;
  const targetChildren = target.children;
  for (let i = 0; i < sourceChildren.length; i += 1) {
    inlineComputedStyles(sourceChildren[i], targetChildren[i]);
  }
}

/**
 * Serialise an `SVGElement` to a standalone, namespaced SVG string: clones the
 * node, ensures `xmlns`/`xmlns:xlink`, applies explicit width/height, optionally
 * inlines computed styles and a background rect, and emits an XML declaration.
 *
 * Pure with respect to its inputs (the source node is never mutated) and
 * deterministic when `inlineStyles` is false — the unit tests rely on that.
 */
export function serializeSvg(svg: SVGElement, options: SerializeSvgOptions = {}): string {
  const { width, height, inlineStyles = true, background } = options;
  const clone = svg.cloneNode(true) as SVGElement;

  clone.setAttribute('xmlns', SVG_NS);
  if (!clone.getAttribute('xmlns:xlink')) clone.setAttribute('xmlns:xlink', XLINK_NS);
  clone.setAttribute('version', '1.1');

  const w = width ?? svgDimension(svg, 'width');
  const h = height ?? svgDimension(svg, 'height');
  if (w != null) clone.setAttribute('width', String(w));
  if (h != null) clone.setAttribute('height', String(h));
  if (!clone.getAttribute('viewBox') && w != null && h != null) {
    clone.setAttribute('viewBox', `0 0 ${w} ${h}`);
  }

  if (inlineStyles) inlineComputedStyles(svg, clone);

  if (background) {
    const ownerDoc = svg.ownerDocument ?? (hasDom() ? document : undefined);
    if (ownerDoc) {
      const rect = ownerDoc.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('x', '0');
      rect.setAttribute('y', '0');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', background);
      clone.insertBefore(rect, clone.firstChild);
    }
  }

  const markup = new XMLSerializer().serializeToString(clone);
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n${markup}`;
}

/** Wrap an SVG string in a UTF-8 `image/svg+xml` Blob (browser only → null). */
export function svgStringToBlob(svgString: string): Blob | null {
  if (typeof Blob === 'undefined') return null;
  return new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
}

/**
 * Rasterise a standalone SVG string to a PNG `Blob` through an offscreen
 * `<canvas>` + `Image`. Resolves to `null` (never throws) wherever the browser
 * APIs are missing — that covers SSR and jsdom, where `Image`/`canvas` decoding
 * is unavailable, so callers can treat `null` as "not in a browser".
 */
export async function svgStringToPngBlob(
  svgString: string,
  options: RasterizeOptions = {},
): Promise<Blob | null> {
  const { scale = 2, background = '#ffffff', type = 'image/png', quality } = options;
  if (!hasDom() || typeof Image === 'undefined' || typeof URL === 'undefined') return null;
  if (typeof URL.createObjectURL !== 'function') return null;

  // Probe for a *real* canvas 2d context before touching the (potentially
  // never-resolving) image loader. jsdom returns `null` here — which lets us
  // bail with a clean `null` instead of hanging on an `Image` that never fires
  // `load`/`error`. Real browsers return a context and proceed.
  const probe = document.createElement('canvas');
  if (typeof probe.getContext !== 'function' || !probe.getContext('2d')) return null;

  const blob = svgStringToBlob(svgString);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);

  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    const baseW = img.naturalWidth || options.width || 0;
    const baseH = img.naturalHeight || options.height || 0;
    if (!baseW || !baseH) return null;
    canvas.width = Math.round(baseW * scale);
    canvas.height = Math.round(baseH * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await canvasToBlob(canvas, type, quality);
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('svg image decode failed'));
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (typeof canvas.toBlob === 'function') {
      canvas.toBlob((b) => resolve(b), type, quality);
    } else {
      resolve(null);
    }
  });
}

/**
 * Trigger a browser download for a `Blob` via a temporary anchor. No-op (and
 * never throws) when `URL.createObjectURL`/`document` are unavailable, mirroring
 * the existing ExportMenu CSV path.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  if (!hasDom() || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.click();
  URL.revokeObjectURL(url);
}

/** Serialise an `<svg>` and download it as a `.svg` file. */
export function downloadSvg(
  svg: SVGElement,
  filename = 'chart.svg',
  options: SerializeSvgOptions = {},
): void {
  const blob = svgStringToBlob(serializeSvg(svg, options));
  if (blob) downloadBlob(blob, filename);
}

/**
 * Rasterise an `<svg>` to PNG and download it. Resolves to `true` when a file was
 * produced, `false` when rasterisation was unavailable (SSR/jsdom) — handy for
 * callers and tests that want to assert the no-op path without a real canvas.
 */
export async function downloadPng(
  svg: SVGElement,
  filename = 'chart.png',
  options: RasterizeOptions = {},
): Promise<boolean> {
  const blob = await svgStringToPngBlob(serializeSvg(svg, options), options);
  if (!blob) return false;
  downloadBlob(blob, filename);
  return true;
}

/** Parse a `#rrggbb` (or `rrggbb`) hex string to an `[r, g, b]` triple. */
function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const value = Number.parseInt(match[1]!, 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

/**
 * Export an `<svg>` to a *true vector* PDF (not a rasterised page) and download
 * it. `jspdf` + `svg2pdf.js` are loaded lazily via dynamic `import()`, so they
 * never enter the main bundle and this module stays statically dependency-free
 * and SSR-safe. The live SVG (with its computed styles) is converted to PDF
 * drawing operations, so text and shapes stay crisp at any zoom.
 *
 * Resolves to `true` when a file was produced, `false` on the no-op path (SSR /
 * jsdom, missing dimensions, or a conversion failure) — mirroring
 * {@link downloadPng}.
 */
export async function downloadPdf(
  svg: SVGElement,
  filename = 'chart.pdf',
  options: PdfExportOptions = {},
): Promise<boolean> {
  if (!hasDom()) return false;
  const width = options.width ?? svgDimension(svg, 'width') ?? 0;
  const height = options.height ?? svgDimension(svg, 'height') ?? 0;
  if (!(width > 0) || !(height > 0)) return false;

  try {
    const [{ jsPDF }, { svg2pdf }] = await Promise.all([
      import('jspdf'),
      import('svg2pdf.js'),
    ]);
    const pdf = new jsPDF({
      orientation: width >= height ? 'landscape' : 'portrait',
      unit: 'pt',
      format: [width, height],
    });
    const rgb = options.background ? hexToRgb(options.background) : null;
    if (rgb) {
      pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
      pdf.rect(0, 0, width, height, 'F');
    }
    await svg2pdf(svg, pdf, { x: 0, y: 0, width, height });
    pdf.save(filename);
    return true;
  } catch {
    return false;
  }
}

/**
 * Print path (PDF via the browser's "Save as PDF"): opens the print dialog. When
 * a `target` is given it is cloned into a transient, full-page print container so
 * only the chart prints; otherwise the whole document prints. No-op under SSR.
 */
export function printElement(target?: Element | string | null): void {
  if (!hasDom() || typeof window.print !== 'function') return;
  const el = typeof target === 'string' ? document.querySelector(target) : (target ?? null);
  if (!el) {
    safePrint();
    return;
  }
  const PRINT_ID = 'st-dataviz-print-root';
  document.getElementById(PRINT_ID)?.remove();
  const holder = document.createElement('div');
  holder.id = PRINT_ID;
  holder.setAttribute('data-dataviz-print', 'true');
  holder.appendChild(el.cloneNode(true));
  document.body.appendChild(holder);

  const style = document.createElement('style');
  style.setAttribute('data-dataviz-print', 'true');
  style.textContent =
    '@media print{body>*{display:none!important}' +
    `#${PRINT_ID}{display:block!important}}`;
  document.head.appendChild(style);

  const cleanup = () => {
    holder.remove();
    style.remove();
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  safePrint();
}

/** Invoke `window.print()` without letting environments that stub it (jsdom) throw. */
function safePrint(): void {
  try {
    window.print();
  } catch {
    /* `window.print` is a not-implemented stub under jsdom; ignore. */
  }
}

/** Export format understood by the ChartExport menu. */
export type ChartExportFormat = 'csv' | 'png' | 'svg' | 'pdf' | 'print';

/**
 * Resolve a chart's `<svg>` from a target that may be the SVG itself, a container
 * element to search within, or a CSS selector. Returns `null` when nothing
 * matches or when there is no DOM.
 */
export function resolveSvg(
  target: Element | string | null | undefined,
  root?: ParentNode | null,
): SVGElement | null {
  if (!hasDom()) return null;
  let el: Element | null = null;
  if (typeof target === 'string') {
    el = (root ?? document).querySelector(target);
  } else if (target) {
    el = target;
  }
  if (!el) return null;
  if (el instanceof SVGSVGElement || el.tagName.toLowerCase() === 'svg') return el as SVGElement;
  return el.querySelector('svg');
}
