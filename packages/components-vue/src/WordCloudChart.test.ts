import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { WordCloudChart, type WordCloudChartWord } from "./WordCloudChart.js";

const words: WordCloudChartWord[] = [
  { text: "svelte", weight: 90 },
  { text: "react", weight: 70 },
  { text: "vue", weight: 55 },
  { text: "tokens", weight: 30 },
  { text: "a11y", weight: 12 },
];

const wordEls = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-wordCloudChart__word"));

describe("WordCloudChart", () => {
  it("renders one word per datum with role img and accessible data list", () => {
    const wrapper = mount(WordCloudChart, { props: { label: "Tags", data: words } });
    const el = wrapper.element as HTMLElement;

    expect(el.querySelector('[role="img"][aria-label="Tags"]')).toBeTruthy();
    expect(wordEls(el).length).toBe(words.length);

    const list = el.querySelector(".st-chartDataList");
    expect(list).toBeTruthy();
    expect(list?.textContent).toContain("svelte: 90");
    expect(list?.textContent).toContain("a11y: 12");
  });

  it("scales font-size with weight (heaviest word is largest)", () => {
    const wrapper = mount(WordCloudChart, { props: { label: "Tags", data: words } });
    const byText = new Map<string, number>();
    wordEls(wrapper.element as HTMLElement).forEach((node) => {
      byText.set(node.textContent?.trim() ?? "", Number(node.getAttribute("font-size")));
    });
    expect(byText.get("svelte")!).toBeGreaterThan(byText.get("a11y")!);
    expect(byText.get("react")!).toBeGreaterThan(byText.get("tokens")!);
  });

  it("colours words by cycling the categorical palette (sorted by weight desc)", () => {
    const wrapper = mount(WordCloudChart, { props: { label: "Tags", data: words } });
    const el = wrapper.element as HTMLElement;
    const svelte = wordEls(el).find((n) => n.textContent?.trim() === "svelte")!;
    expect(svelte.classList.contains("st-wordCloudChart__word--category1")).toBe(true);
    const react = wordEls(el).find((n) => n.textContent?.trim() === "react")!;
    expect(react.classList.contains("st-wordCloudChart__word--category2")).toBe(true);
  });

  it("shows and hides the tooltip on hover", async () => {
    const wrapper = mount(WordCloudChart, { props: { label: "Interactif", data: words } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector('[role="presentation"]')).toBeNull();

    await wrapper.find(".st-wordCloudChart__word").trigger("pointermove");
    const tooltip = el.querySelector('[role="presentation"]');
    expect(tooltip).toBeTruthy();
    expect(tooltip?.textContent).toContain("svelte");
    expect(tooltip?.textContent).toContain("90");

    await wrapper.find(".st-wordCloudChart__visual").trigger("pointerleave");
    expect(el.querySelector('[role="presentation"]')).toBeNull();
  });

  it("ignores non-positive / non-finite weights without crashing", () => {
    const wrapper = mount(WordCloudChart, {
      props: {
        label: "Filtrage",
        data: [
          { text: "vide", weight: 0 },
          { text: "nan", weight: Number.NaN },
          { text: "plein", weight: 10 },
        ] as WordCloudChartWord[],
      },
    });
    const texts = wordEls(wrapper.element as HTMLElement);
    expect(texts.length).toBe(1);
    expect(texts[0].textContent?.trim()).toBe("plein");
  });
});
