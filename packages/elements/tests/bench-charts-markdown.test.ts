import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { marked } from "marked";
import { describe, expect, it } from "vitest";

import {
  BENCH_CHART_FALLBACK_LIMIT_BYTES,
  describeAcceptanceRateChart,
  describePrecisionRecallChart,
  describeRankCurveChart,
  describeScoreCostChart,
  formatAcceptanceRateChartMarkdown,
  formatAcceptanceRateChartSummary,
  formatPrecisionRecallChartMarkdown,
  formatPrecisionRecallChartSummary,
  formatRankCurveChartMarkdown,
  formatRankCurveChartSummary,
  formatScoreCostChartMarkdown,
  formatScoreCostChartSummary,
  type AcceptanceRateChartProps,
  type PrecisionRecallChartProps,
  type RankCurveChartProps,
  type ScoreCostChartProps,
} from "../src/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(here, "..", "fixtures");

function readProps<T>(name: string): T {
  const env = JSON.parse(readFileSync(join(fixturesDir, name), "utf8")) as { root: T };
  return env.root;
}

function parseTable(md: string) {
  const html = marked.parse(md, { gfm: true, async: false });
  const frag = JSDOM.fragment(html);
  const headers = Array.from(frag.querySelectorAll("thead th"), (th) => th.textContent?.trim() ?? "");
  const rows = Array.from(frag.querySelectorAll("tbody tr"), (tr) =>
    Array.from(tr.querySelectorAll("td"), (td) => td.textContent?.trim() ?? ""),
  );
  return { headers, rows };
}

