import { fireEvent, render } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import BarChart from "./lib/BarChart.svelte";
import type { BarChartDatum } from "./lib/BarChart.svelte";

const data: BarChartDatum[] = [
  { label: "A", value: 4 },
  { label: "B", value: 8 },
  { label: "C", value: 2 }
];

describe("BarChart controlled selection", () => {
  it("is purely presentational when onSelect is absent (no regression)", () => {
    const { container } = render(BarChart, { props: { label: "Plain", data } });
    const bars = container.querySelectorAll(".st-barChart__bar");
    expect(bars.length).toBe(3);
    // The decorative bars never carry interactive ARIA — they live in an
    // aria-hidden SVG.
    for (const bar of bars) {
      expect(bar.getAttribute("role")).toBeNull();
      expect(bar.getAttribute("tabindex")).toBeNull();
      expect(bar.getAttribute("aria-pressed")).toBeNull();
      expect(bar.getAttribute("aria-label")).toBeNull();
      expect(bar.classList.contains("st-barChart__bar--interactive")).toBe(false);
    }
    // No accessible selection surface at all.
    expect(container.querySelector(".st-barChart__filters")).toBeNull();
    expect(container.querySelectorAll(".st-barChart__filterChip").length).toBe(0);
  });

  it("renders an accessible filter-chip button per bar OUTSIDE the aria-hidden SVG", () => {
    const { container } = render(BarChart, { props: { label: "Pick", data, onSelect: () => {} } });

    // Selection surface is a real group of <button>s, not <rect>s.
    const group = container.querySelector(".st-barChart__filters")!;
    expect(group.getAttribute("role")).toBe("group");
    expect(group.getAttribute("aria-label")).toBe("Filtrer par Pick");

    // The chips live outside the aria-hidden SVG.
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.contains(group)).toBe(false);

    const chips = container.querySelectorAll("button.st-barChart__filterChip");
    expect(chips.length).toBe(3);
    for (const chip of chips) {
      expect(chip.getAttribute("type")).toBe("button");
    }
    // Accessible name carries label + value.
    expect(chips[0].textContent?.trim()).toBe("A: 4");
    expect(chips[1].textContent?.trim()).toBe("B: 8");

    // Bars stay decorative — no ARIA semantics, only a mouse shortcut.
    for (const bar of container.querySelectorAll(".st-barChart__bar")) {
      expect(bar.getAttribute("role")).toBeNull();
      expect(bar.getAttribute("tabindex")).toBeNull();
      expect(bar.getAttribute("aria-pressed")).toBeNull();
    }
  });

  it("emits onSelect with the bar key (its label) when a chip button is clicked", async () => {
    const onSelect = vi.fn();
    const { container } = render(BarChart, { props: { label: "Click", data, onSelect } });
    const chips = container.querySelectorAll("button.st-barChart__filterChip");
    await fireEvent.click(chips[1]);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("B");
  });

  it("emits onSelect when a bar is clicked with the mouse (sighted shortcut)", async () => {
    const onSelect = vi.fn();
    const { container } = render(BarChart, { props: { label: "BarClick", data, onSelect } });
    const bars = container.querySelectorAll(".st-barChart__bar");
    await fireEvent.click(bars[2]);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("C");
  });

  it("activates the chip via native keyboard (Enter/Space on a real button)", async () => {
    const onSelect = vi.fn();
    const { container } = render(BarChart, { props: { label: "Keys", data, onSelect } });
    const chip = container.querySelectorAll("button.st-barChart__filterChip")[2] as HTMLButtonElement;
    // A native <button> activates on click (the event Enter/Space dispatch).
    chip.focus();
    await fireEvent.click(chip);
    expect(onSelect).toHaveBeenLastCalledWith("C");
  });

  it("reflects selectedKeys via aria-pressed on the chips and the selected classes", () => {
    const { container } = render(BarChart, {
      props: { label: "Sel", data, onSelect: () => {}, selectedKeys: ["B"] }
    });
    const chips = container.querySelectorAll("button.st-barChart__filterChip");
    expect(chips[0].getAttribute("aria-pressed")).toBe("false");
    expect(chips[1].getAttribute("aria-pressed")).toBe("true");
    expect(chips[1].classList.contains("st-barChart__filterChip--selected")).toBe(true);
    expect(chips[0].classList.contains("st-barChart__filterChip--selected")).toBe(false);

    // The bar shape echoes the selection (stroke via class).
    const bars = container.querySelectorAll(".st-barChart__bar");
    expect(bars[1].classList.contains("st-barChart__bar--selected")).toBe(true);
    expect(bars[0].classList.contains("st-barChart__bar--selected")).toBe(false);
  });

  it("dims non-selected bars when a selection is active", () => {
    const { container } = render(BarChart, {
      props: { label: "Dim", data, onSelect: () => {}, selectedKeys: ["B"] }
    });
    const bars = container.querySelectorAll(".st-barChart__bar");
    expect(bars[1].classList.contains("st-barChart__bar--dim")).toBe(false);
    expect(bars[0].classList.contains("st-barChart__bar--dim")).toBe(true);
    expect(bars[2].classList.contains("st-barChart__bar--dim")).toBe(true);
  });

  it("does not dim any bar when selectedKeys is empty", () => {
    const { container } = render(BarChart, {
      props: { label: "None", data, onSelect: () => {}, selectedKeys: [] }
    });
    const bars = container.querySelectorAll(".st-barChart__bar");
    for (const bar of bars) {
      expect(bar.classList.contains("st-barChart__bar--dim")).toBe(false);
      expect(bar.classList.contains("st-barChart__bar--selected")).toBe(false);
    }
  });
});

