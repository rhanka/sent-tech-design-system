import { afterEach, describe, expect, it } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { DataTable, KpiCard } from "./index.js";
import type { CellDecoration, DataTableColumn, DataTableRow } from "./index.js";

const mounted: VueWrapper[] = [];
function track<T extends VueWrapper>(wrapper: T): T {
  mounted.push(wrapper);
  return wrapper;
}
afterEach(() => {
  while (mounted.length) mounted.pop()?.unmount();
});

const columns: DataTableColumn[] = [
  { key: "metric", label: "Metric" },
  { key: "value", label: "Value", align: "end" },
];

const rows: DataTableRow[] = [
  { id: "rev", metric: "Revenue", value: "120" },
  { id: "churn", metric: "Churn", value: "8" },
];

describe("DataTable conditional formatting (vue)", () => {
  it("applies the decoration map to the correct cell and intent class", () => {
    const decorations: Record<string, Record<string, CellDecoration>> = {
      rev: { value: { intent: "positive" } },
      churn: { value: { intent: "negative" } },
    };
    const wrapper = track(mount(DataTable, { props: { columns, rows, decorations } }));
    const positive = wrapper.find(".st-cell--intent-positive");
    const negative = wrapper.find(".st-cell--intent-negative");
    expect(positive.exists()).toBe(true);
    expect(negative.exists()).toBe(true);
    expect(positive.element.tagName).toBe("TD");
    expect(positive.text()).toContain("120");
    expect(negative.text()).toContain("8");
  });

  it("resolves intent → st-cell--intent-<intent> for every intent", () => {
    const intents: CellDecoration["intent"][] = [
      "positive",
      "negative",
      "warning",
      "info",
      "neutral",
    ];
    for (const intent of intents) {
      const wrapper = track(
        mount(DataTable, {
          props: {
            columns,
            rows: [{ id: "r", metric: "m", value: "1" }],
            decorations: { r: { value: { intent } } },
          },
        }),
      );
      expect(wrapper.find(`.st-cell--intent-${intent}`).exists()).toBe(true);
    }
  });

  it("supports the column cellDecoration callback and renders the icon", () => {
    const cols: DataTableColumn[] = [
      { key: "metric", label: "Metric" },
      {
        key: "value",
        label: "Value",
        cellDecoration: (_row, value) =>
          Number(value) > 100 ? { intent: "positive", icon: "trending-up" } : null,
      },
    ];
    const wrapper = track(mount(DataTable, { props: { columns: cols, rows } }));
    expect(wrapper.findAll(".st-cell--intent-positive").length).toBe(1);
    expect(wrapper.find(".st-cell__icon").exists()).toBe(true);
  });

  it("map wins over the column callback when both are present", () => {
    const cols: DataTableColumn[] = [
      { key: "metric", label: "Metric" },
      { key: "value", label: "Value", cellDecoration: () => ({ intent: "warning" }) },
    ];
    const wrapper = track(
      mount(DataTable, {
        props: {
          columns: cols,
          rows: [{ id: "r", metric: "m", value: "1" }],
          decorations: { r: { value: { intent: "info" } } },
        },
      }),
    );
    expect(wrapper.find(".st-cell--intent-info").exists()).toBe(true);
    expect(wrapper.find(".st-cell--intent-warning").exists()).toBe(false);
  });

  it("ignores an unknown icon but keeps the intent class", () => {
    const wrapper = track(
      mount(DataTable, {
        props: {
          columns,
          rows: [{ id: "r", metric: "m", value: "1" }],
          decorations: { r: { value: { intent: "positive", icon: "not-a-real-icon" } } },
        },
      }),
    );
    expect(wrapper.find(".st-cell__icon").exists()).toBe(false);
    expect(wrapper.find(".st-cell--intent-positive").exists()).toBe(true);
  });

  it("exposes the intent to assistive tech (title + SR text), not color only", () => {
    const wrapper = track(
      mount(DataTable, {
        props: {
          columns,
          rows: [{ id: "r", metric: "m", value: "1" }],
          decorations: { r: { value: { intent: "positive" } } },
        },
      }),
    );
    const cell = wrapper.find(".st-cell--intent-positive");
    expect(cell.attributes("title")).toBe("tendance positive");
    expect(cell.find(".st-visually-hidden").text()).toBe("tendance positive");
  });
});

describe("KpiCard conditional formatting (vue)", () => {
  it("applies the decoration intent class and icon to the card", () => {
    const wrapper = track(
      mount(KpiCard, {
        props: {
          label: "Revenue",
          value: 1200,
          decoration: { intent: "positive", icon: "trending-up" },
        },
      }),
    );
    const card = wrapper.find(".st-kpiCard");
    expect(card.classes()).toContain("st-cell--intent-positive");
    expect(card.find(".st-cell__icon").exists()).toBe(true);
  });

  it("includes the intent description in the card aria-label", () => {
    const wrapper = track(
      mount(KpiCard, {
        props: { label: "Churn", value: 8, decoration: { intent: "negative" } },
      }),
    );
    const card = wrapper.find(".st-kpiCard");
    expect(card.attributes("aria-label")).toContain("tendance négative");
  });
});
