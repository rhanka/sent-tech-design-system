import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Finding, Rule, RuleContext } from "../types.js";
import {
  extractCssRuleBlocks,
  extractInlineStyleBlocks,
  extractLinkedCssRuleBlocks,
  type CssRuleBlock
} from "./utils.js";

const INTERACTIVE_PROPERTIES = new Set([
  "background",
  "background-color",
  "color",
  "border",
  "border-color",
  "fill",
  "stroke",
  "box-shadow"
]);

const DARK_MODE_MEDIA_RE = /@media[^{]*\(\s*[^{}]*prefers-color-scheme\s*:\s*(?:light|dark)\b[^{}]*\)/i;

const linkedCssCache = new Map<string, string | undefined>();

function cleanStylesheetHref(href: string): string | undefined {
  const clean = href.trim().split("#")[0]?.split("?")[0] ?? "";
  if (!clean) return undefined;
  if (/^data:/i.test(clean) || /^https?:\/\//i.test(clean) || clean.startsWith("//")) {
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
    const candidate = resolve(targetDir, cleanHref);
    return existsSync(candidate) ? candidate : undefined;
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

function readLinkedStylesheet(path: string): string | undefined {
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

function hasThemeAwareColorDeclarations(blocks: CssRuleBlock[]): boolean {
  return blocks.some((block) =>
    block.declarations.some((declaration) => INTERACTIVE_PROPERTIES.has(declaration.property)),
  );
}

function hasPreferredColorSchemeQuery(context: RuleContext): boolean {
  const stylesToScan: string[] = Array.from(context.document.querySelectorAll("style"))
    .map((styleElement) => styleElement.textContent || "")
    .filter((css) => css.trim().length > 0);

  if (context.target.kind === "file") {
    const seen = new Set<string>();
    context.document.querySelectorAll<HTMLLinkElement>("link[rel~='stylesheet'][href]").forEach((link) => {
      const stylesheetPath = resolveLinkedStylesheetPath(context.target.value, link.getAttribute("href") || "");
      if (!stylesheetPath || seen.has(stylesheetPath)) return;
      seen.add(stylesheetPath);
      const css = readLinkedStylesheet(stylesheetPath);
      if (css) stylesToScan.push(css);
    });
  }

  return stylesToScan.some((css) => DARK_MODE_MEDIA_RE.test(css));
}

export const darkModeRule: Rule = {
  id: "missing-dark-mode",
  description: "Signale l'absence de prise en compte du mode sombre.",
  principle: "design align --theme",
  wp7Finding: "P2-1 dark-mode absent",
  severity: "low",
  evaluate(context: RuleContext): Finding[] {
    const cssBlocks = [...extractCssRuleBlocks(context), ...extractLinkedCssRuleBlocks(context)];
    const hasThemeAwareStyles = hasThemeAwareColorDeclarations(cssBlocks);
    const hasThemeAwareInlineStyles = extractInlineStyleBlocks(context).some((inlineBlock) =>
      inlineBlock.declarations.some((declaration) => INTERACTIVE_PROPERTIES.has(declaration.property)),
    );

    if (!hasThemeAwareStyles && !hasThemeAwareInlineStyles) {
      return [];
    }

    if (hasPreferredColorSchemeQuery(context)) {
      return [];
    }

    return [
      {
        ruleId: "missing-dark-mode",
        severity: "low",
        message:
          "Aucune requête `prefers-color-scheme` n'est détectée alors que des styles colorés sont présents. Ajouter une variante `dark` (ou `light/dark`) pour la lisibilité en mode sombre.",
        location: context.document.documentElement.tagName.toLowerCase()
      }
    ];
  }
};
