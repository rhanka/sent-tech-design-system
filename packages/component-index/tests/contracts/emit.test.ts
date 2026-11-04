import { describe, expect, it } from "vitest";

import {
  assembleContractDocument,
  assembleContractIndex,
  checkBaselineCell,
  loadContractBaseline,
} from "../../src/generator/contracts/emit.js";
import type { FrameworkBody } from "../../src/generator/contracts/types.js";

const DIGEST = "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

function body(overrides: Partial<FrameworkBody> = {}): FrameworkBody {
  return {
    status: "complete",
    source: {
      package: "@sentropic/fixture",
      version: "0.0.0",
      declarationPath: "packages/fixture/dist/Widget.d.ts",
      declarationDigest: DIGEST,
      propsType: "WidgetProps",
    },
    props: { type: "object", properties: { title: { type: "string" } }, required: ["title"] },
    slots: [],
    events: [],
    bindable: [],
    dropped: [],
    replaced: [],
    unresolved: [],
    limitations: ["Defaults are not represented in declaration types and are not extracted (K1b-Q5 profile)."],
    warnings: [],
    ...overrides,
  };
}

describe("K1b contract assembly (spec 5, 8, 9)", () => {
  it("assembles a document with a derived source, mirrors and a recomputing digest", () => {
    const frameworks = { svelte: body(), react: body(), vue: body(), angular: body() };
    const { document, digest } = assembleContractDocument({
      componentId: "widget",
      entryDigest: DIGEST,
      frameworks: frameworks as Parameters<typeof assembleContractDocument>[0]["frameworks"],
    });
    expect(document.contractSource).toBe("derived");
    expect(document.entryDigest).toBe(DIGEST);
    expect(document.digest).toBe(digest);
    expect(document.frameworks["svelte"]).toEqual(expect.objectContaining({ status: "complete" }));
  });

  it("GEN-C4: complete with a non-empty loss list fails generation", () => {
    const dropped = body({
      status: "complete",
      dropped: [{ name: "helper", kind: "function", sourceType: "() => void", reason: "no schema form" }],
    });
    expect(() =>
      assembleContractDocument({
        componentId: "widget",
        entryDigest: DIGEST,
        frameworks: { svelte: dropped, react: body(), vue: body(), angular: body() },
      }),
    ).toThrow(/complete.*loss|GEN-C4/);
  });

  it("GEN-C4: a none cell requires a reason and carries no props", () => {
    const none = body({ status: "none", reason: "absent", props: undefined });
    const { document } = assembleContractDocument({
      componentId: "widget",
      entryDigest: DIGEST,
      frameworks: { svelte: none, react: body(), vue: body(), angular: body() },
    });
    expect(document.frameworks["svelte"]).not.toHaveProperty("props");
    const noReason = body({ status: "none", props: undefined });
    delete (noReason as { reason?: string }).reason;
    expect(() =>
      assembleContractDocument({
        componentId: "widget",
        entryDigest: DIGEST,
        frameworks: { svelte: noReason, react: body(), vue: body(), angular: body() },
      }),
    ).toThrow(/reason/);
  });

  it("GEN-C4: limitations are mandatory on every framework cell", () => {
    const bare = body({ limitations: [] });
    expect(() =>
      assembleContractDocument({
        componentId: "widget",
        entryDigest: DIGEST,
        frameworks: { svelte: bare, react: body(), vue: body(), angular: body() },
      }),
    ).toThrow(/limitations/);
  });

  it("the index mirrors rows and sums counts per framework", () => {
    const frameworks = { svelte: body(), react: body(), vue: body(), angular: body() };
    const first = assembleContractDocument({ componentId: "aaa", entryDigest: DIGEST, frameworks });
    const second = assembleContractDocument({ componentId: "bbb", entryDigest: DIGEST, frameworks });
    const index = assembleContractIndex({
      rows: [
        { componentId: "aaa", entryDigest: DIGEST, contractDigest: first.digest, bodies: frameworks },
        { componentId: "bbb", entryDigest: DIGEST, contractDigest: second.digest, bodies: frameworks },
      ],
      excluded: [{ componentId: "bar-chart", reason: "published" }],
    });
    expect(index.counts.contracts).toBe(2);
    expect(index.counts.byFramework["svelte"]).toEqual({ complete: 2, partial: 0, none: 0 });
    expect(index.entries.map((row) => row.componentId)).toEqual(["aaa", "bbb"]);
    expect(index.entries[0]).toMatchObject({ entryDigest: DIGEST, contractDigest: first.digest });
  });

  it("baseline deviations name the component and framework", () => {
    expect(() =>
      checkBaselineCell("widget", "svelte", body({ status: "partial" }), { status: "complete" }),
    ).toThrow(/widget.*svelte/);
    expect(() =>
      checkBaselineCell(
        "widget",
        "react",
        body({ status: "complete", slots: [{ name: "extra" }] }),
        { status: "complete", slots: [] },
      ),
    ).toThrow(/widget.*react/);
    expect(() =>
      checkBaselineCell("widget", "vue", body({ status: "complete" }), { status: "complete", props: ["renamed"] }),
    ).toThrow(/widget.*vue/);
  });

  it("the contract baseline is versioned and fail-closed", () => {
    expect(() => loadContractBaseline("/nonexistent/dir")).toThrow();
  });
});
