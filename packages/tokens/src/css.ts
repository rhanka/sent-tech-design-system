import type { TokenTree, TokenValue } from "./foundation.js";

export function flattenTokens(tree: TokenTree, prefix: string[] = []): Record<string, TokenValue> {
  const output: Record<string, TokenValue> = {};
  for (const [key, value] of Object.entries(tree)) {
    if (value === undefined) continue;
    const path = [...prefix, key];
    if (typeof value === "object" && value !== null) {
      Object.assign(output, flattenTokens(value as TokenTree, path));
    } else {
      output[path.join("-")] = value;
    }
  }
  return output;
}

export function toCssVariables(tree: TokenTree, selector = ":root", namespace = "st"): string {
  const entries = Object.entries(flattenTokens(tree));
  const lines: string[] = [];
  for (const [name, value] of entries) {
    lines.push(`  --${namespace}-${name}: ${String(value)};`);
    // Les composants consomment la couche foundation sous des noms COURTS
    // (--st-font-sans, --st-radius-md, --st-spacing-2, --st-shadow-medium,
    // --st-motion-fast, --st-z-*…) tandis que l'arbre l'expose sous
    // --st-foundation-*. On émet donc aussi l'alias court pour que la
    // typographie / le radius / l'espacement / le motion suivent le thème.
    // Additif : les noms pleinement qualifiés --st-foundation-* restent émis.
    if (name.startsWith("foundation-")) {
      const short = name.slice("foundation-".length);
      lines.push(`  --${namespace}-${short}: ${String(value)};`);
      // Alias z-index : la couche `z` est consommée comme --st-zindex-*.
      if (short.startsWith("z-")) {
        lines.push(`  --${namespace}-zindex-${short.slice(2)}: ${String(value)};`);
      }
    }
  }
  return `${selector} {\n${lines.join("\n")}\n}\n`;
}
