import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import RoseChart from "./lib/RoseChart.svelte";
import ViolinChart from "./lib/ViolinChart.svelte";

describe("RoseChart", () => {
  it("renders one equal-angle sector per datum with category tones and SR values", () => {
    const { container } = render(RoseChart, {
      props: {
        label: "Activity rose",
        data: [
          { label: "Jan", value: 40 },
          { label: "Feb", value: 20, tone: "category5" },
          { label: "Mar", value: 80 }
        ]
      }
    });

    expect(screen.getByRole("img", { name: "Activity rose" })).toBeTruthy();
    expect(container.querySelectorAll(".st-roseChart__sector")).toHaveLength(3);
    expect(container.querySelector(".st-roseChart__sector--category5")).toBeTruthy();
    expect(Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)).toEqual([
      "Jan: 40",
      "Feb: 20",
      "Mar: 80"
    ]);
  });

  it("scales radius by sqrt(value/max) so area is proportional to value", () => {
    const { container } = render(RoseChart, {
      props: {
        label: "Rose scale",
        width: 200,
        height: 200,
        // single datum at max => full outer radius, sweep = full circle
        data: [{ label: "Full", value: 100 }]
      }
    });

    // outerLimit = min(200,200)/2 - 6 = 94. sqrt(100/100)*94 = 94.
    const path = container.querySelector(".st-roseChart__sector")?.getAttribute("d") ?? "";
    expect(path.includes("94")).toBe(true);
  });

  it("ignores non-finite and negative values (no sector, excluded from max)", () => {
    const { container } = render(RoseChart, {
      props: {
        label: "Rose with bad values",
        data: [
          { label: "Good", value: 50 },
          { label: "NaN", value: Number.NaN },
          { label: "Neg", value: -10 }
        ]
      }
    });

    // only the finite positive datum draws a sector path
    expect(container.querySelectorAll(".st-roseChart__sector")).toHaveLength(1);
    expect(Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)).toEqual([
      "Good: 50",
      "NaN: 0",
      "Neg: 0"
    ]);
  });

  it("renders empty data without crashing", () => {
    const { container } = render(RoseChart, {
      props: { label: "Empty rose", data: [] }
    });
    expect(screen.getByRole("img", { name: "Empty rose" })).toBeTruthy();
    expect(container.querySelectorAll(".st-roseChart__sector")).toHaveLength(0);
  });

  it("shows a tooltip on pointer move over a sector", async () => {
    const { container } = render(RoseChart, {
      props: {
        label: "Rose hover",
        data: [
          { label: "A", value: 60 },
          { label: "B", value: 90 }
        ]
      }
    });

    await fireEvent.pointerMove(container.querySelector('.st-roseChart__sector[data-chart-index="1"]') as Element);
    expect(container.querySelector(".st-roseChart__tooltip")).toBeTruthy();
    expect(container.querySelector(".st-roseChart__tooltipLabel")?.textContent).toBe("B");
  });
});

describe("ViolinChart", () => {
  it("renders one mirrored shape per category with quartile overlays and SR summaries", () => {
    const { container } = render(ViolinChart, {
      props: {
        label: "Latency violins",
        data: [
          { label: "API", values: [10, 12, 14, 20, 22, 28, 30] },
          { label: "Jobs", values: [5, 8, 9, 11, 40], tone: "category4" }
        ]
      }
    });

    expect(screen.getByRole("img", { name: "Latency violins" })).toBeTruthy();
    expect(container.querySelectorAll(".st-violinChart__shape")).toHaveLength(2);
    expect(container.querySelector(".st-violinChart__shape--category4")).toBeTruthy();
    expect(container.querySelectorAll(".st-violinChart__median")).toHaveLength(2);
    expect(container.querySelectorAll(".st-violinChart__box")).toHaveLength(2);
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items[0]).toBe("API: 7 points, min 10, median 20, max 30");
    expect(items[1]).toBe("Jobs: 5 points, min 5, median 9, max 40");
  });

  it("draws a closed mirror path symmetric around the band center", () => {
    const { container } = render(ViolinChart, {
      props: {
        label: "Violin symmetry",
        width: 200,
        height: 200,
        data: [{ label: "One", values: [1, 2, 2, 3] }]
      }
    });
    const d = container.querySelector(".st-violinChart__shape")?.getAttribute("d") ?? "";
    expect(d.startsWith("M ")).toBe(true);
    expect(d.trim().endsWith("Z")).toBe(true);
  });

  it("excludes non-finite values and skips empty categories", () => {
    const { container } = render(ViolinChart, {
      props: {
        label: "Violin cleaning",
        data: [
          { label: "Good", values: [1, 2, Number.NaN, 3, Number.POSITIVE_INFINITY] },
          { label: "Empty", values: [] },
          { label: "AllNaN", values: [Number.NaN, Number.NaN] }
        ]
      }
    });

    // only "Good" survives (one finite category)
    expect(container.querySelectorAll(".st-violinChart__shape")).toHaveLength(1);
    expect(Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)).toEqual([
      "Good: 3 points, min 1, median 2, max 3"
    ]);
  });

  it("hides quartile overlays when quartiles is false", () => {
    const { container } = render(ViolinChart, {
      props: {
        label: "Violin no quartiles",
        quartiles: false,
        data: [{ label: "A", values: [1, 2, 3, 4] }]
      }
    });
    expect(container.querySelectorAll(".st-violinChart__shape")).toHaveLength(1);
    expect(container.querySelectorAll(".st-violinChart__median")).toHaveLength(0);
    expect(container.querySelectorAll(".st-violinChart__box")).toHaveLength(0);
  });

  it("renders empty data without crashing", () => {
    const { container } = render(ViolinChart, {
      props: { label: "Empty violin", data: [] }
    });
    expect(screen.getByRole("img", { name: "Empty violin" })).toBeTruthy();
    expect(container.querySelectorAll(".st-violinChart__shape")).toHaveLength(0);
  });
});
