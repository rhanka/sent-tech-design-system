import type { Finding, RuleContext } from "../types.js";

export function getNodePath(node: Element | null): string {
  if (!node) return ":root";
  const parts: string[] = [];
  let current: Element | null = node;
  let depth = 0;

  while (current && depth < 6) {
    const tag = current.tagName.toLowerCase();
    const id = current.getAttribute("id");
    const classAttr = (current.getAttribute("class") || "").trim();
    const firstClass = classAttr ? `.${classAttr.split(/\s+/)[0]}` : "";
    const marker = id ? `#${id}` : firstClass;
    const siblingIndex = Array.from(current.parentElement?.children || []).indexOf(current) + 1;
    const selector =
      marker || (siblingIndex > 0 ? `${tag}:nth-child(${siblingIndex})` : tag);
    parts.unshift(marker ? `${tag}${marker}` : selector);
    current = current.parentElement;
    depth += 1;
  }

  return parts.join(" > ");
}

export function hasAnyText(nodes: NodeListOf<Element>, predicate: (value: string) => boolean): boolean {
  for (const node of nodes) {
    const text = node.textContent;
    if (!text) continue;
    if (predicate(text)) return true;
  }
  return false;
}

export function createFindingFromElement(
  ruleId: string,
  severity: Finding["severity"],
  message: string,
  element: Element,
  suggestion?: string
): Finding {
  return {
    ruleId,
    severity,
    message,
    location: getNodePath(element),
    suggestion
  };
}
