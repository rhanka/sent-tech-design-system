/** Apply only the reviewed Vue DS Icon migration to Svelte control witnesses.
 * All geometry, sizes, labels and surrounding diagram markup still compare. */
export function withControlIconTokens(element: Element): Element {
  const copy = element.cloneNode(true) as Element;
  for (const icon of copy.querySelectorAll('svg.lucide-plus,svg.lucide-minus')) {
    icon.classList.add('st-icon');
    icon.setAttribute('stroke-width', '2.25');
    icon.setAttribute('focusable', 'false');
  }
  return copy;
}
