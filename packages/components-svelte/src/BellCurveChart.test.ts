import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import BellCurveChart from "./lib/BellCurveChart.svelte";

// Échantillon symétrique autour de 80 → μ ≈ 80.
const sample = [62, 68, 71, 73, 74, 75, 76, 77, 78, 79, 80, 80, 81, 82, 83, 84, 85, 86, 88, 91];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("BellCurveChart", () => {
  it("renders a non-empty normal-density curve", () => {
    const { container } = render(BellCurveChart, { props: { label: "Scores", data: sample } });

    expect(screen.getByRole("img")).toBeTruthy();
    const line = container.querySelector(".st-bellCurveChart__line");
    const area = container.querySelector(".st-bellCurveChart__area");
    expect(line).toBeTruthy();
    expect(area).toBeTruthy();
    // Le tracé contient des commandes de courbe (M + au moins un segment).
    expect((line?.getAttribute("d") ?? "").length).toBeGreaterThan(10);
  });

  it("places the peak (mean line) close to μ on the x-axis", () => {
    const { container } = render(BellCurveChart, { props: { label: "Scores", data: sample, width: 480 } });

    const mean = container.querySelector(".st-bellCurveChart__mean");
    expect(mean).toBeTruthy();

    // μ de l'échantillon ≈ 79.65 ; sur un domaine μ±4σ, μ tombe au centre du
    // plot (left=44, right=16, width=480 → centre x ≈ 254).
    const meanX = Number(mean?.getAttribute("x1"));
    const plotCenter = 44 + (480 - 44 - 16) / 2;
    expect(Math.abs(meanX - plotCenter)).toBeLessThan(1);
  });

  it("summarizes μ, σ and n in the accessible list", () => {
    const { container } = render(BellCurveChart, { props: { label: "Scores", data: sample } });
    const items = listItems(container);
    expect(items.some((t) => t?.startsWith("Moyenne (μ):"))).toBe(true);
    expect(items.some((t) => t?.startsWith("Écart-type (σ):"))).toBe(true);
    expect(items).toContain("Taille de l'échantillon (n): 20");
  });

  it("renders an accessible empty state when n < 2 without crashing", () => {
    const { container } = render(BellCurveChart, { props: { label: "Vide", data: [42] } });
    expect(container.querySelector(".st-bellCurveChart__line")).toBeNull();
    expect(container.querySelector(".st-bellCurveChart__area")).toBeNull();
    expect(listItems(container)).toEqual(["Échantillon insuffisant (au moins 2 valeurs requises)"]);
    expect(screen.getByRole("img", { name: "Vide" })).toBeTruthy();
  });

  it("renders an accessible empty state when σ = 0 (identical values)", () => {
    const { container } = render(BellCurveChart, { props: { label: "Plat", data: [5, 5, 5, 5] } });
    expect(container.querySelector(".st-bellCurveChart__line")).toBeNull();
    expect(listItems(container)).toEqual(["Écart-type nul (valeurs identiques)"]);
  });

  it("drops non-finite values before computing stats", () => {
    const { container } = render(BellCurveChart, {
      props: { label: "Filtré", data: [Number.NaN, Infinity, 10, 12, 14, 16] }
    });
    const items = listItems(container);
    expect(items).toContain("Taille de l'échantillon (n): 4");
  });

  it("applies the tone class to the root element", () => {
    const { container } = render(BellCurveChart, { props: { label: "Tone", data: sample, tone: "category3" } });
    const root = container.querySelector(".st-bellCurveChart");
    expect(root?.classList.contains("st-bellCurveChart--category3")).toBe(true);
  });
});
