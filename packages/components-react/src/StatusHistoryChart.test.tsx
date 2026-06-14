import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusHistoryChart } from "./StatusHistoryChart.js";

const services = [
  {
    series: "API",
    buckets: [
      { at: 0, value: "OK", tone: "success" as const },
      { at: 1, value: "Degraded", tone: "warning" as const },
      { at: 2, value: "OK", tone: "success" as const },
    ],
  },
  {
    series: "DB",
    buckets: [
      { at: 0, value: "OK", tone: "success" as const },
      { at: 1, value: "Down", tone: "error" as const },
      { at: 2, value: "OK", tone: "success" as const },
    ],
  },
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("StatusHistoryChart", () => {
  it("renders one cell per bucket across all rows", () => {
    const { container } = render(<StatusHistoryChart label="Disponibilité" data={services} />);
    expect(container.querySelector('[role="img"]')).toBeTruthy();
    expect(container.querySelectorAll(".st-statusHistoryChart__cell").length).toBe(6);
  });

  it("colours cells by explicit tone and renders a status legend", () => {
    const { container } = render(<StatusHistoryChart label="Disponibilité" data={services} />);
    expect(container.querySelector(".st-statusHistoryChart__cell--success")).toBeTruthy();
    expect(container.querySelector(".st-statusHistoryChart__cell--warning")).toBeTruthy();
    expect(container.querySelector(".st-statusHistoryChart__cell--error")).toBeTruthy();
    expect(container.querySelectorAll(".st-statusHistoryChart__legendItem").length).toBe(3);
  });

  it("derives a stable categoryN tone per status when no tone is given", () => {
    const { container } = render(
      <StatusHistoryChart
        label="Phases"
        data={[
          {
            series: "Row",
            buckets: [
              { at: 0, value: "boot" },
              { at: 1, value: "run" },
              { at: 2, value: "boot" },
            ],
          },
        ]}
      />,
    );
    const cells = container.querySelectorAll(".st-statusHistoryChart__cell");
    expect(cells[0].classList.contains("st-statusHistoryChart__cell--category1")).toBe(true);
    expect(cells[1].classList.contains("st-statusHistoryChart__cell--category2")).toBe(true);
    expect(cells[2].classList.contains("st-statusHistoryChart__cell--category1")).toBe(true);
  });

  it("lays buckets out as a time grid (later bucket sits to the right)", () => {
    const { container } = render(<StatusHistoryChart label="P" data={services} />);
    const cells = container.querySelectorAll<SVGRectElement>(".st-statusHistoryChart__cell");
    const x0 = Number(cells[0].getAttribute("x"));
    const x1 = Number(cells[1].getAttribute("x"));
    expect(x1).toBeGreaterThan(x0);
  });

  it("summarises each row in the accessible data list", () => {
    const { container } = render(
      <StatusHistoryChart
        label="P"
        data={[{ series: "API", buckets: [{ at: 0, value: "OK" }, { at: 1, value: "Down" }] }]}
      />,
    );
    expect(listItems(container)[0]).toBe("API: 0 = OK, 1 = Down");
  });

  it("drops non-finite buckets and unlabeled rows before rendering", () => {
    const { container } = render(
      <StatusHistoryChart
        label="Filtré"
        data={[
          { series: "", buckets: [{ at: 0, value: "A" }] },
          {
            series: "Ok",
            buckets: [
              { at: Number.NaN, value: "bad" },
              { at: 1, value: "good" },
            ],
          },
        ]}
      />,
    );
    expect(container.querySelectorAll(".st-statusHistoryChart__cell").length).toBe(1);
  });
});