const tickLabels = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-barChart__tickLabel")).map((n) =>
    n.textContent?.trim()
  );

describe("BarChart shared value domain", () => {
  it("auto-scales to the data range when no domain is given", () => {
    const { container } = render(BarChart, { props: { label: "Auto", data } });
    // Data max is 8 → auto ticks top out at 8, never 100.
    const labels = tickLabels(container);
    expect(labels).toContain("8");
    expect(labels).not.toContain("100");
  });

  it("uses the provided domain for the value axis (shared scale)", () => {
    const { container } = render(BarChart, { props: { label: "Domain", data, domain: [0, 100] } });
    // The fixed domain forces the axis up to 100 regardless of the small data.
    const labels = tickLabels(container);
    expect(labels).toContain("100");
    expect(labels).not.toContain("8");
  });

  it("shrinks bars when the domain is wider than the data", () => {
    const { container: auto } = render(BarChart, { props: { label: "A", data } });
    const { container: scaled } = render(BarChart, {
      props: { label: "B", data, domain: [0, 100] }
    });
    const autoBar = auto.querySelector(".st-barChart__bar") as SVGRectElement;
    const scaledBar = scaled.querySelector(".st-barChart__bar") as SVGRectElement;
    // Same datum, wider domain → shorter bar.
    expect(Number(scaledBar.getAttribute("height"))).toBeLessThan(
      Number(autoBar.getAttribute("height"))
    );
  });

  it("falls back to auto when the domain is invalid (NaN / unordered)", () => {
    const nan = render(BarChart, {
      props: { label: "NaN", data, domain: [0, Number.NaN] as [number, number] }
    });
    expect(tickLabels(nan.container as HTMLElement)).toContain("8");
    expect(tickLabels(nan.container as HTMLElement)).not.toContain("100");

    const unordered = render(BarChart, {
      props: { label: "Rev", data, domain: [100, 0] }
    });
    expect(tickLabels(unordered.container as HTMLElement)).toContain("8");
    expect(tickLabels(unordered.container as HTMLElement)).not.toContain("100");
  });
});

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("BarChart analytical overlays + error bars", () => {
  it("renders no overlays/error bars by default (additive — zero regression)", () => {
    const { container } = render(BarChart, { props: { label: "Plain", data } });
    expect(container.querySelector(".st-barChart__band")).toBeNull();
    expect(container.querySelector(".st-barChart__refLine")).toBeNull();
    expect(container.querySelector(".st-barChart__goalLine")).toBeNull();
    expect(container.querySelector(".st-barChart__errorBar")).toBeNull();
    expect(listItems(container)).toEqual(["A: 4", "B: 8", "C: 2"]);
  });

  it("renders a reference line with a tone class and describes it", () => {
    const { container } = render(BarChart, {
      props: { label: "Ref", data, referenceLines: [{ value: 6, label: "Seuil", tone: "error" }] }
    });
    const ref = container.querySelector(".st-barChart__refLine");
    expect(ref).not.toBeNull();
    expect(ref!.classList.contains("st-barChart__refLine--error")).toBe(true);
    expect(listItems(container)).toContain("Référence: Seuil = 6");
  });

  it("renders a band and a goal line, describing both", () => {
    const { container } = render(BarChart, {
      props: { label: "BG", data, bands: [{ from: 2, to: 5, label: "Zone" }], goalLine: { value: 7 } }
    });
    expect(container.querySelector(".st-barChart__band")).not.toBeNull();
    expect(container.querySelector(".st-barChart__goalLine")).not.toBeNull();
    expect(listItems(container)).toContain("Bande: Zone (2–5)");
    expect(listItems(container)).toContain("Objectif: 7");
  });

  it("draws bands BELOW the bars and the goal line ABOVE them (document order)", () => {
    const { container } = render(BarChart, {
      props: { label: "Order", data, bands: [{ from: 2, to: 5 }], goalLine: { value: 7 } }
    });
    const nodes = Array.from(container.querySelectorAll("svg *"));
    const firstBar = nodes.findIndex((n) => n.classList.contains("st-barChart__bar"));
    const band = nodes.findIndex((n) => n.classList.contains("st-barChart__band"));
    const goal = nodes.findIndex((n) => n.classList.contains("st-barChart__goalLine"));
    expect(band).toBeGreaterThanOrEqual(0);
    expect(band).toBeLessThan(firstBar);
    expect(goal).toBeGreaterThan(firstBar);
  });

  it("renders an error-bar whisker per datum that carries finite extents", () => {
    const withErrors: BarChartDatum[] = [
      { label: "A", value: 4, errorLow: 3, errorHigh: 5 },
      { label: "B", value: 8 },
      { label: "C", value: 2, errorLow: Number.NaN, errorHigh: Number.NaN }
    ];
    const { container } = render(BarChart, { props: { label: "Err", data: withErrors } });
    // Only A has finite extents → exactly one whisker group.
    const groups = container.querySelectorAll(".st-barChart__errorBar");
    expect(groups.length).toBe(1);
    expect(groups[0].querySelectorAll(".st-barChart__errorCap").length).toBe(2);
    expect(groups[0].querySelector(".st-barChart__errorStem")).not.toBeNull();
  });

  it("extends the value domain so a reference beyond the data stays on-plot", () => {
    const { container } = render(BarChart, {
      props: { label: "Domain", data, referenceLines: [{ value: 100 }] }
    });
    expect(tickLabels(container as HTMLElement)).toContain("100");
  });

  it("does NOT widen a pinned domain for overlays (small-multiples stay aligned)", () => {
    const { container } = render(BarChart, {
      props: { label: "Pinned", data, domain: [0, 10], referenceLines: [{ value: 100 }] }
    });
    // Pinned [0,10] is authoritative — the 100 reference must not raise ticks.
    expect(tickLabels(container as HTMLElement)).not.toContain("100");
    expect(tickLabels(container as HTMLElement)).toContain("10");
  });

  it("ignores a non-finite goal value", () => {
    const { container } = render(BarChart, {
      props: { label: "NaN", data, goalLine: { value: Number.NaN } }
    });
    expect(container.querySelector(".st-barChart__goalLine")).toBeNull();
    expect(listItems(container)).toEqual(["A: 4", "B: 8", "C: 2"]);
  });
});

