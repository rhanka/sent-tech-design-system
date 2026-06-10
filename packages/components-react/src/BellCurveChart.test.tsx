import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BellCurveChart } from "./index.js";

const sample = [62, 68, 71, 73, 74, 75, 76, 77, 78, 79, 80, 80, 81, 82, 83, 84, 85, 86, 88, 91];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("BellCurveChart", () => {
  it("renders a non-empty normal-density curve", () => {
    const { container } = render(<BellCurveChart label="Scores" data={sample} />);
    const line = container.querySelector(".st-bellCurveChart__line");
    const area = container.querySelector(".st-bellCurveChart__area");
    expect(line).toBeTruthy();
    expect(area).toBeTruthy();
    expect((line?.getAttribute("d") ?? "").length).toBeGreaterThan(10);
  });

  it("places the peak (mean line) close to μ on the x-axis", () => {
    const { container } = render(<BellCurveChart label="Scores" data={sample} width={480} />);
    const mean = container.querySelector(".st-bellCurveChart__mean");
    expect(mean).toBeTruthy();
    const meanX = Number(mean?.getAttribute("x1"));
    const plotCenter = 44 + (480 - 44 - 16) / 2;
    expect(Math.abs(meanX - plotCenter)).toBeLessThan(1);
  });

  it("summarizes μ, σ and n in the accessible list", () => {
    const { container } = render(<BellCurveChart label="Scores" data={sample} />);
    const items = listItems(container);
    expect(items.some((t) => t?.startsWith("Moyenne (μ):"))).toBe(true);
    expect(items.some((t) => t?.startsWith("Écart-type (σ):"))).toBe(true);
    expect(items).toContain("Taille de l'échantillon (n): 20");
  });

  it("renders an accessible empty state when n < 2 without crashing", () => {
    const { container } = render(<BellCurveChart label="Vide" data={[42]} />);
    expect(container.querySelector(".st-bellCurveChart__line")).toBeNull();
    expect(container.querySelector(".st-bellCurveChart__area")).toBeNull();
    expect(listItems(container)).toEqual(["Échantillon insuffisant (au moins 2 valeurs requises)"]);
  });

  it("renders an accessible empty state when σ = 0 (identical values)", () => {
    const { container } = render(<BellCurveChart label="Plat" data={[5, 5, 5, 5]} />);
    expect(container.querySelector(".st-bellCurveChart__line")).toBeNull();
    expect(listItems(container)).toEqual(["Écart-type nul (valeurs identiques)"]);
  });

  it("drops non-finite values before computing stats", () => {
    const { container } = render(<BellCurveChart label="Filtré" data={[Number.NaN, Infinity, 10, 12, 14, 16]} />);
    expect(listItems(container)).toContain("Taille de l'échantillon (n): 4");
  });

  it("applies the tone class to the root element", () => {
    const { container } = render(<BellCurveChart label="Tone" data={sample} tone="category3" />);
    const root = container.querySelector(".st-bellCurveChart");
    expect(root?.classList.contains("st-bellCurveChart--category3")).toBe(true);
  });
});
