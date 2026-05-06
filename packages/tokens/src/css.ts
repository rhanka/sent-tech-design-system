import type { TokenTree, TokenValue } from "./foundation";

export function flattenTokens(tree: TokenTree, prefix: string[] = []): Record<string, TokenValue> {
  const output: Record<string, TokenValue> = {};
  for (const [key, value] of Object.entries(tree)) {
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
  const body = entries
    .map(([name, value]) => `  --${namespace}-${name}: ${String(value)};`)
    .join("\n");
  return `${selector} {\n${body}\n}\n`;
}