describe("BarChart horizontal labelPlacement (P1-1)", () => {
  it("keeps short horizontal labels unchanged at default margin (44px, x=38, text-anchor=end)", () => {
    const { container } = render(BarChart, {
      props: { label: "Short", data, orientation: "horizontal", width: 480, height: 200 }
    });
    const labels = Array.from(container.querySelectorAll(".st-barChart__categoryLabel"));
    expect(labels).toHaveLength(3);
    expect(labels[0].getAttribute("x")).toBe("38");
    expect(labels[0].getAttribute("text-anchor")).toBe("end");
    expect(labels[0].textContent?.trim()).toBe("A");
    expect(labels[0].getAttribute("aria-label")).toBeNull();
  });

  it("auto-expands left margin for medium labels up to ~40% of width without clipping", () => {
    const medium: BarChartDatum[] = [
      { label: "Inline completion", value: 70 },
      { label: "Code review", value: 45 }
    ];
    const { container } = render(BarChart, {
      props: { label: "Medium", data: medium, orientation: "horizontal", width: 640, height: 200 }
    });
    const yAxis = container.querySelectorAll(".st-barChart__axis")[0];
    const axisX = Number(yAxis.getAttribute("x1"));
    expect(axisX).toBeGreaterThan(44);
    expect(axisX).toBeLessThanOrEqual(Math.round(640 * 0.4));
    const firstLabel = container.querySelector(".st-barChart__categoryLabel")!;
    expect(firstLabel.textContent?.trim()).toBe("Inline completion");
  });

  it("auto-switches to above-bar when longest label exceeds ~40% of width and never clips start", () => {
    const longLabel = "Intégration continue avec revue automatisée et génération de tests unitaires";
    const longData: BarChartDatum[] = [
      { label: longLabel, value: 82 },
      { label: "Autre outil", value: 18 }
    ];
    const { container } = render(BarChart, {
      props: { label: "Long", data: longData, orientation: "horizontal", width: 480, height: 220 }
    });
    const firstBar = container.querySelector(".st-barChart__bar") as SVGRectElement;
    const firstLabel = container.querySelector(".st-barChart__categoryLabel") as SVGTextElement;
    expect(firstLabel.getAttribute("text-anchor")).toBe("start");
    expect(Number(firstLabel.getAttribute("x"))).toBeGreaterThanOrEqual(0);
    // Above-bar places label y above the bar's top edge
    expect(Number(firstLabel.getAttribute("y"))).toBeLessThan(Number(firstBar.getAttribute("y")));
    // If truncated, ellipsis is at the end only and start is preserved
    const text = firstLabel.textContent?.trim() ?? "";
    expect(text.startsWith("Intégration")).toBe(true);
    if (text !== longLabel) {
      expect(text.endsWith("…")).toBe(true);
      expect(firstLabel.getAttribute("aria-label")).toBe(longLabel);
    }
  });

  it("supports explicit margin mode capped at ~40% with end-ellipsis, tooltip & aria-label preserving full label", async () => {
    const longLabel = "Plateforme interne d'orchestration d'agents autonomes en production";
    const { container } = render(BarChart, {
      props: {
        label: "MarginCap",
        data: [{ label: longLabel, value: 65 }],
        orientation: "horizontal",
        labelPlacement: "margin",
        width: 480,
        height: 160
      }
    });
    const yAxis = container.querySelectorAll(".st-barChart__axis")[0];
    expect(Number(yAxis.getAttribute("x1"))).toBeLessThanOrEqual(Math.round(480 * 0.4));

    const catLabel = container.querySelector(".st-barChart__categoryLabel") as SVGTextElement;
    const visibleText = catLabel.textContent?.trim() ?? "";
    expect(visibleText.startsWith("Plateforme")).toBe(true);
    expect(visibleText.endsWith("…")).toBe(true);
    expect(Number(catLabel.getAttribute("x"))).toBeGreaterThanOrEqual(0);
    expect(catLabel.getAttribute("text-anchor")).toBe("start");
    expect(catLabel.getAttribute("aria-label")).toBe(longLabel);

    // Full label in accessible ChartDataList and hover tooltip
    expect(listItems(container)).toContain(`${longLabel}: 65`);
    const bar = container.querySelector(".st-barChart__bar")!;
    await fireEvent.pointerMove(bar);
    expect(container.querySelector(".st-barChart__tooltipLabel")?.textContent?.trim()).toBe(longLabel);
  });

  it("supports above-bar, inside-bar, and after-value placements with right margin for outside dataLabels", () => {
    const sample: BarChartDatum[] = [
      { label: "Inline completion", value: 100 },
      { label: "Chat", value: 5 }
    ];

    const above = render(BarChart, {
      props: {
        label: "Above",
        data: sample,
        orientation: "horizontal",
        labelPlacement: "above-bar",
        domain: [0, 100],
        dataLabels: { format: (v) => `${v} %` },
        width: 480,
        height: 200
      }
    }).container;
    const aboveBar = above.querySelector(".st-barChart__bar") as SVGRectElement;
    const aboveLabel = above.querySelector(".st-barChart__categoryLabel") as SVGTextElement;
    const aboveVal = above.querySelector(".st-barChart__dataLabel") as SVGTextElement;
    expect(Number(aboveLabel.getAttribute("y"))).toBeLessThan(Number(aboveBar.getAttribute("y")));
    // 100% data label must leave right margin so it stays well inside viewBox width
    expect(Number(aboveVal.getAttribute("x"))).toBeLessThan(480 - 24);

    const inside = render(BarChart, {
      props: {
        label: "Inside",
        data: sample,
        orientation: "horizontal",
        labelPlacement: "inside-bar",
        domain: [0, 100],
        width: 480,
        height: 200
      }
    }).container;
    const insideBars = inside.querySelectorAll(".st-barChart__bar");
    const insideLabels = inside.querySelectorAll(".st-barChart__categoryLabel");
    // Wide bar (100%) places label inside the bar
    expect(Number(insideLabels[0].getAttribute("x"))).toBeGreaterThan(Number(insideBars[0].getAttribute("x")));
    expect(insideLabels[0].classList.contains("st-barChart__categoryLabel--inside")).toBe(true);
    // Narrow bar (5%) falls back outside past bar end so text remains legible
    expect(insideLabels[1].classList.contains("st-barChart__categoryLabel--inside")).toBe(false);

    const after = render(BarChart, {
      props: {
        label: "After",
        data: sample,
        orientation: "horizontal",
        labelPlacement: "after-value",
        domain: [0, 100],
        dataLabels: { format: (v) => `${v}%` },
        width: 480,
        height: 200
      }
    }).container;
    const afterVal = after.querySelector(".st-barChart__dataLabel") as SVGTextElement;
    const afterLabel = after.querySelector(".st-barChart__categoryLabel") as SVGTextElement;
    expect(afterLabel.getAttribute("text-anchor")).toBe("start");
    expect(Number(afterLabel.getAttribute("x"))).toBeGreaterThan(Number(afterVal.getAttribute("x")));
  });

  it("accounts for labelFontSize (e.g. 18px projection) when measuring, truncating, and clipping horizontal labels", () => {
    const label89 =
      "Automated code review and pull-request triage integrated across our continuous delivery!!";
    const label60 = "Interactive pair-programming assistant inside primary IDE now";
    expect(label89.length).toBe(89);
    expect(label60.length).toBe(61);

    const { container } = render(BarChart, {
      props: {
        label: "ProjectionMain",
        data: [
          { label: label89, value: 82 },
          { label: label60, value: 45 }
        ],
        orientation: "horizontal",
        labelPlacement: "above-bar",
        labelFontSize: 18,
        domain: [0, 100],
        dataLabels: { format: (v) => `${v}%` },
        width: 640,
        height: 220
      }
    });

    const root = container.querySelector(".st-barChart") as HTMLElement;
    expect(root.getAttribute("style")).toContain("--st-component-barChart-labelFontSize: 18px");

    const svg = container.querySelector("svg") as SVGSVGElement;
    expect(svg.classList.contains("st-barChart__svg--horizontal")).toBe(true);

    const labels = Array.from(container.querySelectorAll(".st-barChart__categoryLabel")) as SVGTextElement[];
    // At 18px bold on width=640, an 89-char label must be end-truncated (not left untruncated to ~865px)
    const firstVisible = labels[0].textContent?.replace(label89, "").trim() ?? "";
    const firstTitle = labels[0].querySelector("title")?.textContent ?? "";
    expect(firstTitle).toBe(label89);
    expect(labels[0].getAttribute("aria-label")).toBe(label89);
    expect(firstVisible.startsWith("Automated code review")).toBe(true);
    expect(firstVisible.endsWith("…")).toBe(true);
    expect(firstVisible.length).toBeLessThan(65);

    // Segment chart width=460 at 18px must also truncate 60-char labels well within viewBox
    const seg = render(BarChart, {
      props: {
        label: "ProjectionSeg",
        data: [{ label: label60, value: 100 }],
        orientation: "horizontal",
        labelPlacement: "above-bar",
        labelFontSize: 18,
        domain: [0, 100],
        dataLabels: { format: (v) => `${v}%` },
        width: 460,
        height: 160
      }
    }).container;
    const segLabel = seg.querySelector(".st-barChart__categoryLabel") as SVGTextElement;
    expect(segLabel.getAttribute("aria-label")).toBe(label60);
    const segVisible = segLabel.textContent?.replace(label60, "").trim() ?? "";
    expect(segVisible.startsWith("Interactive")).toBe(true);
    expect(segVisible.endsWith("…")).toBe(true);
    expect(segVisible.length).toBeLessThan(42);
    // 100% data label at 18px gets wider right margin so it stays inside 460
    const segVal = seg.querySelector(".st-barChart__dataLabel") as SVGTextElement;
    expect(Number(segVal.getAttribute("x"))).toBeLessThan(460 - 50);

    // Auto placement switches to above-bar earlier when labelFontSize=18 exceeds 40% cap
    const auto18 = render(BarChart, {
      props: {
        label: "Auto18",
        data: [{ label: "Continuous integration", value: 60 }],
        orientation: "horizontal",
        labelFontSize: 18,
        width: 480,
        height: 160
      }
    }).container;
    const autoBar = auto18.querySelector(".st-barChart__bar") as SVGRectElement;
    const autoLabel = auto18.querySelector(".st-barChart__categoryLabel") as SVGTextElement;
    expect(Number(autoLabel.getAttribute("y"))).toBeLessThan(Number(autoBar.getAttribute("y")));
  });
});
