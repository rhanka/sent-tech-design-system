import { describe, expect, it } from "vitest";

import catalog from "../catalog.json";
import envelopeSchema from "../envelope.json";
import { a2uiCommonTypes as commonTypes } from "../src/generated/a2ui-common-types.js";
import { createInterpreterStructure } from "../src/structure/interpreter.js";
import { formatTimeSeriesMarkdown, TIME_SERIES_FALLBACK_LIMIT_BYTES } from "../src/index.js";
import { createEnvelopeValidator } from "../src/validate/index.js";
import single from "../fixtures/time-series-single.json";
import multi from "../fixtures/time-series-multi.json";
import thresholds from "../fixtures/time-series-thresholds.json";
import categories from "./fixtures/bar-chart-pdata-1.json";

const options = { catalog, envelopeSchema, commonTypes };

describe.each([
  ["Node", createEnvelopeValidator(options)],
  ["browser", createEnvelopeValidator({ ...options, structure: createInterpreterStructure(options) })],
] as const)("%s TimeSeriesChart validation", (_name, validator) => {
  it.each([single, multi, thresholds, categories])("should accept $root.label", (fixture) => {
    expect(validator.validate(fixture)).toEqual([]);
  });

  it.each([
    ["missing label", { label: undefined }, "/root/label"],
    ["empty label", { label: "" }, "/root/label"],
    ["empty series", { series: [] }, "/root/series"],
    ["extra root property", { class: "custom" }, "/root/class"],
    ["extra series property", { series: [{ ...single.root.series[0], tone: "red" }] }, "/root/series/0/tone"],
    ["extra point property", { series: [{ ...single.root.series[0], data: [{ x: 1, y: 2, text: "extra" }] }] }, "/root/series/0/data/0/text"],
    ["ambiguous date string", { series: [{ ...single.root.series[0], data: [{ x: "01/02/26", y: 2 }] }] }, "/root/series/0/data/0/x"],
    ["sub-millisecond timestamp", { series: [{ ...single.root.series[0], data: [{ x: 1.25, y: 2 }] }] }, "/root/series/0/data/0/x"],
    ["unrepresentable timestamp", { series: [{ ...single.root.series[0], data: [{ x: 8640000000000001, y: 2 }] }] }, "/root/series/0/data/0/x"],
    ["non-finite value", { series: [{ ...single.root.series[0], data: [{ x: 1, y: Infinity }] }] }, "/root/series/0/data/0/y"],
    ["duplicate time", { series: [{ ...single.root.series[0], data: [{ x: 1, y: 2 }, { x: 1, y: 3 }] }] }, "/root/series/0/data/1/x"],
    ["descending time", { series: [{ ...single.root.series[0], data: [{ x: 2, y: 2 }, { x: 1, y: 3 }] }] }, "/root/series/0/data/1/x"],
    ["duplicate series id", { series: [single.root.series[0], single.root.series[0]] }, "/root/series/1/id"],
    ["unbounded style", { bands: [{ from: 1, to: 2, color: "red" }] }, "/root/bands/0/color"],
    ["ambiguous x reference", { referenceLines: [{ axis: "x", value: 1.5 }] }, "/root/referenceLines/0/value"],
  ] as const)("should reject %s at the offending path", (_case, props, path) => {
    const fixture = { ...single, root: { ...single.root, ...props } };
    expect(validator.validate(fixture)).toEqual(expect.arrayContaining([
      expect.objectContaining({ path, severity: "error" }),
    ]));
  });
});

describe("TimeSeriesChart Markdown fallback", () => {
  it("should use UTC milliseconds and break timestamp ties by series order", () => {
    expect(formatTimeSeriesMarkdown(single.root)).toContain("| 2026-01-01T00:00:00.123Z | Jobs | jobs | 4 |");
    expect(formatTimeSeriesMarkdown(multi.root).split("\n").slice(2)).toEqual([
      "| 2026-01-01T00:00:00.000Z | East | east | 10 |",
      "| 2026-01-01T01:00:00.000Z | East | east | 21 |",
      "| 2026-01-01T01:00:00.000Z | West | west | 14 |",
      "| 2026-01-01T02:00:00.000Z | West | west | 8 |",
      "| 2026-01-01T03:00:00.000Z | East | east | 15 |",
      "| 2026-01-01T03:00:00.000Z | West | west | 20 |",
    ]);
    for (const fixture of [single, multi, thresholds]) {
      expect(Buffer.byteLength(formatTimeSeriesMarkdown(fixture.root))).toBeLessThanOrEqual(4096);
    }
  });

  it("should escape labels and IDs while retaining one row per observation", () => {
    const props = {
      ...single.root,
      series: [{ id: "series|a\\b", label: "🧪 | <em>\nNext", data: [{ x: 1, y: 2 }] }],
    };
    expect(formatTimeSeriesMarkdown(props).split("\n").at(-1)).toBe(
      "| 1970-01-01T00:00:00.001Z | 🧪 &#124; &#60;em&#62;&#10;Next | series&#124;a&#92;b | 2 |",
    );
  });

  it("should preserve series IDs when a label matches a disambiguated label", () => {
    const props = {
      ...multi.root,
      series: [
        ...multi.root.series.map((series) => ({ ...series, label: "Sensor" })),
        { id: "third", label: "Sensor (east)", data: [{ x: 1767229200000, y: 30 }] },
      ],
    };
    const markdown = formatTimeSeriesMarkdown(props);
    expect(markdown.split("\n").filter((row) => row.startsWith("| 2026-01-01T01:00:00.000Z |"))).toEqual([
      "| 2026-01-01T01:00:00.000Z | Sensor | east | 21 |",
      "| 2026-01-01T01:00:00.000Z | Sensor | west | 14 |",
      "| 2026-01-01T01:00:00.000Z | Sensor (east) | third | 30 |",
    ]);
    expect(markdown).toContain("| Time (UTC) | Series | Series ID | Value |");
  });

  it("should accept 4096 UTF-8 bytes and refuse an overflow without dropping rows", () => {
    const format = (label: string) => formatTimeSeriesMarkdown({
      label: "Bounded",
      series: [{ id: "series", label, data: [{ x: 1, y: 2 }] }],
    });
    const prefix = "🧪\uD800";
    const filler = TIME_SERIES_FALLBACK_LIMIT_BYTES - Buffer.byteLength(format(prefix));
    const label = prefix + "a".repeat(filler);
    expect(Buffer.byteLength(format(label))).toBe(4096);
    expect(() => format(label + "a")).toThrow(RangeError);
  });
});
