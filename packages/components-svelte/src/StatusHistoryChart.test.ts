import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import StatusHistoryChart from "./lib/StatusHistoryChart.svelte";

// Grille temps × entité : une ligne par series, une cellule de statut par bucket.
const services = [
  {
    series: "API",
    buckets: [
      { at: 0, value: "OK", tone: "success" as const },
      { at: 1, value: "Degraded", tone: "warning" as const },
      { at: 2, value: "OK", tone: "success" as const }
    ]
  },
  {
    series: "DB",
    buckets: [
      { at: 0, value: "OK", tone: "success" as const },
      { at: 1, value: "Down", tone: "error" as const },
      { at: 2, value: "OK", tone: "success" as const }
    ]
  }
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("StatusHistoryChart", () => {
  it("renders one cell per bucket across all rows", () => {
    const { container } = render(StatusHistoryChart, {
      props: { label: "Disponibilité", data: services }
    });
    expect(screen.getByRole("img")).toBeTruthy();
    // 3 + 3 = 6 cellules au total.
    expect(container.querySelectorAll(".st-statusHistoryChart__cell").length).toBe(6);
  });

  it("colours cells by explicit tone and renders a status legend", () => {
    const { container } = render(StatusHistoryChart, {
      props: { label: "Disponibilité", data: services }
    });
    expect(container.querySelector(".st-statusHistoryChart__cell--success")).toBeTruthy();
    expect(container.querySelector(".st-statusHistoryChart__cell--warning")).toBeTruthy();
    expect(container.querySelector(".st-statusHistoryChart__cell--error")).toBeTruthy();
    // Statuts distincts : OK, Degraded, Down → 3 items de légende.
    expect(container.querySelectorAll(".st-statusHistoryChart__legendItem").length).toBe(3);
  });

  it("derives a stable categoryN tone per status when no tone is given", () => {
    const { container } = render(StatusHistoryChart, {
      props: {
        label: "Phases",
        data: [
          {
            series: "Row",
            buckets: [
              { at: 0, value: "boot" },
              { at: 1, value: "run" },
              { at: 2, value: "boot" }
            ]
          }
        ]
      }
    });
    const cells = container.querySelectorAll(".st-statusHistoryChart__cell");
    // boot → category1, run → category2, boot → category1 (ordre d'apparition).
    expect(cells[0].classList.contains("st-statusHistoryChart__cell--category1")).toBe(true);
    expect(cells[1].classList.contains("st-statusHistoryChart__cell--category2")).toBe(true);
    expect(cells[2].classList.contains("st-statusHistoryChart__cell--category1")).toBe(true);
  });

  it("lays buckets out as a time grid (later bucket sits to the right)", () => {
    const { container } = render(StatusHistoryChart, { props: { label: "P", data: services } });
    const cells = container.querySelectorAll<SVGRectElement>(".st-statusHistoryChart__cell");
    const x0 = Number(cells[0].getAttribute("x"));
    const x1 = Number(cells[1].getAttribute("x"));
    // Le bucket at=1 est à droite du bucket at=0.
    expect(x1).toBeGreaterThan(x0);
  });

  it("summarises each row in the accessible data list", () => {
    const { container } = render(StatusHistoryChart, {
      props: {
        label: "P",
        data: [{ series: "API", buckets: [{ at: 0, value: "OK" }, { at: 1, value: "Down" }] }]
      }
    });
    const items = listItems(container);
    expect(items[0]).toBe("API: 0 = OK, 1 = Down");
  });

  it("drops non-finite buckets and unlabeled rows before rendering", () => {
    const { container } = render(StatusHistoryChart, {
      props: {
        label: "Filtré",
        data: [
          { series: "", buckets: [{ at: 0, value: "A" }] },
          {
            series: "Ok",
            buckets: [
              { at: Number.NaN, value: "bad" },
              { at: 1, value: "good" }
            ]
          }
        ]
      }
    });
    // La ligne sans libellé est supprimée ; le bucket NaN aussi → 1 cellule restante.
    expect(container.querySelectorAll(".st-statusHistoryChart__cell").length).toBe(1);
  });
});
