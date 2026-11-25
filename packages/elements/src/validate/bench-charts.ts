import type { AcceptanceRateChartProps } from "../contracts/acceptance-rate-chart.js";
import type { BenchGroup } from "../contracts/bench-types.js";
import type { PrecisionRecallChartProps } from "../contracts/precision-recall-chart.js";
import type { RankCurveChartProps } from "../contracts/rank-curve-chart.js";
import type { ScoreCostChartProps } from "../contracts/score-cost-chart.js";
import type { Diagnostic } from "./diagnostics.js";

function semanticError(path: string, message: string): Diagnostic {
  return { code: "semantic-invalid", path, message, severity: "error", source: "catalog" };
}

function semanticWarning(path: string, message: string): Diagnostic {
  return { code: "semantic-invalid", path, message, severity: "warning", source: "catalog" };
}

function collectUniqueIds<T extends { readonly id: string }>(
  entries: readonly T[],
  basePath: string,
  kind: string,
  diagnostics: Diagnostic[],
): Set<string> {
  const ids = new Set<string>();
  for (const [index, entry] of entries.entries()) {
    if (ids.has(entry.id)) {
      diagnostics.push(semanticError(`${basePath}/${index}/id`, `${kind} id must be unique`));
    }
    ids.add(entry.id);
  }
  return ids;
}

function validateGroupsAndPoints(
  groups: readonly BenchGroup[] | undefined,
  points: readonly { readonly id: string; readonly groupId?: string }[],
  diagnostics: Diagnostic[],
): void {
  const groupIds = collectUniqueIds(groups ?? [], "/root/groups", "group", diagnostics);
  collectUniqueIds(points, "/root/points", "point", diagnostics);
  for (const [index, point] of points.entries()) {
    if (point.groupId !== undefined && !groupIds.has(point.groupId)) {
      diagnostics.push(semanticError(`/root/points/${index}/groupId`, `groupId "${point.groupId}" does not resolve to any declared group`));
    }
  }
}

/** Semantic rules for PrecisionRecallChart after JSON Schema validation. */
export function validatePrecisionRecall({ points, groups, isoF1 }: PrecisionRecallChartProps): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  validateGroupsAndPoints(groups, points, diagnostics);
  let prev = -Infinity;
  for (const [index, level] of (isoF1 ?? []).entries()) {
    if (level <= prev) {
      diagnostics.push(semanticError(`/root/isoF1/${index}`, "isoF1 levels must be strictly increasing"));
    }
    prev = level;
  }
  return diagnostics;
}

/** Semantic rules for ScoreCostChart after JSON Schema validation. */
export function validateScoreCost({ points, groups }: ScoreCostChartProps): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  validateGroupsAndPoints(groups, points, diagnostics);
  return diagnostics;
}

/** Semantic rules for RankCurveChart after JSON Schema validation. */
export function validateRankCurve({ series, rankAxis }: RankCurveChartProps): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  collectUniqueIds(series, "/root/series", "series", diagnostics);
  const effectiveAxis = rankAxis ?? "rank";
  if (effectiveAxis === "rank" && series.length > 1) {
    const lengths = new Set(series.map((entry) => entry.values.length));
    if (lengths.size > 1) {
      diagnostics.push(
        semanticWarning(
          rankAxis !== undefined ? "/root/rankAxis" : "/root",
          'series have different lengths under rankAxis "rank"; rankAxis "percent" is recommended',
        ),
      );
    }
  }
  return diagnostics;
}

/** Semantic rules for AcceptanceRateChart after JSON Schema validation. */
export function validateAcceptanceRate({ items }: AcceptanceRateChartProps): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  collectUniqueIds(items, "/root/items", "item", diagnostics);
  for (const [index, item] of items.entries()) {
    if (item.accepted > item.total) {
      diagnostics.push(semanticError(`/root/items/${index}/accepted`, "accepted count must not exceed total"));
    }
  }
  return diagnostics;
}
