import { afterEach, describe, expect, it } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { ScoreCard } from "./ScoreCard.js";

const mounted: VueWrapper[] = [];
function track<T extends VueWrapper>(wrapper: T): T {
  mounted.push(wrapper);
  return wrapper;
}
afterEach(() => {
  while (mounted.length) mounted.pop()?.unmount();
});

describe("ScoreCard", () => {
  it("renders the title and a score formatted to one decimal", () => {
    const wrapper = track(
      mount(ScoreCard, { props: { title: "Valeur métier", score: 4.2, stars: 4 } }),
    );
    const root = wrapper.find(".st-scoreCard");
    expect(root.element.tagName.toLowerCase()).toBe("article");
    expect(root.attributes("role")).toBe("group");
    expect(wrapper.find(".st-scoreCard__title").text()).toBe("Valeur métier");
    expect(wrapper.find(".st-scoreCard__score").text().trim()).toBe("4.2 points");
  });

  it("renders max symbols with the correct number filled (value -> stars)", () => {
    const wrapper = track(
      mount(ScoreCard, { props: { title: "Note", score: 3, stars: 3, type: "value" } }),
    );
    expect(wrapper.find(".st-scoreCard--value").exists()).toBe(true);
    expect(wrapper.findAll(".st-scoreCard__symbol").length).toBe(5);
    expect(wrapper.findAll(".st-scoreCard__symbol--on").length).toBe(3);
    expect(wrapper.findAll(".st-scoreCard__symbol--off").length).toBe(2);
  });

  it("complexity type switches the modifier class", () => {
    const wrapper = track(
      mount(ScoreCard, {
        props: { title: "Complexité", score: 2.5, stars: 2, type: "complexity" },
      }),
    );
    expect(wrapper.find(".st-scoreCard--complexity").exists()).toBe(true);
  });

  it("clamps the filled count between 0 and max", () => {
    const wrapper = track(
      mount(ScoreCard, { props: { title: "Hors borne", score: 9, stars: 12, max: 5 } }),
    );
    expect(wrapper.findAll(".st-scoreCard__symbol").length).toBe(5);
    expect(wrapper.findAll(".st-scoreCard__symbol--on").length).toBe(5);
  });

  it("honours a custom max and unit, and exposes a descriptive aria-label", () => {
    const wrapper = track(
      mount(ScoreCard, { props: { title: "Score", score: 6, stars: 6, max: 10, unit: "pts" } }),
    );
    expect(wrapper.findAll(".st-scoreCard__symbol").length).toBe(10);
    expect(wrapper.find(".st-scoreCard__score").text().trim()).toBe("6.0 pts");
    const aria = wrapper.find(".st-scoreCard").attributes("aria-label") ?? "";
    expect(aria).toContain("Score");
    expect(aria).toContain("6.0 pts");
    expect(aria).toContain("6 sur 10");
  });

  it("applies the size modifier class", () => {
    const wrapper = track(mount(ScoreCard, { props: { title: "Grand", score: 5, stars: 5, size: "lg" } }));
    expect(wrapper.find(".st-scoreCard--lg").exists()).toBe(true);
  });
});
