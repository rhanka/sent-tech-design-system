import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WordCloudChart, type WordCloudChartWord } from "./WordCloudChart.js";

const words: WordCloudChartWord[] = [
  { text: "svelte", weight: 90 },
  { text: "react", weight: 70 },
  { text: "vue", weight: 55 },
  { text: "tokens", weight: 30 },
  { text: "a11y", weight: 12 },
];

const wordEls = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-wordCloudChart__word"));

describe("WordCloudChart", () => {
  it("renders one word per datum with role img and accessible data list", () => {
    const { container } = render(<WordCloudChart label="Tags" data={words} />);

    expect(screen.getByRole("img", { name: "Tags" })).toBeTruthy();
    expect(wordEls(container).length).toBe(words.length);

    const list = container.querySelector(".st-chartDataList");
    expect(list).toBeTruthy();
    expect(list?.textContent).toContain("svelte: 90");
    expect(list?.textContent).toContain("a11y: 12");
  });

  it("scales font-size with weight (heaviest word is largest)", () => {
    const { container } = render(<WordCloudChart label="Tags" data={words} />);
    const byText = new Map<string, number>();
    wordEls(container).forEach((el) => {
      byText.set(el.textContent?.trim() ?? "", Number(el.getAttribute("font-size")));
    });
    expect(byText.get("svelte")!).toBeGreaterThan(byText.get("a11y")!);
    expect(byText.get("react")!).toBeGreaterThan(byText.get("tokens")!);
  });

  it("colours words by cycling the categorical palette (sorted by weight desc)", () => {
    const { container } = render(<WordCloudChart label="Tags" data={words} />);
    const svelte = wordEls(container).find((el) => el.textContent?.trim() === "svelte")!;
    expect(svelte.classList.contains("st-wordCloudChart__word--category1")).toBe(true);
    const react = wordEls(container).find((el) => el.textContent?.trim() === "react")!;
    expect(react.classList.contains("st-wordCloudChart__word--category2")).toBe(true);
  });

  it("shows and hides the tooltip on hover", () => {
    const { container } = render(<WordCloudChart label="Interactif" data={words} />);
    expect(screen.queryByRole("presentation")).toBeNull();

    fireEvent.pointerMove(container.querySelector(".st-wordCloudChart__word") as Element);
    const tooltip = screen.getByRole("presentation");
    expect(tooltip.textContent).toContain("svelte");
    expect(tooltip.textContent).toContain("90");

    fireEvent.pointerLeave(container.querySelector(".st-wordCloudChart__visual") as Element);
    expect(screen.queryByRole("presentation")).toBeNull();
  });

  it("ignores non-positive / non-finite weights without crashing", () => {
    const { container } = render(
      <WordCloudChart
        label="Filtrage"
        data={
          [
            { text: "vide", weight: 0 },
            { text: "nan", weight: Number.NaN },
            { text: "plein", weight: 10 },
          ] as WordCloudChartWord[]
        }
      />,
    );
    const texts = wordEls(container);
    expect(texts.length).toBe(1);
    expect(texts[0].textContent?.trim()).toBe("plein");
  });
});
