import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import HollowCandlestickChart from "./lib/HollowCandlestickChart.svelte";

// Jeu de données pensé pour découpler la COULEUR (close vs close préc.)
// du REMPLISSAGE (close vs open) :
//   Lun: open 100 close 110 → 1re bougie up (close≥open) ; hollow (close≥open)
//   Mar: open 110 close 105 (prev 110) → down ; filled (close<open)
//   Mer: open 105 close 108 (prev 105) → up ; hollow (close≥open)
//   Jeu: open 108 close 102 (prev 108) → down ; filled (close<open)
//   Ven: open 110 close 104 (prev 102) → up (close≥prev) ; filled (close<open) ← combinaison croisée
const week = [
  { label: "Lun", open: 100, high: 113, low: 98, close: 110 },
  { label: "Mar", open: 110, high: 112, low: 103, close: 105 },
  { label: "Mer", open: 105, high: 110, low: 104, close: 108 },
  { label: "Jeu", open: 108, high: 109, low: 100, close: 102 },
  { label: "Ven", open: 110, high: 114, low: 101, close: 104 }
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("HollowCandlestickChart", () => {
  it("renders one candle (body) per period", () => {
    const { container } = render(HollowCandlestickChart, { props: { label: "Cours", data: week } });
    expect(screen.getByRole("img")).toBeTruthy();
    expect(container.querySelectorAll(".st-hollowCandlestickChart__candle").length).toBe(week.length);
    expect(container.querySelectorAll(".st-hollowCandlestickChart__wick").length).toBe(week.length);
  });

  it("hollows the body when close ≥ open and fills it when close < open", () => {
    const { container } = render(HollowCandlestickChart, { props: { label: "Cours", data: week } });
    const candles = container.querySelectorAll(".st-hollowCandlestickChart__candle");
    // Lun (close≥open) → creux
    expect(candles[0].classList.contains("st-hollowCandlestickChart__candle--hollow")).toBe(true);
    expect(candles[0].classList.contains("st-hollowCandlestickChart__candle--filled")).toBe(false);
    // Mar (close<open) → plein
    expect(candles[1].classList.contains("st-hollowCandlestickChart__candle--filled")).toBe(true);
    expect(candles[1].classList.contains("st-hollowCandlestickChart__candle--hollow")).toBe(false);
  });

  it("colours the body by close vs previous close (up/down), independent of fill", () => {
    const { container } = render(HollowCandlestickChart, { props: { label: "Cours", data: week } });
    const candles = container.querySelectorAll(".st-hollowCandlestickChart__candle");
    // Mar : close 105 < close préc. 110 → down
    expect(candles[1].classList.contains("st-hollowCandlestickChart__candle--down")).toBe(true);
    // Mer : close 108 ≥ close préc. 105 → up
    expect(candles[2].classList.contains("st-hollowCandlestickChart__candle--up")).toBe(true);
    // Ven : close 104 ≥ close préc. 102 → up MAIS close 104 < open 110 → plein (combinaison croisée)
    expect(candles[4].classList.contains("st-hollowCandlestickChart__candle--up")).toBe(true);
    expect(candles[4].classList.contains("st-hollowCandlestickChart__candle--filled")).toBe(true);
  });

  it("colours the first candle up when close ≥ open", () => {
    const { container } = render(HollowCandlestickChart, { props: { label: "Cours", data: week } });
    const wicks = container.querySelectorAll(".st-hollowCandlestickChart__wick");
    expect(wicks[0].classList.contains("st-hollowCandlestickChart__wick--up")).toBe(true);
  });

  it("summarizes O/H/L/C per period in the accessible list", () => {
    const { container } = render(HollowCandlestickChart, { props: { label: "Cours", data: week } });
    const items = listItems(container);
    expect(items.length).toBe(week.length);
    expect(items[0]).toBe("Lun: O 100 H 113 L 98 C 110");
  });

  it("drops non-finite periods before rendering", () => {
    const { container } = render(HollowCandlestickChart, {
      props: {
        label: "Filtré",
        data: [
          { label: "Bad", open: Number.NaN, high: 10, low: 1, close: 5 },
          { label: "Ok", open: 4, high: 8, low: 2, close: 6 }
        ]
      }
    });
    expect(container.querySelectorAll(".st-hollowCandlestickChart__candle").length).toBe(1);
  });
});
