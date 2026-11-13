/** Clone the reference without rewriting its SVG contract. Diagram controls
 * compose DS Icon in bare mode, preserving the Svelte attributes. */
export function withControlIconTokens(element: Element): Element {
  return element.cloneNode(true) as Element;
}
