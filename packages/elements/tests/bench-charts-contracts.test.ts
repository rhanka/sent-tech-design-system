import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import catalog from "../catalog.json";
import envelopeSchema from "../envelope.json";
import { a2uiCommonTypes } from "../src/generated/a2ui-common-types.js";
import { createInterpreterStructure } from "../src/structure/interpreter.js";
import { createEnvelopeValidator } from "../src/validate/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(here, "..", "fixtures");
const schemasDir = join(here, "..", "schemas");

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

const options = { catalog, envelopeSchema, commonTypes: a2uiCommonTypes };

const BENCH_COMPONENTS = [
  "PrecisionRecallChart",
  "ScoreCostChart",
  "RankCurveChart",
  "AcceptanceRateChart",
] as const;

const FIXTURE_SETS = {
  PrecisionRecallChart: [
    "precision-recall-minimal.json",
    "precision-recall-typical.json",
    "precision-recall-maximal.json",
    "precision-recall-worst-case.json",
  ],
  ScoreCostChart: [
    "score-cost-minimal.json",
    "score-cost-typical.json",
    "score-cost-maximal.json",
    "score-cost-worst-case.json",
  ],
  RankCurveChart: [
    "rank-curve-minimal.json",
    "rank-curve-typical.json",
    "rank-curve-maximal.json",
    "rank-curve-worst-case.json",
  ],
  AcceptanceRateChart: [
    "acceptance-rate-minimal.json",
    "acceptance-rate-typical.json",
    "acceptance-rate-maximal.json",
    "acceptance-rate-worst-case.json",
  ],
} as const;

function componentLocalProps(component: string): Record<string, Record<string, unknown>> {
  const schema = readJson(join(schemasDir, `${component}.v1.json`));
  const defs = schema.$defs as Record<string, unknown>;
  const comp = defs.component as { allOf: Record<string, unknown>[] };
  const local = comp.allOf[2] as { properties: Record<string, Record<string, unknown>> };
  return local.properties;
}

describe("Bench charts schemas and bounds (including P2-3)", () => {
  it("generates standalone schemas and catalogue entries for all four charts", () => {
    for (const name of BENCH_COMPONENTS) {
      expect(catalog.components).toHaveProperty(name);
      const standalone = readJson(join(schemasDir, `${name}.v1.json`));
      expect(standalone.title).toBe(`${name} standalone envelope schema`);
    }
  });

  it("PrecisionRecallChart schema carries typed item bounds, @minItems on isoF1 & groups, and closed objects", () => {
    const props = componentLocalProps("PrecisionRecallChart");
    expect(props.label).toMatchObject({ type: "string", minLength: 1, maxLength: 80 });
    expect(props.points).toMatchObject({ type: "array", minItems: 1, maxItems: 200 });
    expect(props.groups).toMatchObject({ type: "array", minItems: 0, maxItems: 8 });
    expect(props.isoF1).toMatchObject({
      type: "array",
      minItems: 0,
      maxItems: 9,
      items: { type: "number", exclusiveMinimum: 0, exclusiveMaximum: 1 },
    });
    const pt = props.points!.items as { properties: Record<string, unknown>; additionalProperties: boolean };
    expect(pt.additionalProperties).toBe(false);
    expect(pt.properties.precision).toMatchObject({ type: "number", minimum: 0, maximum: 1 });
    expect(pt.properties.recall).toMatchObject({ type: "number", minimum: 0, maximum: 1 });
    expect(pt.properties.id).toMatchObject({ type: "string", minLength: 1, maxLength: 64, pattern: "^[A-Za-z0-9._:-]+$" });
  });

  it("ScoreCostChart schema carries @minLength 1 on scoreLabel, @minItems on groups, and cost bounds", () => {
    const props = componentLocalProps("ScoreCostChart");
    expect(props.points).toMatchObject({ type: "array", minItems: 1, maxItems: 200 });
    expect(props.groups).toMatchObject({ type: "array", minItems: 0, maxItems: 8 });
    expect(props.scoreLabel).toMatchObject({ type: "string", minLength: 1, maxLength: 24 });
    expect(props.costUnit).toMatchObject({ type: "string", minLength: 1, maxLength: 32 });
    const pt = props.points!.items as { properties: Record<string, unknown>; additionalProperties: boolean };
    expect(pt.additionalProperties).toBe(false);
    expect(pt.properties.cost).toMatchObject({ type: "number", exclusiveMinimum: 0, maximum: 1e12 });
    expect(pt.properties.score).toMatchObject({ type: "number", minimum: 0, maximum: 1 });
  });

  it("RankCurveChart schema carries @minLength 1 on valueLabel & itemLabel and UnitInterval item bounds on values", () => {
    const props = componentLocalProps("RankCurveChart");
    expect(props.series).toMatchObject({ type: "array", minItems: 1, maxItems: 4 });
    expect(props.valueLabel).toMatchObject({ type: "string", minLength: 1, maxLength: 24 });
    expect(props.itemLabel).toMatchObject({ type: "string", minLength: 1, maxLength: 24 });
    const seriesItem = props.series!.items as { properties: Record<string, unknown>; additionalProperties: boolean };
    expect(seriesItem.additionalProperties).toBe(false);
    expect(seriesItem.properties.values).toMatchObject({
      type: "array",
      minItems: 1,
      maxItems: 2000,
      items: { type: "number", minimum: 0, maximum: 1 },
    });
  });

  it("AcceptanceRateChart schema carries @minLength 1 on acceptedLabel and integer count bounds", () => {
    const props = componentLocalProps("AcceptanceRateChart");
    expect(props.items).toMatchObject({ type: "array", minItems: 1, maxItems: 24 });
    expect(props.acceptedLabel).toMatchObject({ type: "string", minLength: 1, maxLength: 24 });
    expect(props.target).toMatchObject({ type: "number", minimum: 0, maximum: 1 });
    const item = props.items!.items as { properties: Record<string, unknown>; additionalProperties: boolean };
    expect(item.additionalProperties).toBe(false);
    expect(item.properties.accepted).toMatchObject({ type: "integer", minimum: 0, maximum: 1_000_000_000 });
    expect(item.properties.total).toMatchObject({ type: "integer", minimum: 1, maximum: 1_000_000_000 });
  });
});

