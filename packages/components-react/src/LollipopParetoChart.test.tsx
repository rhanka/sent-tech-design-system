import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import { LollipopChart, ParetoChart } from "./index.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("LollipopChart parity with Svelte", () => {
  it("renders one stem + dot per datum and SR values", () => {
    const { container } = render(
      <LollipopChart
        label="Lollipop demo"
        data={[
          { label: "A", value: 30 },
          { label: "B", value: 50, tone: "category2" },
          { label: "C", value: 20 },
        ]}
      />
    );

    expect(container.querySelectorAll(".st-lollipopChart__stem")).toHaveLength(3);
    expect(container.querySelectorAll(".st-lollipopChart__dot")).toHaveLength(3);
    expect(
      Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)
    ).toEqual(["A: 30", "B: 50", "C: 20"]);
  });

  it("applies the tone class to dots", () => {
    const { container } = render(
      <LollipopChart
        label="Tones"
        data={[
          { label: "A", value: 10, tone: "category3" },
          { label: "B", value: 20 },
        ]}
      />
    );
    expect(container.querySelector(".st-lollipopChart__dot--category3")).toBeTruthy();
    expect(container.querySelector(".st-lollipopChart__dot--category1")).toBeTruthy();
  });

  it("supports horizontal orientation", () => {
    const { container } = render(
      <LollipopChart
        label="Horizontal"
        orientation="horizontal"
        data={[
          { label: "A", value: 30 },
          { label: "B", value: 50 },
        ]}
      />
    );
    expect(container.querySelectorAll(".st-lollipopChart__dot")).toHaveLength(2);
  });

  it("honours a fixed domain (taller value → smaller cy in vertical)", () => {
    const { container } = render(
      <LollipopChart
        label="Domain"
        domain={[0, 100]}
        data={[
          { label: "Low", value: 10 },
          { label: "High", value: 90 },
        ]}
      />
    );
    const dots = container.querySelectorAll(".st-lollipopChart__dot");
    expect(Number(dots[1].getAttribute("cy"))).toBeLessThan(Number(dots[0].getAttribute("cy")));
  });

  it("ignores an invalid domain (no crash)", () => {
    const { container } = render(
      <LollipopChart label="Bad domain" domain={[100, 0]} data={[{ label: "A", value: 40 }]} />
    );
    expect(container.querySelectorAll(".st-lollipopChart__dot")).toHaveLength(1);
  });

  it("shows tooltip on pointer move", () => {
    const { container } = render(
      <LollipopChart label="Tooltip" data={[{ label: "A", value: 40 }]} />
    );
    fireEvent.pointerMove(container.querySelector(".st-lollipopChart__dot") as Element);
    expect(container.querySelector(".st-lollipopChart__tooltip")).toBeTruthy();
  });

  it("skips datum with NaN/Infinity value", () => {
    const { container } = render(
      <LollipopChart
        label="Invalid"
        data={[
          { label: "Valid", value: 50 },
          { label: "NaN", value: NaN },
          { label: "Inf", value: Infinity },
        ]}
      />
    );
    expect(container.querySelectorAll(".st-lollipopChart__dot")).toHaveLength(1);
  });

  it("renders nothing breaking on empty data", () => {
    const { container } = render(<LollipopChart label="Empty" data={[]} />);
    expect(container.querySelectorAll(".st-lollipopChart__dot")).toHaveLength(0);
  });
});

describe("ParetoChart parity with Svelte", () => {
  it("renders bars sorted descending + cumulative line, SR values incl. cumulative %", () => {
    const { container } = render(
      <ParetoChart
        label="Pareto demo"
        data={[
          { label: "A", value: 30 },
          { label: "B", value: 50 },
          { label: "C", value: 20 },
        ]}
      />
    );

    expect(container.querySelectorAll(".st-paretoChart__bar")).toHaveLength(3);
    expect(container.querySelector(".st-paretoChart__cumLine")).toBeTruthy();
    expect(container.querySelectorAll(".st-paretoChart__cumDot")).toHaveLength(3);
    expect(
      Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)
    ).toEqual([
      "B: 50 (50% cumulé)",
      "A: 30 (80% cumulé)",
      "C: 20 (100% cumulé)",
    ]);
  });

  it("renders category labels in descending value order", () => {
    const { container } = render(
      <ParetoChart
        label="Order"
        data={[
          { label: "small", value: 5 },
          { label: "big", value: 90 },
          { label: "mid", value: 40 },
        ]}
      />
    );
    expect(
      Array.from(container.querySelectorAll(".st-paretoChart__categoryLabel")).map((n) =>
        n.textContent?.trim()
      )
    ).toEqual(["big", "mid", "small"]);
  });

  it("applies the tone class to bars", () => {
    const { container } = render(
      <ParetoChart
        label="Tones"
        data={[
          { label: "A", value: 30, tone: "category4" },
          { label: "B", value: 10 },
        ]}
      />
    );
    expect(container.querySelector(".st-paretoChart__bar--category4")).toBeTruthy();
  });

  it("shows tooltip on pointer move over a cumulative dot", () => {
    const { container } = render(
      <ParetoChart label="Tooltip" data={[{ label: "A", value: 40 }]} />
    );
    fireEvent.pointerMove(container.querySelector(".st-paretoChart__cumDot") as Element);
    expect(container.querySelector(".st-paretoChart__tooltip")).toBeTruthy();
  });

  it("skips datum with NaN/Infinity/negative value", () => {
    const { container } = render(
      <ParetoChart
        label="Invalid"
        data={[
          { label: "Valid", value: 50 },
          { label: "NaN", value: NaN },
          { label: "Inf", value: Infinity },
          { label: "Neg", value: -10 },
        ]}
      />
    );
    expect(container.querySelectorAll(".st-paretoChart__bar")).toHaveLength(1);
  });

  it("renders nothing breaking on empty data (no cumulative line)", () => {
    const { container } = render(<ParetoChart label="Empty" data={[]} />);
    expect(container.querySelectorAll(".st-paretoChart__bar")).toHaveLength(0);
    expect(container.querySelector(".st-paretoChart__cumLine")).toBeNull();
  });

  it("reaches 100% cumulative on the last point", () => {
    const { container } = render(
      <ParetoChart
        label="Full"
        data={[
          { label: "A", value: 10 },
          { label: "B", value: 30 },
        ]}
      />
    );
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map(
      (n) => n.textContent
    );
    expect(items[items.length - 1]).toContain("100% cumulé");
  });
});
