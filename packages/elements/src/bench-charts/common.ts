import type { BenchGroup } from "../contracts/bench-types.js";
import { utf8ByteLength } from "../validate/envelope.js";

export const BENCH_CHART_FALLBACK_LIMIT_BYTES = 4096;

/** Escape Markdown table cell delimiters and control newlines (EZ-1 rule). */
export function markdownCell(value: string): string {
  return value
    .replace(/[&<>|\\`*_\[\]~!]/g, (character) => `&#${character.charCodeAt(0)};`)
    .replace(/\r\n|[\r\n]/g, "&#10;");
}

/** Single-line label safe for the §8.2 summary line (≤ 512 UTF-8 bytes total). */
export function summaryLabel(label: string): string {
  return label.replace(/\r\n|[\r\n]/g, " ").replace(/"/g, '\\"');
}

/**
 * Format a number with fixed decimals using half-even rounding on the decimal
 * string (no locale, deterministic).
 */
export function formatFixedHalfEven(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return decimals > 0 ? `0.${"0".repeat(decimals)}` : "0";
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  const raw = abs.toFixed(12);
  const [intPart = "0", fracPart = ""] = raw.split(".");
  const padded = fracPart.padEnd(decimals + 12, "0");
  const keepFrac = padded.slice(0, decimals);
  const nextDigit = Number(padded[decimals] ?? "0");
  const rest = padded.slice(decimals + 1);
  const hasNonZeroRest = /[1-9]/.test(rest);

  const digits = `${intPart}${keepFrac}`.split("").map(Number);
  const lastDigit = digits[digits.length - 1] ?? 0;
  let roundUp = false;
  if (nextDigit > 5) roundUp = true;
  else if (nextDigit === 5) roundUp = hasNonZeroRest || lastDigit % 2 !== 0;

  if (roundUp) {
    let carry = 1;
    for (let i = digits.length - 1; i >= 0 && carry > 0; i -= 1) {
      const next = (digits[i] ?? 0) + carry;
      digits[i] = next % 10;
      carry = Math.floor(next / 10);
    }
    if (carry > 0) digits.unshift(carry);
  }

  const full = digits.join("");
  const splitAt = full.length - decimals;
  const outInt = splitAt > 0 ? full.slice(0, splitAt) : "0";
  const outFrac = decimals > 0 ? full.slice(Math.max(0, splitAt)).padStart(decimals, "0") : "";
  const formatted = decimals > 0 ? `${outInt}.${outFrac}` : outInt;
  const zeroForm = decimals > 0 ? `0.${"0".repeat(decimals)}` : "0";
  return formatted === zeroForm ? formatted : `${sign}${formatted}`;
}

/** Proportions always print as `0.000` (three decimals, half-even). */
export function formatProportion(value: number): string {
  return formatFixedHalfEven(value, 3);
}

/** Percentages print with one decimal place (`82.5 %`). */
export function formatPercent(value: number): string {
  return `${formatFixedHalfEven(value * 100, 1)} %`;
}

/** Costs print with up to 4 significant digits, no thousands separator. */
export function formatCost(cost: number): string {
  if (!Number.isFinite(cost)) return "0";
  return String(Number(cost.toPrecision(4)));
}

/** Map `groupId -> label` from optional `groups`. */
export function resolveGroupMap(groups: readonly BenchGroup[] | undefined): ReadonlyMap<string, string> {
  const map = new Map<string, string>();
  for (const group of groups ?? []) map.set(group.id, group.label);
  return map;
}

function omittedTrailerLine(omittedCount: number, columnCount: number): string {
  const trailingPipes = columnCount > 2 ? " |".repeat(columnCount - 2) : "";
  return `| ... | ${omittedCount} rows omitted |${trailingPipes}`;
}

export interface BoundedMarkdownTableInput {
  readonly summary: string;
  readonly headers: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

/**
 * Render `<summary>\n\n<GFM table>` deterministically within 4096 UTF-8 bytes.
 * Never throws: if all rows do not fit, stops before exceeding the budget and
 * appends `| ... | <n> rows omitted |` padded to the column count (owner Q2).
 */
export function renderBoundedMarkdownTable({ summary, headers, rows }: BoundedMarkdownTableInput): string {
  const columnCount = headers.length;
  const headerLine = `| ${headers.join(" | ")} |`;
  const separatorLine = `| ${headers.map(() => "---").join(" | ")} |`;
  const lines = [summary, "", headerLine, separatorLine];
  let usedBytes = utf8ByteLength(lines.join("\n"));

  const rowLines = rows.map((cells) => `| ${cells.join(" | ")} |`);
  const total = rowLines.length;

  for (let i = 0; i < total; i += 1) {
    const rowLine = rowLines[i]!;
    const rowCost = 1 + utf8ByteLength(rowLine);
    const remainingAfter = total - (i + 1);
    const trailerCost =
      remainingAfter > 0 ? 1 + utf8ByteLength(omittedTrailerLine(remainingAfter, columnCount)) : 0;

    if (usedBytes + rowCost + trailerCost <= BENCH_CHART_FALLBACK_LIMIT_BYTES) {
      lines.push(rowLine);
      usedBytes += rowCost;
      continue;
    }

    lines.push(omittedTrailerLine(total - i, columnCount));
    break;
  }

  return lines.join("\n");
}