describe.each([
  ["Node", () => createEnvelopeValidator(options)],
  ["browser", () => createEnvelopeValidator({ ...options, structure: createInterpreterStructure(options) })],
] as const)("%s bench chart validation", (_name, makeValidator) => {
  it("accepts all minimal, typical, maximal, and worst-case fixtures", () => {
    const validator = makeValidator();
    for (const files of Object.values(FIXTURE_SETS)) {
      for (const file of files) {
        const fixture = readJson(join(fixturesDir, file));
        const diags = validator.validate(fixture);
        expect(diags.filter((d) => d.severity === "error"), `${file}: ${JSON.stringify(diags)}`).toEqual([]);
      }
    }
  });

  it("refuses schema-violation cases at the offending path", () => {
    const validator = makeValidator();
    const pr = readJson(join(fixturesDir, "precision-recall-minimal.json"));
    const sc = readJson(join(fixturesDir, "score-cost-minimal.json"));
    const rc = readJson(join(fixturesDir, "rank-curve-minimal.json"));
    const ar = readJson(join(fixturesDir, "acceptance-rate-minimal.json"));

    const prRoot = pr.root as Record<string, unknown>;
    const scRoot = sc.root as Record<string, unknown>;
    const rcRoot = rc.root as Record<string, unknown>;
    const arRoot = ar.root as Record<string, unknown>;

    const refusals: Array<[string, Record<string, unknown>, string]> = [
      ["PR extra root prop", { ...pr, root: { ...prRoot, extra: 1 } }, "/root/extra"],
      ["PR empty label", { ...pr, root: { ...prRoot, label: "" } }, "/root/label"],
      ["PR label > 80", { ...pr, root: { ...prRoot, label: "a".repeat(81) } }, "/root/label"],
      ["PR empty points", { ...pr, root: { ...prRoot, points: [] } }, "/root/points"],
      ["PR isoF1 = 0", { ...pr, root: { ...prRoot, isoF1: [0] } }, "/root/isoF1/0"],
      ["PR isoF1 = 1", { ...pr, root: { ...prRoot, isoF1: [1] } }, "/root/isoF1/0"],
      ["PR bad id pattern", { ...pr, root: { ...prRoot, points: [{ ...(prRoot.points as Record<string, unknown>[])[0], id: "bad id" }] } }, "/root/points/0/id"],
      ["SC cost = 0", { ...sc, root: { ...scRoot, points: [{ ...(scRoot.points as Record<string, unknown>[])[0], cost: 0 }] } }, "/root/points/0/cost"],
      ["SC empty scoreLabel", { ...sc, root: { ...scRoot, scoreLabel: "" } }, "/root/scoreLabel"],
      ["SC costUnit > 32", { ...sc, root: { ...scRoot, costUnit: "x".repeat(33) } }, "/root/costUnit"],
      ["RC value = 1.2", { ...rc, root: { ...rcRoot, series: [{ ...(rcRoot.series as Record<string, unknown>[])[0], values: [1.2] }] } }, "/root/series/0/values/0"],
      ["RC empty valueLabel", { ...rc, root: { ...rcRoot, valueLabel: "" } }, "/root/valueLabel"],
      ["RC empty itemLabel", { ...rc, root: { ...rcRoot, itemLabel: "" } }, "/root/itemLabel"],
      ["AR empty acceptedLabel", { ...ar, root: { ...arRoot, acceptedLabel: "" } }, "/root/acceptedLabel"],
      ["AR total = 0", { ...ar, root: { ...arRoot, items: [{ ...(arRoot.items as Record<string, unknown>[])[0], total: 0 }] } }, "/root/items/0/total"],
      ["AR non-integer accepted", { ...ar, root: { ...arRoot, items: [{ ...(arRoot.items as Record<string, unknown>[])[0], accepted: 1.5 }] } }, "/root/items/0/accepted"],
    ];

    for (const [label, env, path] of refusals) {
      const diags = validator.validate(env);
      expect(diags.some((d) => d.code === "schema-violation" && d.path === path), `${label}: ${JSON.stringify(diags)}`).toBe(true);
    }
  });

  it("refuses semantic violations and emits rank-axis warning when unequal series use rank", () => {
    const validator = makeValidator();
    const pr = readJson(join(fixturesDir, "precision-recall-minimal.json"));
    const sc = readJson(join(fixturesDir, "score-cost-minimal.json"));
    const rc = readJson(join(fixturesDir, "rank-curve-minimal.json"));
    const ar = readJson(join(fixturesDir, "acceptance-rate-minimal.json"));

    const prPt = (pr.root as { points: Record<string, unknown>[] }).points[0]!;
    expect(
      validator.validate({ ...pr, root: { ...(pr.root as object), points: [prPt, prPt] } }),
    ).toEqual(expect.arrayContaining([expect.objectContaining({ code: "semantic-invalid", path: "/root/points/1/id", severity: "error" })]));

    expect(
      validator.validate({ ...pr, root: { ...(pr.root as object), points: [{ ...prPt, groupId: "missing" }] } }),
    ).toEqual(expect.arrayContaining([expect.objectContaining({ code: "semantic-invalid", path: "/root/points/0/groupId", severity: "error" })]));

    expect(
      validator.validate({ ...pr, root: { ...(pr.root as object), isoF1: [0.6, 0.4] } }),
    ).toEqual(expect.arrayContaining([expect.objectContaining({ code: "semantic-invalid", path: "/root/isoF1/1", severity: "error" })]));

    // (0, 0) precision/recall is explicitly valid.
    expect(
      validator.validate({ ...pr, root: { ...(pr.root as object), points: [{ ...prPt, precision: 0, recall: 0 }] } }),
    ).toEqual([]);

    const scPt = (sc.root as { points: Record<string, unknown>[] }).points[0]!;
    expect(
      validator.validate({ ...sc, root: { ...(sc.root as object), points: [{ ...scPt, groupId: "nope" }] } }),
    ).toEqual(expect.arrayContaining([expect.objectContaining({ code: "semantic-invalid", path: "/root/points/0/groupId", severity: "error" })]));

    const arItem = (ar.root as { items: Record<string, unknown>[] }).items[0]!;
    expect(
      validator.validate({ ...ar, root: { ...(ar.root as object), items: [{ ...arItem, accepted: 5, total: 4 }] } }),
    ).toEqual(expect.arrayContaining([expect.objectContaining({ code: "semantic-invalid", path: "/root/items/0/accepted", severity: "error" })]));

    // Unequal series lengths with rankAxis "rank" produces a warning, no error.
    const rcSeries = (rc.root as { series: Record<string, unknown>[] }).series[0]!;
    const warnDiags = validator.validate({
      ...rc,
      root: {
        ...(rc.root as object),
        rankAxis: "rank",
        series: [
          { ...rcSeries, id: "s1", values: [0.9, 0.5] },
          { ...rcSeries, id: "s2", values: [0.8, 0.6, 0.4] },
        ],
      },
    });
    expect(warnDiags.filter((d) => d.severity === "error")).toEqual([]);
    expect(warnDiags).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "semantic-invalid", severity: "warning" })]),
    );
  });
});
