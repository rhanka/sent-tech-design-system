import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import ScoreCard from "./lib/ScoreCard.svelte";

describe("ScoreCard", () => {
  it("renders the title and a score formatted to one decimal", () => {
    const { container } = render(ScoreCard, {
      props: { title: "Valeur métier", score: 4.2, stars: 4 },
    });
    const root = container.querySelector(".st-scoreCard");
    expect(root).toBeTruthy();
    expect(root?.tagName.toLowerCase()).toBe("article");
    expect(root?.getAttribute("role")).toBe("group");
    expect(screen.getByText("Valeur métier")).toBeTruthy();
    expect(container.querySelector(".st-scoreCard__score")?.textContent?.trim()).toBe("4.2 points");
  });

  it("renders max symbols with the correct number filled (value -> stars)", () => {
    const { container } = render(ScoreCard, {
      props: { title: "Note", score: 3, stars: 3, type: "value" },
    });
    expect(container.querySelector(".st-scoreCard--value")).toBeTruthy();
    const all = container.querySelectorAll(".st-scoreCard__symbol");
    expect(all.length).toBe(5);
    expect(container.querySelectorAll(".st-scoreCard__symbol--on").length).toBe(3);
    expect(container.querySelectorAll(".st-scoreCard__symbol--off").length).toBe(2);
  });

  it("complexity type switches the modifier class", () => {
    const { container } = render(ScoreCard, {
      props: { title: "Complexité", score: 2.5, stars: 2, type: "complexity" },
    });
    expect(container.querySelector(".st-scoreCard--complexity")).toBeTruthy();
  });

  it("clamps the filled count between 0 and max", () => {
    const { container } = render(ScoreCard, {
      props: { title: "Hors borne", score: 9, stars: 12, max: 5 },
    });
    expect(container.querySelectorAll(".st-scoreCard__symbol").length).toBe(5);
    expect(container.querySelectorAll(".st-scoreCard__symbol--on").length).toBe(5);
  });

  it("honours a custom max and unit, and exposes a descriptive aria-label", () => {
    const { container } = render(ScoreCard, {
      props: { title: "Score", score: 6, stars: 6, max: 10, unit: "pts" },
    });
    expect(container.querySelectorAll(".st-scoreCard__symbol").length).toBe(10);
    expect(container.querySelector(".st-scoreCard__score")?.textContent?.trim()).toBe("6.0 pts");
    const aria = container.querySelector(".st-scoreCard")?.getAttribute("aria-label") ?? "";
    expect(aria).toContain("Score");
    expect(aria).toContain("6.0 pts");
    expect(aria).toContain("6 sur 10");
  });

  it("applies the size modifier class", () => {
    const { container } = render(ScoreCard, {
      props: { title: "Grand", score: 5, stars: 5, size: "lg" },
    });
    expect(container.querySelector(".st-scoreCard--lg")).toBeTruthy();
  });
});
