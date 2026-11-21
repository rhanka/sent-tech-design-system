import { describe, expect, it } from "vitest";

import catalog from "../catalog.json";
import envelopeSchema from "../envelope.json";
import { a2uiCommonTypes as commonTypes } from "../src/generated/a2ui-common-types.js";
import { createInterpreterStructure } from "../src/structure/interpreter.js";
import { createEnvelopeValidator } from "../src/validate/index.js";
import single from "./fixtures/time-series-single.json";
import multi from "./fixtures/time-series-multi.json";
import thresholds from "./fixtures/time-series-thresholds.json";
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
