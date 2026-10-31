/**
 * Canonical ordering for the committed artifacts (§5.1): keys and `$defs`
 * sorted, so a regeneration without a type change produces no diff.
 *
 * The rule is deliberately simple and total:
 * - object keys are sorted (recursively);
 * - arrays whose every element is a string are sorted — they are SETS in
 *   these schemas (`required`, `enum`), never sequences;
 * - every other array keeps its order — `allOf`/`oneOf` are ordered
 *   compositions and a tuple's item schemas are positional.
 */

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

function isStringArray(value: readonly unknown[]): boolean {
  return value.every((element) => typeof element === "string");
}

export function canonicalize(value: Json): Json {
  if (Array.isArray(value)) {
    const mapped = value.map((element) => canonicalize(element));
    return isStringArray(value) ? [...mapped].sort() : mapped;
  }
  if (value !== null && typeof value === "object") {
    const sorted: { [key: string]: Json } = {};
    for (const key of Object.keys(value).sort()) {
      sorted[key] = canonicalize((value as { [key: string]: Json })[key] as Json);
    }
    return sorted;
  }
  return value;
}

/**
 * The committed-artifact format: canonical order, 2-space indent, a trailing
 * newline — byte-stable for unchanged types.
 */
export function stableStringify(value: Json): string {
  return `${JSON.stringify(canonicalize(value), null, 2)}\n`;
}
