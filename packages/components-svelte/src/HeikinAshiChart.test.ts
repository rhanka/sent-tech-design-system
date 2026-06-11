import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import HeikinAshiChart from "./lib/HeikinAshiChart.svelte";

// Données OHLC brutes ; les valeurs Heikin-Ashi sont RECALCULÉES.
// HA (vérifié) :
//   Lun: O 104    H 110 L 95     C 103.25 → baisse (haClose < haOpen) ALORS QUE close brut 108 ≥ open 100
//   Mar: O 103.63 H 112 L 103.63 C 107.50 → hausse
//   Mer: O 105.56 H 109 L 99     C 103.75 → baisse
//   Jeu: O 104.66 H 107 L 100    C 103.25 → baisse
//   Ven: O 103.95 H 115 L 103.95 C 109.25 → hausse
const week = [
  { label: "Lun", open: 100, high: 110, low: 95, close: 108 },
  { label: "Mar", open: 108, high: 112, low: 104, close: 106 },
  { label: "Mer", open: 106, high: 109, low: 99, close: 101 },
  { label: "Jeu", open: 101, high: 107, low: 100, close: 105 },
  { label: "Ven", open: 105, high: 115, low: 104, close: 113 }
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("HeikinAshiChart", () => {
  it("renders one body and one wick per period", () => {
    const { container } = render(HeikinAshiChart, { props: { label: "Cours", data: week } });
    expect(screen.getByRole("img")).toBeTruthy();
    expect(container.querySelectorAll(".st-heikinAshiChart__body").length).toBe(week.length);
    expect(container.querySelectorAll(".st-heikinAshiChart__wick").length).toBe(week.length);
  });

  it("colours each body by Heikin-Ashi haClose vs haOpen, not raw OHLC", () => {
    const { container } = render(HeikinAshiChart, { props: { label: "Cours", data: week } });
    const bodies = container.querySelectorAll(".st-heikinAshiChart__body");
    // Lun : close brut 108 ≥ open 100 (haussier brut) MAIS haClose 103.25 < haOpen 104 → baisse HA
    expect(bodies[0].classList.contains("st-heikinAshiChart__body--down")).toBe(true);
    expect(bodies[0].classList.contains("st-heikinAshiChart__body--up")).toBe(false);
    // Mar : hausse HA
    expect(bodies[1].classList.contains("st-heikinAshiChart__body--up")).toBe(true);
    // Mer : baisse HA
    expect(bodies[2].classList.contains("st-heikinAshiChart__body--down")).toBe(true);
    // Ven : hausse HA
    expect(bodies[4].classList.contains("st-heikinAshiChart__body--up")).toBe(true);
  });

  it("colours wicks consistently with their body direction", () => {
    const { container } = render(HeikinAshiChart, { props: { label: "Cours", data: week } });
    const wicks = container.querySelectorAll(".st-heikinAshiChart__wick");
    expect(wicks[0].classList.contains("st-heikinAshiChart__wick--down")).toBe(true);
    expect(wicks[1].classList.contains("st-heikinAshiChart__wick--up")).toBe(true);
  });

  it("summarizes RECALCULATED Heikin-Ashi O/H/L/C per period in the accessible list", () => {
    const { container } = render(HeikinAshiChart, { props: { label: "Cours", data: week } });
    const items = listItems(container);
    expect(items.length).toBe(week.length);
    // valeurs HA, pas les valeurs OHLC brutes
    expect(items[0]).toBe("Lun: O 104 H 110 L 95 C 103.25");
    expect(items[1]).toBe("Mar: O 103.63 H 112 L 103.63 C 107.50");
  });

  it("drops non-finite periods before computing Heikin-Ashi", () => {
    const { container } = render(HeikinAshiChart, {
      props: {
        label: "Filtré",
        data: [
          { label: "Bad", open: Number.NaN, high: 10, low: 1, close: 5 },
          { label: "Ok", open: 4, high: 8, low: 2, close: 6 }
        ]
      }
    });
    expect(container.querySelectorAll(".st-heikinAshiChart__body").length).toBe(1);
    const items = listItems(container);
    // "Ok" devient la 1re bougie HA → haOpen=(4+6)/2=5, haClose=(4+8+2+6)/4=5
    expect(items[0]).toBe("Ok: O 5 H 8 L 2 C 5");
  });
});
