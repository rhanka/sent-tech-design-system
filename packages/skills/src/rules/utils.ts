import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
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

const linkedCssCache = new Map<string, string | undefined>();

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

function extractRuleBlocksFromCss(css: string, locationPrefix: string): CssRuleBlock[] {
  const blocks: CssRuleBlock[] = [];
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
      location: `${locationPrefix} ${selector}`
    });
  }

  return blocks;
}

export function extractCssRuleBlocks(context: RuleContext): CssRuleBlock[] {
  const blocks: CssRuleBlock[] = [];

  context.document.querySelectorAll("style").forEach((styleElement, styleIndex) => {
    const css = styleElement.textContent || "";
    blocks.push(...extractRuleBlocksFromCss(css, `style[${styleIndex + 1}]`));
  });

  return blocks;
}

function cleanStylesheetHref(href: string): string | undefined {
  const clean = href.trim().split("#")[0]?.split("?")[0] ?? "";
  if (!clean || /^data:/i.test(clean) || /^https?:\/\//i.test(clean) || clean.startsWith("//")) {
    return undefined;
  }
  return clean;
}

function resolveLinkedStylesheetPath(targetPath: string, href: string): string | undefined {
  const cleanHref = cleanStylesheetHref(href);
  if (!cleanHref) return undefined;

  if (cleanHref.startsWith("file://")) {
    try {
      return fileURLToPath(cleanHref);
    } catch {
      return undefined;
    }
  }

  const targetDir = dirname(resolve(targetPath));
  if (!cleanHref.startsWith("/")) {
    return resolve(targetDir, cleanHref);
  }

  const relativeHref = cleanHref.slice(1);
  let currentDir = targetDir;
  while (true) {
    const candidate = resolve(currentDir, relativeHref);
    if (existsSync(candidate)) return candidate;
    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }

  return undefined;
}

function readLinkedCss(path: string): string | undefined {
  if (linkedCssCache.has(path)) return linkedCssCache.get(path);
  try {
    const css = readFileSync(path, "utf8");
    linkedCssCache.set(path, css);
    return css;
  } catch {
    linkedCssCache.set(path, undefined);
    return undefined;
  }
}

export function extractLinkedCssRuleBlocks(context: RuleContext): CssRuleBlock[] {
  if (context.target.kind !== "file") return [];

  const blocks: CssRuleBlock[] = [];
  const seen = new Set<string>();
  context.document.querySelectorAll<HTMLLinkElement>("link[rel~='stylesheet'][href]").forEach((link) => {
    const stylesheetPath = resolveLinkedStylesheetPath(context.target.value, link.getAttribute("href") || "");
    if (!stylesheetPath || seen.has(stylesheetPath)) return;
    seen.add(stylesheetPath);

    const css = readLinkedCss(stylesheetPath);
    if (!css) return;
    blocks.push(...extractRuleBlocksFromCss(css, stylesheetPath));
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
