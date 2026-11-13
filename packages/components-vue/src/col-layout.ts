import type { ColSpan } from './Col.vue';
export function spanBasis(span: ColSpan | undefined): string | undefined {
  if (span == null) return undefined;
  if (span === "auto") return "auto";
  const clamped = Math.max(1, Math.min(12, Math.round(span)));
  const ratio = clamped / 12;
  // Subtract this column's share of the inter-column gutters.
  return `calc(${ratio * 100}% - var(--st-row-gutter, 0px) * ${(12 - clamped) / 12})`;
}
export function offsetMargin(offset: number | undefined): string | undefined {
  if (!offset) return undefined;
  const clamped = Math.max(0, Math.min(11, Math.round(offset)));
  if (clamped === 0) return undefined;
  const ratio = clamped / 12;
  return `calc(${ratio * 100}% + var(--st-row-gutter, 0px) * ${ratio})`;
}
