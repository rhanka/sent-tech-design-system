/**
 * Rendered-markup comparator for the Angular ↔ React dataviz adapters.
 *
 * Both sides are flattened into an order-sensitive list of `<tag attr=…>` /
 * `#text` entries, then diffed position by position. Every diff count this
 * harness prints depends on this file: a stricter or looser allowlist moves the
 * numbers without changing the conclusions, which is why the normaliser lives in
 * the repository next to the table it produces.
 *
 * The allowlist absorbs differences that belong to the DESIGN SYSTEM packages
 * (components-angular vs components-react), not to the adapters:
 *
 *  - `data-st-component`  : emitted by every DS Angular component, by no DS React one.
 *  - `<st-*>` host element: Angular components have one, React/Vue render none.
 *  - generated ids        : Angular counters/Math.random() vs React `useId()`.
 *  - `style` formatting   : Angular writes `a: b; c: d;`, React `a:b;c:d`.
 *  - empty `class=""`     : React renders it, Angular omits the attribute.
 *  - class token ORDER    : Angular's class binding diffs tokens, so it does not
 *                           preserve the order of the string it is given.
 *  - `xmlns` / `lucide-*` : carried by the React icon helper only.
 */
const ID_ATTRS = new Set([
  'id',
  'for',
  'aria-describedby',
  'aria-controls',
  'aria-labelledby',
  'aria-activedescendant',
  'fill',
  'clip-path',
  'href',
  'xlink:href',
]);
const DROP_ATTR = /^(ng-reflect-|_ngcontent|_nghost|ng-version|jsaction|data-st-component$|xmlns$)/;
// A generated id is either `<prefix>-<generated>` or React's bare `useId()` value
// (`_R_0_`), which carries no prefix at all.
const GENERATED_ID = /^(?:#|url\(#)?(?:[A-Za-z][A-Za-z-]*-(?:_R_[^_]*_|\d+|[A-Za-z0-9]{5,9})|_R_[A-Za-z0-9]*_)\)?$/;

function normalizeValue(name: string, value: string): string {
  if (name === 'style') {
    return value
      .split(';')
      .map((part) => part.trim().replace(/\s*:\s*/, ':'))
      .filter(Boolean)
      .sort()
      .join(';');
  }
  if (name === 'class') {
    return value
      .split(/\s+/)
      .filter((token) => token && !/^lucide(-|$)/.test(token))
      .sort()
      .join(' ');
  }
  if (ID_ATTRS.has(name) && GENERATED_ID.test(value)) {
    return value.startsWith('url(') ? 'url(#GENERATED-ID)' : 'GENERATED-ID';
  }
  return value;
}

export type Entry = string;

/** Flatten an element tree into an order-sensitive list of tag + sorted attributes + text. */
export function flatten(root: Element): Entry[] {
  const out: Entry[] = [];
  const visit = (node: Node): void => {
    if (node.nodeType === 8) return; // comment (Angular @if/@for anchors)
    if (node.nodeType === 3) {
      const text = (node.textContent ?? '').replace(/\s+/g, ' ').trim();
      if (text) out.push(`#text ${text}`);
      return;
    }
    if (node.nodeType !== 1) return;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const unwrap = /^st-[a-z0-9-]+$/.test(tag);
    if (!unwrap) {
      const attrs = Array.from(el.attributes)
        .filter((a) => !DROP_ATTR.test(a.name))
        .map((a) => [a.name, normalizeValue(a.name, a.value)] as const)
        .filter(([name, value]) => !(name === 'class' && value === ''))
        .map(([name, value]) => `${name}="${value}"`)
        .sort();
      out.push(`<${tag} ${attrs.join(' ')}>`);
    }
    for (const child of Array.from(el.childNodes)) visit(child);
    if (!unwrap) out.push(`</${tag}>`);
  };
  for (const child of Array.from(root.childNodes)) visit(child);
  return out;
}

export function flattenHtml(html: string): Entry[] {
  const host = document.createElement('div');
  host.innerHTML = html;
  return flatten(host);
}

/**
 * The user- and assistive-technology-visible content of a render: every text node
 * plus every `aria-label`, `placeholder`, `title` and `alt` value, in document
 * order — independent of which elements the design system wrapped them in.
 */
export function textSignature(entries: Entry[]): string[] {
  const out: string[] = [];
  for (const entry of entries) {
    if (entry.startsWith('#text ')) {
      out.push(entry.slice(6));
      continue;
    }
    for (const match of entry.matchAll(/\b(aria-label|placeholder|title|alt)="([^"]*)"/g)) {
      out.push(`${match[1]}=${match[2]}`);
    }
  }
  return out;
}

export function diff(a: Entry[], b: Entry[]): string[] {
  const out: string[] = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (a[i] !== b[i]) out.push(`#${i}\n  angular: ${a[i] ?? '(none)'}\n  react:   ${b[i] ?? '(none)'}`);
  }
  return out;
}
