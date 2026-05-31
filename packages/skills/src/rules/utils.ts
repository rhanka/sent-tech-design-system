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

export interface CssDeclaration {
  property: string;
  value: string;
}

export interface CssRuleBlock {
  selector: string;
  declarations: CssDeclaration[];
  location: string;
}

export function isSentropicToken(value: string): boolean {
  return /var\(\s*--st-/i.test(value);
}

export function parseCssLengthPx(value: string): number | undefined {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === "0") return 0;

  const px = trimmed.match(/^(-?[0-9]+(?:\.[0-9]+)?)px$/);
  if (px) return Number(px[1]);

  const rem = trimmed.match(/^(-?[0-9]+(?:\.[0-9]+)?)rem$/);
  if (rem) return Number(rem[1]) * 16;

  return undefined;
}

export function parseDeclarations(style: string): CssDeclaration[] {
  return style
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separator = part.indexOf(":");
      if (separator === -1) return null;
      return {
        property: part.slice(0, separator).trim().toLowerCase(),
        value: part.slice(separator + 1).trim()
      };
    })
    .filter((decl): decl is CssDeclaration => decl !== null);
}

export function getDeclaration(declarations: CssDeclaration[], property: string): string | undefined {
  const normalized = property.toLowerCase();
  return declarations.find((decl) => decl.property === normalized)?.value;
}

export function extractCssRuleBlocks(context: RuleContext): CssRuleBlock[] {
  const blocks: CssRuleBlock[] = [];

  context.document.querySelectorAll("style").forEach((styleElement, styleIndex) => {
    const css = styleElement.textContent || "";
    const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, "");
    const ruleRe = /([^{}@]+)\{([^{}]+)\}/g;
    let match: RegExpExecArray | null;

    while ((match = ruleRe.exec(cleaned)) !== null) {
      const selector = match[1].trim();
      const body = match[2].trim();
      if (!selector || !body) continue;
      blocks.push({
        selector,
        declarations: parseDeclarations(body),
        location: `style[${styleIndex + 1}] ${selector}`
      });
    }
  });

  return blocks;
}

export function extractInlineStyleBlocks(context: RuleContext): Array<{ element: HTMLElement; declarations: CssDeclaration[] }> {
  return Array.from(context.document.querySelectorAll<HTMLElement>("[style]"))
    .map((element) => ({
      element,
      declarations: parseDeclarations(element.getAttribute("style") || "")
    }))
    .filter((entry) => entry.declarations.length > 0);
}