describe("Bench charts Markdown fallbacks and descriptions", () => {
  it("starts with the one-line summary, followed by a blank line and GFM table", () => {
    const pr = readProps<PrecisionRecallChartProps>("precision-recall-typical.json");
    const summary = formatPrecisionRecallChartSummary(pr);
    const md = formatPrecisionRecallChartMarkdown(pr);
    expect(summary).not.toContain("\n");
    expect(Buffer.byteLength(summary, "utf8")).toBeLessThanOrEqual(512);
    expect(md.startsWith(`${summary}\n\n| # | Label | Group | Precision | Recall | F1 |\n`)).toBe(true);
    expect(md).toBe(formatPrecisionRecallChartMarkdown(pr));
    expect(describePrecisionRecallChart(pr)).toContain("6 points");
  });

  it("PrecisionRecallChart orders by F1 descending then id ascending and keeps 1-based # index", () => {
    const pr: PrecisionRecallChartProps = {
      label: "PR tie check",
      groups: [{ id: "g1", label: "Group 1" }],
      points: [
        { id: "b-id", label: "First input", precision: 0.8, recall: 0.8, groupId: "g1" },
        { id: "a-id", label: "Second input", precision: 0.8, recall: 0.8, groupId: "g1" },
        { id: "zero", label: "Zero", precision: 0, recall: 0 },
      ],
    };
    const { headers, rows } = parseTable(formatPrecisionRecallChartMarkdown(pr));
    expect(headers).toEqual(["#", "Label", "Group", "Precision", "Recall", "F1"]);
    expect(rows).toEqual([
      ["2", "Second input", "Group 1", "0.800", "0.800", "0.800"],
      ["1", "First input", "Group 1", "0.800", "0.800", "0.800"],
      ["3", "Zero", "—", "0.000", "0.000", "0.000"],
    ]);
  });

  it("uses half-even rounding on proportions to three decimal places", () => {
    const pr: PrecisionRecallChartProps = {
      label: "Half-even",
      points: [
        { id: "even", label: "Even tie", precision: 0.1245, recall: 0.1255 },
      ],
    };
    const { rows } = parseTable(formatPrecisionRecallChartMarkdown(pr));
    expect(rows[0]![3]).toBe("0.124");
    expect(rows[0]![4]).toBe("0.126");
  });

  it("ScoreCostChart puts frontier points first by cost ascending, then dominated by score descending", () => {
    const sc = readProps<ScoreCostChartProps>("score-cost-typical.json");
    const md = formatScoreCostChartMarkdown(sc);
    const { headers, rows } = parseTable(md);
    expect(headers).toEqual(["#", "Label", "Group", "Cost (USD per 1k items)", "F1", "Frontier"]);
    expect(rows.slice(0, 4).map((r) => [r[1], r[5]])).toEqual([
      ["System A", "yes"],
      ["System C", "yes"],
      ["System E", "yes"],
      ["System G", "yes"],
    ]);
    expect(rows.slice(4).map((r) => [r[1], r[5]])).toEqual([
      ["System H", "no"],
      ["System F", "no"],
      ["System D", "no"],
      ["System B", "no"],
    ]);
    expect(describeScoreCostChart(sc)).toContain("Pareto frontier");
  });

  it("RankCurveChart renders summary rows with exact quantiles and zero counts", () => {
    const rc = readProps<RankCurveChartProps>("rank-curve-typical.json");
    const md = formatRankCurveChartMarkdown(rc);
    const { headers, rows } = parseTable(md);
    expect(headers).toEqual(["Series", "n", "Mean", "Min", "P10", "Median", "P90", "Max", "Zeros"]);
    expect(rows).toHaveLength(2);
    expect(rows[0]![0]).toBe("System A");
    expect(rows[0]![1]).toBe("12");
    expect(rows[0]![8]).toBe("2");
    expect(describeRankCurveChart(rc)).toContain("System A");
  });

  it("AcceptanceRateChart formats counts, rate, 95% Wilson interval, and target", () => {
    const ar = readProps<AcceptanceRateChartProps>("acceptance-rate-typical.json");
    const md = formatAcceptanceRateChartMarkdown(ar);
    const { headers, rows } = parseTable(md);
    expect(headers).toEqual(["Label", "Accepted", "Total", "Rate", "95 % interval", "Target"]);
    expect(rows.map((r) => r[0])).toEqual(["System C", "System A", "System B", "System D"]);
    expect(rows[1]).toEqual(["System A", "330", "400", "0.825", "[0.785, 0.859]", "0.800"]);
    expect(describeAcceptanceRateChart(ar)).toContain("80.0 % target");
  });

  it("never exceeds 4096 UTF-8 bytes on maximal and worst-case fixtures and appends exact omitted-rows trailer", () => {
    const formatters: Array<[string, () => string, number]> = [
      [
        "precision-recall-maximal",
        () => formatPrecisionRecallChartMarkdown(readProps<PrecisionRecallChartProps>("precision-recall-maximal.json")),
        200,
      ],
      [
        "precision-recall-worst-case",
        () => formatPrecisionRecallChartMarkdown(readProps<PrecisionRecallChartProps>("precision-recall-worst-case.json")),
        200,
      ],
      [
        "score-cost-maximal",
        () => formatScoreCostChartMarkdown(readProps<ScoreCostChartProps>("score-cost-maximal.json")),
        200,
      ],
      [
        "score-cost-worst-case",
        () => formatScoreCostChartMarkdown(readProps<ScoreCostChartProps>("score-cost-worst-case.json")),
        200,
      ],
      [
        "acceptance-rate-worst-case",
        () => formatAcceptanceRateChartMarkdown(readProps<AcceptanceRateChartProps>("acceptance-rate-worst-case.json")),
        24,
      ],
    ];

    for (const [name, run, totalRows] of formatters) {
      const md = run();
      expect(Buffer.byteLength(md, "utf8"), name).toBeLessThanOrEqual(BENCH_CHART_FALLBACK_LIMIT_BYTES);
      const lastLine = md.split("\n").at(-1)!;
      const match = /^\| \.\.\. \| (\d+) rows omitted \|/.exec(lastLine);
      expect(match, `${name} last line: ${lastLine}`).not.toBeNull();
      const omitted = Number(match![1]);
      const parsed = parseTable(md);
      const renderedDataRows = parsed.rows.length - 1; // excluding trailer row
      expect(renderedDataRows + omitted, name).toBe(totalRows);
      expect(omitted, name).toBeGreaterThan(0);
    }

    // RankCurveChart worst-case has 4 summary rows and must fit completely with 0 rows omitted.
    const rcWorst = formatRankCurveChartMarkdown(readProps<RankCurveChartProps>("rank-curve-worst-case.json"));
    expect(Buffer.byteLength(rcWorst, "utf8")).toBeLessThanOrEqual(BENCH_CHART_FALLBACK_LIMIT_BYTES);
    expect(rcWorst).not.toContain("rows omitted");
    expect(parseTable(rcWorst).rows).toHaveLength(4);

    // Summary helpers return deterministic single line for all fixtures.
    expect(formatScoreCostChartSummary(readProps<ScoreCostChartProps>("score-cost-minimal.json"))).toContain("1 point");
    expect(formatRankCurveChartSummary(readProps<RankCurveChartProps>("rank-curve-minimal.json"))).toContain("1 series");
    expect(formatAcceptanceRateChartSummary(readProps<AcceptanceRateChartProps>("acceptance-rate-minimal.json"))).toContain("1 item");
  });
});
