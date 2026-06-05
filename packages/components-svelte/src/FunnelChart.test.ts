import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import FunnelChart from "./lib/FunnelChart.svelte";
import type { FunnelChartDatum } from "./lib/FunnelChart.svelte";

describe("FunnelChart", () => {
  const data: FunnelChartDatum[] = [
    { label: "Visites", value: 1000 },
    { label: "Inscriptions", value: 600 },
    { label: "Achats", value: 150 }
  ];

  it("renders one polygon per step, centered, with role img", () => {
    const { container } = render(FunnelChart, {
      props: { data, label: "Tunnel de conversion" }
    });

    expect(screen.getByRole("img", { name: "Tunnel de conversion" })).toBeTruthy();
    const wrapper = container.querySelector(".st-funnelChart");
    expect(wrapper?.className).toContain("st-funnelChart");

    const polys = container.querySelectorAll(".st-funnelChart__segment");
    expect(polys.length).toBe(3);
    // Default tones cycle category1..8.
    expect(polys[0].getAttribute("class")).toContain("st-funnelChart__segment--category1");
    expect(polys[1].getAttribute("class")).toContain("st-funnelChart__segment--category2");

    // Labels + values rendered as SVG text.
    expect(screen.getByText("Visites")).toBeTruthy();
    expect(screen.getByText("Inscriptions")).toBeTruthy();
  });

  it("computes percentages ofFirst by default and ofPrevious when asked", () => {
    const { container, rerender } = render(FunnelChart, {
      props: { data, label: "Funnel", percentMode: "ofFirst" }
    });
    // ofFirst: 600/1000 = 60%, hidden a11y list contains it.
    const list = container.querySelector(".st-chartDataList");
    expect(list?.textContent).toContain("60%");
    expect(list?.textContent).toContain("15%"); // 150/1000

    rerender({ data, label: "Funnel", percentMode: "ofPrevious" });
    const list2 = container.querySelector(".st-chartDataList");
    expect(list2?.textContent).toContain("25%"); // 150/600
  });

  it("omits percentages when showPercentages is false", () => {
    const { container } = render(FunnelChart, {
      props: { data, label: "Funnel", showPercentages: false }
    });
    const list = container.querySelector(".st-chartDataList");
    expect(list?.textContent).not.toContain("%");
  });

  it("renders horizontally and shows a legend when enabled", () => {
    const { container } = render(FunnelChart, {
      props: { data, label: "Funnel", orientation: "horizontal", legend: true }
    });
    expect(container.querySelectorAll(".st-funnelChart__segment").length).toBe(3);
    const legend = container.querySelector(".st-funnelChart__legend");
    expect(legend).toBeTruthy();
    expect(legend?.querySelectorAll(".st-funnelChart__legendItem").length).toBe(3);
  });

  it("shows and hides a tooltip on pointer interactions", async () => {
    const { container } = render(FunnelChart, {
      props: { data, label: "Funnel" }
    });

    expect(screen.queryByRole("presentation")).toBeNull();

    const polys = container.querySelectorAll(".st-funnelChart__segment");
    await fireEvent.pointerMove(polys[1]);

    expect(screen.getByRole("presentation")).toBeTruthy();
    expect(screen.getAllByText("Inscriptions").length).toBeGreaterThan(0);

    await fireEvent.pointerLeave(
      container.querySelector(".st-funnelChart__visual") as Element
    );
    expect(screen.queryByRole("presentation")).toBeNull();
  });

  it("respects custom tone overrides", () => {
    const toned: FunnelChartDatum[] = [
      { label: "A", value: 100, tone: "category5" },
      { label: "B", value: 40, tone: "category6" }
    ];
    const { container } = render(FunnelChart, {
      props: { data: toned, label: "Toned" }
    });
    const polys = container.querySelectorAll(".st-funnelChart__segment");
    expect(polys[0].getAttribute("class")).toContain("st-funnelChart__segment--category5");
    expect(polys[1].getAttribute("class")).toContain("st-funnelChart__segment--category6");
  });
});
