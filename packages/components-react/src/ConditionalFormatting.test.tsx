import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { DataTable, type DataTableColumn, type DataTableRow } from "./DataTable.js";
import { KpiCard } from "./KpiCard.js";
import type { CellDecoration } from "./cellDecoration.js";

afterEach(cleanup);

const columns: DataTableColumn[] = [
  { key: "metric", label: "Metric" },
  { key: "value", label: "Value", align: "end" },
];

const rows: DataTableRow[] = [
  { id: "rev", metric: "Revenue", value: "120" },
  { id: "churn", metric: "Churn", value: "8" },
];

describe("DataTable conditional formatting", () => {
  it("applies the decoration map to the correct cell and intent class", () => {
    const decorations: Record<string, Record<string, CellDecoration>> = {
      rev: { value: { intent: "positive" } },
      churn: { value: { intent: "negative" } },
    };
    const { container } = render(<DataTable columns={columns} rows={rows} decorations={decorations} />);
    const positive = container.querySelector(".st-cell--intent-positive");
    const negative = container.querySelector(".st-cell--intent-negative");
    expect(positive).toBeTruthy();
    expect(negative).toBeTruthy();
    expect(positive?.tagName).toBe("TD");
    // The positive decoration is on the Revenue row's value cell.
    expect(positive?.textContent).toContain("120");
    expect(negative?.textContent).toContain("8");
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
      const { container, unmount } = render(
        <DataTable
          columns={columns}
          rows={[{ id: "r", metric: "m", value: "1" }]}
          decorations={{ r: { value: { intent } } }}
        />,
      );
      expect(container.querySelector(`.st-cell--intent-${intent}`)).toBeTruthy();
      unmount();
    }
  });

  it("supports the column cellDecoration callback", () => {
    const cols: DataTableColumn[] = [
      { key: "metric", label: "Metric" },
      {
        key: "value",
        label: "Value",
        cellDecoration: (_row, value) =>
          Number(value) > 100 ? { intent: "positive", icon: "trending-up" } : null,
      },
    ];
    const { container } = render(<DataTable columns={cols} rows={rows} />);
    const positives = container.querySelectorAll(".st-cell--intent-positive");
    // Only the Revenue row (value 120 > 100) is decorated.
    expect(positives.length).toBe(1);
    expect(container.querySelector(".st-cell__icon")).toBeTruthy();
  });

  it("map wins over the column callback when both are present", () => {
    const cols: DataTableColumn[] = [
      { key: "metric", label: "Metric" },
      { key: "value", label: "Value", cellDecoration: () => ({ intent: "warning" }) },
    ];
    const { container } = render(
      <DataTable
        columns={cols}
        rows={[{ id: "r", metric: "m", value: "1" }]}
        decorations={{ r: { value: { intent: "info" } } }}
      />,
    );
    expect(container.querySelector(".st-cell--intent-info")).toBeTruthy();
    expect(container.querySelector(".st-cell--intent-warning")).toBeNull();
  });

  it("renders a known lucide icon and ignores an unknown one", () => {
    const { container } = render(
      <DataTable
        columns={columns}
        rows={[{ id: "r", metric: "m", value: "1" }]}
        decorations={{ r: { value: { intent: "positive", icon: "trending-up" } } }}
      />,
    );
    expect(container.querySelector(".st-cell__icon")).toBeTruthy();

    cleanup();
    const { container: c2 } = render(
      <DataTable
        columns={columns}
        rows={[{ id: "r", metric: "m", value: "1" }]}
        decorations={{ r: { value: { intent: "positive", icon: "not-a-real-icon" } } }}
      />,
    );
    // Unknown icon ignored gracefully, but the intent class still applies.
    expect(c2.querySelector(".st-cell__icon")).toBeNull();
    expect(c2.querySelector(".st-cell--intent-positive")).toBeTruthy();
  });

  it("exposes the intent to assistive tech (title + SR text), not color only", () => {
    const { container } = render(
      <DataTable
        columns={columns}
        rows={[{ id: "r", metric: "m", value: "1" }]}
        decorations={{ r: { value: { intent: "positive" } } }}
      />,
    );
    const cell = container.querySelector(".st-cell--intent-positive") as HTMLElement;
    expect(cell.getAttribute("title")).toBe("tendance positive");
    expect(cell.querySelector(".st-visually-hidden")?.textContent).toBe("tendance positive");
  });
});

describe("KpiCard conditional formatting", () => {
  it("applies the decoration intent class and icon to the card", () => {
    const { container } = render(
      <KpiCard label="Revenue" value={1200} decoration={{ intent: "positive", icon: "trending-up" }} />,
    );
    const card = container.querySelector(".st-kpiCard") as HTMLElement;
    expect(card.className).toContain("st-cell--intent-positive");
    expect(card.querySelector(".st-cell__icon")).toBeTruthy();
  });

  it("includes the intent description in the card aria-label", () => {
    const { container } = render(
      <KpiCard label="Churn" value={8} decoration={{ intent: "negative" }} />,
    );
    const card = container.querySelector(".st-kpiCard") as HTMLElement;
    expect(card.getAttribute("aria-label")).toContain("tendance négative");
  });
});
