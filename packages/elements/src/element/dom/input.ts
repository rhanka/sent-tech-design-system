/**
 * The two input channels of every element (§4.2, §6.5): the render envelope
 * through the `envelope` JS property or a child
 * `<script type="application/json">` data island (never an attribute — §6.2:
 * no attribute carries data), and the host configuration through the
 * `hostConfig` JS property or the page's `#st-host-config` island.
 *
 * The island is re-read through a MutationObserver, so a host that replaces
 * the island re-renders without touching the property. A malformed island
 * is not a crash: the RAW TEXT reaches the validator, which refuses it as a
 * §4.5 diagnostic (the error panel shows it; the element is never blank).
 */

/** One data island's parsed JSON, or the raw text when it does not parse. */
export type IslandInput = { readonly value: unknown; readonly parsed: boolean };

/** Read one `<script type="application/json">` data island. */
export function readJsonIsland(script: Element | null): IslandInput | undefined {
  if (script === null || script.textContent === null) return undefined;
  const text = script.textContent;
  try {
    return { value: JSON.parse(text) as unknown, parsed: true };
  } catch {
    return { value: text, parsed: false };
  }
}

/**
 * The element's envelope island: the first JSON script among its children.
 * A child that is not a JSON island (the host's own markup) is ignored.
 */
export function readEnvelopeIsland(element: HTMLElement): IslandInput | undefined {
  for (const child of element.children) {
    if (child instanceof HTMLScriptElement && child.type === "application/json") {
      return readJsonIsland(child);
    }
  }
  return undefined;
}

/** The page's host configuration island (§6.5), when the host provides one. */
export function readHostConfigIsland(document: Document): unknown {
  const island = document.getElementById("st-host-config");
  if (island === null) return undefined;
  const parsed = readJsonIsland(island);
  return parsed !== undefined && parsed.parsed ? parsed.value : undefined;
}

/**
 * Watch the element's light children for island changes (a replaced or
 * added envelope island re-renders). Returns the disconnect handle.
 */
export function observeEnvelopeIsland(
  element: HTMLElement,
  onChange: (input: IslandInput | undefined) => void,
): () => void {
  const observer = new MutationObserver(() => {
    onChange(readEnvelopeIsland(element));
  });
  observer.observe(element, { childList: true, subtree: false });
  return () => observer.disconnect();
}

/**
 * The mount action that feeds the envelope ISLAND channel into the wrapper
 * (§4.2): reads the element's JSON island once at mount, then observes the
 * light children for its replacement. The `apply` callback carries the
 * parsed value (or the raw text of a malformed island — the validator
 * refuses it as a §4.5 diagnostic, the panel shows it).
 */
export function envelopeIslandInput(
  node: HTMLElement,
  options: { apply: (value: unknown) => void },
): { destroy: () => void } {
  const root = node.getRootNode();
  const host = root instanceof ShadowRoot && root.host instanceof HTMLElement ? root.host : undefined;
  let stop: (() => void) | undefined;
  if (host !== undefined) {
    const island = readEnvelopeIsland(host);
    if (island !== undefined) options.apply(island.value);
    stop = observeEnvelopeIsland(host, (next) => {
      options.apply(next === undefined ? undefined : next.value);
    });
  }
  return {
    destroy() {
      stop?.();
    },
  };
}
