import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import WordCloudChart from "./lib/WordCloudChart.svelte";
import type { WordCloudChartWord } from "./lib/WordCloudChart.svelte";

describe("WordCloudChart", () => {
  const words: WordCloudChartWord[] = [
    { text: "svelte", weight: 90 },
    { text: "react", weight: 70 },
    { text: "vue", weight: 55 },
    { text: "tokens", weight: 30 },
    { text: "a11y", weight: 12 }
  ];

  it("renders one word per datum with role img and accessible data list", () => {
    const { container } = render(WordCloudChart, {
      props: { data: words, label: "Tags" }
    });

    // role img + label accessible (parité Treemap/Bar/Donut)
    expect(screen.getByRole("img", { name: "Tags" })).toBeTruthy();

    const texts = container.querySelectorAll(".st-wordCloudChart__word");
    expect(texts.length).toBe(words.length);

    // ChartDataList masqué listant chaque poids.
    const list = container.querySelector(".st-chartDataList");
    expect(list).toBeTruthy();
    expect(list?.textContent).toContain("svelte: 90");
    expect(list?.textContent).toContain("a11y: 12");
  });

  it("scales font-size with weight (heaviest word is largest)", () => {
    const { container } = render(WordCloudChart, {
      props: { data: words, label: "Tags" }
    });

    const byText = new Map<string, number>();
    container.querySelectorAll(".st-wordCloudChart__word").forEach((el) => {
      byText.set(el.textContent?.trim() ?? "", Number(el.getAttribute("font-size")));
    });

    // Le mot le plus lourd (svelte, 90) a une police plus grande que le plus léger (a11y, 12).
    expect(byText.get("svelte")!).toBeGreaterThan(byText.get("a11y")!);
    expect(byText.get("react")!).toBeGreaterThan(byText.get("tokens")!);
  });

  it("colours words by cycling the categorical palette (sorted by weight desc)", () => {
    const { container } = render(WordCloudChart, {
      props: { data: words, label: "Tags" }
    });
    // svelte (poids max) = 1re catégorie.
    const svelte = [...container.querySelectorAll(".st-wordCloudChart__word")].find(
      (el) => el.textContent?.trim() === "svelte"
    )!;
    expect(svelte.classList.contains("st-wordCloudChart__word--category1")).toBe(true);
    // react (2e poids) = 2e catégorie.
    const react = [...container.querySelectorAll(".st-wordCloudChart__word")].find(
      (el) => el.textContent?.trim() === "react"
    )!;
    expect(react.classList.contains("st-wordCloudChart__word--category2")).toBe(true);
  });

  it("shows and hides the tooltip on hover", async () => {
    const { container } = render(WordCloudChart, {
      props: { data: words, label: "Interactif" }
    });

    expect(screen.queryByRole("presentation")).toBeNull();

    const first = container.querySelector(".st-wordCloudChart__word") as Element;
    await fireEvent.pointerMove(first);

    const tooltip = screen.getByRole("presentation");
    expect(tooltip).toBeTruthy();
    expect(tooltip.textContent).toContain("svelte");
    expect(tooltip.textContent).toContain("90");

    await fireEvent.pointerLeave(
      container.querySelector(".st-wordCloudChart__visual") as Element
    );
    expect(screen.queryByRole("presentation")).toBeNull();
  });

  it("ignores non-positive / non-finite weights without crashing", () => {
    const { container } = render(WordCloudChart, {
      props: {
        data: [
          { text: "vide", weight: 0 },
          { text: "nan", weight: Number.NaN },
          { text: "plein", weight: 10 }
        ] as WordCloudChartWord[],
        label: "Filtrage"
      }
    });

    const texts = container.querySelectorAll(".st-wordCloudChart__word");
    expect(texts.length).toBe(1);
    expect(texts[0].textContent?.trim()).toBe("plein");
  });
});
